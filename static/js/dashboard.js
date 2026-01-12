// dashboard.js
const API_BASE = "http://127.0.0.1:8000";
const USER_ID = localStorage.getItem("userId");

// ----------------------
// Load Genres Dropdown
// ----------------------
const genreDropdown = document.getElementById("genreDropdown");

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
const readingListDropdown = document.getElementById("readingListDropdown");

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
  } catch (e) {
    console.error("Reading lists failed:", e);
    readingListDropdown.innerHTML =
      `<li><span style="padding:8px;display:block">Failed to load</span></li>`;
  }
}

// ----------------------
// Completed Stories
// ----------------------
async function loadCompletedStories(userId) {
  try {
    const res = await fetch(`${API_BASE}/completed_stories/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch completed stories");

    const data = await res.json();
    const grid = document.getElementById("completedStoriesGrid");
    grid.innerHTML = "";

    if (data.length === 0) {
      grid.innerHTML = `<p>No completed stories yet.</p>`;
      return;
    }

    data.forEach(story => {
      const card = document.createElement("article");
      card.classList.add("story-card");

      card.innerHTML = `
        <img src="${story.image_url}" alt="${story.title}">
        <div class="card-overlay">
          <div class="card-header"><h3>${story.title}</h3></div>
          <div class="card-details">
            <p class="card-blurb">${story.blurb}</p>
            <div class="card-meta">
              <span>${story.rating ? story.rating.toFixed(1) : "N/A"}</span>
              <span>${story.estimated_read_time} min read</span>
              <span>${story.author_name}</span>
            </div>
          </div>
        </div>
      `;
      // 👉 click -> story page
      card.addEventListener("click", () => {
        window.location.href = `/story.html?id=${story.story_id}`;
      });

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading completed stories:", error);
    document.getElementById("completedStoriesGrid").innerHTML =
      `<p>Failed to load completed stories.</p>`;
  }
}

// ----------------------
// Continue Reading
// ----------------------
async function loadContinueReading() {
  try {
    const response = await fetch(`${API_BASE}/stories/continue/${USER_ID}`);
    if (!response.ok) throw new Error("Failed to fetch continue reading stories");

    const stories = await response.json();
    const grid = document.getElementById("continueReadingGrid");
    grid.innerHTML = "";

    if (stories.length === 0) {
      grid.innerHTML = `<p>No stories in progress.</p>`;
      return;
    }

    stories.forEach(story => {
      const card = document.createElement("article");
      card.classList.add("story-card");

      card.innerHTML = `
        <img src="${story.image_url}" alt="${story.title}">
        <div class="card-overlay">
          <div class="card-header"><h3>${story.title}</h3></div>
          <div class="card-details">
            <p class="card-blurb">${story.blurb}</p>
            <div class="card-meta">
              <span>${story.rating ? story.rating.toFixed(1) : "N/A"}</span>
              <span>${story.estimated_read_time} min read</span>
              <span>${story.author_name}</span>
            </div>
          </div>
        </div>
      `;
      // 👉 click -> story page
      card.addEventListener("click", () => {
        window.location.href = `/story.html?id=${story.story_id}`;
      });

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading continue reading:", error);
    document.getElementById("continueReadingGrid").innerHTML =
      `<p>Failed to load stories.</p>`;
  }
}

// ----------------------
// Run on page load + Logout
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadReadingLists();
  loadCompletedStories(USER_ID);
  loadContinueReading();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userId"); // clear stored user
      window.location.href = "/login.html"; // go back to login
    });
  }
});