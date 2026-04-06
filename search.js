const currentUser = ensureCurrentUser();
const searchInput = document.querySelector("#anime-search");
const searchMeta = document.querySelector("#search-meta");
const searchResults = document.querySelector("#search-results");
const randomButton = document.querySelector("#add-random-btn");
const loadMoreButton = document.querySelector("#load-more-btn");
let coverCache = getCoverCache();
let lastRequestId = 0;
let currentPage = 1;
let hasNextPage = false;
let activeQuery = "";
let renderedResults = [];

function addAnimeToWatched(id) {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  if (user.watched.some((entry) => entry.id === id)) {
    renderSearchResults();
    return;
  }

  user.watched.push({ id, rating: 8 });
  user.wantToWatch = user.wantToWatch.filter((entry) => entry.id !== id);
  updateCurrentUser(user);
  renderSearchResults();
}

function addAnimeToWantList(id) {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  if (user.wantToWatch.some((entry) => entry.id === id) || user.watched.some((entry) => entry.id === id)) {
    renderSearchResults();
    return;
  }

  user.wantToWatch.push({ id, addedAt: new Date().toISOString() });
  updateCurrentUser(user);
  renderSearchResults();
}

function renderSearchCards(matches, watchedIds, wantIds) {
  searchResults.innerHTML = matches.length
    ? matches
        .map((anime) => {
          const isWatched = watchedIds.has(anime.id);
          const isWanted = wantIds.has(anime.id);
          return `
            <article class="anime-card">
              ${getPosterMarkup(anime, coverCache)}
              <div class="anime-card-content">
                <h3>${anime.title}</h3>
                ${getSummaryMarkup(anime.summary, 105)}
                <div class="detail-row">
                  <span class="chip">${anime.genres.join(" • ") || "Anime"}</span>
                </div>
                <div class="chip-row">
                  ${anime.themes.map((theme) => `<span class="chip">${theme}</span>`).join("")}
                </div>
                <div class="chip-row">
                  ${anime.vibes.map((vibe) => `<span class="chip">${vibe}</span>`).join("")}
                </div>
                <div class="chip-row">
                  <button type="button" data-add-id="${anime.id}" ${isWatched ? "disabled" : ""}>
                    ${isWatched ? "Already Watched" : "Add to Watched"}
                  </button>
                  <button type="button" data-want-id="${anime.id}" ${isWanted || isWatched ? "disabled" : ""}>
                    ${isWanted ? "Saved" : "Watch Later"}
                  </button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No anime matched that search.</div>';
}

function updateSearchMeta(query, count) {
  if (!query.trim()) {
    searchMeta.textContent = "";
    return;
  }

  searchMeta.textContent = "";
}

function syncLoadMoreButton() {
  loadMoreButton.classList.toggle("hidden", !hasNextPage);
}

async function renderSearchResults(reset = true) {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const query = searchInput.value || "";
  const watchedIds = new Set(user.watched.map((entry) => entry.id));
  const wantIds = new Set((user.wantToWatch || []).map((entry) => entry.id));
  const requestId = ++lastRequestId;
  const nextPage = reset ? 1 : currentPage + 1;

  if (query.trim()) {
    searchResults.innerHTML = '<div class="empty-state">Searching anime...</div>';
  }

  const response = await fetchAnimeSearchPage(query, nextPage);

  if (requestId !== lastRequestId) {
    return;
  }

  currentPage = nextPage;
  activeQuery = query.trim();
  hasNextPage = response.hasNextPage;

  if (reset) {
    renderedResults = rankAnimeResults(response.results, query);
  } else {
    renderedResults = [...renderedResults, ...response.results];
    renderedResults = rankAnimeResults(renderedResults, query);
  }

  renderSearchCards(renderedResults, watchedIds, wantIds);
  updateSearchMeta(activeQuery, renderedResults.length);
  syncLoadMoreButton();
}

searchInput?.addEventListener("input", renderSearchResults);
loadMoreButton?.addEventListener("click", () => renderSearchResults(false));

randomButton?.addEventListener("click", () => {
  const user = ensureCurrentUser();
  if (!user) {
    return;
  }
  const watchedIds = new Set(user.watched.map((entry) => entry.id));
  const candidates = ANIME_CATALOG.filter((anime) => !watchedIds.has(anime.id));
  if (!candidates.length) {
    return;
  }
  const randomAnime = candidates[Math.floor(Math.random() * candidates.length)];
  addAnimeToWatched(randomAnime.id);
});

document.addEventListener("click", (event) => {
  const addId = event.target.getAttribute("data-add-id");
  const wantId = event.target.getAttribute("data-want-id");
  if (addId) {
    addAnimeToWatched(addId);
  }
  if (wantId) {
    addAnimeToWantList(wantId);
  }
});

if (!currentUser) {
  window.location.href = "./index.html";
} else {
  renderSearchResults();
  loadAnimeCovers().then((nextCache) => {
    coverCache = nextCache;
    renderSearchCards(
      renderedResults,
      new Set((ensureCurrentUser()?.watched || []).map((entry) => entry.id)),
      new Set((ensureCurrentUser()?.wantToWatch || []).map((entry) => entry.id))
    );
  });
}
