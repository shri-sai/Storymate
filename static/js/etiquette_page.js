const API_BASE = "http://127.0.0.1:8000";
const USER_ID = localStorage.getItem("userId");

// extract etiquette ID from the URL (e.g., etiquette_page.html?id=xxxx)
const urlParams = new URLSearchParams(window.location.search);
const etiquetteId = urlParams.get("id");

/* ===== Utilities ===== */
const $ = (sel, parent = document) => parent.querySelector(sel);

function toast(msg, type = "ok") {
  const stack = $("#toastStack");
  if (!stack) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}


// get DOM elements
const slideContainer = document.getElementById("slide");
const title = document.querySelector(".hero h1");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const indicatorContainer = document.getElementById("indicatorContainer");

let currentSlide = 0;
let totalSlides = 0;
let slideWidth = 0;

// === Load slides dynamically from backend ===
async function loadSlides() {
  try {
    const response = await fetch(`${API_BASE}/etiquettes/${etiquetteId}`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const slides = await response.json();

    slideContainer.innerHTML = ""; // clear placeholder slides
    indicatorContainer.innerHTML = ""; // clear previous indicators
    totalSlides = slides.length;

    // build slides dynamically
    slides.forEach((s, index) => {
      const slideCol = document.createElement("div");
      slideCol.classList.add("slide-col");

      slideCol.innerHTML = `
        <div class="user-text">
          <h3>${s.title}</h3>
          <p>${s.content}</p>
        </div>
        <div class="user-img">
          <img src="${API_BASE}${s.image_url}" alt="etiquette slide image">
        </div>
      `;

      slideContainer.appendChild(slideCol);

      // create indicator dot for each slide
      const dot = document.createElement("span");
      dot.classList.add("btn");
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        currentSlide = index;
        updateSlide();
      });
      indicatorContainer.appendChild(dot);
    });

    // set title dynamically from the first slide
if (slides.length > 0 && slides[0].title) {
  title.textContent = slides[0].title;
} else {
  title.textContent = "Etiquette Slides";
}


    // initialize slider
    slideWidth = document.querySelector(".slide-col").clientWidth;
    updateSlide();
  } catch (error) {
    console.error("Error loading slides:", error);
    slideContainer.innerHTML = "<p>Failed to load slides.</p>";
  }
}

// === Slide control functions ===
function updateSlide() {
  slideContainer.style.transform = `translateX(${-slideWidth * currentSlide}px)`;

  // update active indicator dot
  const allDots = document.querySelectorAll(".indicator .btn");
  allDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

nextBtn.addEventListener("click", () => {
  currentSlide++;
  if (currentSlide >= totalSlides) currentSlide = 0;
  updateSlide();
});

prevBtn.addEventListener("click", () => {
  currentSlide--;
  if (currentSlide < 0) currentSlide = totalSlides - 1;
  updateSlide();
});

// === Load everything when page starts ===
loadSlides();

/* ===== ETIQUETTE FEEDBACK ===== */
async function sendEtiquetteFeedback(reaction, reason = null, comment = null) {
  try {
    const response = await fetch(`${API_BASE}/etiquettes/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        etiquette_id: etiquetteId,
        reaction,
        reason,
        comment,
      }),
    });

    if (response.ok) {
      toast(`Feedback submitted: ${reaction} ✅`, "ok");
    } else {
      const err = await response.json();
      toast("Error: " + (err.detail || "Could not send feedback"), "warn");
    }

  } catch (error) {
    alert("Network error: " + error.message, "warn");
  }
}

/* ===== Bind Feedback Buttons ===== */
document.getElementById("likeBtn")?.addEventListener("click", () => sendEtiquetteFeedback("like"));
document.getElementById("loveBtn")?.addEventListener("click", () => sendEtiquetteFeedback("love"));

document.getElementById("dislikeBtn")?.addEventListener("click", () => {
  document.getElementById("dislikePopup")?.classList.remove("hidden");
});

document.getElementById("reportBtn")?.addEventListener("click", () => {
  document.getElementById("reportPopup")?.classList.remove("hidden");
});

document.getElementById("dislikeSubmit")?.addEventListener("click", () => {
  const comment = document.getElementById("dislikeComment")?.value || null;
  sendEtiquetteFeedback("dislike", "reason-not-specified", comment);
  document.getElementById("dislikePopup")?.classList.add("hidden");
});

document.getElementById("reportSubmit")?.addEventListener("click", () => {
  const comment = document.getElementById("reportComment")?.value || null;
  sendEtiquetteFeedback("report", "reason-not-specified", comment);
  document.getElementById("reportPopup")?.classList.add("hidden");
});

/* ===== Close Popups ===== */
document.querySelectorAll(".closePopup").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("dislikePopup")?.classList.add("hidden");
    document.getElementById("reportPopup")?.classList.add("hidden");
  });
});
