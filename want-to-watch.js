const wantUser = ensureCurrentUser();
const wantList = document.querySelector("#want-list");
const wantCount = document.querySelector("#want-count");
const wantTopGenre = document.querySelector("#want-top-genre");
const wantTopVibe = document.querySelector("#want-top-vibe");
let wantCoverCache = getCoverCache();

function removeWanted(id) {
  const user = ensureCurrentUser();
  user.wantToWatch = user.wantToWatch.filter((entry) => entry.id !== id);
  updateCurrentUser(user);
  renderWantList();
}

function moveWantedToWatched(id) {
  const user = ensureCurrentUser();
  user.wantToWatch = user.wantToWatch.filter((entry) => entry.id !== id);
  if (!user.watched.some((entry) => entry.id === id)) {
    user.watched.push({ id, rating: 8 });
  }
  updateCurrentUser(user);
  renderWantList();
}

function renderWantList() {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const items = user.wantToWatch
    .map((entry) => getAnimeById(entry.id))
    .filter(Boolean);

  if (!items.length) {
    wantList.innerHTML = '<div class="empty-state">No planned anime yet. Add some from search or recommendations.</div>';
    wantCount.textContent = "0";
    wantTopGenre.textContent = "None yet";
    wantTopVibe.textContent = "None yet";
    return;
  }

  wantList.innerHTML = items.map((anime) => `
    <article class="watch-card">
      ${getPosterMarkup(anime, wantCoverCache)}
      <div class="watch-card-content">
        <h3>${anime.title}</h3>
        ${getSummaryMarkup(anime.summary, 110)}
        <div class="chip-row">
          ${anime.genres.map((genre) => `<span class="chip">${genre}</span>`).join("")}
        </div>
        <div class="chip-row">
          <button type="button" data-move-id="${anime.id}">Move to Watched</button>
          <button type="button" data-remove-want-id="${anime.id}">Remove</button>
        </div>
      </div>
    </article>
  `).join("");

  const genres = new Map();
  const vibes = new Map();
  items.forEach((anime) => {
    anime.genres.forEach((genre) => genres.set(genre, (genres.get(genre) || 0) + 1));
    anime.vibes.forEach((vibe) => vibes.set(vibe, (vibes.get(vibe) || 0) + 1));
  });

  wantCount.textContent = String(items.length);
  wantTopGenre.textContent = getTopEntry(genres)?.[0] || "None yet";
  wantTopVibe.textContent = getTopEntry(vibes)?.[0] || "None yet";
}

document.addEventListener("click", (event) => {
  const removeId = event.target.getAttribute("data-remove-want-id");
  const moveId = event.target.getAttribute("data-move-id");

  if (removeId) {
    removeWanted(removeId);
  }

  if (moveId) {
    moveWantedToWatched(moveId);
  }
});

if (!wantUser) {
  window.location.href = "./index.html";
} else {
  renderWantList();
  loadAnimeCovers().then((nextCache) => {
    wantCoverCache = nextCache;
    renderWantList();
  });
}
