const friendsUser = ensureCurrentUser();
const friendForm = document.querySelector("#friend-form");
const friendUsernameInput = document.querySelector("#friend-username");
const friendMessage = document.querySelector("#friend-message");
const incomingRequests = document.querySelector("#incoming-requests");
const outgoingRequests = document.querySelector("#outgoing-requests");
const friendsList = document.querySelector("#friends-list");

function renderFriendCards(container, items, emptyText, mode) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  container.innerHTML = items.map((user) => {
    const watchedCount = (user.watched || []).length;
    const wantCount = (user.wantToWatch || []).length;

    if (mode === "incoming") {
      return `
        <article class="friend-card">
          <div>
            <strong>${user.name}</strong>
            <p>@${user.username}</p>
          </div>
          <div class="friend-actions">
            <button type="button" data-accept-friend="${user.username}">Accept</button>
            <button type="button" class="ghost-button" data-decline-friend="${user.username}">Decline</button>
          </div>
        </article>
      `;
    }

    if (mode === "outgoing") {
      return `
        <article class="friend-card">
          <div>
            <strong>${user.name}</strong>
            <p>@${user.username}</p>
          </div>
          <span class="chip">Pending</span>
        </article>
      `;
    }

    return `
      <article class="friend-card">
        <div>
          <strong>${user.name}</strong>
          <p>@${user.username}</p>
          <p>${watchedCount} watched • ${wantCount} watch later</p>
        </div>
        <div class="friend-actions">
          <a class="nav-link" href="./friend-profile.html?user=${encodeURIComponent(user.username)}">View lists</a>
          <button type="button" class="ghost-button" data-remove-friend="${user.username}">Remove</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderFriendsPage() {
  const user = ensureCurrentUser();
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  renderFriendCards(
    incomingRequests,
    user.incomingFriendRequests.map((username) => getUserByUsername(username)).filter(Boolean),
    "No incoming friend requests.",
    "incoming"
  );

  renderFriendCards(
    outgoingRequests,
    user.outgoingFriendRequests.map((username) => getUserByUsername(username)).filter(Boolean),
    "No pending requests sent.",
    "outgoing"
  );

  renderFriendCards(
    friendsList,
    getFriendsForUser(user),
    "No friends yet. Add someone by username.",
    "friends"
  );
}

friendForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = sendFriendRequest(friendUsernameInput.value);
  friendMessage.textContent = result.message;
  if (result.ok) {
    friendUsernameInput.value = "";
  }
  renderFriendsPage();
});

document.addEventListener("click", (event) => {
  const acceptUser = event.target.getAttribute("data-accept-friend");
  const declineUser = event.target.getAttribute("data-decline-friend");
  const removeUser = event.target.getAttribute("data-remove-friend");

  if (acceptUser) {
    friendMessage.textContent = acceptFriendRequest(acceptUser).message;
    renderFriendsPage();
  }

  if (declineUser) {
    friendMessage.textContent = declineFriendRequest(declineUser).message;
    renderFriendsPage();
  }

  if (removeUser) {
    friendMessage.textContent = removeFriend(removeUser).message;
    renderFriendsPage();
  }
});

if (!friendsUser) {
  window.location.href = "./index.html";
} else {
  renderFriendsPage();
}
