const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const signupMessage = document.querySelector("#signup-message");
const signupTab = document.querySelector("#signup-tab");
const loginTab = document.querySelector("#login-tab");

function showSignupForm() {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupMessage.textContent = "";
}

function showLoginForm() {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  signupMessage.textContent = "";
}

signupTab?.addEventListener("click", showSignupForm);
loginTab?.addEventListener("click", showLoginForm);

signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const rawUsername = document.querySelector("#username").value.trim();
  const username = normalizeUsername(rawUsername);
  const email = document.querySelector("#signup-email").value.trim().toLowerCase();
  const password = document.querySelector("#signup-password").value;

  if (!name || !username || !email || password.length < 6) {
    signupMessage.textContent = "Please fill every field and use a password with at least 6 characters.";
    return;
  }

  if (!isValidUsername(username)) {
    signupMessage.textContent = "Use a username with letters, numbers, or underscores only.";
    return;
  }

  const response = apiRequest("/api/signup", {
    method: "POST",
    body: {
      name,
      username,
      email,
      password
    }
  });

  if (!response.ok) {
    signupMessage.textContent = response.data?.error || "Unable to create account right now.";
    return;
  }

  saveCurrentUser(response.data?.user || null);
  signupMessage.textContent = "Account created. Opening your anime search page now.";

  window.setTimeout(() => {
    window.location.href = "./search.html";
  }, 900);
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#login-email").value.trim().toLowerCase();
  const password = document.querySelector("#login-password").value;

  const response = apiRequest("/api/login", {
    method: "POST",
    body: {
      email,
      password
    }
  });

  if (!response.ok) {
    signupMessage.textContent = response.data?.error || "Wrong email or password.";
    return;
  }

  saveCurrentUser(response.data?.user || null);
  signupMessage.textContent = "Logged in. Opening your anime profile now.";
  window.setTimeout(() => {
    window.location.href = "./profile.html";
  }, 900);
});
