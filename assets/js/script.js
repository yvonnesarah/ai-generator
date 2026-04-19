// Elements
let quoteElement = document.querySelector(".quote");
let explanationElement = document.querySelector(".explanation");
let form = document.querySelector("#form");

let lastTopic = "";
let lastQuote = "";
let chart;

// DISPLAY QUOTE
function displayquote(response) {
  let quoteText = response.data.answer;

  if (
    quoteText.toLowerCase().includes("unknown") ||
    quoteText.toLowerCase().includes("anonymous")
  ) {
    quoteText = quoteText.replace(/unknown|anonymous/i, "AI Thinker");
  }

  quoteElement.innerHTML = "";

  new Typewriter(".quote", {
    strings: quoteText,
    autoStart: true,
    cursor: "",
    delay: 15,
  });

  lastQuote = quoteText;

  document.querySelector(".actions").classList.remove("hidden");

  saveHistory(lastTopic);
  saveAnalytics(lastTopic, lastQuote);
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
    history.map((item) => `<div>🔎 ${item}</div>`).join("");
}

// ANALYTICS
function saveAnalytics(topic, quote) {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    topics: {},
    favorites: [],
    lastVisit: null,
    streak: 0
  };

  data.topics[topic] = (data.topics[topic] || 0) + 1;

  let today = new Date().toDateString();

  if (data.lastVisit) {
    let last = new Date(data.lastVisit);
    let diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) data.streak += 1;
    else if (diff > 1) data.streak = 1;
  } else {
    data.streak = 1;
  }

  data.lastVisit = today;

  localStorage.setItem("analytics", JSON.stringify(data));
  renderDashboard();
}

// FAVORITES
function saveFavorite() {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    favorites: []
  };

  if (!data.favorites.includes(lastQuote)) {
    data.favorites.push(lastQuote);
  }

  localStorage.setItem("analytics", JSON.stringify(data));
  renderDashboard();
}

// DASHBOARD
function renderDashboard() {
  let data = JSON.parse(localStorage.getItem("analytics"));
  if (!data) return;

  document.querySelector("#streak").innerText = data.streak || 0;
  document.querySelector("#favoritesCount").innerText =
    data.favorites?.length || 0;

  document.querySelector(".favorites-list").innerHTML =
    (data.favorites || [])
      .slice(-3)
      .map((q) => `<div>⭐ ${q}</div>`)
      .join("");

  let labels = Object.keys(data.topics || {});
  let values = Object.values(data.topics || {});

  let ctx = document.getElementById("topicsChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Search Frequency",
        data: values
      }]
    }
  });
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
  let context = "You are a helpful teacher.";
  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apiKey}`;

  explanationElement.classList.remove("hidden");
  explanationElement.innerHTML = "🧠 Thinking...";

  axios.get(url).then((res) => {
    explanationElement.innerHTML = res.data.answer;
  });
}

// SEARCH
function handleSearch(event) {
  event.preventDefault();

  let topic = document.querySelector(".search-input").value;
  let language = document.querySelector("#language").value;

  lastTopic = topic;

  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";
  let prompt = `Generate a quote about ${topic} in ${language}`;
  let context =
    'You are an expert quote writer. Generate a short, powerful quote and attribute it to a realistic human name (e.g. Maya Angelou-style, not Unknown). Format exactly as: <em>\"Quote\"</em><br><strong>Author Name</strong>"';

  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apiKey}`;

  showLoading(topic);

  axios.get(url).then(displayquote).catch(showError);
}

// ✅ Regenerate
function regenerateQuote() {
  if (lastTopic) {
    handleSearch(new Event("submit"));
  }
}

// ✅ Theme toggle
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
}


// EVENTS
form.addEventListener("submit", handleSearch);
document.querySelector("#favorite").addEventListener("click", saveFavorite);
document.querySelector("#speak").addEventListener("click", speakQuote);
document.querySelector("#explain").addEventListener("click", explainQuote);
document.querySelector("#regenerate")?.addEventListener("click", regenerateQuote);
document.querySelector("#toggle-theme")?.addEventListener("click", toggleTheme);

// INIT
renderHistory();
renderDashboard();