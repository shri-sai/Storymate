/* script.js
   SPA navigation + video grid + player interactions
   Uses the video list extracted from your uploaded doc. (source file)
*/

/* ----------------------
   Video dataset (extracted from Insert statement.docx)
   Fields: id, title, blurb, duration (string), seconds (computed)
   ---------------------- */

/* NOTE: these entries were parsed from your document. Citation: uploaded file. :contentReference[oaicite:1]{index=1} */
const videos = [
  { id: "PbcMRDl_OpQ", title: "Behavior Change", blurb: "A quick spark of inspiration in under a minute. Perfect for a fast dose of motivation.", duration: "11:18" },
  { id: "5BuHC8wBdBU", title: "Self Improvement", blurb: "Where every second tells a deeper story. Short content that leaves a lasting impression.", duration: "4:59" },
  { id: "p_7QxYN8Bd8", title: "SWOT Analysis", blurb: "A moment that sticks with you. Brief but deeply memorable.", duration: "2:23" },
  { id: "QX_oy9614HQ", title: "Delayed Gratification", blurb: "Challenge your impulse — wait a little, gain more. Patience turns seconds into insight.", duration: "3:28" },
  { id: "uPD6n9gwmDM", title: "Infographics", blurb: "A flash of thought, captured. Quick ideas worth your attention.", duration: "2:48" },
  { id: "_pbcmPyqshA", title: "Communication Hack", blurb: "Less than a minute, lasting impact. Time-efficient yet thought-provoking.", duration: "02:00" },
  { id: "a08Dr61Tuig", title: "Self Confidence", blurb: "Self-confidence isn’t about being perfect — it’s about trusting yourself. Believe in your worth, speak your truth.", duration: "3:57" },
  { id: "by1QAoRcc-U", title: "Speaking Skills", blurb: "Short, sharp, unforgettable. Crisp content that hits the mark.", duration: "8:42" },
  { id: "4ncLB3JPy_w", title: "Grammar", blurb: "A colorful adventure where words come alive and grammar becomes easy, silly, and super fun.", duration: "1:38:34" },
  { id: "jBEVDM0BEdI", title: "Developing Habits", blurb: "Healthy Habits Every Kid Needs to Know! Join Nastya as she explores fun ways to stay healthy and active.", duration: "20:19" }
];

/* parse duration string into seconds (handles mm:ss and hh:mm:ss) */
function durationToSeconds(d) {
  const parts = d.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return parseInt(parts[0], 10) || 0;
}

/* add seconds field & type (long > 180 seconds) */
videos.forEach(v => {
  v.seconds = durationToSeconds(v.duration.replace(/\s/g,''));
  v.type = v.seconds > 180 ? 'long' : 'short';
});

/* ----------------------
   DOM refs
   ---------------------- */
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const longGrid = document.getElementById('longGrid');
const shortGrid = document.getElementById('shortGrid');
const videosBack = document.getElementById('videosBack');
const playerBack = document.getElementById('playerBack');
const playerSection = document.getElementById('player');
const playerCenter = document.getElementById('playerCenter');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const loveBtn = document.getElementById('loveBtn');
const reportBtn = document.getElementById('reportBtn');
const markWatchedBtn = document.getElementById('markWatchedBtn');
const popup = document.getElementById('popup');
const enterFullscreen = document.getElementById('enterFullscreen');

/* store current video state */
let currentVideo = null;

/* ----------------------
   SPA Navigation
   ---------------------- */
function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) page.classList.add('active');

  // update nav active link
  navLinks.forEach(a => {
    const target = a.dataset.page;
    if (target === id) a.classList.add('active');
    else a.classList.remove('active');
  });

  // scroll to top each time
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* hook nav link clicks */
navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const page = a.dataset.page;
    if (page) showPage(page);
  });
});

/* back buttons */
videosBack.addEventListener('click', () => showPage('home'));
playerBack.addEventListener('click', () => {
  unloadPlayer();
  showPage('videos');
});

/* ----------------------
   Build grids
   ---------------------- */
function createCard(video) {
  const card = document.createElement('article');
  card.className = 'video-card';
  card.innerHTML = `
    <div class="video-thumb" data-id="${video.id}">
      <iframe src="https://www.youtube.com/embed/${video.id}?rel=0&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div class="overlay">
        <div class="play-overlay">
          <button class="play-btn" data-id="${video.id}">▶ Play</button>
        </div>
      </div>
    </div>
    <div class="video-info">
      <div class="video-title">${video.title}</div>
      <div class="video-blurb">${video.blurb}</div>
    </div>
  `;
  // clicking play button enters player page
  card.querySelector('.play-btn').addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    openPlayer(id);
  });

  return card;
}

function populateGrids() {
  longGrid.innerHTML = '';
  shortGrid.innerHTML = '';
  videos.forEach(v => {
    const c = createCard(v);
    if (v.type === 'long') longGrid.appendChild(c);
    else shortGrid.appendChild(c);
  });
}

/* ----------------------
   Player behaviors
   ---------------------- */
function openPlayer(id) {
  currentVideo = videos.find(v => v.id === id);
  if (!currentVideo) return;
  // create iframe (set autoplay=1 to start in player)
  playerCenter.innerHTML = `<iframe id="playerIframe" src="https://www.youtube.com/embed/${id}?rel=0&autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  // reset controls
  likeBtn.classList.remove('active');
  loveBtn.classList.remove('active');
  markWatchedBtn.disabled = false;
  markWatchedBtn.textContent = 'Mark as watched';
  showPage('player');
}

/* unload (stop playback) */
function unloadPlayer() {
  playerCenter.innerHTML = '';
  currentVideo = null;
}

/* like / dislike / love / report interactions */
likeBtn.addEventListener('click', () => {
  likeBtn.classList.toggle('active');
  // if liked, ensure dislike not active
  if (likeBtn.classList.contains('active')) {
    dislikeBtn.classList.remove('active');
  }
});

// dislike => show "not for me" popup for 2 seconds
dislikeBtn.addEventListener('click', () => {
  // visual press
  dislikeBtn.classList.add('active');
  likeBtn.classList.remove('active');
  popup.textContent = 'Not for me';
  popup.classList.remove('hidden');
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hidden');
    dislikeBtn.classList.remove('active');
  }, 2000);
});

loveBtn.addEventListener('click', () => {
  loveBtn.classList.toggle('active');
  // style fill simulated by CSS active class
});

// report just shows a small confirmation (could ping backend)
reportBtn.addEventListener('click', () => {
  popup.textContent = 'Reported';
  popup.classList.remove('hidden');
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hidden');
  }, 1400);
});

/* Mark as watched -> disabled and state changes */
markWatchedBtn.addEventListener('click', () => {
  markWatchedBtn.textContent = 'Watched';
  markWatchedBtn.disabled = true;
  // optional: mark in local storage for persistence
  if (currentVideo) {
    localStorage.setItem(`watched_${currentVideo.id}`, '1');
  }
});

/* Fullscreen: use Fullscreen API on playerCenter (stays on same page) */
enterFullscreen.addEventListener('click', () => {
  const el = playerCenter;
  if (!el) return;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
});

/* ----------------------
   On load
   ---------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateGrids();

  // if a video was watched earlier, disable its watched button when opening player
  // (we set markWatchedBtn always enabled on open, but restore here)
  // Optional: mark watched badges on grid cards
  videos.forEach(v => {
    if (localStorage.getItem(`watched_${v.id}`)) {
      // add small 'watched' label to the matching grid card if present
      const thumbs = document.querySelectorAll(`.video-thumb[data-id="${v.id}"]`);
      thumbs.forEach(t => {
        const lbl = document.createElement('div');
        lbl.style.position = 'absolute';
        lbl.style.top = '8px';
        lbl.style.right = '8px';
        lbl.style.background = 'rgba(0,0,0,0.6)';
        lbl.style.color = '#fff';
        lbl.style.padding = '6px 8px';
        lbl.style.fontSize = '12px';
        lbl.style.borderRadius = '8px';
        lbl.textContent = 'Watched';
        t.appendChild(lbl);
      });
    }
  });

  // hook nav link with scrolling to completedStories anchor (if any)
  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const sel = a.getAttribute('data-scroll');
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
