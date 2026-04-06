const recommendationUser = ensureCurrentUser();
const recommendationList = document.querySelector("#recommendation-list");
let coverCache = getCoverCache();

function renderRecommendationsPage() {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const results = getRecommendationResults(user).slice(0, 18);

  const watchedIds = new Set((user.watched || []).map((entry) => entry.id));
  const wantIds = new Set((user.wantToWatch || []).map((entry) => entry.id));

  recommendationList.innerHTML = results.length
    ? results.map((anime) => `
        <article class="recommendation-card">
          ${getPosterMarkup(anime, coverCache)}
          <div class="recommendation-card-content">
            <div class="chip-row">
              <span class="chip">${Math.round(anime.score)} pts</span>
            </div>
            <h3>${anime.title}</h3>
            ${getSummaryMarkup(anime.summary, 110)}
            <div class="chip-row">
              ${anime.genres.map((genre) => `<span class="chip">${genre}</span>`).join("")}
            </div>
            <div class="chip-row">
              <button type="button" data-rec-watch-id="${anime.id}" ${watchedIds.has(anime.id) ? "disabled" : ""}>
                ${watchedIds.has(anime.id) ? "Already Watched" : "Add to Watched"}
              </button>
              <button type="button" data-rec-want-id="${anime.id}" ${wantIds.has(anime.id) || watchedIds.has(anime.id) ? "disabled" : ""}>
                ${wantIds.has(anime.id) ? "Saved" : "Watch Later"}
              </button>
            </div>
            <ul class="reason-list">
              ${anime.reasons.map((reason) => `<li>${reason}</li>`).join("")}
            </ul>
          </div>
        </article>
      `).join("")
    : '<div class="empty-state">Add watched anime first so the app can generate recommendations.</div>';
}

if (!recommendationUser) {
  window.location.href = "./index.html";
} else {
  renderRecommendationsPage();
  loadAnimeCovers().then((nextCache) => {
    coverCache = nextCache;
    renderRecommendationsPage();
  });
}

document.addEventListener("click", (event) => {
  const watchId = event.target.getAttribute("data-rec-watch-id");
  const wantId = event.target.getAttribute("data-rec-want-id");
  const user = ensureCurrentUser();

  if (!user) {
    return;
  }

  if (watchId && !user.watched.some((entry) => entry.id === watchId)) {
    user.watched.push({ id: watchId, rating: 8 });
    user.wantToWatch = (user.wantToWatch || []).filter((entry) => entry.id !== watchId);
    updateCurrentUser(user);
    renderRecommendationsPage();
  }

  if (wantId && !user.watched.some((entry) => entry.id === wantId) && !(user.wantToWatch || []).some((entry) => entry.id === wantId)) {
    user.wantToWatch = [...(user.wantToWatch || []), { id: wantId, addedAt: new Date().toISOString() }];
    updateCurrentUser(user);
    renderRecommendationsPage();
  }
});
