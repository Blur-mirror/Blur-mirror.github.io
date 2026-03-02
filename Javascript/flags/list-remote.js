// --- NEW: Global variable to store countries for filtering ---
let allCountries = [];

// 1. COUNTRIES API
async function fetchCountriesData() {
  const container = document.getElementById("remote-data-container");
  container.innerHTML =
    '<p style="grid-column: 1/-1;">⌛ Loading countries...</p>';

  try {
    // We add ?fields= to only get the data we need.
    // This often fixes 400 errors caused by request size/timeout.
    const url =
      "https://restcountries.com/v3.1/all?fields=name,flags,region,population";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    // Save and Sort
    allCountries = data.sort((a, b) =>
      (a.name.common || "").localeCompare(b.name.common || ""),
    );

    displayCountriesData(allCountries);
  } catch (error) {
    console.error("Detailed Fetch Error:", error.message);
    container.innerHTML = `<p style="color: red; grid-column: 1/-1;">⚠️ Error: ${error.message}</p>`;
  }
}

function displayCountriesData(countriesArray) {
  const container = document.getElementById("remote-data-container");

  // Use a generic message since it's not just Europe anymore
  let htmlOutput = `<p style="grid-column: 1/-1; font-weight: bold;">Showing ${countriesArray.length} countries.</p>`;

  countriesArray.forEach((country) => {
    htmlOutput += `
    <div style="border: 1px solid #ccc; padding: 12px; border-radius: 6px; background: #fff;">
        <img src="${country.flags.png}" alt="Flag" width="80" style="border: 1px solid #eee">
         <p>
            <b>${country.name.common}</b><br>
            <small>Region: ${country.region}</small><br>
            Pop: ${country.population.toLocaleString()}
         </p>
    </div>`;
  });
  container.innerHTML = htmlOutput;
}

// --- NEW: Function to filter countries locally ---
function filterCountries() {
  const searchTerm = document
    .getElementById("countrySearch")
    .value.toLowerCase();
  const regionTerm = document
    .getElementById("regionSelect")
    .value.toLowerCase();

  const filtered = allCountries.filter((country) => {
    const matchesName = country.name.common.toLowerCase().includes(searchTerm);
    const matchesRegion =
      regionTerm === "all" || country.region.toLowerCase() === regionTerm;
    return matchesName && matchesRegion;
  });

  displayCountriesData(filtered);
}

// --- POKEMON FETCH (No changes needed here) ---
async function fetchPokemonData(name = "") {
  const container = document.getElementById("remote-data-container");
  try {
    const safeName = encodeURIComponent(name.toLowerCase().trim());
    const url = name
      ? `https://pokeapi.co/api/v2/pokemon/${safeName}`
      : `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${Math.floor(Math.random() * 500)}`;

    const response = await fetch(url);
    if (!response.ok) {
      container.innerHTML = `<p class="no-results">No Pokémon found matching "${name}".</p>`;
      return;
    }
    const data = await response.json();
    if (name) {
      displaySinglePokemon(data);
    } else {
      displayPokemonList(data.results);
    }
  } catch (error) {
    showError();
  }
}

function displayPokemonList(pokemonArray) {
  const container = document.getElementById("remote-data-container");
  container.innerHTML = "";
  pokemonArray.forEach((pokemon) => {
    const urlParts = pokemon.url.split("/");
    const id = urlParts[urlParts.length - 2];
    renderPokemonCard(id, pokemon.name);
  });
}

function displaySinglePokemon(pokemon) {
  const container = document.getElementById("remote-data-container");
  container.innerHTML = "";
  renderPokemonCard(pokemon.id, pokemon.name);
}

function renderPokemonCard(id, name) {
  const container = document.getElementById("remote-data-container");
  const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const card = document.createElement("div");
  card.style =
    "border: 1px solid #eee; padding: 15px; border-radius: 10px; text-align: center; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";
  card.innerHTML = `<img src="${imgUrl}" alt="${name}" style="width: 120px; height: 120px; object-fit: contain;"><p style="text-transform: capitalize; font-weight: bold; margin-top: 10px;">#${id} ${name}</p>`;
  container.appendChild(card);
}

// 3. EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
  const btnContainer = document.getElementById("button-container");
  const pokemonFilter = document.getElementById("filter-pokemon");
  const countryFilter = document.getElementById("filter-countries"); // New reference
  const pokemonSearch = document.getElementById("pokemonSearch");

  btnContainer.addEventListener("click", (e) => {
    // Hide all filters initially
    pokemonFilter.style.display = "none";
    countryFilter.style.display = "none";

    if (e.target.id === "btn-countries") {
      countryFilter.style.display = "block"; // Show country filter
      fetchCountriesData();
    } else if (e.target.id === "btn-nintendo") {
      pokemonFilter.style.display = "block";
      pokemonSearch.value = "";
      fetchPokemonData();
    }
  });

  // --- New listeners for Country Filter ---
  document
    .getElementById("countrySearch")
    .addEventListener("input", filterCountries);
  document
    .getElementById("regionSelect")
    .addEventListener("change", filterCountries);

  // Pokemon Search logic
  pokemonSearch.addEventListener("input", () => {
    const term = pokemonSearch.value.trim();
    if (term.length > 2) {
      fetchPokemonData(term);
    } else if (term === "") {
      fetchPokemonData();
    }
  });
});

function showError() {
  document.getElementById("remote-data-container").innerHTML =
    '<p style="color: red;">Connection error.</p>';
}
