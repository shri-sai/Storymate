// video.js
const API_BASE = "http://127.0.0.1:8000";
const USER_ID = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", () => {
  const longGrid = document.getElementById("longGrid");
  const shortGrid = document.getElementById("shortGrid");
  loadGenres();
  loadReadingLists();


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

  // Fetch videos from backend
  fetch("http://127.0.0.1:8000/videos")  
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json();
    })
    .then(data => {
      // Populate long videos
      data.long_videos.forEach(video => {
        const card = createVideoCard(video);
        longGrid.appendChild(card);
      });

      // Populate short videos
      data.short_videos.forEach(video => {
        const card = createVideoCard(video);
        shortGrid.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error loading videos:", err);
    });
});

// Create a video card element
function createVideoCard(video) {
  const card = document.createElement("article");
  card.className = "video-card";

  card.innerHTML = `
    <img src="${video.thumbnail_url}" alt="${video.title}">
    <div class="video-overlay">
        <div class="overlay-title">${video.title}</div>
        <div class="overlay-blurb">${video.blurb}</div>
      <div class="overlay-meta">
        <span> duration: ${video.duration || "N/A"}</span>
      </div>
    </div>
  `;

  // When a card is clicked → go to video.html with video_id
    card.addEventListener("click", () => {
    window.location.href = `/video_player.html?video_id=${video.video_id}`;
    });



  return card;
}

// ----------------------
// Run on page load
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadReadingLists();
});
