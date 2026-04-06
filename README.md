# Otaku Oracle

Otaku Oracle is an anime recommendation website where users can build a personal anime profile and get recommendations based on what they have watched.

## What it does

- lets users sign up and log in with their own account
- lets users search anime from a live anime catalog
- shows anime cover images in the search results
- lets users add anime to `Watched` or `Watch Later`
- lets users rate watched anime out of 10, including decimal ratings like `9.6`
- gives recommendations based on watched shows and ratings
- lets users add friends by username
- lets friends view each other's watched lists, ratings, and watch later lists

## How it works

The website uses a Python backend and a SQLite database.

- `server.py` runs the website backend
- the HTML files are the website pages
- the JavaScript files handle the page actions and UI behavior
- `shared.js` contains the shared anime, account, recommendation, and API logic
- `styles.css` controls the website design
- anime search and poster images come from the AniList API

User accounts, watch lists, ratings, friend requests, sessions, and signup counts are stored in the database so the website can track real users instead of only saving data in one browser.

## Main website features

### Accounts

Users can:

- create an account with full name, username, email, and password
- log in to their own profile
- keep their anime lists tied to their account

### Anime tracking

Users can:

- search for anime
- add titles to watched
- add titles to watch later
- move titles from watch later into watched
- rate watched anime

### Recommendations

The website looks at the genres, themes, vibes, and ratings in a user's watched list to create recommendation results.

### Friends

Users can:

- send friend requests by username
- accept or decline requests
- remove friends
- open a friend's shared anime lists after both users are friends
