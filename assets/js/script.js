// عناصر
let quoteElement = document.querySelector(".quote");
let explanationElement = document.querySelector(".explanation");
let form = document.querySelector("#form");

let lastTopic = "";
let lastQuote = "";

// ✅ FIXED: single display function
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
}

// ✅ Loading
function showLoading(topic) {
  quoteElement.classList.remove("hidden");
  quoteElement.innerHTML = `⏳ Generating a quote about <strong>${topic}</strong>...`;
}

// ✅ Error handling
function showError() {
  quoteElement.innerHTML = "⚠️ Failed to load quote. Please try again.";
}

// ✅ History (last 5)
function saveHistory(topic) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(topic);
  history = history.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let historyDiv = document.querySelector(".history");
  if (!historyDiv) return;

  historyDiv.innerHTML = history
    .map((item) => `<div>🔎 ${item}</div>`)
    .join("");
}

// ✅ Text-to-speech
function speakQuote() {
  let speech = new SpeechSynthesisUtterance(
    quoteElement.innerText.replace(/<[^>]*>/g, "")
  );
  speechSynthesis.speak(speech);
}

// ✅ Explain quote
function explainQuote() {
  let apiKey = "8bcecf2b930c0252ec9aa584f9do621t";

  let prompt = `Explain this quote simply: ${lastQuote}`;
  let context = "You are a helpful teacher.";

  let url = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apiKey}`;

  explanationElement.classList.remove("hidden");
  explanationElement.innerHTML = "🧠 Thinking...";

  axios.get(url)
    .then((res) => {
      explanationElement.innerHTML = res.data.answer;
    })
    .catch(() => {
      explanationElement.innerHTML = "⚠️ Could not explain this quote.";
    });
}

// ✅ Main search function (enhanced)
function handleSearch(event) {
  event.preventDefault();

  let searchInput = document.querySelector(".search-input");
  let topic = searchInput.value;

  let language = document.querySelector("#language")?.value || "English";

  lastTopic = topic;

  let apikey = "8bcecf2b930c0252ec9aa584f9do621t";

  let prompt = `Generate a quote about ${topic} in ${language}`;

  let context =
    'You are an expert quote writer. Generate a short, powerful quote and attribute it to a realistic human name (e.g. Maya Angelou-style, not Unknown). Format exactly as: <em>\"Quote\"</em><br><strong>Author Name</strong>"';

  let apiURL = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apikey}`;

  showLoading(topic);

  axios.get(apiURL)
    .then(displayquote)
    .catch(showError);
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

// ✅ Event listeners
form.addEventListener("submit", handleSearch);

document.querySelector("#speak")?.addEventListener("click", speakQuote);
document.querySelector("#explain")?.addEventListener("click", explainQuote);
document.querySelector("#regenerate")?.addEventListener("click", regenerateQuote);
document.querySelector("#toggle-theme")?.addEventListener("click", toggleTheme);

// Load history on start
renderHistory();