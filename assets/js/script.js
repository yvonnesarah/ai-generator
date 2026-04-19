let quoteElement = document.querySelector(".quote");
let explanationElement = document.querySelector(".explanation");
let form = document.querySelector("#form");
let alertBox = document.querySelector(".alert");

let lastTopic = "";
let lastQuote = "";
let hasExplained = false;
let chart;

// QUICK TOPICS
document.querySelectorAll(".quick-topics button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".search-input").value = btn.dataset.topic;
  });
});

// =====================
// ⭐ FAVORITES RENDER
// =====================
function renderFavorites() {
  let data = JSON.parse(localStorage.getItem("analytics")) || { favorites: [] };

  let container = document.querySelector(".favorites-list");

  if (!data.favorites || data.favorites.length === 0) {
    container.innerHTML = "<p>No favourites yet ⭐</p>";
    return;
  }

  container.innerHTML = data.favorites
    .map((quote, index) => {
      return `
        <div class="favorite-item">
          <p>${quote}</p>
          <button class="delete-fav" data-index="${index}">🗑️ Delete</button>
        </div>
      `;
    })
    .join("");

  // attach delete events
  document.querySelectorAll(".delete-fav").forEach(btn => {
    btn.addEventListener("click", (e) => {
      deleteFavorite(e.target.dataset.index);
    });
  });
}


// =====================
// 🗑️ DELETE FAVORITE
// =====================
function deleteFavorite(index) {
  let data = JSON.parse(localStorage.getItem("analytics")) || { favorites: [] };

  data.favorites.splice(index, 1);

  localStorage.setItem("analytics", JSON.stringify(data));

  renderFavorites();
  renderDashboard();
}

// DISPLAY QUOTE
function displayquote(response) {
  let quoteText = response.data.answer;

  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = "";

  new Typewriter(".quote", {
    strings: quoteText,
    autoStart: true,
    cursor: "",
    delay: 15,
  });

  lastQuote = quoteText;
  hasExplained = false;

  document.querySelector(".actions").classList.remove("hidden");

  saveHistory(lastTopic);
  saveAnalytics(lastTopic);
}

// LOADING
function showLoading(topic) {
  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = `⏳ Generating a quote about <strong>${topic}</strong>...`;
}

// ERROR
function showError() {
  quoteElement.innerHTML = "⚠️ Failed to load quote.";
}

// HISTORY
function saveHistory(topic) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(topic);
  history = history.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  document.querySelector(".history").innerHTML =
    history.map(item => `<div class="history-item">🔎 ${item}</div>`).join("");

  document.querySelectorAll(".history-item").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelector(".search-input").value =
        el.innerText.replace("🔎 ", "");
    });
  });
}

// ANALYTICS
function saveAnalytics(topic) {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    topics: {},
    favorites: [],
    streak: 0,
    total: 0
  };

  data.topics[topic] = (data.topics[topic] || 0) + 1;
  data.total++;

  localStorage.setItem("analytics", JSON.stringify(data));
  renderDashboard();
}

// FAVOURITES 
document.querySelector("#favorite").addEventListener("click", () => {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    favorites: []
  };

  if (!data.favorites.includes(lastQuote)) {
    data.favorites.push(lastQuote);
  }

  localStorage.setItem("analytics", JSON.stringify(data));

  renderFavorites();
  renderDashboard();
});

// DASHBOARD
function renderDashboard() {
  let data = JSON.parse(localStorage.getItem("analytics")) || {};

  document.querySelector("#streak").innerText = data.streak || 0;
  document.querySelector("#favoritesCount").innerText =
    data.favorites?.length || 0;

  document.querySelector("#totalCount").innerText = data.total || 0;

  let labels = Object.keys(data.topics || {});
  let values = Object.values(data.topics || {});

  let ctx = document.getElementById("topicsChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Topics", data: values }]
    }
  });

  renderFavorites(); // ✅ IMPORTANT
}

// SPEAK
function speakQuote() {
  let speech = new SpeechSynthesisUtterance(quoteElement.innerText);
  speechSynthesis.speak(speech);
}

// EXPLAIN
function explainQuote() {
  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";
  let prompt = `Explain this quote simply: ${lastQuote}`;

  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=You are a teacher&key=${apiKey}`;

  explanationElement.classList.remove("hidden");
  explanationElement.innerHTML = "🧠 Thinking...";

  axios.get(url).then(res => {
    explanationElement.innerHTML = res.data.answer;
    hasExplained = true;
    alertBox.classList.add("hidden");
  });
}

// SEARCH
function handleSearch(event) {
  event.preventDefault();

  if (lastQuote && !hasExplained) {
    alertBox.classList.remove("hidden");
    alertBox.innerHTML =
      "⚠️ Please explain the quote before generating a new one.";
    return;
  }

  let topic = document.querySelector(".search-input").value;
  let language = document.querySelector("#language").value;

  lastTopic = topic;

  let prompt = `Generate a quote about ${topic} in ${language}`;

  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=You are an expert quote writer. Generate a short, powerful quote and attribute it to a realistic human name (e.g. Maya Angelou-style, not Unknown). Format exactly as: <em>\"Quote\"</em><br><strong>Author Name</strong>&key=8bcecf3b930c0252ec9aa584f9do621t`;

  showLoading(topic);

  axios.get(url).then(displayquote).catch(showError);
}

// REGENERATE
function regenerateQuote() {
  if (lastTopic) {
    document.querySelector(".search-input").value = lastTopic;
    handleSearch(new Event("submit"));
  }
}

// THEME
function toggleTheme() {
  document.body.classList.toggle("light");
}

// EVENTS
form.addEventListener("submit", handleSearch);
document.querySelector("#speak").addEventListener("click", speakQuote);
document.querySelector("#explain").addEventListener("click", explainQuote);
document.querySelector("#regenerate").addEventListener("click", regenerateQuote);
document.querySelector("#toggle-theme").addEventListener("click", toggleTheme);

// INIT
renderHistory();
renderDashboard();
renderFavorites();