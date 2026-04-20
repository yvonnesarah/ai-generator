// =====================
// DOM ELEMENTS
// =====================
let quoteElement = document.querySelector(".quote"); // Quote display container
let explanationElement = document.querySelector(".explanation"); // Explanation box
let form = document.querySelector("#form"); // Search form
let alertBox = document.querySelector(".alert"); // Alert messages
let suggestionsBox = document.querySelector(".suggestions"); // Suggestions dropdown
let typingTimer; // Timer for debounce input

// =====================
// STATE VARIABLES
// =====================
let lastTopic = ""; // Stores last searched topic
let lastQuote = ""; // Stores last generated quote
let hasExplained = false; // Tracks if explanation was shown
let chart; // Chart.js instance


// =====================
// QUICK TOPICS
// =====================
// Clicking a quick topic fills the input field
document.querySelectorAll(".quick-topics button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".search-input").value = btn.dataset.topic;
  });
});


// =====================
// ⭐ FAVORITES RENDER
// =====================
function renderFavorites() {
  // Get stored analytics or fallback
  let data = JSON.parse(localStorage.getItem("analytics")) || { favorites: [] };

  let container = document.querySelector(".favorites-list");

  // Empty state
  if (!data.favorites || data.favorites.length === 0) {
    container.innerHTML = "<p>No favourites yet ⭐</p>";
    return;
  }

  // Render favorites list
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

  // Attach delete event listeners
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

  // Remove selected favorite
  data.favorites.splice(index, 1);

  // Save updated data
  localStorage.setItem("analytics", JSON.stringify(data));

  // Refresh UI
  renderFavorites();
  renderDashboard();
}


// =====================
// DISPLAY QUOTE
// =====================
function displayquote(response) {
  let quoteText = response.data.answer;

  // Show quote container
  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = "";

  // Typewriter animation
  new Typewriter(".quote", {
    strings: quoteText,
    autoStart: true,
    cursor: "",
    delay: 15,
  });

  // Update state
  lastQuote = quoteText;
  hasExplained = false;

  // Show action buttons
  document.querySelector(".actions").classList.remove("hidden");

  // Save history + analytics
  saveHistory(lastTopic);
  saveAnalytics(lastTopic);
}


// =====================
// LOADING STATE
// =====================
function showLoading(topic) {
  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = `⏳ Generating a quote about <strong>${topic}</strong>...`;
}


// =====================
// ERROR STATE
// =====================
function showError() {
  quoteElement.innerHTML = "⚠️ Failed to load quote.";
}


// =====================
// HISTORY MANAGEMENT
// =====================
function saveHistory(topic) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  // Add new topic at the beginning
  history.unshift(topic);

  // Limit to last 5 entries
  history = history.slice(0, 5);

  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  // Display history
  document.querySelector(".history").innerHTML =
    history.map(item => `<div class="history-item">🔎 ${item}</div>`).join("");

  // Allow clicking history to reuse topic
  document.querySelectorAll(".history-item").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelector(".search-input").value =
        el.innerText.replace("🔎 ", "");
    });
  });
}


// =====================
// ANALYTICS
// =====================
function saveAnalytics(topic) {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    topics: {},
    favorites: [],
    streak: 0,
    total: 0
  };

  // Increment topic count
  data.topics[topic] = (data.topics[topic] || 0) + 1;

  // Increment total quotes count
  data.total++;

  localStorage.setItem("analytics", JSON.stringify(data));
  renderDashboard();
}


// =====================
// TRENDING TOPICS
// =====================
function getTrendingTopics() {
  let data = JSON.parse(localStorage.getItem("analytics")) || {};
  let topics = data.topics || {};

  // Return top 3 most used topics
  return Object.keys(topics)
    .sort((a, b) => topics[b] - topics[a])
    .slice(0, 3);
}


// =====================
// FETCH AI SUGGESTIONS
// =====================
function fetchSuggestions(topic) {
  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";

  let prompt = `Give 5 short related topics to: ${topic}. Format as comma separated list.`;

  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=You are a helpful assistant&key=${apiKey}`;

  axios.get(url).then(res => {
    let suggestions = res.data.answer.split(",");
    renderSuggestions(suggestions);
  }).catch(() => {
    suggestionsBox.classList.add("hidden");
  });
}


// =====================
// RENDER SUGGESTIONS
// =====================
function renderSuggestions(list) {
  let trending = getTrendingTopics();

  // Combine trending + API suggestions (remove duplicates)
  let combined = [...new Set([...trending, ...list])];

  if (combined.length === 0) return;

  suggestionsBox.classList.remove("hidden");

  suggestionsBox.innerHTML = combined
    .map(item => `<div class="suggestion-item">${item.trim()}</div>`)
    .join("");

  // Click suggestion to autofill input
  document.querySelectorAll(".suggestion-item").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelector(".search-input").value = el.innerText;
      suggestionsBox.classList.add("hidden");
    });
  });
}


// =====================
// INPUT DEBOUNCE
// =====================
document.querySelector(".search-input").addEventListener("input", (e) => {
  let value = e.target.value.trim();

  clearTimeout(typingTimer);

  // Hide if too short
  if (value.length < 3) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  // Delay API call (debounce)
  typingTimer = setTimeout(() => {
    fetchSuggestions(value);
  }, 500);
});


// =====================
// ⭐ ADD TO FAVORITES
// =====================
document.querySelector("#favorite").addEventListener("click", () => {
  let data = JSON.parse(localStorage.getItem("analytics")) || {
    favorites: []
  };

  // Prevent duplicates
  if (!data.favorites.includes(lastQuote)) {
    data.favorites.push(lastQuote);
  }

  localStorage.setItem("analytics", JSON.stringify(data));

  renderFavorites();
  renderDashboard();
});


// =====================
// 📊 DASHBOARD
// =====================
function renderDashboard() {
  let data = JSON.parse(localStorage.getItem("analytics")) || {};

  // Update stats
  document.querySelector("#streak").innerText = data.streak || 0;
  document.querySelector("#favoritesCount").innerText =
    data.favorites?.length || 0;
  document.querySelector("#totalCount").innerText = data.total || 0;

  let labels = Object.keys(data.topics || {});
  let values = Object.values(data.topics || {});

  let ctx = document.getElementById("topicsChart");

  // Destroy old chart before creating new one
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Topics", data: values }]
    }
  });

  renderFavorites(); // keep favorites synced
}


// =====================
// 🔊 TEXT-TO-SPEECH
// =====================
function speakQuote() {
  let speech = new SpeechSynthesisUtterance(quoteElement.innerText);
  speechSynthesis.speak(speech);
}


// =====================
// 🧠 EXPLAIN QUOTE
// =====================
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


// =====================
// 🔍 SEARCH HANDLER
// =====================
function handleSearch(event) {
  event.preventDefault();

  suggestionsBox.classList.add("hidden");

  // Prevent skipping explanation step
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


// =====================
// 🔁 REGENERATE
// =====================
function regenerateQuote() {
  if (lastTopic) {
    document.querySelector(".search-input").value = lastTopic;
    handleSearch(new Event("submit"));
  }
}


// =====================
// 🌙 THEME TOGGLE
// =====================
function toggleTheme() {
  document.body.classList.toggle("light");
}


// =====================
// EVENT LISTENERS
// =====================
form.addEventListener("submit", handleSearch);
document.querySelector("#speak").addEventListener("click", speakQuote);
document.querySelector("#explain").addEventListener("click", explainQuote);
document.querySelector("#regenerate").addEventListener("click", regenerateQuote);
document.querySelector("#toggle-theme").addEventListener("click", toggleTheme);


// =====================
// INITIAL LOAD
// =====================
renderHistory();
renderDashboard();
renderFavorites();