/* ===== Config ===== */
const API_BASE = "http://127.0.0.1:8000";
const USER_ID = localStorage.getItem("userId");

// Get story_id from URL (?id=...)
const params = new URLSearchParams(window.location.search);
const STORY_ID = params.get("id");

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

/* ===== Load Story Details ===== */
async function loadStory() {
  try {
    const res = await fetch(`${API_BASE}/story/${STORY_ID}`);
    if (!res.ok) throw new Error("Failed to load story");

    const story = await res.json();

    // Fill UI (use IDs)
    $("#storyImage").src = story.image_url || "";
    $("#storyTitle").textContent = story.title || "Untitled Story";
    $("#storyMeta").textContent = `Reading Time: ${story.estimated_read_time} min • Author: ${story.author_name} • ⭐ ${
      story.rating ?? "N/A"
    }`;
    $("#storyContent").innerHTML = story.content || "";

    /* ===== US-SM-Translation: Translate to Tamil ===== */
    const translateBtn = $("#translateBtn");

    let isTamil = false;
    let originalStory = {}; // to restore English later

    translateBtn?.addEventListener("click", async () => {
      // Toggle back to English
      if (isTamil) {
        $("#storyTitle").textContent = originalStory.title;
        $("#storyMeta").textContent = `Reading Time: ${originalStory.estimated_read_time} min • Author: ${originalStory.author_name} • ⭐ ${originalStory.rating ?? "N/A"}`;
        $("#storyContent").innerHTML = originalStory.content;
        translateBtn.innerHTML = `<i class="fa-solid fa-language"></i> Translate to Tamil`;
        isTamil = false;
        return;
      }

      // First time: fetch translation
      try {
        const res = await fetch(`${API_BASE}/translations/${STORY_ID}`);
        if (!res.ok) throw new Error("No Tamil translation found");

        const translation = await res.json();

        // Store English version for toggle
        if (!originalStory.title) {
          originalStory = {
            title: $("#storyTitle").textContent,
            author_name: $("#storyMeta").textContent.split("Author: ")[1]?.split(" •")[0],
            estimated_read_time: $("#storyMeta").textContent.split("Reading Time: ")[1]?.split(" min")[0],
            rating: $("#storyMeta").textContent.split("⭐ ")[1] || "N/A",
            content: $("#storyContent").innerHTML
          };
        }

        // Replace UI with Tamil
        $("#storyTitle").textContent = translation.title;
        $("#storyMeta").textContent = `Reading Time: ${translation.estimated_read_time || "—"} min • Author: ${translation.author_name || "—"}`;
        $("#storyContent").innerHTML = translation.content;

        translateBtn.innerHTML = `<i class="fa-solid fa-language"></i> Show English`;
        isTamil = true;
      } catch (err) {
        console.error("Error fetching translation:", err);
        toast("Tamil translation not found ❌", "warn");
      }
    });


    // Mark as in progress
    await fetch(`${API_BASE}/story/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        story_id: STORY_ID,
        status: "in progress",
      }),
    });
  } catch (err) {
    console.error("Error fetching story:", err);
    toast("Could not load story ❌", "warn");
  }
}


/* ===== US-SM-001: Mark as Completed ===== */
const markCompletedBtn = $("#markCompletedBtn");
if (markCompletedBtn) {
  markCompletedBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE}/story/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          story_id: STORY_ID,
          status: "completed",
        }),
      });

      if (response.ok) {
        toast("Story marked as completed ✅", "ok");
        markCompletedBtn.textContent = "✓ Completed";
        markCompletedBtn.disabled = true;
      } else {
        const err = await response.json();
        toast("Error: " + (err.detail || "Could not complete story"), "warn");
      }
    } catch (error) {
      toast("Network error: " + error.message, "warn");
    }
  });
}

/* ===== US-SM-002: Feedback ===== */
async function sendFeedback(reaction, reason = null, comment = null) {
  try {
    const response = await fetch(`${API_BASE}/story/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        story_id: STORY_ID,
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
    toast("Network error: " + error.message, "warn");
  }
}

// Like & Love
$("#likeBtn")?.addEventListener("click", () => sendFeedback("like"));
$("#loveBtn")?.addEventListener("click", () => sendFeedback("love"));

// Dislike
$("#dislikeSubmit")?.addEventListener("click", () => {
  const comment = $("#dislikeComment")?.value || null;
  sendFeedback("dislike", "reason-not-specified", comment);
  $("#dislikePopup")?.classList.add("hidden");
});

// Report
$("#reportSubmit")?.addEventListener("click", () => {
  const comment = $("#reportComment")?.value || null;
  sendFeedback("report", "reason-not-specified", comment);
  $("#reportPopup")?.classList.add("hidden");
});

/* ===== US-SM-003: Reading List ===== */
const saveBtn = $("#saveListBtn");
const listPopup = $("#listPopup");
const popupListOptions = $("#popupListOptions");
const newListForm = $("#newListForm");
const newListNameInput = $("#newListName");
const createListConfirm = $("#createListConfirm");

// Open popup
saveBtn?.addEventListener("click", async () => {
  listPopup.classList.remove("hidden");
  await loadReadingLists();
});

// Load reading lists into popup
async function loadReadingLists() {
  if (!popupListOptions) return;
  try {
    const res = await fetch(`${API_BASE}/reading_lists/${USER_ID}`);
    if (!res.ok) throw new Error("Failed to fetch reading lists");

    const lists = await res.json();
    popupListOptions.innerHTML = "";

    lists.forEach((list) => {
      const li = document.createElement("li");
      li.dataset.listId = list.reading_list_id;
      li.textContent = list.reading_list_name;
      popupListOptions.appendChild(li);
    });

    // Add "Create New" option
    const createLi = document.createElement("li");
    createLi.dataset.list = "createNew";
    createLi.textContent = "+ Create New List";
    popupListOptions.appendChild(createLi);
  } catch (err) {
    console.error("Error loading lists:", err);
    toast("Could not load reading lists ❌", "warn");
  }
}

// Handle list selection
popupListOptions?.addEventListener("click", async (e) => {
  if (e.target.tagName !== "LI") return;

  if (e.target.dataset.list === "createNew") {
    newListForm.classList.remove("hidden");
  } else {
    const listId = e.target.dataset.listId;
    const listName = e.target.textContent;
    await addStoryToList(listId, listName);
    listPopup.classList.add("hidden");
  }
});

// Create new list
createListConfirm?.addEventListener("click", async () => {
  const newName = newListNameInput.value.trim();
  if (!newName) {
    toast("Please enter a name ❌", "warn");
    return;
  }

  try {
    const createRes = await fetch(`${API_BASE}/reading_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: USER_ID,
        reading_list_name: newName,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      toast("Error creating list: " + (err.detail || "Unknown error"), "warn");
      return;
    }

    const createdList = await createRes.json();
    await addStoryToList(createdList.reading_list_id, newName);

    newListForm.classList.add("hidden");
    newListNameInput.value = "";
    listPopup.classList.add("hidden");
  } catch (error) {
    toast("Network error: " + error.message, "warn");
  }
});

// Helper: add story to list
async function addStoryToList(listId, listName) {
  try {
    const res = await fetch(`${API_BASE}/reading-list/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reading_list_id: listId,
        story_id: STORY_ID,
      }),
    });

    if (res.ok) {
      toast(`Story saved to ${listName} ✅`, "ok");
    } else {
      const err = await res.json();
      toast("Error adding story: " + (err.detail || "Unknown error"), "warn");
    }
  } catch (error) {
    toast("Network error: " + error.message, "warn");
  }
}

/* ===== Popups ===== */
$("#dislikeBtn")?.addEventListener("click", () => {
  $("#dislikePopup")?.classList.remove("hidden");
});
$("#reportBtn")?.addEventListener("click", () => {
  $("#reportPopup")?.classList.remove("hidden");
});
document.querySelectorAll(".closePopup").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("#dislikePopup")?.classList.add("hidden");
    $("#reportPopup")?.classList.add("hidden");
    $("#listPopup")?.classList.add("hidden");
    newListForm?.classList.add("hidden");
  });
});

/* ===== US-SM-AUDIO: Load and Attach Audio ===== */
async function loadAudio() {
  try {
    const res = await fetch(`${API_BASE}/audio/${STORY_ID}`);
    if (!res.ok) {
      console.warn("No audio found for this story.");
      // optional: hide the play button if no audio
      document.getElementById("playAudioBtn")?.classList.add("hidden");
      return;
    }

    const audioData = await res.json();
    const storyAudio = document.getElementById("storyAudio");

    // assign the Google Drive audio URL
    storyAudio.src = audioData.audio_url;

    // activate play/pause toggle
    const playAudioBtn = document.getElementById("playAudioBtn");
    playAudioBtn.addEventListener("click", () => {
      if (storyAudio.paused) {
        storyAudio.play();
        playAudioBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Audio`;
      } else {
        storyAudio.pause();
        playAudioBtn.innerHTML = `<i class="fa-solid fa-volume-up"></i> Play Audio`;
      }
    });

    // reset button when audio ends
    storyAudio.addEventListener("ended", () => {
      playAudioBtn.innerHTML = `<i class="fa-solid fa-volume-up"></i> Play Audio`;
    });

  } catch (error) {
    console.error("Error fetching audio:", error);
  }
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  loadStory();
  loadAudio();


});
