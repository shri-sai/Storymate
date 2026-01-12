// video_player.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("video_id");

  const titleEl = document.getElementById("videoTitle");
  const frameEl = document.getElementById("videoFrame");

  if (!videoId) {
    titleEl.textContent = "No video selected.";
    return;
  }

  // Fetch the video details from backend
  fetch(`http://127.0.0.1:8000/video/${videoId}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch video");
      return res.json();
    })
    .then(video => {
      // Set title
      titleEl.textContent = video.title;

      // Use DB embed URL directly
      frameEl.src = video.video_url;
      frameEl.style.display = "block";
    })
    .catch(err => {
      console.error("Error loading video:", err);
      titleEl.textContent = "Error loading video.";
    });
});
