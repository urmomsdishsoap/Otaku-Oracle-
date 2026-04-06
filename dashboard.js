const dashboardAuth = document.querySelector("#dashboard-auth");
const dashboardContent = document.querySelector("#dashboard-content");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminPasscode = document.querySelector("#admin-passcode");
const adminMessage = document.querySelector("#admin-message");
const signupCount = document.querySelector("#signup-count");
const latestSignup = document.querySelector("#latest-signup");
const activeUser = document.querySelector("#active-user");
const signupList = document.querySelector("#signup-list");

function showDashboard() {
  dashboardAuth?.classList.add("hidden");
  dashboardContent?.classList.remove("hidden");
}

function showAuth() {
  dashboardAuth?.classList.remove("hidden");
  dashboardContent?.classList.add("hidden");
}

function renderDashboard() {
  const response = apiRequest("/api/admin/dashboard");
  if (!response.ok) {
    adminMessage.textContent = "Creator access required.";
    showAuth();
    return;
  }

  const users = (response.data?.users || []).map(normalizeUserRecord);
  const current = response.data?.currentUser ? normalizeUserRecord(response.data.currentUser) : null;

  signupCount.textContent = String(users.length);
  latestSignup.textContent = users.length ? formatDate(users[users.length - 1].createdAt) : "No signups";
  activeUser.textContent = current ? `@${current.username}` : "Not signed in";

  signupList.innerHTML = users.length
    ? [...users].reverse().map((user) => `
        <article class="signup-item">
          <strong>${user.name}</strong>
          <p>@${user.username}</p>
          <p>${user.email}</p>
          <p>Signed up: ${formatDate(user.createdAt)}</p>
          <p>Watched shows: ${user.watched.length}</p>
        </article>
      `).join("")
    : '<div class="empty-state">No signups have been created in this browser yet.</div>';
}

adminLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const response = apiRequest("/api/admin/login", {
    method: "POST",
    body: { passcode: adminPasscode.value }
  });

  if (!response.ok) {
    adminMessage.textContent = response.data?.error || "Wrong creator passcode.";
    return;
  }

  adminMessage.textContent = "";
  showDashboard();
  renderDashboard();
});

if (getAdminSession()) {
  showDashboard();
  renderDashboard();
} else {
  showAuth();
}
