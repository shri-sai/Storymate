// login.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  const emailInput = form.querySelector("input[placeholder='Email']");
  const passwordInput = document.getElementById("loginPassword");
  const msg = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      email_id: emailInput.value.trim(),
      password: passwordInput.value
    };

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        msg.textContent = errData.detail || "Login failed";
        msg.className = "message error";
        msg.style.display = "block";
        return;
      }

      const user = await res.json();

      // ✅ Save user id for later
      localStorage.setItem("userId", user.user_id);

      msg.textContent = "Login successful! Redirecting...";
      msg.className = "message success";
      msg.style.display = "block";

      // Redirect after 1.5 sec
      window.location.href = "/templates/dashboard.html";
    } catch (err) {
      console.error("Login error:", err);
      msg.textContent = "An error occurred. Please try again later.";
      msg.className = "message error";
      msg.style.display = "block";
    }
  });
});

// toggle password show/hide
window.togglePassword = function (inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈"; // change icon
  } else {
    input.type = "password";
    btn.textContent = "👁️"; // reset icon
  }
};
