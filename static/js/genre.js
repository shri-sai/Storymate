// genre.js
const API_BASE = "http://127.0.0.1:8000";

const urlParams = new URLSearchParams(window.location.search);
const genreId = urlParams.get("id");

const genreTitleEl = document.getElementById("genreTitle");
const grid = document.getElementById("genreStoriesGrid");
const genreDropdown = document.getElementById("genreDropdown");
const readingListDropdown = document.getElementById("readingListDropdown");

// TODO: replace with logged-in user's UUID later
const USER_ID = localStorage.getItem("userId");

// Create story card
function createCard(story) {
  const card = document.createElement("article");
  card.className = "story-card";
  card.innerHTML = `
    <img src="${story.image_url}" alt="${story.title}">
    <div class="card-overlay">
      <div class="card-header"><h3>${story.title}</h3></div>
      <div class="card-details">
        <p class="card-blurb">${story.blurb ?? ""}</p>
        <div class="card-meta">
          <span>${story.rating != null ? story.rating.toFixed(1) : ""}</span>
          <span>${story.estimated_read_time ? `${story.estimated_read_time} min read` : ""}</span>
          <span>${story.author_name ?? ""}</span>
        </div>
      </div>
    </div>
  `;
  // 👉 add click here
  card.addEventListener("click", () => {
    window.location.href = `/story.html?id=${story.story_id}`;
  });
  return card;
}
// ----------------------
// Load Genres Dropdown
// ----------------------
async function loadGenres() {
  try {
    const res = await fetch(`${API_BASE}/genre/list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const genres = await res.json();

    genreDropdown.innerHTML = "";
    genres.forEach(g => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `/genre.html?id=${g.genre_id}`;
      a.textContent = g.genre_name;
      li.appendChild(a);
      genreDropdown.appendChild(li);
    });

    const current = genres.find(g => String(g.genre_id) === String(genreId));
    genreTitleEl.textContent = current ? current.genre_name : "Genre";
  } catch (err) {
    console.error("Failed to load genre list:", err);
    genreTitleEl.textContent = "Genre";
  }
}

// ----------------------
// Load Reading Lists Dropdown
// ----------------------
async function loadReadingLists() {
  try {
    const res = await fetch(`${API_BASE}/reading_lists/${USER_ID}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lists = await res.json();

    readingListDropdown.innerHTML = "";
    lists.forEach(list => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `/readinglist.html?listId=${list.reading_list_id}`;
      a.textContent = list.reading_list_name;
      li.appendChild(a);
      readingListDropdown.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load reading lists:", err);
    readingListDropdown.innerHTML = `<li><span style="padding:8px;display:block">Failed to load</span></li>`;
  }
}

// ----------------------
// Load Stories of a Genre
// ----------------------
async function loadGenreStories() {
  if (!genreId) {
    grid.innerHTML = "<p>Genre not found.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/genre/${genreId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const genreData = await res.json();

    grid.innerHTML = "";
    if (!genreData.stories || genreData.stories.length === 0) {
      grid.innerHTML = "<p>No stories found in this genre.</p>";
      return;
    }

    genreData.stories.forEach(story => grid.appendChild(createCard(story)));
  } catch (err) {
    console.error("Failed to load genre stories:", err);
    grid.innerHTML = "<p>Failed to load stories.</p>";
  }
}

// ----------------------
// Run on page load
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadReadingLists();
  loadGenreStories();
});
