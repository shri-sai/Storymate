// signup.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  const emailInput = form.querySelector("input[placeholder='Email Id']");
  const userNameInput = form.querySelector("input[placeholder='User Name']");
  const passwordInput = document.getElementById("signupPassword");
  const confirmInput = document.getElementById("signupConfirmPassword");
  const requirementsBox = document.getElementById("requirements");
  const matchError = document.getElementById("matchError");

  const checks = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*]/,
  };

  // === Password live validation ===
  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
      requirementsBox.style.display = "block";
    } else {
      requirementsBox.style.display = "none";
    }

    for (let key in checks) {
      const item = document.getElementById(key);
      if (checks[key].test(passwordInput.value)) {
        item.classList.add("valid");
      } else {
        item.classList.remove("valid");
      }
    }

    // check match live
    if (confirmInput.value.length > 0) {
      if (confirmInput.value !== passwordInput.value) {
        matchError.style.display = "block";
      } else {
        matchError.style.display = "none";
      }
    }
  });

  // confirm password live check
  confirmInput.addEventListener("input", () => {
    if (confirmInput.value !== passwordInput.value) {
      matchError.style.display = "block";
    } else {
      matchError.style.display = "none";
    }
  });

  // toggle password show/hide
  window.togglePassword = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "🙈";
    } else {
      input.type = "password";
      btn.textContent = "👁️";
    }
  };

  // === Submit form ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop default HTML form submit

    // final password rules check
    for (let key in checks) {
      if (!checks[key].test(passwordInput.value)) {
        const msg = document.getElementById("message");
        msg.textContent = "Password does not meet all requirements.";
        msg.className = "message error";
        msg.style.display = "block";
        return;
      }
    }

    if (passwordInput.value !== confirmInput.value) {
      matchError.style.display = "block";
      const msg = document.getElementById("message");
      msg.textContent = "Passwords do not match!";
      msg.className = "message error";
      msg.style.display = "block";
      return;
    }

    const payload = {
      email_id: emailInput.value.trim(),
      user_name: userNameInput.value.trim(),
      password: passwordInput.value,
      confirm_password: confirmInput.value,
    };

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const msg = document.getElementById("message");

      if (!res.ok) {
        const errData = await res.json();
        msg.textContent = errData.detail || "Sign up failed";
        msg.className = "message error";
        msg.style.display = "block";
        return;
      }

      // success
      msg.textContent = "Account created successfully! Please log in.";
      msg.className = "message success";
      msg.style.display = "block";

      // redirect after 2 sec
        window.location.href = "/login.html";
    } catch (err) {
      const msg = document.getElementById("message");
      msg.textContent = "An error occurred. Please try again later.";
      msg.className = "message error";
      msg.style.display = "block";
      console.error("Signup error:", err);
    }
  });
});
