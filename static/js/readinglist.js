// readinglist.js
const API_BASE = "http://127.0.0.1:8000";

// elements
const titleEl = document.getElementById("readingListTitle");
const gridEl = document.getElementById("readingListStoriesGrid");
const readingListDropdown = document.getElementById("readingListDropdown");
const genreDropdown = document.getElementById("genreDropdown");

// parse listId from URL
const params = new URLSearchParams(window.location.search);
const listId = params.get("listId");

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
  } catch (err) {
    console.error("Failed to load genres:", err);
    genreDropdown.innerHTML = `<li><span style="padding:8px;display:block">Failed to load genres</span></li>`;
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
// Load Reading List Page
// ----------------------
async function loadReadingListPage() {
  if (!listId) {
    titleEl.textContent = "Reading List";
    gridEl.innerHTML = "<p>No reading list selected.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/reading_list/${listId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json(); // { reading_list_id, reading_list_name, stories: [...] }

    titleEl.textContent = data.reading_list_name || "Reading List";

    gridEl.innerHTML = "";
    if (!data.stories || data.stories.length === 0) {
      gridEl.innerHTML = "<p>No stories in this list.</p>";
      return;
    }

    data.stories.forEach(story => gridEl.appendChild(createCard(story)));
  } catch (err) {
    console.error("Failed to load reading list:", err);
    gridEl.innerHTML = "<p>Failed to load stories.</p>";
  }
}

// ----------------------
// Run on page load
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadReadingLists();
  loadReadingListPage();
});
