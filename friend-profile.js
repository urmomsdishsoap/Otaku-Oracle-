const currentFriendViewer = ensureCurrentUser();
const friendProfileTitle = document.querySelector("#friend-profile-title");
const friendProfileMeta = document.querySelector("#friend-profile-meta");
const friendWatchedList = document.querySelector("#friend-watched-list");
const friendWantList = document.querySelector("#friend-want-list");
let friendCoverCache = getCoverCache();

function renderFriendAnimeList(container, items, emptyText, showRatings = false) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  container.innerHTML = items.map((anime) => `
    <article class="watch-card">
      ${getPosterMarkup(anime, friendCoverCache)}
      <div class="watch-card-content">
        <h3>${anime.title}</h3>
        ${getSummaryMarkup(anime.summary, 105)}
        <div class="chip-row">
          ${anime.genres.map((genre) => `<span class="chip">${genre}</span>`).join("")}
        </div>
        ${showRatings ? `<p class="meta">Rating: ${anime.rating}/10</p>` : ""}
      </div>
    </article>
  `).join("");
}

function renderFriendProfile() {
  const viewer = ensureCurrentUser();
  if (!viewer) {
    window.location.href = "./index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const username = normalizeUsername(params.get("user") || "");
  const friend = getUserByUsername(username);

  if (!friend || !viewer.friends.includes(friend.username)) {
    friendProfileTitle.textContent = "Friend anime lists";
    friendProfileMeta.textContent = "This profile is only visible after both people are friends.";
    friendWatchedList.innerHTML = '<div class="empty-state">Friend profile not available.</div>';
    friendWantList.innerHTML = '<div class="empty-state">Friend profile not available.</div>';
    return;
  }

  friendProfileTitle.textContent = `${friend.name}'s anime lists`;
  friendProfileMeta.textContent = `Viewing @${friend.username}`;

  const watchedItems = (friend.watched || []).map((entry) => {
    const anime = getAnimeById(entry.id);
    return anime ? { ...anime, rating: entry.rating || 0 } : null;
  }).filter(Boolean);

  const wantItems = (friend.wantToWatch || []).map((entry) => {
    const anime = getAnimeById(entry.id);
    return anime ? { ...anime } : null;
  }).filter(Boolean);

  renderFriendAnimeList(friendWatchedList, watchedItems, "No watched anime shared yet.", true);
  renderFriendAnimeList(friendWantList, wantItems, "Nothing in watch later yet.");
}

if (!currentFriendViewer) {
  window.location.href = "./index.html";
} else {
  renderFriendProfile();
  loadAnimeCovers().then((nextCache) => {
    friendCoverCache = nextCache;
    renderFriendProfile();
  });
}
