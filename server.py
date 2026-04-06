from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import secrets
import sqlite3
from datetime import datetime, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("OTAKU_ORACLE_DB_PATH", ROOT / "otaku_oracle.db"))
SESSION_COOKIE = "otaku_oracle_session"
ADMIN_COOKIE = "otaku_oracle_admin"
ADMIN_PASSCODE = os.environ.get("OTAKU_ORACLE_ADMIN_PASSCODE", "creator-otaku-2026")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def db_connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with db_connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TEXT NOT NULL,
                watched_json TEXT NOT NULL DEFAULT '[]',
                want_to_watch_json TEXT NOT NULL DEFAULT '[]',
                friends_json TEXT NOT NULL DEFAULT '[]',
                incoming_requests_json TEXT NOT NULL DEFAULT '[]',
                outgoing_requests_json TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS admin_sessions (
                token TEXT PRIMARY KEY,
                created_at TEXT NOT NULL
            );
            """
        )


def normalize_username(value: str = "") -> str:
    cleaned = value.lower().lstrip("@")
    return "".join(char for char in cleaned if char.isalnum() or char == "_")


def is_valid_username(username: str) -> bool:
    return 3 <= len(username) <= 20 and all(char.isalnum() or char == "_" for char in username)


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        240000,
    ).hex()
    return password_hash, salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    candidate_hash, _ = hash_password(password, salt=salt)
    return secrets.compare_digest(candidate_hash, password_hash)


def parse_json_list(value: str | None) -> list:
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def user_from_row(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None

    return {
        "id": row["id"],
        "name": row["name"],
        "username": row["username"],
        "email": row["email"],
        "createdAt": row["created_at"],
        "watched": parse_json_list(row["watched_json"]),
        "wantToWatch": parse_json_list(row["want_to_watch_json"]),
        "friends": parse_json_list(row["friends_json"]),
        "incomingFriendRequests": parse_json_list(row["incoming_requests_json"]),
        "outgoingFriendRequests": parse_json_list(row["outgoing_requests_json"]),
    }


def sanitize_watch_entries(entries: list) -> list:
    normalized = []
    for entry in entries or []:
        anime_id = str(entry.get("id", "")).strip()
        if not anime_id:
            continue
        rating = entry.get("rating", 8)
        try:
            rating_value = round(max(1.0, min(10.0, float(rating))), 1)
        except (TypeError, ValueError):
            rating_value = 8.0
        normalized.append(
            {
                "id": anime_id,
                "rating": rating_value,
                "addedAt": entry.get("addedAt") or now_iso(),
            }
        )
    return normalized


def sanitize_watch_later_entries(entries: list) -> list:
    normalized = []
    seen_ids = set()
    for entry in entries or []:
        anime_id = str(entry.get("id", "")).strip()
        if not anime_id or anime_id in seen_ids:
            continue
        seen_ids.add(anime_id)
        normalized.append(
            {
                "id": anime_id,
                "addedAt": entry.get("addedAt") or now_iso(),
            }
        )
    return normalized


def get_user_by_email(connection: sqlite3.Connection, email: str) -> sqlite3.Row | None:
    return connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_user_by_username(connection: sqlite3.Connection, username: str) -> sqlite3.Row | None:
    return connection.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()


def update_user_record(connection: sqlite3.Connection, user: dict) -> None:
    connection.execute(
        """
        UPDATE users
        SET name = ?, username = ?, email = ?, watched_json = ?, want_to_watch_json = ?,
            friends_json = ?, incoming_requests_json = ?, outgoing_requests_json = ?
        WHERE id = ?
        """,
        (
            user["name"],
            user["username"],
            user["email"],
            json.dumps(user["watched"]),
            json.dumps(user["wantToWatch"]),
            json.dumps(user["friends"]),
            json.dumps(user["incomingFriendRequests"]),
            json.dumps(user["outgoingFriendRequests"]),
            user["id"],
        ),
    )


class OtakuOracleHandler(BaseHTTPRequestHandler):
    server_version = "OtakuOracle/1.0"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed.path)
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self.send_json(404, {"error": "Not found"})
            return
        self.handle_api_post(parsed.path)

    def log_message(self, format: str, *args) -> None:
        return

    def parse_json_body(self) -> dict:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        if content_length <= 0:
            return {}

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
            return payload if isinstance(payload, dict) else {}
        except json.JSONDecodeError:
            return {}

    def get_cookie(self, name: str) -> str | None:
        jar = cookies.SimpleCookie()
        jar.load(self.headers.get("Cookie", ""))
        morsel = jar.get(name)
        return morsel.value if morsel else None

    def send_json(self, status: int, payload: dict, extra_headers: list[tuple[str, str]] | None = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for key, value in extra_headers:
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def serve_static(self, path: str) -> None:
        relative_path = "index.html" if path in {"", "/"} else unquote(path.lstrip("/"))
        target = (ROOT / relative_path).resolve()
        if not str(target).startswith(str(ROOT)) or not target.exists() or not target.is_file():
            self.send_json(404, {"error": "File not found"})
            return

        mime_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        content = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", f"{mime_type}; charset=utf-8" if mime_type.startswith("text/") else mime_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def current_user(self, connection: sqlite3.Connection) -> dict | None:
        token = self.get_cookie(SESSION_COOKIE)
        if not token:
            return None

        row = connection.execute(
            """
            SELECT u.*
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
            """,
            (token,),
        ).fetchone()
        return user_from_row(row)

    def admin_authorized(self, connection: sqlite3.Connection) -> bool:
        token = self.get_cookie(ADMIN_COOKIE)
        if not token:
            return False
        row = connection.execute("SELECT token FROM admin_sessions WHERE token = ?", (token,)).fetchone()
        return row is not None

    def create_session_headers(self, user_id: int) -> list[tuple[str, str]]:
        token = secrets.token_urlsafe(32)
        with db_connect() as connection:
            connection.execute(
                "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
                (token, user_id, now_iso()),
            )
            connection.commit()
        return [("Set-Cookie", f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax")]

    def clear_session_headers(self) -> list[tuple[str, str]]:
        token = self.get_cookie(SESSION_COOKIE)
        with db_connect() as connection:
            if token:
                connection.execute("DELETE FROM sessions WHERE token = ?", (token,))
                connection.commit()
        return [("Set-Cookie", f"{SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")]

    def create_admin_headers(self) -> list[tuple[str, str]]:
        token = secrets.token_urlsafe(32)
        with db_connect() as connection:
            connection.execute(
                "INSERT INTO admin_sessions (token, created_at) VALUES (?, ?)",
                (token, now_iso()),
            )
            connection.commit()
        return [("Set-Cookie", f"{ADMIN_COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax")]

    def handle_api_get(self, path: str) -> None:
        with db_connect() as connection:
            if path == "/api/me":
                self.send_json(200, {"user": self.current_user(connection)})
                return

            if path == "/api/admin/session":
                self.send_json(200, {"authorized": self.admin_authorized(connection)})
                return

            if path == "/api/admin/dashboard":
                if not self.admin_authorized(connection):
                    self.send_json(403, {"error": "Forbidden"})
                    return
                users = [user_from_row(row) for row in connection.execute("SELECT * FROM users ORDER BY created_at ASC")]
                self.send_json(200, {"users": users, "currentUser": self.current_user(connection)})
                return

            if path.startswith("/api/users/"):
                current = self.current_user(connection)
                if not current:
                    self.send_json(401, {"error": "Unauthorized"})
                    return
                username = normalize_username(path.split("/api/users/", 1)[1])
                target = user_from_row(get_user_by_username(connection, username))
                if not target:
                    self.send_json(404, {"error": "User not found"})
                    return
                related_usernames = {
                    *current.get("friends", []),
                    *current.get("incomingFriendRequests", []),
                    *current.get("outgoingFriendRequests", []),
                    current.get("username"),
                }
                if target["username"] not in related_usernames:
                    self.send_json(403, {"error": "Forbidden"})
                    return
                self.send_json(
                    200,
                    {
                        "user": {
                            "name": target["name"],
                            "username": target["username"],
                            "email": target["email"],
                            "watched": target["watched"],
                            "wantToWatch": target["wantToWatch"],
                        }
                    },
                )
                return

            if path.startswith("/api/friends/profile/"):
                current = self.current_user(connection)
                if not current:
                    self.send_json(401, {"error": "Unauthorized"})
                    return
                username = normalize_username(path.split("/api/friends/profile/", 1)[1])
                target = user_from_row(get_user_by_username(connection, username))
                if not target or username not in current.get("friends", []):
                    self.send_json(403, {"error": "Forbidden"})
                    return
                self.send_json(
                    200,
                    {
                        "user": {
                            "name": target["name"],
                            "username": target["username"],
                            "watched": target["watched"],
                            "wantToWatch": target["wantToWatch"],
                        }
                    },
                )
                return

        self.send_json(404, {"error": "Not found"})

    def handle_api_post(self, path: str) -> None:
        payload = self.parse_json_body()

        if path == "/api/signup":
            self.api_signup(payload)
            return
        if path == "/api/login":
            self.api_login(payload)
            return
        if path == "/api/logout":
            self.send_json(200, {"ok": True}, self.clear_session_headers())
            return
        if path == "/api/me/update":
            self.api_update_me(payload)
            return
        if path == "/api/admin/login":
            self.api_admin_login(payload)
            return
        if path == "/api/admin/logout":
            self.api_admin_logout()
            return
        if path == "/api/friends/request":
            self.api_friend_request(payload)
            return
        if path == "/api/friends/accept":
            self.api_friend_accept(payload)
            return
        if path == "/api/friends/decline":
            self.api_friend_decline(payload)
            return
        if path == "/api/friends/remove":
            self.api_friend_remove(payload)
            return

        self.send_json(404, {"error": "Not found"})

    def api_signup(self, payload: dict) -> None:
        name = str(payload.get("name", "")).strip()
        username = normalize_username(str(payload.get("username", "")))
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))

        if not name or not email or len(password) < 6 or not is_valid_username(username):
            self.send_json(400, {"error": "Invalid signup details"})
            return

        with db_connect() as connection:
            if get_user_by_email(connection, email):
                self.send_json(409, {"error": "That email already exists."})
                return
            if get_user_by_username(connection, username):
                self.send_json(409, {"error": "That username is already taken."})
                return

            password_hash, password_salt = hash_password(password)
            watched = []
            want_to_watch = []
            connection.execute(
                """
                INSERT INTO users (
                    name, username, email, password_hash, password_salt, created_at,
                    watched_json, want_to_watch_json, friends_json, incoming_requests_json, outgoing_requests_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', '[]')
                """,
                (
                    name,
                    username,
                    email,
                    password_hash,
                    password_salt,
                    now_iso(),
                    json.dumps(watched),
                    json.dumps(want_to_watch),
                ),
            )
            user_id = connection.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()["id"]
            connection.commit()
            row = get_user_by_email(connection, email)
            headers = self.create_session_headers(user_id)
            self.send_json(200, {"user": user_from_row(row)}, headers)

    def api_login(self, payload: dict) -> None:
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))

        with db_connect() as connection:
            row = get_user_by_email(connection, email)
            if not row or not verify_password(password, row["password_hash"], row["password_salt"]):
                self.send_json(401, {"error": "Wrong email or password."})
                return
            headers = self.create_session_headers(row["id"])
            self.send_json(200, {"user": user_from_row(row)}, headers)

    def api_update_me(self, payload: dict) -> None:
        with db_connect() as connection:
            current = self.current_user(connection)
            if not current:
                self.send_json(401, {"error": "Unauthorized"})
                return

            row = connection.execute("SELECT * FROM users WHERE id = ?", (current["id"],)).fetchone()
            stored = user_from_row(row)
            stored["watched"] = sanitize_watch_entries(payload.get("watched", stored["watched"]))
            stored["wantToWatch"] = sanitize_watch_later_entries(payload.get("wantToWatch", stored["wantToWatch"]))
            update_user_record(connection, stored)
            connection.commit()
            self.send_json(200, {"user": stored})

    def api_admin_login(self, payload: dict) -> None:
        passcode = str(payload.get("passcode", ""))
        if passcode != ADMIN_PASSCODE:
            self.send_json(401, {"error": "Wrong creator passcode."})
            return
        self.send_json(200, {"ok": True}, self.create_admin_headers())

    def api_admin_logout(self) -> None:
        token = self.get_cookie(ADMIN_COOKIE)
        with db_connect() as connection:
            if token:
                connection.execute("DELETE FROM admin_sessions WHERE token = ?", (token,))
                connection.commit()
        self.send_json(200, {"ok": True}, [("Set-Cookie", f"{ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")])

    def mutate_friendship(self, action: str, username_value: str) -> tuple[int, dict]:
        normalized_target = normalize_username(username_value)
        with db_connect() as connection:
            current_row = connection.execute(
                """
                SELECT u.*
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token = ?
                """,
                (self.get_cookie(SESSION_COOKIE),),
            ).fetchone()
            current = user_from_row(current_row)
            if not current or not normalized_target:
                return 401, {"error": "Unauthorized"}

            if normalized_target == current["username"]:
                return 400, {"error": "You cannot add yourself."}

            target = user_from_row(get_user_by_username(connection, normalized_target))
            if not target:
                return 404, {"error": "That username was not found."}

            if action == "request":
                if normalized_target in current["friends"]:
                    return 400, {"error": "You are already friends."}
                if normalized_target in current["outgoingFriendRequests"]:
                    return 400, {"error": "Friend request already sent."}
                if normalized_target in current["incomingFriendRequests"]:
                    action = "accept"
                else:
                    current["outgoingFriendRequests"].append(normalized_target)
                    target["incomingFriendRequests"].append(current["username"])
                    update_user_record(connection, current)
                    update_user_record(connection, target)
                    connection.commit()
                    return 200, {"message": f"Friend request sent to @{normalized_target}."}

            if action == "accept":
                current["incomingFriendRequests"] = [
                    username for username in current["incomingFriendRequests"] if username != normalized_target
                ]
                target["outgoingFriendRequests"] = [
                    username for username in target["outgoingFriendRequests"] if username != current["username"]
                ]
                if normalized_target not in current["friends"]:
                    current["friends"].append(normalized_target)
                if current["username"] not in target["friends"]:
                    target["friends"].append(current["username"])
                update_user_record(connection, current)
                update_user_record(connection, target)
                connection.commit()
                return 200, {"message": f"You are now friends with @{normalized_target}."}

            if action == "decline":
                current["incomingFriendRequests"] = [
                    username for username in current["incomingFriendRequests"] if username != normalized_target
                ]
                target["outgoingFriendRequests"] = [
                    username for username in target["outgoingFriendRequests"] if username != current["username"]
                ]
                update_user_record(connection, current)
                update_user_record(connection, target)
                connection.commit()
                return 200, {"message": f"Friend request from @{normalized_target} removed."}

            if action == "remove":
                current["friends"] = [username for username in current["friends"] if username != normalized_target]
                target["friends"] = [username for username in target["friends"] if username != current["username"]]
                current["outgoingFriendRequests"] = [
                    username for username in current["outgoingFriendRequests"] if username != normalized_target
                ]
                current["incomingFriendRequests"] = [
                    username for username in current["incomingFriendRequests"] if username != normalized_target
                ]
                target["outgoingFriendRequests"] = [
                    username for username in target["outgoingFriendRequests"] if username != current["username"]
                ]
                target["incomingFriendRequests"] = [
                    username for username in target["incomingFriendRequests"] if username != current["username"]
                ]
                update_user_record(connection, current)
                update_user_record(connection, target)
                connection.commit()
                return 200, {"message": f"Removed @{normalized_target} from your friends."}

        return 400, {"error": "Unable to update friendship."}

    def api_friend_request(self, payload: dict) -> None:
        status, response = self.mutate_friendship("request", str(payload.get("username", "")))
        self.send_json(status, response)

    def api_friend_accept(self, payload: dict) -> None:
        status, response = self.mutate_friendship("accept", str(payload.get("username", "")))
        self.send_json(status, response)

    def api_friend_decline(self, payload: dict) -> None:
        status, response = self.mutate_friendship("decline", str(payload.get("username", "")))
        self.send_json(status, response)

    def api_friend_remove(self, payload: dict) -> None:
        status, response = self.mutate_friendship("remove", str(payload.get("username", "")))
        self.send_json(status, response)


def main() -> None:
    init_db()
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), OtakuOracleHandler)
    print(f"Otaku Oracle running at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
