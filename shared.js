const APP_KEYS = {
  coverCache: "otaku-oracle-cover-cache-v2",
  customAnime: "otaku-oracle-custom-anime"
};

const ADMIN_PASSCODE = "creator-otaku-2026";
let currentUserCache = null;
let currentUserLoaded = false;

const ANIME_CATALOG = [
  {
    id: "death-note",
    title: "Death Note",
    genres: ["Thriller", "Mystery", "Psychological"],
    themes: ["Mind Games", "Justice", "Power"],
    vibes: ["Smart", "Dark", "Tense"],
    summary: "A genius student finds a supernatural notebook and starts a deadly battle of ideals.",
    cover: "linear-gradient(180deg, #232526 0%, #414345 100%)"
  },
  {
    id: "one-piece",
    title: "One Piece",
    genres: ["Adventure", "Action", "Fantasy"],
    themes: ["Friendship", "Freedom", "Dreams"],
    vibes: ["Epic", "Funny", "Heartfelt"],
    summary: "A giant pirate adventure about chasing dreams, finding crewmates, and reaching the impossible.",
    cover: "linear-gradient(180deg, #0b5cab 0%, #58c4ff 100%)"
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    genres: ["Action", "Drama", "Mystery"],
    themes: ["War", "Survival", "Sacrifice"],
    vibes: ["Intense", "Dark", "Epic"],
    summary: "Humanity fights for survival while devastating secrets reshape the story.",
    cover: "linear-gradient(180deg, #41251f 0%, #b15c35 100%)"
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    anilistSearch: "Kimetsu no Yaiba",
    genres: ["Action", "Fantasy", "Drama"],
    themes: ["Family", "Survival", "Compassion"],
    vibes: ["Beautiful", "Emotional", "Epic"],
    summary: "A determined swordsman battles demons while trying to save what is left of his family.",
    cover: "linear-gradient(180deg, #0a1f1b 0%, #0f7c73 100%)"
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    genres: ["Action", "Supernatural", "Thriller"],
    themes: ["Duty", "Friendship", "Curses"],
    vibes: ["Stylish", "Dark", "Hype"],
    summary: "Curses, monster fights, and confident characters collide in a sharp modern battle anime.",
    cover: "linear-gradient(180deg, #0b1535 0%, #6f4cff 100%)"
  },
  {
    id: "haikyuu",
    title: "Haikyuu!!",
    genres: ["Sports", "Comedy", "Drama"],
    themes: ["Competition", "Growth", "Teamwork"],
    vibes: ["Hype", "Warm", "Inspirational"],
    summary: "An electrifying sports series built on teamwork, effort, and nonstop momentum.",
    cover: "linear-gradient(180deg, #ff8a00 0%, #ffcc70 100%)"
  },
  {
    id: "blue-lock",
    title: "Blue Lock",
    genres: ["Sports", "Thriller", "Drama"],
    themes: ["Ego", "Rivalry", "Ambition"],
    vibes: ["Intense", "Stylish", "Hype"],
    summary: "A ruthless soccer competition focused on ego, pressure, and becoming number one.",
    cover: "linear-gradient(180deg, #001f54 0%, #0088ff 100%)"
  },
  {
    id: "violet-evergarden",
    title: "Violet Evergarden",
    genres: ["Drama", "Fantasy", "Slice of Life"],
    themes: ["Healing", "Love", "Loss"],
    vibes: ["Beautiful", "Emotional", "Reflective"],
    summary: "A former soldier learns empathy, grief, and love through the letters she writes for others.",
    cover: "linear-gradient(180deg, #796557 0%, #d8bc90 100%)"
  },
  {
    id: "your-lie-in-april",
    title: "Your Lie in April",
    genres: ["Drama", "Romance", "Music"],
    themes: ["Trauma", "Performance", "Growth"],
    vibes: ["Bittersweet", "Emotional", "Beautiful"],
    summary: "Music, love, and painful growth collide in a tragic coming-of-age story.",
    cover: "linear-gradient(180deg, #ef709b 0%, #ffd194 100%)"
  },
  {
    id: "spy-x-family",
    title: "Spy x Family",
    anilistSearch: "SPY x FAMILY",
    genres: ["Comedy", "Action", "Slice of Life"],
    themes: ["Found Family", "Secrets", "Parenting"],
    vibes: ["Charming", "Funny", "Warm"],
    summary: "A spy, an assassin, and a telepath build the most chaotic fake family in anime.",
    cover: "linear-gradient(180deg, #d7af49 0%, #f7e6a5 100%)"
  },
  {
    id: "kaguya-sama",
    title: "Kaguya-sama: Love Is War",
    genres: ["Comedy", "Romance", "Psychological"],
    themes: ["Mind Games", "Love", "Pride"],
    vibes: ["Funny", "Smart", "Charming"],
    summary: "Two elite students turn romance into a dramatic psychological battlefield.",
    cover: "linear-gradient(180deg, #831843 0%, #f472b6 100%)"
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    genres: ["Fantasy", "Drama", "Adventure"],
    themes: ["Mortality", "Memory", "Healing"],
    vibes: ["Warm", "Reflective", "Beautiful"],
    summary: "A quiet fantasy about time, grief, and what remains after the adventure ends.",
    cover: "linear-gradient(180deg, #1e3a5f 0%, #89b8ff 100%)"
  },
  {
    id: "vinland-saga",
    title: "Vinland Saga",
    genres: ["Action", "Drama", "Historical"],
    themes: ["War", "Purpose", "Growth"],
    vibes: ["Epic", "Reflective", "Intense"],
    summary: "A brutal historical epic that evolves into a profound search for meaning.",
    cover: "linear-gradient(180deg, #3b2f2f 0%, #99806f 100%)"
  },
  {
    id: "monster",
    title: "Monster",
    genres: ["Thriller", "Drama", "Psychological"],
    themes: ["Morality", "Guilt", "Identity"],
    vibes: ["Dark", "Smart", "Slow-Burn"],
    summary: "A serious psychological thriller about evil, guilt, and impossible choices.",
    cover: "linear-gradient(180deg, #1b1b1b 0%, #555555 100%)"
  },
  {
    id: "hunter-x-hunter",
    title: "Hunter x Hunter",
    anilistSearch: "Hunter x Hunter",
    genres: ["Action", "Adventure", "Fantasy"],
    themes: ["Friendship", "Growth", "Exploration"],
    vibes: ["Epic", "Hype", "Smart"],
    summary: "A flexible adventure with brilliant battles, lovable characters, and surprising depth.",
    cover: "linear-gradient(180deg, #1f7a1f 0%, #98db53 100%)"
  }
];

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const xhr = new XMLHttpRequest();
  xhr.open(method, path, false);
  xhr.withCredentials = true;
  xhr.setRequestHeader("Accept", "application/json");

  let payload = null;
  if (options.body !== undefined) {
    xhr.setRequestHeader("Content-Type", "application/json");
    payload = JSON.stringify(options.body);
  }

  try {
    xhr.send(payload);
  } catch (error) {
    return { ok: false, status: 0, data: null };
  }

  let data = null;
  try {
    data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
  } catch (error) {
    data = null;
  }

  return {
    ok: xhr.status >= 200 && xhr.status < 300,
    status: xhr.status,
    data
  };
}

function getUsers() {
  const response = apiRequest("/api/admin/dashboard");
  return response.ok ? (response.data?.users || []).map(normalizeUserRecord) : [];
}

function saveUsers(users) {
  return users;
}

function getCurrentUser() {
  if (currentUserLoaded) {
    return currentUserCache;
  }

  const response = apiRequest("/api/me");
  currentUserCache = response.ok && response.data?.user ? normalizeUserRecord(response.data.user) : null;
  currentUserLoaded = true;
  return currentUserCache;
}

function saveCurrentUser(user) {
  if (user === null) {
    apiRequest("/api/logout", { method: "POST", body: {} });
    currentUserCache = null;
    currentUserLoaded = true;
    return;
  }

  currentUserCache = normalizeUserRecord(user);
  currentUserLoaded = true;
}

function normalizeUsername(value = "") {
  return value.toLowerCase().replace(/^@+/, "").replace(/[^\w]/g, "").trim();
}

function createFallbackUsername(user) {
  const fromUsername = normalizeUsername(user?.username || "");
  if (fromUsername) {
    return fromUsername;
  }

  const fromName = normalizeUsername((user?.name || "").replace(/\s+/g, ""));
  if (fromName) {
    return fromName;
  }

  const fromEmail = normalizeUsername((user?.email || "").split("@")[0] || "");
  return fromEmail || `user${Math.floor(Math.random() * 10000)}`;
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function normalizeUserRecord(user) {
  const username = createFallbackUsername(user);
  return {
    ...user,
    username,
    friends: Array.isArray(user?.friends) ? user.friends : [],
    incomingFriendRequests: Array.isArray(user?.incomingFriendRequests) ? user.incomingFriendRequests : [],
    outgoingFriendRequests: Array.isArray(user?.outgoingFriendRequests) ? user.outgoingFriendRequests : [],
    watched: Array.isArray(user?.watched) ? user.watched : [],
    wantToWatch: Array.isArray(user?.wantToWatch) ? user.wantToWatch : []
  };
}

function getAdminSession() {
  const response = apiRequest("/api/admin/session");
  return Boolean(response.ok && response.data?.authorized);
}

function saveAdminSession(isOpen) {
  if (!isOpen) {
    apiRequest("/api/admin/logout", { method: "POST", body: {} });
  }
}

function getCustomAnime() {
  return readJson(APP_KEYS.customAnime, []);
}

function saveCustomAnime(animeList) {
  writeJson(APP_KEYS.customAnime, animeList);
}

function getAllAnime() {
  return [...ANIME_CATALOG, ...getCustomAnime()];
}

function ensureCurrentUser() {
  return getCurrentUser();
}

function updateCurrentUser(nextUser) {
  const response = apiRequest("/api/me/update", {
    method: "POST",
    body: {
      watched: nextUser?.watched || [],
      wantToWatch: nextUser?.wantToWatch || []
    }
  });

  if (response.ok && response.data?.user) {
    currentUserCache = normalizeUserRecord(response.data.user);
    currentUserLoaded = true;
    return currentUserCache;
  }

  return getCurrentUser();
}

function saveUserCollection(users) {
  return users;
}

function getUserByUsername(username) {
  const normalized = normalizeUsername(username);
  const response = apiRequest(`/api/users/${encodeURIComponent(normalized)}`);
  return response.ok && response.data?.user ? normalizeUserRecord(response.data.user) : null;
}

function getFriendsForUser(user) {
  return (user?.friends || [])
    .map((username) => getUserByUsername(username))
    .filter(Boolean);
}

function sendFriendRequest(targetUsername) {
  const response = apiRequest("/api/friends/request", {
    method: "POST",
    body: { username: targetUsername }
  });
  currentUserLoaded = false;
  return {
    ok: response.ok,
    message: response.data?.message || response.data?.error || "Unable to send friend request."
  };
}

function acceptFriendRequest(fromUsername) {
  const response = apiRequest("/api/friends/accept", {
    method: "POST",
    body: { username: fromUsername }
  });
  currentUserLoaded = false;
  return {
    ok: response.ok,
    message: response.data?.message || response.data?.error || "Unable to accept request."
  };
}

function declineFriendRequest(fromUsername) {
  const response = apiRequest("/api/friends/decline", {
    method: "POST",
    body: { username: fromUsername }
  });
  currentUserLoaded = false;
  return {
    ok: response.ok,
    message: response.data?.message || response.data?.error || "Unable to decline request."
  };
}

function removeFriend(usernameToRemove) {
  const response = apiRequest("/api/friends/remove", {
    method: "POST",
    body: { username: usernameToRemove }
  });
  currentUserLoaded = false;
  return {
    ok: response.ok,
    message: response.data?.message || response.data?.error || "Unable to remove friend."
  };
}

function getAnimeById(id) {
  return getAllAnime().find((anime) => anime.id === id);
}

function searchAnime(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getAllAnime();
  }

  return getAllAnime().filter((anime) => {
    const haystack = [
      anime.title,
      anime.genres.join(" "),
      anime.themes.join(" "),
      anime.vibes.join(" "),
      anime.summary
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function buildProfile(user) {
  const genres = new Map();
  const themes = new Map();
  const vibes = new Map();

  (user?.watched || []).forEach((entry) => {
    const anime = getAnimeById(entry.id);
    if (!anime) {
      return;
    }

    const weight = entry.rating || 5;

    anime.genres.forEach((genre) => genres.set(genre, (genres.get(genre) || 0) + weight));
    anime.themes.forEach((theme) => themes.set(theme, (themes.get(theme) || 0) + weight));
    anime.vibes.forEach((vibe) => vibes.set(vibe, (vibes.get(vibe) || 0) + weight));
  });

  return { genres, themes, vibes };
}

function getTopEntry(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0] || null;
}

function getRecommendationResults(user) {
  const watchedIds = new Set((user?.watched || []).map((entry) => entry.id));
  const watchedAnime = (user?.watched || [])
    .map((entry) => getAnimeById(entry.id))
    .filter(Boolean);
  const watchedKeys = new Set(watchedAnime.map((anime) => getAnimeDedupKey(anime)).filter(Boolean));
  const profile = buildProfile(user);

  return getAllAnime()
    .filter((anime) => !watchedIds.has(anime.id))
    .filter((anime) => {
      const dedupKey = getAnimeDedupKey(anime);
      return dedupKey ? !watchedKeys.has(dedupKey) : true;
    })
    .map((anime) => {
      let score = 0;
      const reasons = [];

      const genreHits = anime.genres.filter((genre) => profile.genres.has(genre));
      const themeHits = anime.themes.filter((theme) => profile.themes.has(theme));
      const vibeHits = anime.vibes.filter((vibe) => profile.vibes.has(vibe));

      genreHits.forEach((genre) => {
        score += profile.genres.get(genre) * 3;
      });
      themeHits.forEach((theme) => {
        score += profile.themes.get(theme) * 2;
      });
      vibeHits.forEach((vibe) => {
        score += profile.vibes.get(vibe) * 2;
      });

      if (genreHits.length) {
        reasons.push(`Matches your top genres like ${genreHits.slice(0, 2).join(" and ")}`);
      }
      if (themeHits.length) {
        reasons.push(`Shares themes like ${themeHits.slice(0, 2).join(" and ")}`);
      }
      if (vibeHits.length) {
        reasons.push(`Keeps the ${vibeHits.slice(0, 2).join(" / ")} vibe you rate highly`);
      }
      if (!reasons.length) {
        reasons.push("Broad match for your overall anime audience profile");
      }

      return { ...anime, score, reasons };
    })
    .filter(shouldKeepAnimeEntry)
    .filter((anime, index, list) => {
      const key = getAnimeDedupKey(anime);
      return key ? list.findIndex((item) => getAnimeDedupKey(item) === key) === index : true;
    })
    .sort((a, b) => b.score - a.score);
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "No date";
  }
  return new Date(timestamp).toLocaleString();
}

function getCoverCache() {
  return readJson(APP_KEYS.coverCache, {});
}

function saveCoverCache(cache) {
  writeJson(APP_KEYS.coverCache, cache);
}

async function fetchAniListGraphQL(query, variables = {}) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query, variables })
  });

  return response.json();
}

async function loadAnimeCovers() {
  const cache = getCoverCache();
  const missingAnime = ANIME_CATALOG.filter((anime) => !cache[anime.id]);

  if (!missingAnime.length) {
    return cache;
  }

  const updates = {};

  await Promise.all(
    missingAnime.map(async (anime) => {
      try {
        const payload = await fetchAniListGraphQL(
          `
            query ($search: String) {
              Page(page: 1, perPage: 1) {
                media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
                  coverImage {
                    extraLarge
                    large
                    medium
                  }
                }
              }
            }
          `,
          { search: anime.anilistSearch || anime.sourceTitle || anime.title }
        );
        const media = payload?.data?.Page?.media?.[0];
        updates[anime.id] = media?.coverImage?.extraLarge || media?.coverImage?.large || media?.coverImage?.medium || null;
      } catch (error) {
        updates[anime.id] = null;
      }
    })
  );

  const nextCache = { ...cache, ...updates };
  saveCoverCache(nextCache);
  return nextCache;
}

function getPosterMarkup(anime, coverCache) {
  const imageUrl = anime.imageUrl || coverCache?.[anime.id];

  if (imageUrl) {
    return `<img class="anime-poster" src="${imageUrl}" alt="${anime.title} cover" loading="lazy" />`;
  }

  return `<div class="anime-poster-fallback" style="background:${anime.cover}"><span>${anime.title}</span></div>`;
}

function getShortSummary(text, maxLength = 120) {
  const cleanText = cleanSummaryText(text);

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  const shortened = cleanText.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 40 ? lastSpace : maxLength).trim()}...`;
}

function cleanSummaryText(text) {
  return (text || "No summary available yet.")
    .replace(/\[Written by MAL Rewrite\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSummaryMarkup(text, maxLength = 120) {
  const cleanText = cleanSummaryText(text);
  const shortText = getShortSummary(cleanText, maxLength);
  const isExpandable = cleanText.length > shortText.length;

  return `
    <div class="summary-block">
      <p class="meta summary-text">
        <span>${escapeHtml(shortText)}</span>${isExpandable ? ` <button class="summary-toggle inline-toggle" type="button" data-summary-toggle>Load more</button>` : ""}
      </p>
      ${isExpandable ? `<p class="meta summary-full hidden">${escapeHtml(cleanText)} <button class="summary-toggle inline-toggle" type="button" data-summary-toggle>Hide</button></p>` : ""}
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-summary-toggle]");
  if (!toggle) {
    return;
  }

  const block = toggle.closest(".summary-block");
  const shortText = block?.querySelector(".summary-text");
  const fullText = block?.querySelector(".summary-full");

  if (!block || !shortText || !fullText) {
    return;
  }

  const isExpanded = !fullText.classList.contains("hidden");
  fullText.classList.toggle("hidden", isExpanded);
  shortText.classList.toggle("hidden", !isExpanded);
});

function normalizeApiAnime(apiAnime) {
  const malId = apiAnime?.id || apiAnime?.idMal || apiAnime?.mal_id;
  const title = apiAnime?.title?.english || apiAnime?.title?.romaji || apiAnime?.title?.native || apiAnime?.title;

  if (!malId || !title) {
    return null;
  }

  return {
    id: `mal-${malId}`,
    title,
    sourceTitle: apiAnime?.title?.romaji || apiAnime?.title?.english || apiAnime?.title || "",
    nativeTitle: apiAnime?.title?.native || "",
    genres: (apiAnime.genres || []).map((genre) => genre.name || genre).slice(0, 3),
    themes: (apiAnime.tags || apiAnime.themes || [])
      .filter((theme) => (theme?.rank || 100) >= 60 || typeof theme === "string")
      .map((theme) => theme.name || theme)
      .slice(0, 3),
    vibes: [
      (apiAnime.isAdult || apiAnime.rating?.includes("R")) ? "Dark" : "Accessible",
      (apiAnime.averageScore || apiAnime.score) && (apiAnime.averageScore || apiAnime.score) >= 80 ? "Highly Rated" : "Popular",
      apiAnime.format || apiAnime.type || "Series"
    ].filter(Boolean),
    summary: apiAnime.description || apiAnime.synopsis || "No summary available yet.",
    cover: "linear-gradient(180deg, #1a2f3a 0%, #3d6f87 100%)",
    imageUrl:
      apiAnime?.coverImage?.extraLarge ||
      apiAnime?.coverImage?.large ||
      apiAnime?.coverImage?.medium ||
      apiAnime?.bannerImage ||
      apiAnime?.images?.jpg?.large_image_url ||
      apiAnime?.images?.jpg?.image_url ||
      null,
    rank: apiAnime?.rank || null,
    popularity: apiAnime?.popularity || null,
    scoreValue: apiAnime?.averageScore ? apiAnime.averageScore / 10 : apiAnime?.score || null,
    episodes: apiAnime?.episodes || null,
    year: apiAnime?.seasonYear || apiAnime?.year || null,
    type: apiAnime?.format || apiAnime?.type || "",
    status: apiAnime?.status || ""
  };
}

function isFranchiseSplitEntry(anime) {
  const title = `${anime.title} ${anime.sourceTitle || ""}`.toLowerCase();
  return (
    /season\s+\d/.test(title) ||
    /part\s+\d/.test(title) ||
    /\bfinal season\b/.test(title) ||
    /\bova\b/.test(title) ||
    /\bona\b/.test(title) ||
    /\bspecial\b/.test(title) ||
    /\brecap\b/.test(title)
  );
}

function shouldKeepAnimeEntry(anime) {
  if (!anime) {
    return false;
  }

  return !isFranchiseSplitEntry(anime);
}

function getBaseAnimeTitle(title = "") {
  return normalizeSearchQuery(title)
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(2nd|second|3rd|third|1st|first)\s+season\b/g, " ")
    .replace(/\bseason\b/g, " ")
    .replace(/\b(the animation|tv|series)\b/g, " ")
    .replace(/\bpart\b/g, " ")
    .replace(/\bmovie\b/g, " movie ")
    .replace(/\bfilm\b/g, " movie ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAnimeDedupKey(anime) {
  const normalizedTitle = getBaseAnimeTitle(anime.title || "");
  const normalizedSourceTitle = getBaseAnimeTitle(anime.sourceTitle || "");
  const normalizedNativeTitle = getBaseAnimeTitle(anime.nativeTitle || "");
  const movieTag =
    /\b(movie|film)\b/i.test(`${anime.title} ${anime.sourceTitle || ""}`) || anime.type === "Movie"
      ? "movie"
      : "series";

  const candidates = [normalizedTitle, normalizedSourceTitle, normalizedNativeTitle].filter(Boolean);
  if (!candidates.length) {
    return movieTag;
  }

  candidates.sort((a, b) => a.length - b.length);
  return `${candidates[0]}|${movieTag}`;
}

function dedupeAnimeResults(animeList) {
  const seenKeys = new Set();
  const seenIds = new Set();
  const deduped = [];

  animeList.forEach((anime) => {
    const key = getAnimeDedupKey(anime);
    if (!key || seenKeys.has(key) || (anime.id && seenIds.has(anime.id))) {
      return;
    }
    seenKeys.add(key);
    if (anime.id) {
      seenIds.add(anime.id);
    }
    deduped.push(anime);
  });

  return deduped;
}

function rankAnimeResults(animeList, query = "") {
  const normalizedQuery = normalizeSearchQuery(query);

  return dedupeAnimeResults(animeList).sort((a, b) => {
    const aSplit = isFranchiseSplitEntry(a) ? 1 : 0;
    const bSplit = isFranchiseSplitEntry(b) ? 1 : 0;
    if (aSplit !== bSplit) {
      return aSplit - bSplit;
    }

    const aExact = normalizeSearchQuery(a.title) === normalizedQuery ? 1 : 0;
    const bExact = normalizeSearchQuery(b.title) === normalizedQuery ? 1 : 0;
    if (aExact !== bExact) {
      return bExact - aExact;
    }

    const aQueryExact = normalizedQuery && normalizeSearchQuery(a.sourceTitle || "") === normalizedQuery ? 1 : 0;
    const bQueryExact = normalizedQuery && normalizeSearchQuery(b.sourceTitle || "") === normalizedQuery ? 1 : 0;
    if (aQueryExact !== bQueryExact) {
      return bQueryExact - aQueryExact;
    }

    const aTitleStarts = normalizedQuery && normalizeSearchQuery(a.title).startsWith(normalizedQuery) ? 1 : 0;
    const bTitleStarts = normalizedQuery && normalizeSearchQuery(b.title).startsWith(normalizedQuery) ? 1 : 0;
    if (aTitleStarts !== bTitleStarts) {
      return bTitleStarts - aTitleStarts;
    }

    const aSourceStarts =
      normalizedQuery && normalizeSearchQuery(a.sourceTitle || "").startsWith(normalizedQuery) ? 1 : 0;
    const bSourceStarts =
      normalizedQuery && normalizeSearchQuery(b.sourceTitle || "").startsWith(normalizedQuery) ? 1 : 0;
    if (aSourceStarts !== bSourceStarts) {
      return bSourceStarts - aSourceStarts;
    }

    const aIsPopularFavorite = (a.popularity || Number.MAX_SAFE_INTEGER) <= 25 ? 1 : 0;
    const bIsPopularFavorite = (b.popularity || Number.MAX_SAFE_INTEGER) <= 25 ? 1 : 0;
    if (aIsPopularFavorite !== bIsPopularFavorite) {
      return bIsPopularFavorite - aIsPopularFavorite;
    }

    const aScore = a.scoreValue || 0;
    const bScore = b.scoreValue || 0;
    if (aScore !== bScore) {
      return bScore - aScore;
    }

    const aPopularity = a.popularity || Number.MAX_SAFE_INTEGER;
    const bPopularity = b.popularity || Number.MAX_SAFE_INTEGER;
    if (aPopularity !== bPopularity) {
      return aPopularity - bPopularity;
    }

    return (a.rank || Number.MAX_SAFE_INTEGER) - (b.rank || Number.MAX_SAFE_INTEGER);
  });
}

function mergeApiAnime(results) {
  const existing = getCustomAnime();
  const existingMap = new Map(existing.map((anime) => [anime.id, anime]));
  let changed = false;

  results.forEach((anime) => {
    if (!anime) {
      return;
    }

    const prior = existingMap.get(anime.id);
    if (!prior || JSON.stringify(prior) !== JSON.stringify(anime)) {
      existingMap.set(anime.id, anime);
      changed = true;
    }
  });

  if (changed) {
    saveCustomAnime([...existingMap.values()]);
  }
}

async function fetchAnimeSearchResults(query) {
  const normalized = query.trim();
  return fetchAnimeSearchPage(normalized, 1);
}

function normalizeSearchQuery(query) {
  return query
    .toLowerCase()
    .replace(/\b(anime|show|series|tv|watch)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchAnimeSearchPage(query, page = 1) {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return fetchTopPopularAnimePage(page);
  }

  try {
    const payload = await fetchAniListGraphQL(
      `
        query ($search: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              hasNextPage
            }
            media(search: $search, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
              id
              idMal
              title {
                romaji
                english
                native
              }
              description(asHtml: false)
              coverImage {
                extraLarge
                large
                medium
              }
              bannerImage
              genres
              tags {
                name
                rank
              }
              averageScore
              popularity
              episodes
              seasonYear
              format
              status
              isAdult
            }
          }
        }
      `,
      { search: normalized, page, perPage: 25 }
    );
    const apiResults = (payload?.data?.Page?.media || [])
      .map(normalizeApiAnime)
      .filter(shouldKeepAnimeEntry);

    mergeApiAnime(apiResults);

    const localMatches = searchAnime(normalized).filter(shouldKeepAnimeEntry);
    const combined = [...apiResults];
    const seen = new Set(apiResults.map((anime) => anime.id));

    localMatches.forEach((anime) => {
      if (!seen.has(anime.id)) {
        combined.push(anime);
      }
    });

    return {
      results: combined,
      hasNextPage: Boolean(payload?.data?.Page?.pageInfo?.hasNextPage),
      query: normalized
    };
  } catch (error) {
    return {
      results: searchAnime(normalized),
      hasNextPage: false,
      query: normalized
    };
  }
}

async function fetchTopPopularAnimePage(page = 1) {
  const cappedPage = Math.max(1, Math.min(4, page));

  try {
    const [topPayload, popularPayload] = await Promise.all([
      fetchAniListGraphQL(
        `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                hasNextPage
              }
              media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description(asHtml: false)
                coverImage {
                  extraLarge
                  large
                  medium
                }
                bannerImage
                genres
                tags {
                  name
                  rank
                }
                averageScore
                popularity
                episodes
                seasonYear
                format
                status
                isAdult
              }
            }
          }
        `,
        { page: cappedPage, perPage: 25 }
      ),
      fetchAniListGraphQL(
        `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                hasNextPage
              }
              media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description(asHtml: false)
                coverImage {
                  extraLarge
                  large
                  medium
                }
                bannerImage
                genres
                tags {
                  name
                  rank
                }
                averageScore
                popularity
                episodes
                seasonYear
                format
                status
                isAdult
              }
            }
          }
        `,
        { page: cappedPage, perPage: 25 }
      )
    ]);
    const apiResults = [
      ...(topPayload?.data?.Page?.media || []),
      ...(popularPayload?.data?.Page?.media || [])
    ]
      .map(normalizeApiAnime)
      .filter(shouldKeepAnimeEntry);

    mergeApiAnime(apiResults);

    const rankedResults = rankAnimeResults(apiResults).sort((a, b) => {
      const aBlend = (a.scoreValue || 0) * 10 - Math.min(a.popularity || 9999, 9999) / 15;
      const bBlend = (b.scoreValue || 0) * 10 - Math.min(b.popularity || 9999, 9999) / 15;

      if (aBlend !== bBlend) {
        return bBlend - aBlend;
      }

      const aPopularity = a.popularity || Number.MAX_SAFE_INTEGER;
      const bPopularity = b.popularity || Number.MAX_SAFE_INTEGER;
      if (aPopularity !== bPopularity) {
        return aPopularity - bPopularity;
      }

      return (a.rank || Number.MAX_SAFE_INTEGER) - (b.rank || Number.MAX_SAFE_INTEGER);
    });

    return {
      results: rankedResults,
      hasNextPage:
        cappedPage < 4 &&
        (Boolean(topPayload?.data?.Page?.pageInfo?.hasNextPage) || Boolean(popularPayload?.data?.Page?.pageInfo?.hasNextPage)),
      query: ""
    };
  } catch (error) {
    return {
      results: rankAnimeResults(getAllAnime().slice(0, 25)),
      hasNextPage: false,
      query: ""
    };
  }
}
