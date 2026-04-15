// Function to display the generated quote using the Typewriter effect
function displayquote(response) {
  // Create a new Typewriter effect on the element with the class 'quote'
  new Typewriter(".quote", {
    strings: response.data.answer, // Set the generated quote as the string
    autoStart: true, // Automatically start typing
    cursor: "", // No cursor displayed
    delay: 1.5, // Delay between characters (in milliseconds)
  });
}

// Function to handle the search event (when the user submits the search form)
function handleSearch(event) {
  event.preventDefault(); // Prevent the default form submission behavior
  
  // Get the user's input from the search input field
  let searchInput = document.querySelector(".search-input");
  
  // Define the API key for authentication with the SheCodes AI service
  let apikey = "8bcecf2b930c0252ec9aa584f9do621t";
  
  // Construct the prompt that will instruct the AI to generate a quote based on user input
  let prompt = `User instruction:Generate a quote on ${searchInput.value}`;
  
  // Provide context for the AI, asking it to generate a concise and clear quote
  let context =
    "You are an expert in writing quotes. Make sure to give a concise and clear quote. Do not include title. Sign the quote with the author in a <strong> provided by SheCodes AI";
  
  // Define the API URL with the prompt, context, and API key as parameters
  let apiURL = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apikey}`;
  
  // Send a GET request to the SheCodes AI API and pass the response to displayquote function
  axios.get(apiURL).then(displayquote);
  
  // Get the quote element in the DOM
  let quote = document.querySelector(".quote");
  
  // Remove the 'hidden' class to display the quote element
  quote.classList.remove("hidden");
  
  // Set the inner HTML of the quote element to show a loading message with the user's input
 quote.innerHTML = `✨ Generating a quote about <strong>${searchInput.value}</strong>...`;
}

// Get the search form element
let search = document.querySelector("#form");

// Add an event listener to handle form submission (trigger the handleSearch function)
search.addEventListener("submit", handleSearch);
