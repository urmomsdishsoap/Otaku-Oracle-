const watchedUser = ensureCurrentUser();
const watchedList = document.querySelector("#watched-list");
const watchedCount = document.querySelector("#watched-count");
const averageRating = document.querySelector("#average-rating");
const topGenre = document.querySelector("#top-genre");
const themeProfile = document.querySelector("#theme-profile");
let coverCache = getCoverCache();

function removeWatched(id) {
  const user = ensureCurrentUser();
  user.watched = user.watched.filter((entry) => entry.id !== id);
  updateCurrentUser(user);
  renderWatched();
}

function updateRating(id, rating) {
  const user = ensureCurrentUser();
  const entry = user.watched.find((item) => item.id === id);
  if (!entry) {
    return;
  }

  const parsedRating = Number(rating);
  const safeRating = Number.isFinite(parsedRating) ? parsedRating : 1;
  entry.rating = Math.round(Math.max(1, Math.min(10, safeRating)) * 10) / 10;
  updateCurrentUser(user);
  renderWatched();
}

function renderWatched() {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const items = user.watched.map((entry) => {
    const anime = getAnimeById(entry.id);
    return anime ? { ...anime, rating: entry.rating } : null;
  }).filter(Boolean);

  if (!items.length) {
    watchedList.innerHTML = '<div class="empty-state">No watched anime yet. Add some from the search page.</div>';
    watchedCount.textContent = "0";
    averageRating.textContent = "0.0";
    topGenre.textContent = "None yet";
    themeProfile.className = "profile-tags empty-state";
    themeProfile.textContent = "Rate anime to reveal your strongest themes.";
    return;
  }

  watchedList.innerHTML = items.map((anime) => `
    <article class="watch-card">
      ${getPosterMarkup(anime, coverCache)}
      <div class="watch-card-content">
        <h3>${anime.title}</h3>
        ${getSummaryMarkup(anime.summary, 110)}
        <div class="chip-row">
          ${anime.genres.map((genre) => `<span class="chip">${genre}</span>`).join("")}
        </div>
        <div class="rating-row">
          <label>
            Your rating out of 10
            <input class="rating-input" type="number" min="1" max="10" step="0.1" value="${Number(anime.rating || 0).toFixed(1)}" data-rating-id="${anime.id}" />
          </label>
          <button type="button" data-remove-id="${anime.id}">Remove</button>
        </div>
      </div>
    </article>
  `).join("");

  const average = items.reduce((sum, anime) => sum + anime.rating, 0) / items.length;
  const profile = buildProfile(user);
  const topGenreEntry = getTopEntry(profile.genres);
  const topThemeEntries = [...profile.themes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  watchedCount.textContent = String(items.length);
  averageRating.textContent = average.toFixed(1);
  topGenre.textContent = topGenreEntry ? topGenreEntry[0] : "None yet";

  themeProfile.className = "profile-tags";
  themeProfile.innerHTML = topThemeEntries.length
    ? topThemeEntries.map(([theme]) => `<span class="chip">${theme}</span>`).join("")
    : '<div class="empty-state">Rate anime to reveal your strongest themes.</div>';
}

document.addEventListener("click", (event) => {
  const removeId = event.target.getAttribute("data-remove-id");
  if (removeId) {
    removeWatched(removeId);
  }
});

document.addEventListener("change", (event) => {
  const ratingId = event.target.getAttribute("data-rating-id");
  if (ratingId) {
    updateRating(ratingId, event.target.value);
  }
});

if (!watchedUser) {
  window.location.href = "./index.html";
} else {
  renderWatched();
  loadAnimeCovers().then((nextCache) => {
    coverCache = nextCache;
    renderWatched();
  });
}
