const profileUser = ensureCurrentUser();
const profileName = document.querySelector("#profile-name");
const profileUsername = document.querySelector("#profile-username");
const profileEmail = document.querySelector("#profile-email");
const profileWatchedCount = document.querySelector("#profile-watched-count");
const profileWantCount = document.querySelector("#profile-want-count");
const profileAverageRating = document.querySelector("#profile-average-rating");
const profileTopGenre = document.querySelector("#profile-top-genre");
const profileFriendCount = document.querySelector("#profile-friend-count");
const profileIncomingCount = document.querySelector("#profile-incoming-count");
const profileOutgoingCount = document.querySelector("#profile-outgoing-count");
const logoutButton = document.querySelector("#logout-btn");

function renderProfile() {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const watched = user.watched || [];
  const average = watched.length
    ? watched.reduce((sum, item) => sum + (item.rating || 0), 0) / watched.length
    : 0;
  const profile = buildProfile(user);
  const topGenreEntry = getTopEntry(profile.genres);

  profileName.textContent = user.name;
  profileUsername.textContent = `@${user.username}`;
  profileEmail.textContent = user.email;
  profileWatchedCount.textContent = String(watched.length);
  profileWantCount.textContent = String((user.wantToWatch || []).length);
  profileAverageRating.textContent = average.toFixed(1);
  profileTopGenre.textContent = topGenreEntry ? topGenreEntry[0] : "None yet";
  profileFriendCount.textContent = String((user.friends || []).length);
  profileIncomingCount.textContent = String((user.incomingFriendRequests || []).length);
  profileOutgoingCount.textContent = String((user.outgoingFriendRequests || []).length);
}

logoutButton?.addEventListener("click", () => {
  saveCurrentUser(null);
  window.location.href = "./index.html";
});

if (!profileUser) {
  window.location.href = "./index.html";
} else {
  renderProfile();
}
