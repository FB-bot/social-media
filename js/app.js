// js/app.js
// Auth + Feed + Posts + Profile + Follow + Messages + Notifications + Search
// + Activity Log + Saved Posts + Stories + Admin Panel + Reports

// ===============================
// 🔥 Firebase Config (CHANGE THIS)
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  updateDoc,
  increment,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// extra modules
import {
  initNotifications,
  createNotification,
  startNotificationsListener,
  markAllNotificationsRead,
  requestFcmTokenForUser,
} from "./notifications.js";

import {
  initSearchSystem,
  searchUsers,
  searchPosts,
  searchByHashtag,
} from "./search.js";

// TODO: নিজের Firebase project-এর config এখানে বসাও
const firebaseConfig = {
  apiKey: "AIzaSyA5_baqmrQfH_INYwEHJFoZ86GH4_UDI7c",
  authDomain: "social-media-3f28d.firebaseapp.com",
  projectId: "social-media-3f28d",
  storageBucket: "social-media-3f28d.firebasestorage.app",
  messagingSenderId: "346720725412",
  appId: "1:346720725412:web:50a8fc02840898bef67931",
  measurementId: "G-1KGNSHJP0M"
};






// ==============================
// USER INFO + AVATAR HELPERS
// ==============================
const userNameCache = {};
const userPhotoCache = {};

async function getUserBasicInfo(uid) {
  if (!uid) return { name: "Unknown", photoURL: "" };

  if (userNameCache[uid] && userPhotoCache[uid] !== undefined) {
    return {
      name: userNameCache[uid],
      photoURL: userPhotoCache[uid],
    };
  }

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const d = snap.data();
      const name = d.name || d.username || "Unknown";
      const photoURL = d.photoURL || "";

      userNameCache[uid] = name;
      userPhotoCache[uid] = photoURL;

      return { name, photoURL };
    }
  } catch (e) {
    console.error("getUserBasicInfo error:", e);
  }

  return { name: "Unknown", photoURL: "" };
}





// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// init external systems
initNotifications(app, db);
initSearchSystem(db);

// ===============================
// Theme Utils
// ===============================
const THEME_KEY = "sm_theme";

function applyTheme(theme) {
  const finalTheme = theme === "dark" ? "dark" : "light";
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(finalTheme + "-theme");
  localStorage.setItem(THEME_KEY, finalTheme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || "light");
}







// ===============================
// Simple SPA State
// ===============================

let currentUser = null;
let isAdmin = false;
let storiesCache = {};



// =============================
// Browser Notification Feature
// =============================

// =============================
// Browser Notification Feature
// =============================

let lastNotificationIds = []; // আগের notification ID গুলো মনে রাখার জন্য

window.requestBrowserNotificationPermission = function () {
  if (!("Notification" in window)) {
    console.log("এই ব্রাউজারে Notification API সাপোর্ট করে না।");
    return;
  }

  if (Notification.permission === "granted") {
    console.log("Notification already granted");
    return;
  }

  Notification.requestPermission().then((permission) => {
    console.log("Notification permission:", permission);
    if (permission === "granted") {
      window.showNativeNotification(
        "Notification enabled",
        "Popup now works!"
      );
    }
  });
};

window.showNativeNotification = function (title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, { body });
};






const appRoot = document.getElementById("app");
initTheme();

// Feed pagination
let isLoadingPosts = false;
let lastPostDoc = null;
const PAGE_SIZE = 5;

// Presence
let presenceIntervalId = null;

// Notifications state
let latestNotifications = [];
let notificationsUnsub = null;

// Chat state
let currentChatId = null;
let currentChatPartnerId = null;
let chatMessagesUnsub = null;
let typingUnsub = null;
const typingTimeouts = {};



// =============================
// Message notification helpers
// =============================

// একবার লোড করলে আবার লোড করব না

async function getUserDisplayName(uid) {
  if (!uid) return "Someone";
  if (userNameCache[uid]) return userNameCache[uid];

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      const name = d.name || d.username || "Someone";
      userNameCache[uid] = name;
      return name;
    }
  } catch (e) {
    console.error("getUserDisplayName error:", e);
  }

  return "Someone";
}

// Navbar Messages icon highlight
function updateNavMessagesHighlight(unreadCount) {
  const btn = document.getElementById("navMessages");
  if (!btn) return;
  if (unreadCount > 0) {
    btn.classList.add("nav-messages-unread");
  } else {
    btn.classList.remove("nav-messages-unread");
  }
}

// Chat list এ unread user highlight
// Chat list এ unread user highlight + উপরে তোলা





// =============================
// NOTIFICATIONS PANEL RENDER
// =============================
// ===============================
// Notifications panel create / reuse (with Close button)
// ===============================
// ===============================
// Notifications panel (backdrop + card + header with close)
// ===============================








/// edit


// ===============================
// Notifications list render only inside #notificationsPanelBody
// ===============================




// ============================================
// HIGHLIGHT UNREAD CHATS + MOVE TO TOP
// ============================================
function highlightUnreadChatsFromNotifications(list) {
  const unreadSenders = new Set(
    list
      .filter((n) => n.type === "message" && !n.isRead && n.fromUserId)
      .map((n) => n.fromUserId)
  );

  const container = document.getElementById("chatContactsList");
  if (!container) return;

  const items = [...container.querySelectorAll(".chat-list-item")];

  items.forEach((item) => {
    const uid = item.dataset.uid;

    if (unreadSenders.has(uid)) {
      item.classList.add("chat-unread");
    } else {
      item.classList.remove("chat-unread");
    }
  });

  // NEW → Move unread senders to TOP
  items
    .sort((a, b) => {
      const aUnread = a.classList.contains("chat-unread") ? 1 : 0;
      const bUnread = b.classList.contains("chat-unread") ? 1 : 0;
      return bUnread - aUnread;
    })
    .forEach((item) => container.appendChild(item));
}




// ===============================
// Helpers
// ===============================

function render(html) {
  appRoot.innerHTML = html;
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] || c;
  });
}

function formatDate(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString();
}

function getChatId(a, b) {
  return [a, b].sort().join("_");
}

function updateNavNotificationBadge(count) {
  const btn = document.getElementById("navNotifications");
  if (!btn) return;
  if (!count) {
    btn.textContent = "Notifications";
  } else {
    btn.textContent = `Notifications (${count})`;
  }
}

async function checkAdminAndBanStatus() {
  if (!currentUser) {
    isAdmin = false;
    return;
  }
  try {
    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      isAdmin = false;
      return;
    }
    const data = snap.data();
    isAdmin = !!data.isAdmin;

    if (data.isBanned) {
      alert("Your account has been banned by admin.");
      await signOut(auth);
    }
  } catch (err) {
    console.error("Admin/ban check error:", err);
  }
}

// ===============================
// Templates (Views)
// ===============================



function loginViewTemplate() {
  return `
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-logo-circle">S</div>
        <div class="auth-brand-text">
          <h1>SocialApp</h1>
          <p>Welcome back 👋</p>
        </div>
      </div>

      <h2 class="auth-title">Login to your account</h2>
      <p class="auth-subtitle">Enter your credentials to continue</p>

      <form id="loginForm" class="auth-form">
        <div class="auth-field">
          <label for="loginEmail">Email</label>
          <input type="email" id="loginEmail" placeholder="you@example.com" required />
        </div>

        <div class="auth-field">
          <label for="loginPassword">Password</label>
          <input type="password" id="loginPassword" placeholder="••••••••" required />
        </div>

        <button type="submit" class="auth-btn">Login</button>
        <p id="loginError" class="auth-error"></p>
      </form>

      <div class="auth-footer">
        <span>Don't have an account?</span>
        <button id="goToSignup" class="auth-link-btn">Create account</button>
      </div>
    </div>
  </div>
  `;
}

function signupViewTemplate() {
  return `
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-logo-circle">S</div>
        <div class="auth-brand-text">
          <h1>SocialApp</h1>
          <p>Join the community 🚀</p>
        </div>
      </div>

      <h2 class="auth-title">Create your account</h2>
      <p class="auth-subtitle">It only takes a minute</p>

      <form id="signupForm" class="auth-form">
        <div class="auth-field">
          <label for="signupName">Full Name</label>
          <input type="text" id="signupName" placeholder="John Doe" required />
        </div>

        <div class="auth-field">
          <label for="signupUsername">Username</label>
          <input type="text" id="signupUsername" placeholder="username" required />
        </div>

        <div class="auth-field">
          <label for="signupEmail">Email</label>
          <input type="email" id="signupEmail" placeholder="you@example.com" required />
        </div>

        <div class="auth-field">
          <label for="signupPassword">Password</label>
          <input type="password" id="signupPassword" placeholder="Minimum 6 characters" required />
        </div>

        <button type="submit" class="auth-btn">Create account</button>
        <p id="signupError" class="auth-error"></p>
      </form>

      <div class="auth-footer">
        <span>Already have an account?</span>
        <button id="goToLogin" class="auth-link-btn">Login</button>
      </div>
    </div>
  </div>
  `;
}








///edit 


function commonNavHtml() {
  return `
    <div class="nav-container">
      <!-- TOP ROW: Logo + Search + Menu -->
      <div class="nav-top-row">
        <div class="nav-logo-text">SocialApp</div>

        <div class="nav-search">
          <input
            type="text"
            id="globalSearchInput"
            placeholder="Search users, posts or #hashtags..."
          />
          <button type="button" class="nav-search-btn" id="navSearchIconBtn">🔍</button>
        </div>

        <button
          id="navMenuToggle"
          class="nav-icon-btn nav-menu-toggle"
          title="Menu"
        >
          ☰
        </button>
      </div>

      <!-- BOTTOM ROW: Main icons -->
      <div class="nav-bottom-row">
        <button id="navHome" class="nav-icon-btn" title="Home">🏠</button>
        <button id="navMessages" class="nav-icon-btn" title="Messages">💬</button>
        <button id="navNotifications" class="nav-icon-btn" title="Notifications">🔔</button>
        <button id="navProfile" class="nav-icon-btn" title="Profile">👤</button>
        <button
          id="themeToggleBtn"
          class="nav-icon-btn theme-toggle-btn"
          title="Toggle theme"
        >
          …
        </button>
      </div>

      <!-- SIDE MENU: সব বাকি অপশন -->
      <div id="navSideMenu" class="nav-side-menu">
        <div class="nav-side-inner">
          <button class="nav-side-close" id="navSideClose">✕</button>

          <div class="nav-side-section">
            <div class="nav-side-title">Navigation</div>
            <button id="navHome" class="nav-side-item">🏠 Home</button>
            <button id="navMessages" class="nav-side-item">💬 Messages</button>
            <button id="navNotifications" class="nav-side-item">🔔 Notifications</button>
            <button id="navSearch" class="nav-side-item">🔍 Search</button>
            <button id="navSaved" class="nav-side-item">💾 Saved</button>
            <button id="navActivity" class="nav-side-item">📜 Activity</button>
            <button id="navAdmin" class="nav-side-item">🛡 Admin Panel</button>
            <button id="navProfile" class="nav-side-item">👤 Profile</button>
          </div>

          <div class="nav-side-section">
            <div class="nav-side-title">Settings</div>
            <button id="logoutBtn" class="nav-side-item nav-logout">🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  `;
}





function feedViewTemplate(user) {
  const name = user?.displayName || "User";
  const photoURL = user?.photoURL || "";
  const initials = name
    .split(" ")
    .map((p) => p[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarHtml = photoURL
    ? `<img src="${photoURL}" alt="${name}" />`
    : `<span>${initials}</span>`;

  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>
    <main class="feed-main">

      <!-- 🕒 Story Bar -->
      <section class="profile-main-card">
        <div class="story-bar">
          <div class="story-items" id="storyItems">
            <div class="story-item story-add" id="addStoryBtn">
              <div class="story-avatar" style="display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">+</div>
              <div class="story-name">Your Story</div>
            </div>
          </div>
        </div>
        <input type="file" id="storyFileInput" accept="image/*,video/*" style="display:none;" />
      </section>

      <section class="create-post-card">
        <div class="create-post-header">
          <div class="post-avatar">
            ${avatarHtml}
          </div>
          <div>
            <div style="font-weight:600;font-size:14px;">
              ${name}
            </div>
            <div style="font-size:12px;color:#666;">What's on your mind?</div>
          </div>
        </div>
        <form id="createPostForm">
          <textarea id="postText" placeholder="Write something." required></textarea>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
            <label style="font-size:13px;cursor:pointer;">
              📷 Media
              <input type="file" id="postMedia" accept="image/*,video/*" style="display:none;" />
            </label>
            <button type="submit" class="post-submit-btn">Post</button>
          </div>
        </form>
      </section>

      <section class="posts-list" id="postsList">
        <!-- Skeleton Loader -->
        <div class="post-card" id="postsSkeleton">
          <div class="post-header">
            <div class="post-avatar skeleton"></div>
            <div class="post-meta" style="flex:1;">
              <div class="skeleton" style="width:40%;height:12px;margin-bottom:4px;border-radius:999px;"></div>
              <div class="skeleton" style="width:25%;height:10px;border-radius:999px;"></div>
            </div>
          </div>
          <div class="skeleton" style="width:90%;height:12px;margin-top:8px;border-radius:999px;"></div>
          <div class="skeleton" style="width:80%;height:12px;margin-top:4px;border-radius:999px;"></div>
        </div>
      </section>
    </main>
  </div>
  `;
}




function messagesViewTemplate() {
  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <div class="chat-layout">

        <!-- LEFT: Chat list -->
        <aside class="chat-sidebar profile-main-card">
          <div class="chat-sidebar-header">
            <h3>Messages</h3>
            <span class="chat-sidebar-sub">Select a friend to start</span>
          </div>
          <div id="chatContactsList" class="chat-contacts">
            <p class="chat-empty-text">Loading users...</p>
          </div>
        </aside>

        <!-- RIGHT: Chat window -->
        <section class="chat-window profile-main-card">
          <!-- Placeholder -->
          <div class="chat-placeholder">
            <div class="chat-placeholder-icon">💬</div>
            <div class="chat-placeholder-title">No conversation selected</div>
            <div class="chat-placeholder-text">
              Choose a user from the left to start chatting.
            </div>
          </div>

          <!-- Active chat header -->
          <div class="chat-header" style="display:none;">
            <div class="chat-header-main">
              <div class="chat-header-avatar"></div>
              <div>
                <div id="chatPartnerName" class="chat-header-name"></div>
                <div id="chatPartnerStatus" class="chat-header-status"></div>
              </div>
            </div>
          </div>

          <!-- Messages area -->
          <div id="chatMessages" class="chat-messages"></div>

          <!-- Input area -->
          <div class="chat-input-row" style="display:none;">
            <input
              id="chatMessageInput"
              type="text"
              placeholder="Type a message..."
              autocomplete="off"
            />
            <button id="chatSendBtn" class="chat-send-btn">Send</button>
          </div>

          <!-- Typing indicator -->
          <div id="typingIndicator" class="typing-indicator"></div>
        </section>
      </div>
    </main>
  </div>
  `;
}



// জয়েন ডেট সুন্দর করে দেখানোর helper
function formatProfileJoinDate(date) {
  try {
    const options = { year: "numeric", month: "short" };
    // উদাহরণ: "Joined Nov 2025"
    return "Joined " + date.toLocaleDateString(undefined, options);
  } catch (e) {
    return "Joined";
  }
}



// ===============================
// Profile Template (final fixed)
// ===============================
function profileViewTemplate(userData, isCurrentUser, suggestions = []) {
  const createdAt = userData.createdAt?.toDate
    ? userData.createdAt.toDate()
    : userData.createdAt
    ? new Date(userData.createdAt)
    : null;

  const joinDateText = createdAt
    ? formatProfileJoinDate(createdAt)
    : "Joined";

  const followersCount = userData.followersCount || 0;
  const followingCount = userData.followingCount || 0;
  const postsCount = userData.postsCount || 0;

  const bio = userData.bio || "";
  const photoURL = userData.photoURL || "";
  const coverPhotoURL = userData.coverPhotoURL || "";

  const address = userData.address || "";
  const relationshipStatus = userData.relationshipStatus || "";

  const suggestionsHtml = (suggestions || [])
    .map(
      (item) => `
      <div class="suggested-user-item" data-user-id="${item.id}">
        <div class="suggested-user-info" style="display:flex;gap:6px;align-items:center;cursor:pointer;">
          <div class="suggested-user-avatar" style="width:30px;height:30px;border-radius:50%;background:#ccc;"></div>
          <div>
            <div style="font-size:14px;font-weight:600;">${
              item.data.name || "User"
            }</div>
            <div style="font-size:12px;color:#666;">@${
              item.data.username || "username"
            }</div>
          </div>
        </div>
        <button
          class="follow-btn-suggest profile-edit-btn"
          data-user-id="${item.id}"
          style="margin-left:auto;"
        >
          Follow
        </button>
      </div>
    `
    )
    .join("");

  const postsTitle = isCurrentUser
    ? "Your posts"
    : `${userData.name || "User"}’s posts`;

  return `
  <div class="profile-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <!-- COVER + AVATAR + BASIC INFO -->
      <section class="profile-main-card">
        <div class="profile-cover">
          ${
            coverPhotoURL
              ? `<img src="${coverPhotoURL}" alt="cover" />`
              : `<div style="width:100%;height:160px;background:#ddd;border-radius:12px;"></div>`
          }
        </div>
        <div style="position:relative;">
          <div class="profile-avatar-big" style="margin-top:-50px;">
            ${
              photoURL
                ? `<img src="${photoURL}" alt="avatar" />`
                : `<div style="width:100px;height:100px;border-radius:50%;background:#ccc;margin-top:-40px;border:4px solid #fff;"></div>`
            }
          </div>
        </div>
        <div class="profile-basic-info profile-header-row">
          <div class="profile-name">${userData.name || "User"}</div>
          <div class="profile-username">@${userData.username || "username"}</div>

          <div class="profile-bio">
            ${bio || "No bio added yet."}
          </div>

          <div class="profile-stats-row">
            <div class="profile-stat-item">
              <div class="profile-stat-label">Posts</div>
              <div class="profile-stat-value">${postsCount}</div>
            </div>
            <div class="profile-stat-item">
              <div class="profile-stat-label">Follower</div>
              <div class="profile-stat-value">
                <span id="profileFollowersCount">${followersCount}</span>
              </div>
            </div>
            <div class="profile-stat-item">
              <div class="profile-stat-label">Following</div>
              <div class="profile-stat-value">
                <span id="profileFollowingCount">${followingCount}</span>
              </div>
            </div>
          </div>


          <div class="profile-actions-row">
            ${
              isCurrentUser
                ? `
              <button
                class="profile-action-btn primary"
                id="btnEditProfile"
              >
                ✏️ Edit Profile
              </button>
            `
                : `
              <button
                class="profile-action-btn primary"
                id="btnFollowUser"
                data-user-id="${userData.id || ""}"
              >
                ➕ Follow
              </button>
              <button
                class="profile-action-btn"
                id="btnMessageUser"
              >
                💬 Message
              </button>
            `
            }
          </div>
        </div>
      </section>

      <!-- ABOUT CARD -->
      <section class="profile-main-card">
        <div class="profile-about-card">
          <div class="profile-about-title">About</div>
          <div class="profile-about-list">
            <div class="profile-about-item">
              <span class="profile-about-label">Address</span>
              <span>${address || "Not added"}</span>
            </div>
            <div class="profile-about-item">
              <span class="profile-about-label">Relationship</span>
              <span>${relationshipStatus || "Not added"}</span>
            </div>
            <div class="profile-about-item">
              <span class="profile-about-label">Joined</span>
              <span>${joinDateText}</span>
            </div>
          </div>
        </div>

        ${
          isCurrentUser
            ? `
          <div id="profileEditArea" style="margin-top:12px;">
            <h4 style="margin-bottom:6px;">Edit Profile</h4>
            <form id="profileEditForm" class="profile-edit-form">
              <input
                type="text"
                id="editName"
                placeholder="Full name"
                value="${userData.name || ""}"
              />
              <input
                type="text"
                id="editUsername"
                placeholder="Username"
                value="${userData.username || ""}"
              />
              <textarea
                id="editBio"
                placeholder="Bio"
              >${bio}</textarea>
              <input
                type="text"
                id="editPhotoURL"
                placeholder="Profile photo URL"
                value="${photoURL}"
              />
              <input
                type="text"
                id="editCoverURL"
                placeholder="Cover photo URL"
                value="${coverPhotoURL}"
              />
              <input
                type="text"
                id="editAddress"
                placeholder="Address"
                value="${address}"
              />
              <input
                type="text"
                id="editRelationship"
                placeholder="Relationship status"
                value="${relationshipStatus}"
              />
              <button
                type="submit"
                class="post-submit-btn"
                style="margin-top:8px;"
              >
                Save changes
              </button>
            </form>
          </div>
        `
            : ""
        }
      </section>

      <!-- POSTS SECTION -->
      <section class="profile-main-card profile-posts-section">
        <div class="profile-posts-title">${postsTitle}</div>
        <div id="profilePostsList">
          <p style="font-size:14px;color:#666;">Loading posts...</p>
        </div>
      </section>

      <!-- People you may know -->
      <section class="profile-main-card">
        <h3 style="margin-bottom:8px;">People you may know</h3>
        <div class="suggested-users-list" style="display:flex;flex-direction:column;gap:6px;">
          ${
            suggestionsHtml ||
            "<p style='font-size:14px;color:#666;'>No suggestions.</p>"
          }
        </div>
      </section>
    </main>
  </div>
  `;
}









function searchViewTemplate() {
  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <section class="profile-main-card">
        <h3>Search</h3>
        <input id="searchInput" placeholder="Search users, posts or #hashtag" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;" />
        <button id="searchBtn" class="post-submit-btn">Search</button>
      </section>

      <section class="profile-main-card">
        <h3>Results</h3>
        <div id="searchResults"></div>
      </section>
    </main>
  </div>
  `;
}

function savedViewTemplate() {
  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <section class="profile-main-card">
        <h3>Saved Posts</h3>
        <div id="savedPostsList">
          <p style="font-size:14px;color:#666;">Loading saved posts...</p>
        </div>
      </section>
    </main>
  </div>
  `;
}

function activityViewTemplate() {
  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <section class="profile-main-card">
        <h3>Activity Log</h3>
        <div id="activityList">
          <p style="font-size:14px;color:#666;">Loading activity...</p>
        </div>
      </section>
    </main>
  </div>
  `;
}

function adminViewTemplate() {
  return `
  <div class="feed-layout">
    <header class="top-nav">
      <div class="logo">SocialApp Admin</div>
      <nav class="nav-links">
        ${commonNavHtml()}
      </nav>
    </header>

    <main class="feed-main">
      <section class="profile-main-card">
        <h3>Site Analytics</h3>
        <div id="adminStats">
          <p style="font-size:14px;color:#666;">Loading stats...</p>
        </div>
      </section>

      <section class="profile-main-card">
        <h3>Reported Posts</h3>
        <div id="adminReports">
          <p style="font-size:14px;color:#666;">Loading reports...</p>
        </div>
      </section>

      <section class="profile-main-card">
        <h3>User Management</h3>
        <div id="adminUsers">
          <p style="font-size:14px;color:#666;">Loading users...</p>
        </div>
      </section>
    </main>
  </div>
  `;
}




// ... উপরের কোডগুলো

// এখানে formatTime ফাংশন বসাবে
function formatTime(value) {
  if (!value) return "";

  let date;
  try {
    // Firestore Timestamp হলে
    if (value.toDate) {
      date = value.toDate();
    } else {
      date = new Date(value);
    }
  } catch (e) {
    date = new Date();
  }

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return diffMin + " min ago";
  if (diffHour < 24) return diffHour + " h ago";
  if (diffDay < 7) return diffDay + " d ago";

  // এর পরে normal তারিখ দেখাই
  return date.toLocaleDateString();
}



// ===============================
// SINGLE POST CARD TEMPLATE (WITH COMMENTS AREA)
// ===============================
function postCardTemplate(id, data) {
  const authorPhoto = data.authorPhotoURL || "";

  let mediaHtml = "";
  if (data.mediaURL) {
    if (data.mediaType?.startsWith("video")) {
      mediaHtml = `
        <div class="post-media">
          <video src="${data.mediaURL}" controls
          style="width:100%;max-height:420px;border-radius:10px;"></video>
        </div>`;
    } else {
      mediaHtml = `
        <div class="post-media">
          <img src="${data.mediaURL}"
          style="width:100%;max-height:420px;object-fit:cover;border-radius:10px;" />
        </div>`;
    }
  }

  return `
    <article class="post-card" data-id="${id}" data-author-id="${data.authorId || ""}">
      <div class="post-header">
        <div class="post-avatar">
          ${authorPhoto ? `<img src="${authorPhoto}" alt="avatar" />` : ""}
        </div>
        <div class="post-meta">
          <div class="post-author" style="cursor:pointer;">
            ${data.authorName || "Unknown User"}
          </div>
          <div class="post-time">${formatDate(data.createdAt)}</div>
        </div>
      </div>

      <div class="post-content">
        ${(data.text || "").replace(/\n/g, "<br>")}
      </div>

      ${mediaHtml}

      <div class="post-actions">
        <button class="like-btn">Like (${data.likesCount || 0})</button>
        <button class="comment-btn">Comment (${data.commentsCount || 0})</button>
        <button class="save-btn">Save</button>
        <button class="share-btn">Share</button>
        <button class="report-btn">Report</button>
      </div>

      <!-- নতুন: কমেন্ট দেখানোর জায়গা -->
      <div class="post-comments" data-post-id="${id}" style="margin-top:6px;">
        <div class="post-comments-list" style="margin-top:4px;">
          <!-- Realtime comments এখানে আসবে -->
        </div>
      </div>
    </article>
  `;
}







// ===============================
// Auth Views
// ===============================

function showLoginView() {
  render(loginViewTemplate());

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const goToSignup = document.getElementById("goToSignup");

  goToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    showSignupView();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      currentUser = cred.user;
      showFeedView();
    } catch (error) {
      loginError.textContent = error.message;
    }
  });
}





function showSignupView() {
  render(signupViewTemplate());

  const signupForm = document.getElementById("signupForm");
  const signupError = document.getElementById("signupError");
  const goToLogin = document.getElementById("goToLogin");

  goToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginView();
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupError.textContent = "";

    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (username.includes(" ")) {
      signupError.textContent = "Username এ স্পেস থাকা যাবে না";
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      currentUser = cred.user;

      // ⭐ ডিফল্ট প্রোফাইল পিকচার (নেইম থেকে অটো জেনারেট)
      const defaultPhoto =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(name || "User") +
        "&background=0D8ABC&color=ffffff";

      // Firebase Auth এ নাম + photoURL সেট করা
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: defaultPhoto,
      });

      // Firestore users collection এ সেভ
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        name,
        username,
        email,
        createdAt: serverTimestamp(),
        bio: "",
        photoURL: defaultPhoto,   // ⭐ এখানেও সেভ
        coverPhotoURL: "",
        followersCount: 0,
        followingCount: 0,
        isAdmin: false,
        isBanned: false,
      });

      showFeedView();
    } catch (error) {
      signupError.textContent = error.message;
    }
  });
}




// ===============================
// Presence
// ===============================

function startPresenceTracking() {
  if (!currentUser) return;
  const statusRef = doc(db, "status", currentUser.uid);
  setDoc(
    statusRef,
    { isOnline: true, lastActive: serverTimestamp() },
    { merge: true }
  ).catch(() => {});

  if (presenceIntervalId) clearInterval(presenceIntervalId);
  presenceIntervalId = setInterval(() => {
    if (!currentUser) return;
    updateDoc(statusRef, {
      isOnline: true,
      lastActive: serverTimestamp(),
    }).catch(() => {});
  }, 30000);

  window.addEventListener(
    "beforeunload",
    () => {
      updateDoc(statusRef, {
        isOnline: false,
        lastActive: serverTimestamp(),
      }).catch(() => {});
    },
    { once: true }
  );
}

// ===============================
// Top Nav (Common)
// ===============================


// ===============================
// Notifications Panel (FINAL VERSION)
// ===============================
function ensureNotificationsPanelElement() {
  let panel = document.getElementById("notificationsPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationsPanel";
    panel.className = "notifications-panel-backdrop";

    panel.innerHTML = `
      <div class="notifications-panel-card">
        <div class="notifications-panel-header">
          <span class="notifications-panel-title">Notifications</span>
          <button
            type="button"
            id="notificationsPanelClose"
            class="notifications-close-btn"
            aria-label="Close notifications"
          >
            ✕
          </button>
        </div>
        <div id="notificationsPanelBody" class="notifications-panel-body">
          <!-- notifications list here -->
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // বাইরে কালো অংশে ক্লিক করলে panel বন্ধ
    panel.addEventListener("click", (e) => {
      if (e.target === panel) {
        panel.classList.remove("open");
      }
    });

    // Cross বাটনে ক্লিক করলে panel বন্ধ
    const closeBtn = panel.querySelector("#notificationsPanelClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        panel.classList.remove("open");
      });
    }
  }

  return panel;
}



////edit



// ===============================
// Notifications list render + click → navigate
// ===============================
async function renderNotificationsPanel() {
  const panel = ensureNotificationsPanelElement();
  const body = document.getElementById("notificationsPanelBody");
  if (!body) return;

  // কোনো notification না থাকলে
  if (!latestNotifications || !latestNotifications.length) {
    body.innerHTML = `
      <div class="notifications-empty">
        কোনো নতুন নোটিফিকেশন নেই।
      </div>
    `;
    return;
  }

  const itemsHtml = [];

  for (const n of latestNotifications) {
    let actorName = "Someone";
    let actorPhoto = "";

    if (n.fromUserId) {
      try {
        const info = await getUserBasicInfo(n.fromUserId);
        if (info) {
          actorName = info.name || actorName;
          actorPhoto = info.photoURL || "";
        }
      } catch (e) {
        console.error("getUserBasicInfo error:", e);
      }
    }

    let title;
    if (n.type === "like") title = `${actorName} liked your post`;
    else if (n.type === "comment") title = `${actorName} commented on your post`;
    else if (n.type === "follow") title = `${actorName} started following you`;
    else if (n.type === "message") title = `${actorName} sent you a message`;
    else title = `Activity from ${actorName}`;

    const preview = n.previewText || "";
    let timeText = "";
    try {
      if (n.createdAt && typeof n.createdAt.toDate === "function") {
        timeText = formatDate(n.createdAt);
      }
    } catch (e) {
      console.error(e);
    }

    const initials = actorName
      .split(" ")
      .map((p) => p[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const avatar = actorPhoto
      ? `<img src="${actorPhoto}" alt="${actorName}" />`
      : `<span>${initials}</span>`;

    itemsHtml.push(`
      <div class="notification-item ${n.isRead ? "" : "unread"}"
           data-type="${n.type || ""}"
           data-post-id="${n.postId || ""}"
           data-from-user-id="${n.fromUserId || ""}"
           data-from-name="${actorName}">
        <div class="notification-avatar">
          ${avatar}
        </div>
        <div class="notification-main">
          <div class="notification-title">${title}</div>
          ${
            preview
              ? `<div class="notification-text">${preview}</div>`
              : ""
          }
          ${
            timeText
              ? `<div class="notification-time">${timeText}</div>`
              : ""
          }
        </div>
      </div>
    `);
  }

  body.innerHTML = itemsHtml.join("");

  // 🔗 Notification item click → Navigate
  body.onclick = (e) => {
    const item = e.target.closest(".notification-item");
    if (!item) return;

    const type = item.dataset.type;
    const postId = item.dataset.postId;
    const fromUserId = item.dataset.fromUserId;
    const fromUserName = item.dataset.fromName || "";

    // Panel বন্ধ
    panel.classList.remove("open");

    // 🟢 Message notification → Messages view + ওই user এর chat
    if (type === "message" && fromUserId) {
      showMessagesView();
      setTimeout(() => {
        // 2nd parameter হিসেবে নাম পাঠাচ্ছি
        openChatWithUser(fromUserId, fromUserName);
      }, 200);
      return;
    }

    // 🟢 Like / Comment → Feed view + নির্দিষ্ট post scroll + highlight
    if ((type === "like" || type === "comment") && postId) {
      showFeedView();
      setTimeout(() => {
        const card = document.querySelector(
          `.post-card[data-id="${postId}"]`
        );
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          const oldShadow = card.style.boxShadow;
          card.style.boxShadow = "0 0 0 2px #2563eb";
          setTimeout(() => {
            card.style.boxShadow = oldShadow || "";
          }, 2000);
        }
      }, 400);
      return;
    }

    // 🟢 Follow → profile view
    if (type === "follow" && fromUserId) {
      showProfileView(fromUserId);
      return;
    }

    // অন্য কিছু হলে default feed
    showFeedView();
  };
}




// ===============================
// Top Nav (Common) - UPDATED WITH SIDE MENU + GLOBAL SEARCH
// ===============================

// ===============================
// Top Nav (Common) - UPDATED
// ===============================
function setupTopNavCommon() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
    });
  }

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    const now = localStorage.getItem(THEME_KEY) || "light";
    themeToggleBtn.textContent = now === "light" ? "🌙 Dark" : "☀️ Light";

    themeToggleBtn.addEventListener("click", () => {
      const current = localStorage.getItem(THEME_KEY) || "light";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      themeToggleBtn.textContent =
        next === "light" ? "🌙 Dark" : "☀️ Light";
    });
  }

  // Navigation buttons
  document.getElementById("navHome")?.addEventListener("click", () => {
    showFeedView();
  });

  document.getElementById("navProfile")?.addEventListener("click", () => {
    if (!currentUser) return;
    showProfileView(currentUser.uid);
  });

  document.getElementById("navMessages")?.addEventListener("click", () => {
    showMessagesView();
  });

  // 🔔 Notifications বাটন – এখন নামও দেখাবে


  document
    .getElementById("navNotifications")
    ?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!currentUser) return;

      const panel = ensureNotificationsPanelElement();

      // Panel already open থাকলে → বন্ধ করে দিচ্ছি
      if (panel.classList.contains("open")) {
        panel.classList.remove("open");
        return;
      }

      // নতুন করে render করে ওপেন করো
      await renderNotificationsPanel();
      panel.classList.add("open");

      // সব notification read করে দেই
      try {
        await markAllNotificationsRead(currentUser.uid);
      } catch (err) {
        console.error("markAllNotificationsRead error:", err);
      }

      // badge / highlight আপডেট করি
      updateNavNotificationBadge(0);
      updateNavMessagesHighlight(0);
      highlightUnreadChatsFromNotifications(latestNotifications);
    });








  document.getElementById("navSearch")?.addEventListener("click", () => {
    showSearchView();
  });

  document.getElementById("navSaved")?.addEventListener("click", () => {
    showSavedView();
  });

  document.getElementById("navActivity")?.addEventListener("click", () => {
    showActivityView();
  });

  const adminBtn = document.getElementById("navAdmin");
  if (adminBtn) {
    if (!isAdmin) {
      adminBtn.style.display = "none";
    } else {
      adminBtn.style.display = "inline-block";
      adminBtn.addEventListener("click", () => {
        showAdminView();
      });
    }
  }

  // ======= Side menu + global search (আগের মতোই থাকলো) =======
  const sideMenu = document.getElementById("navSideMenu");
  const menuToggle = document.getElementById("navMenuToggle");
  const sideClose = document.getElementById("navSideClose");
  const globalSearchInput = document.getElementById("globalSearchInput");

  if (menuToggle && sideMenu) {
    menuToggle.onclick = () => {
      sideMenu.classList.add("open");
    };
  }

  if (sideClose && sideMenu) {
    sideClose.onclick = () => {
      sideMenu.classList.remove("open");
    };
  }

  if (sideMenu) {
    sideMenu.addEventListener("click", (e) => {
      if (e.target === sideMenu) {
        sideMenu.classList.remove("open");
      }
    });
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const text = globalSearchInput.value.trim();
        if (!text) return;
        showSearchView();

        setTimeout(() => {
          const mainInput = document.getElementById("searchInput");
          if (mainInput) {
            mainInput.value = text;
            mainInput.focus();
          }
        }, 80);
      }
    });
  }
}




// ===============================
// Story System (24h)
// ===============================

async function setupStorySystem() {
  if (!currentUser) return;

  const addBtn = document.getElementById("addStoryBtn");
  const fileInput = document.getElementById("storyFileInput");
  const storyItems = document.getElementById("storyItems");

  if (addBtn && fileInput) {
    addBtn.onclick = () => {
      fileInput.value = "";
      fileInput.click();
    };

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const caption = prompt("Add a caption (optional):") || "";

      await createStory(file, caption);
      await loadStories();
    };
  }

  if (storyItems) {
    storyItems.onclick = (e) => {
      const item = e.target.closest(".story-item");
      if (item && item.classList.contains("story-add")) return;
      if (!item) return;
      const storyId = item.dataset.storyId;
      if (!storyId) return;
      openStoryViewer(storyId);
    };
  }

  await loadStories();
}

async function createStory(file, caption) {
  if (!currentUser) return;

  try {
    const path = `storiesMedia/${currentUser.uid}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const mediaURL = await getDownloadURL(fileRef);
    const mediaType = file.type || "";

    const storiesCol = collection(db, "stories");
    const docRef = await addDoc(storiesCol, {
      userId: currentUser.uid,
      userName: currentUser.displayName || "User",
      mediaURL,
      mediaType,
      caption: caption || "",
      createdAt: serverTimestamp(),
    });

    await logActivity("story_create", {
      storyId: docRef.id,
      previewText: caption.slice(0, 60),
    });
  } catch (err) {
    console.error("Story create error:", err);
    alert("Story upload করতে সমস্যা হচ্ছে");
  }
}

async function loadStories() {
  const storyItems = document.getElementById("storyItems");
  if (!storyItems || !currentUser) return;

  storyItems.querySelectorAll(".story-item:not(.story-add)").forEach((el) =>
    el.remove()
  );

  storiesCache = {};

  try {
    const storiesCol = collection(db, "stories");
    const qStories = query(storiesCol, orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(qStories);

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    const perUserLatest = {};

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.createdAt) return;
      const created = data.createdAt.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      if (now - created.getTime() > ONE_DAY) return;

      const uid = data.userId;
      if (!uid) return;

      if (!perUserLatest[uid]) {
        perUserLatest[uid] = {
          id: docSnap.id,
          data,
        };
      }
    });

    Object.values(perUserLatest).forEach((item) => {
      const { id, data } = item;
      storiesCache[id] = { id, data };

      const isSelf = data.userId === currentUser.uid;

      const el = document.createElement("div");
      el.className = "story-item" + (isSelf ? " story-self" : "");
      el.dataset.storyId = id;

      el.innerHTML = `
        <div class="story-avatar"></div>
        <div class="story-name">${data.userName || "Story"}</div>
      `;
      storyItems.appendChild(el);
    });
  } catch (err) {
    console.error("Load stories error:", err);
  }
}

function openStoryViewer(storyId) {
  const storyObj = storiesCache[storyId];
  if (!storyObj) return;

  const { data } = storyObj;

  const overlay = document.createElement("div");
  overlay.id = "storyOverlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const box = document.createElement("div");
  box.style.background = "#000";
  box.style.borderRadius = "12px";
  box.style.padding = "10px";
  box.style.maxWidth = "420px";
  box.style.width = "90%";
  box.style.color = "#fff";
  box.style.position = "relative";

  const closeBtn = document.createElement("button");
  closeBtn.id = "closeStoryBtn";
  closeBtn.textContent = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "8px";
  closeBtn.style.right = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "rgba(255,255,255,0.15)";
  closeBtn.style.color = "#fff";
  closeBtn.style.borderRadius = "999px";
  closeBtn.style.padding = "4px 8px";
  closeBtn.style.cursor = "pointer";

  let mediaHtml = "";
  if (data.mediaType?.startsWith("video")) {
    mediaHtml = `<video src="${data.mediaURL}" controls style="width:100%;max-height:420px;border-radius:10px;"></video>`;
  } else {
    mediaHtml = `<img src="${data.mediaURL}" style="width:100%;max-height:420px;object-fit:cover;border-radius:10px;" />`;
  }

  box.innerHTML = `
    <div style="font-size:14px;font-weight:600;margin-bottom:6px;">
      ${data.userName || "Story"}
    </div>
    ${mediaHtml}
    ${
      data.caption
        ? `<div style="margin-top:6px;font-size:13px;">${escapeHtml(
            data.caption
          )}</div>`
        : ""
    }
  `;

  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target.id === "storyOverlay") close();
  });
  closeBtn.addEventListener("click", close);
}

// ===============================
// Feed (Home)
// ===============================

function showFeedView() {
  if (!currentUser) {
    showLoginView();
    return;
  }

  isLoadingPosts = false;
  lastPostDoc = null;
  window.onscroll = null;

  render(feedViewTemplate(currentUser));
  setupTopNavCommon();
  setupStorySystem();
  setupCreatePostForm();
  loadInitialPosts();

  window.onscroll = async () => {
    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
      !isLoadingPosts
    ) {
      await loadMorePosts();
    }
  };

  const postsList = document.getElementById("postsList");
  postsList?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    const authorEl = e.target.closest(".post-author");

    const cardFromBtn = btn?.closest(".post-card");
    const cardFromAuthor = authorEl?.closest(".post-card");
    const card = cardFromBtn || cardFromAuthor;
    const postId = card?.dataset.id;

    if (authorEl && card) {
      const authorId = card.dataset.authorId;
      if (authorId) {
        showProfileView(authorId);
      }
      return;
    }

    if (!btn || !card || !postId) return;

    if (btn.classList.contains("like-btn")) {
      handleLike(postId, btn);
    } else if (btn.classList.contains("comment-btn")) {
      handleComment(postId, btn);
    } else if (btn.classList.contains("save-btn")) {
      handleSave(postId, btn);
    } else if (btn.classList.contains("share-btn")) {
      handleShare(postId);
    } else if (btn.classList.contains("report-btn")) {
      handleReport(postId);
    }
  });
}

// ===============================
// Messages View (Realtime Chat)
// ===============================

function showMessagesView() {
  if (!currentUser) {
    showLoginView();
    return;
  }

  window.onscroll = null;

  render(messagesViewTemplate());
  setupTopNavCommon();

  loadChatContacts();

  // ⭐ notification থেকে unread sender থাকলে সাথে সাথেই highlight
  if (latestNotifications && latestNotifications.length) {
    highlightUnreadChatsFromNotifications(latestNotifications);
  }
}



////added


async function loadChatContacts() {
  const listEl = document.getElementById("chatContactsList");
  if (!listEl || !currentUser) return;

  listEl.innerHTML =
    "<p style='font-size:14px;color:#666;'>Loading users...</p>";

  try {
    const usersCol = collection(db, "users");
    const qUsers = query(usersCol, limit(50));
    const snap = await getDocs(qUsers);

    let html = "";
    for (const docSnap of snap.docs) {
      if (docSnap.id === currentUser.uid) continue;
      const data = docSnap.data();
      const name = data.name || data.username || "User";
      const photoURL = data.photoURL || "";

      // Online/Offline status
      let statusText = "Offline";
      let statusDotColor = "#999";
      try {
        const statusSnap = await getDoc(doc(db, "status", docSnap.id));
        if (statusSnap.exists()) {
          const s = statusSnap.data();
          if (s.isOnline) {
            statusText = "Online";
            statusDotColor = "#31a24c";
          }
        }
      } catch (err) {}

      const initials = name
        .split(" ")
        .map((p) => p[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const avatarHtml = photoURL
        ? `<img src="${photoURL}" alt="${name}" />`
        : `<span>${initials}</span>`;

      html += `
        <div class="chat-list-item"
             data-user-id="${docSnap.id}"
             data-uid="${docSnap.id}"
             data-name="${name}">
          <div class="chat-list-avatar">
            ${avatarHtml}
          </div>
          <div class="chat-list-main">
            <div class="chat-list-top" style="display:flex;align-items:center;gap:6px;">
              <span class="status-dot" style="width:8px;height:8px;border-radius:50%;background:${statusDotColor};"></span>
              <span class="chat-list-name">${name}</span>
            </div>
            <div class="chat-list-bottom">
              <span class="chat-list-preview">${statusText}</span>
            </div>
          </div>
        </div>
      `;
    }

    listEl.innerHTML =
      html ||
      "<p style='font-size:14px;color:#666;'>No other users found.</p>";

    // click → open chat
    listEl.addEventListener("click", (e) => {
      const item = e.target.closest(".chat-list-item");
      if (!item) return;
      const uid = item.dataset.userId;
      const name = item.dataset.name;
      openChatWithUser(uid, name);
    });

    // ⭐ notification list থেকে unread sender গুলা highlight করো
    if (latestNotifications && latestNotifications.length) {
      highlightUnreadChatsFromNotifications(latestNotifications);
    }
  } catch (err) {
    console.error(err);
    listEl.innerHTML =
      "<p style='font-size:14px;color:red;'>Error loading users</p>";
  }
}




////edit

async function openChatWithUser(userId, name) {
  if (!currentUser) return;

  const chatId = getChatId(currentUser.uid, userId);
  currentChatId = chatId;
  currentChatPartnerId = userId;

  const placeholder = document.querySelector(".chat-placeholder");
  const header = document.querySelector(".chat-header");
  const inputRow = document.querySelector(".chat-input-row");
  const partnerNameEl = document.getElementById("chatPartnerName");
  const partnerStatusEl = document.getElementById("chatPartnerStatus");
  const messagesDiv = document.getElementById("chatMessages");

  if (placeholder) placeholder.style.display = "none";
  if (header) header.style.display = "flex";
  if (inputRow) inputRow.style.display = "flex";

  if (partnerNameEl) {
    partnerNameEl.textContent = name || "User";
  }
  if (messagesDiv) {
    messagesDiv.innerHTML = "";
  }

  // 🔵 নতুন অংশ: chat header এ avatar দেখানো
  const headerAvatarEl = document.querySelector(".chat-header-avatar");
  if (headerAvatarEl) {
    headerAvatarEl.innerHTML = "";

    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists()) {
        const u = userSnap.data();
        const displayName = u.name || u.username || name || "User";
        const photoURL = u.photoURL || "";
        const initials = displayName
          .split(" ")
          .map((p) => p[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase();

        if (photoURL) {
          headerAvatarEl.innerHTML = `
            <img
              src="${photoURL}"
              alt="${displayName}"
              style="width:100%;height:100%;border-radius:999px;object-fit:cover;"
            />
          `;
        } else {
          headerAvatarEl.textContent = initials;
        }
      } else {
        const initialsFallback = (name || "User")
          .split(" ")
          .map((p) => p[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase();
        headerAvatarEl.textContent = initialsFallback;
      }
    } catch (e) {
      console.error("chat header avatar error:", e);
    }
  }

  const chatRef = doc(db, "chats", chatId);
  await setDoc(
    chatRef,
    {
      participants: [currentUser.uid, userId],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  try {
    const statusSnap = await getDoc(doc(db, "status", userId));
    if (statusSnap.exists()) {
      const s = statusSnap.data();
      partnerStatusEl.textContent = s.isOnline ? "Online" : "Offline";
    } else {
      partnerStatusEl.textContent = "";
    }
  } catch (err) {
    partnerStatusEl.textContent = "";
  }

  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
  if (typingUnsub) {
    typingUnsub();
    typingUnsub = null;
  }

  const messagesCol = collection(db, "chats", chatId, "messages");
  const qMessages = query(messagesCol, orderBy("createdAt", "asc"), limit(50));
  chatMessagesUnsub = onSnapshot(qMessages, (snap) => {
    let html = "";
    snap.forEach((docSnap) => {
      const m = docSnap.data();
      const isSelf = m.senderId === currentUser.uid;
      const seenText = isSelf
        ? m.seen
          ? "✓✓ Seen"
          : "✓ Delivered"
        : "";
      html += `
        <div class="chat-message ${isSelf ? "self" : "other"}" style="margin-bottom:4px;">
          <div class="chat-text" style="display:inline-block;padding:6px 10px;border-radius:10px;background:${
            isSelf ? "#1877f2" : "#e4e6eb"
          };color:${isSelf ? "#fff" : "#000"};max-width:80%;">${escapeHtml(
        m.text || ""
      )}</div>
          <div class="chat-meta" style="font-size:11px;color:#999;margin-top:2px;">${formatDate(
            m.createdAt
          )} ${seenText}</div>
        </div>
      `;
    });
    messagesDiv.innerHTML = html;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    markIncomingMessagesAsSeen(chatId, userId, snap);
  });

  setupTyping(chatId, userId);

  const input = document.getElementById("chatMessageInput");
  const sendBtn = document.getElementById("chatSendBtn");
  sendBtn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;
    try {
      await addDoc(messagesCol, {
        text,
        senderId: currentUser.uid,
        receiverId: userId,
        createdAt: serverTimestamp(),
        seen: false,
      });

      await createNotification({
        userId,
        fromUserId: currentUser.uid,
        type: "message",
        chatId,
        previewText: text.slice(0, 60),
      });

      await logActivity("message_send", {
        toUserId: userId,
        previewText: text.slice(0, 60),
      });

      input.value = "";
      await setTypingState(chatId, currentUser.uid, false);
    } catch (err) {
      console.error(err);
    }
  };
}





function setupTyping(chatId, partnerId) {
  const typingIndicator = document.getElementById("typingIndicator");
  const input = document.getElementById("chatMessageInput");
  if (!typingIndicator || !input) return;

  const typingRefOther = doc(db, "chats", chatId, "typing", partnerId);
  typingUnsub = onSnapshot(typingRefOther, (snap) => {
    if (!snap.exists()) {
      typingIndicator.textContent = "";
      return;
    }
    const data = snap.data();
    typingIndicator.textContent = data.isTyping ? "Typing..." : "";
  });

  input.oninput = () => {
    if (!currentUser) return;
    setTypingState(chatId, currentUser.uid, true);
    if (typingTimeouts[chatId]) clearTimeout(typingTimeouts[chatId]);
    typingTimeouts[chatId] = setTimeout(() => {
      setTypingState(chatId, currentUser.uid, false);
    }, 1500);
  };
}

async function setTypingState(chatId, userId, isTyping) {
  try {
    const refTyping = doc(db, "chats", chatId, "typing", userId);
    await setDoc(
      refTyping,
      {
        isTyping,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(err);
  }
}

async function markIncomingMessagesAsSeen(chatId, partnerId, snap) {
  if (!currentUser) return;
  const promises = [];
  snap.forEach((docSnap) => {
    const m = docSnap.data();
    if (m.senderId === partnerId && !m.seen) {
      const msgRef = doc(db, "chats", chatId, "messages", docSnap.id);
      promises.push(updateDoc(msgRef, { seen: true }));
    }
  });
  if (promises.length) {
    try {
      await Promise.all(promises);
    } catch (err) {
      console.error(err);
    }
  }
}


// ===============================
// Profile View
// ===============================
async function showProfileView(userId) {
  if (!currentUser) {
    showLoginView();
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      alert("User not found");
      showFeedView();
      return;
    }

    // ⭐ এখানে id রেখে দিলাম, যাতে template আর follow logic দুই জায়গায় কাজে লাগে
    const userData = { id: userSnap.id, ...userSnap.data() };
    const isCurrentUser = currentUser.uid === userId;

    // simple suggestions
    const suggestions = [];
    const usersCol = collection(db, "users");
    const usersSnap = await getDocs(usersCol);
    usersSnap.forEach((docSnap) => {
      if (docSnap.id === currentUser.uid || docSnap.id === userId) return;
      suggestions.push({ id: docSnap.id, data: docSnap.data() });
    });

    render(profileViewTemplate(userData, isCurrentUser, suggestions.slice(0, 5)));
    setupTopNavCommon();

    if (isCurrentUser) {
      // নিজের প্রোফাইল → Edit Profile
      const editBtn = document.getElementById("btnEditProfile");
      const editForm = document.getElementById("profileEditForm");

      if (editBtn && editForm) {
        editBtn.addEventListener("click", () => {
          const area = document.getElementById("profileEditArea");
          if (!area) return;
          area.style.display =
            area.style.display === "none" || !area.style.display
              ? "block"
              : "none";
        });

        editForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const name = document.getElementById("editName").value.trim();
          const username = document
            .getElementById("editUsername")
            .value.trim();
          const bio = document.getElementById("editBio").value.trim();
          const photoURL = document
            .getElementById("editPhotoURL")
            .value.trim();
          const coverPhotoURL = document
            .getElementById("editCoverURL")
            .value.trim();
          const address = document
            .getElementById("editAddress")
            .value.trim();
          const relationshipStatus = document
            .getElementById("editRelationship")
            .value.trim();

          try {
            await updateDoc(userRef, {
              name,
              username,
              bio,
              photoURL,
              coverPhotoURL,
              address,
              relationshipStatus,
            });

            if (name && currentUser.displayName !== name) {
              await updateProfile(currentUser, { displayName: name });
            }
            if (photoURL && currentUser.photoURL !== photoURL) {
              await updateProfile(currentUser, { photoURL });
            }

            await logActivity("profile_update", {});
            alert("Profile updated!");
            showProfileView(userId);
          } catch (err) {
            console.error(err);
            alert("Update error: " + err.message);
          }
        });
      }
    } else {
      // অন্যের প্রোফাইল → Follow + Message

      const followBtn = document.getElementById("btnFollowUser");
      if (followBtn) {
        // ⭐ আগের follow logic যেভাবে কাজ করত, ঠিক সেভাবে
        // সাধারণত setupFollowButton শুধু button নেয় এবং button.dataset.userId থেকে userId পড়ে
        if (typeof setupFollowButton === "function") {
          setupFollowButton(followBtn);
        } else {
          // backup: শুধু console এ দেখাই, যেন crash না করে
          followBtn.addEventListener("click", () => {
            console.log("Follow clicked (setupFollowButton not found)");
          });
        }
      }

      const messageBtn = document.getElementById("btnMessageUser");
      if (messageBtn) {
        messageBtn.addEventListener("click", () => {
          const displayName =
            userData.name || userData.username || "User";
          showMessagesView();
          if (typeof openChatWithUser === "function") {
            setTimeout(() => {
              openChatWithUser(userId, displayName);
            }, 200);
          }
        });
      }
    }

    // Suggestions click handling (People you may know)
    const suggestionsList = document.querySelector(".suggested-users-list");
    if (suggestionsList) {
      suggestionsList.addEventListener("click", (e) => {
        const item = e.target.closest(".suggested-user-item");
        if (!item) return;
        const targetId = item.dataset.userId;
        if (!targetId) return;

        if (e.target.classList.contains("follow-btn-suggest")) {
          if (typeof setupFollowButton === "function") {
            setupFollowButton(e.target);
          }
        } else if (e.target.closest(".suggested-user-info")) {
          showProfileView(targetId);
        }
      });
    }

    // ⭐ প্রোফাইলের সব পোস্ট লোড করবো (নতুন template ব্যবহার করে)
    await loadProfilePosts(userId, userData);
  } catch (err) {
    console.error("showProfileView error:", err);
    alert("Profile load error");
    showFeedView();
  }
}





// ===============================
// Profile specific post card template
// ===============================
function profilePostCardTemplate(post, profileUserData) {
  const name =
    post.authorName ||
    profileUserData?.name ||
    profileUserData?.username ||
    "User";

  const avatarUrl =
    post.authorPhotoURL ||
    profileUserData?.photoURL ||
    "";

  const initials = name
    .split(" ")
    .map((p) => p[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" alt="${name}" />`
    : `<span>${initials}</span>`;

  const likeCount = post.likeCount || 0;
  const commentCount = post.commentCount || 0;

  return `
    <div class="post-card" data-post-id="${post.id}" data-author-id="${
    post.authorId || ""
  }">
      <div class="post-header">
        <div class="post-avatar">
          ${avatarHtml}
        </div>
        <div class="post-meta">
          <div class="post-author">${name}</div>
          <div class="post-time">${
            typeof formatTime === "function"
              ? formatTime(post.createdAt)
              : ""
          }</div>
        </div>
      </div>

      <div class="post-content">
        ${typeof escapeHtml === "function"
          ? escapeHtml(post.text || "")
          : (post.text || "")
        }
      </div>

      ${
        post.mediaUrl
          ? `
        <div class="post-media">
          ${
            post.mediaType === "video"
              ? `<video src="${post.mediaUrl}" controls></video>`
              : `<img src="${post.mediaUrl}" alt="Post media" />`
          }
        </div>
      `
          : ""
      }

      <div class="post-actions">
        <button class="like-btn" data-post-id="${post.id}">
          <span class="action-label">Like</span>
          <span class="action-count" data-like-count="${post.id}">
            ${likeCount}
          </span>
        </button>

        <button class="comment-btn" data-post-id="${post.id}">
          <span class="action-label">Comment</span>
          <span class="action-count" data-comment-count="${post.id}">
            ${commentCount}
          </span>
        </button>

        <button class="save-btn" data-post-id="${post.id}">
          <span class="action-label">Save</span>
        </button>

        <button class="share-btn" data-post-id="${post.id}">
          <span class="action-label">Share</span>
        </button>
      </div>

      <!-- Comments section (যদি আগে থেকে setup থাকে) -->
      <div class="comments-section" data-post-id="${post.id}">
        <div class="comments-header">
          <span class="comments-header-title">Comments</span>
          <span
            class="comments-count"
            data-comment-count-label="${post.id}"
          >
            ${commentCount} comment${commentCount === 1 ? "" : "s"}
          </span>
        </div>

        <button
          class="comments-view-toggle"
          data-comments-toggle="${post.id}"
          style="display:none;"
        >
          View all comments
        </button>

        <div
          class="comments-list collapsed"
          id="comments-${post.id}"
        ></div>

        <div class="comment-input-row">
          <div class="comment-input-avatar" data-current-user-avatar></div>
          <input
            type="text"
            placeholder="Write a comment..."
            data-comment-input="${post.id}"
          />
          <button
            type="button"
            data-comment-submit="${post.id}"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  `;
}





// ===============================
// Profile posts loader (use profilePostCardTemplate)
// ===============================
async function loadProfilePosts(userId, profileUserData) {
  const listEl = document.getElementById("profilePostsList");
  if (!listEl) return;

  listEl.innerHTML =
    "<p style='font-size:14px;color:#666;'>Loading posts...</p>";

  try {
    const postsRef = collection(db, "posts");

    // authorId দিয়ে filter, কোনো orderBy নেই → index লাগবে না
    const q = query(postsRef, where("authorId", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML =
        "<p style='font-size:14px;color:#666;'>This user has not posted anything yet.</p>";
      return;
    }

    const posts = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({ id: docSnap.id, ...data });
    });

    // JS দিয়ে createdAt অনুযায়ী sort (নতুন আগে)
    posts.sort((a, b) => {
      const ta =
        a.createdAt && typeof a.createdAt.toDate === "function"
          ? a.createdAt.toDate().getTime()
          : 0;
      const tb =
        b.createdAt && typeof b.createdAt.toDate === "function"
          ? b.createdAt.toDate().getTime()
          : 0;
      return tb - ta; // desc
    });

    let html = "";
    posts.forEach((post) => {
      html += profilePostCardTemplate(post, profileUserData);
    });

    listEl.innerHTML = html;

    // প্রতিটি পোস্টের জন্য comments listener (আগের মতো)
    if (typeof startCommentsListener === "function") {
      posts.forEach((post) => {
        startCommentsListener(post.id);
      });
    }
  } catch (err) {
    console.error("loadProfilePosts error:", err);
    listEl.innerHTML =
      "<p style='font-size:14px;color:red;'>Error loading posts.</p>";
  }
}





// ===============================
// Search View
// ===============================

function showSearchView() {
  if (!currentUser) return showLoginView();

  render(searchViewTemplate());
  setupTopNavCommon();

  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const resultsDiv = document.getElementById("searchResults");

  btn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;

    resultsDiv.innerHTML = "<p>Searching...</p>";

    let results = [];

    if (text.startsWith("#")) {
      results = await searchByHashtag(text);
    } else {
      const userR = await searchUsers(text);
      const postR = await searchPosts(text);

      results = [
        { type: "Users", items: userR },
        { type: "Posts", items: postR },
      ];
    }

    renderSearchResults(results, resultsDiv);
  };
}

function renderSearchResults(results, container) {
  let html = "";

  if (Array.isArray(results) && results.length && results[0]?.type) {
    results.forEach((block) => {
      html += `<h4>${block.type}</h4>`;
      if (!block.items.length) {
        html += `<p style="color:#666;font-size:14px;">No ${block.type.toLowerCase()} found</p>`;
        return;
      }
      block.items.forEach((item) => {
        if (block.type === "Users") {
          html += `
            <div class="suggested-user-item" data-user-id="${item.id}" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <div class="suggested-user-info" style="display:flex;align-items:center;gap:6px;">
                <div class="suggested-user-avatar" style="width:30px;height:30px;border-radius:50%;background:#ccc;"></div>
                <div>
                  <div style="font-size:14px;font-weight:600;">${item.name}</div>
                  <div style="font-size:12px;color:#666;">@${item.username}</div>
                </div>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="post-card" data-id="${item.id}" style="margin-bottom:8px;cursor:pointer;">
              <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Post</div>
              <div style="font-size:13px;">${(item.text || "").slice(
                0,
                150
              )}</div>
            </div>
          `;
        }
      });
    });
  } else {
    html += "<h4>Posts</h4>";
    if (!results.length) {
      html += `<p style="color:#666;font-size:14px;">No posts found</p>`;
    }
    results.forEach((item) => {
      html += `
        <div class="post-card" data-id="${item.id}" style="margin-bottom:8px;cursor:pointer;">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Post</div>
          <div style="font-size:13px;">${(item.text || "").slice(0, 150)}</div>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  container.onclick = (e) => {
    const userItem = e.target.closest(".suggested-user-item");
    const postItem = e.target.closest(".post-card");

    if (userItem) {
      showProfileView(userItem.dataset.userId);
      return;
    }
    if (postItem) {
      alert("Single post view এখনো বানাইনি (এই ভার্সনে নেই)।");
    }
  };
}

// ===============================
// Saved Posts View
// ===============================

function showSavedView() {
  if (!currentUser) return showLoginView();

  render(savedViewTemplate());
  setupTopNavCommon();
  loadSavedPosts();
}

async function loadSavedPosts() {
  const container = document.getElementById("savedPostsList");
  if (!container || !currentUser) return;

  try {
    const savesCol = collection(db, "postSaves");
    const qSaves = query(
      savesCol,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const snap = await getDocs(qSaves);

    if (snap.empty) {
      container.innerHTML =
        "<p style='font-size:14px;color:#666;'>You haven't saved any posts yet.</p>";
      return;
    }

    const posts = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (!data.postId) continue;
      const postRef = doc(db, "posts", data.postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        posts.push({ id: postSnap.id, ...postSnap.data() });
      }
    }

    if (!posts.length) {
      container.innerHTML =
        "<p style='font-size:14px;color:#666;'>No valid posts found.</p>";
      return;
    }

    let html = "";
    posts.forEach((p) => {
      html += postCardTemplate(p.id, p);
    });
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p style='font-size:14px;color:red;'>Error loading saved posts.</p>";
  }
}

// ===============================
// Activity Log View
// ===============================

function showActivityView() {
  if (!currentUser) return showLoginView();

  render(activityViewTemplate());
  setupTopNavCommon();
  loadActivityLogs();
}

async function loadActivityLogs() {
  const container = document.getElementById("activityList");
  if (!container || !currentUser) return;

  try {
    const logsCol = collection(db, "activityLogs");
    const qLogs = query(
      logsCol,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(qLogs);

    if (snap.empty) {
      container.innerHTML =
        "<p style='font-size:14px;color:#666;'>No activity yet.</p>";
      return;
    }

    let html = "<ul style='list-style:none;padding-left:0;'>";
    snap.forEach((docSnap) => {
      const log = docSnap.data();
      const text = describeActivity(log);
      html += `
        <li style="margin-bottom:6px;font-size:14px;">
          <span>${text}</span><br/>
          <span style="font-size:12px;color:#666;">${formatDate(
            log.createdAt
          )}</span>
        </li>
      `;
    });
    html += "</ul>";
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p style='font-size:14px;color:red;'>Error loading activity.</p>";
  }
}

function describeActivity(log) {
  const t = log.type;
  const d = log.details || {};
  if (t === "post_create") return "Created a new post";
  if (t === "post_like") return "Liked a post";
  if (t === "post_unlike") return "Removed like from a post";
  if (t === "comment")
    return `Commented: "${(d.previewText || "").slice(0, 40)}"`;
  if (t === "post_save") return "Saved a post";
  if (t === "post_unsave") return "Removed a saved post";
  if (t === "follow") return "Followed a user";
  if (t === "unfollow") return "Unfollowed a user";
  if (t === "message_send")
    return `Sent a message: "${(d.previewText || "").slice(0, 40)}"`;
  if (t === "profile_update") return "Updated profile";
  if (t === "story_create") return "Posted a story";
  if (t === "post_report")
    return `Reported a post (${(d.reason || "").slice(0, 30)})`;
  return "Activity";
}

// ===============================
// Admin View
// ===============================

function showAdminView() {
  if (!currentUser) return showLoginView();
  if (!isAdmin) {
    alert("You are not an admin.");
    return showFeedView();
  }

  render(adminViewTemplate());
  setupTopNavCommon();
  loadAdminDashboard();
}

async function loadAdminDashboard() {
  const statsDiv = document.getElementById("adminStats");
  const reportsDiv = document.getElementById("adminReports");
  const usersDiv = document.getElementById("adminUsers");

  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const postsSnap = await getDocs(collection(db, "posts"));
    const reportsSnap = await getDocs(collection(db, "reports"));

    const totalUsers = usersSnap.size;
    const totalPosts = postsSnap.size;
    let pendingReports = 0;
    reportsSnap.forEach((d) => {
      if (d.data().status === "pending") pendingReports++;
    });

    statsDiv.innerHTML = `
      <p>Total users: <b>${totalUsers}</b></p>
      <p>Total posts: <b>${totalPosts}</b></p>
      <p>Pending reports: <b>${pendingReports}</b></p>
    `;

    const qReports = query(
      collection(db, "reports"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const repSnap = await getDocs(qReports);

    if (repSnap.empty) {
      reportsDiv.innerHTML =
        "<p style='font-size:14px;color:#666;'>No pending reports.</p>";
    } else {
      let html = "";
      repSnap.forEach((docSnap) => {
        const r = docSnap.data();
        html += `
          <div class="post-card" data-report-id="${docSnap.id}" data-post-id="${
          r.postId
        }" data-author-id="${r.postAuthorId || ""}">
            <div style="font-size:13px;margin-bottom:4px;">
              <b>Post ID:</b> ${r.postId || "-"}<br/>
              <b>Reporter:</b> ${r.reporterId || "-"}<br/>
              <b>Reason:</b> ${r.reason || "-"}
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">
              ${
                r.postPreview
                  ? escapeHtml(r.postPreview.slice(0, 120))
                  : ""
              }
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
              <button class="admin-delete-post-btn profile-edit-btn">Delete Post</button>
              <button class="admin-mark-safe-btn profile-edit-btn">Mark Safe</button>
              <button class="admin-ban-user-btn profile-edit-btn">Ban User</button>
            </div>
          </div>
        `;
      });
      reportsDiv.innerHTML = html;

      reportsDiv.onclick = async (e) => {
        const card = e.target.closest(".post-card");
        if (!card) return;
        const reportId = card.dataset.reportId;
        const postId = card.dataset.postId;
        const authorId = card.dataset.authorId;

        if (e.target.classList.contains("admin-delete-post-btn")) {
          if (!confirm("Delete this post?")) return;
          await deleteDoc(doc(db, "posts", postId));
          await updateDoc(doc(db, "reports", reportId), {
            status: "resolved",
            adminAction: "delete_post",
          });
          card.remove();
        } else if (e.target.classList.contains("admin-mark-safe-btn")) {
          await updateDoc(doc(db, "reports", reportId), {
            status: "resolved",
            adminAction: "safe",
          });
          card.remove();
        } else if (e.target.classList.contains("admin-ban-user-btn")) {
          if (!authorId) return alert("No authorId on report.");
          await updateDoc(doc(db, "users", authorId), {
            isBanned: true,
          });
          await updateDoc(doc(db, "reports", reportId), {
            status: "resolved",
            adminAction: "ban_user",
          });
          card.remove();
        }
      };
    }

    const usersLimitQuery = query(collection(db, "users"), limit(50));
    const uSnap = await getDocs(usersLimitQuery);
    let htmlUsers = "";
    uSnap.forEach((docSnap) => {
      const u = docSnap.data();
      htmlUsers += `
        <div class="suggested-user-item" data-user-id="${docSnap.id}" style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
          <div class="suggested-user-info" style="display:flex;align-items:center;gap:6px;">
            <div class="suggested-user-avatar" style="width:30px;height:30px;border-radius:50%;background:#ccc;"></div>
            <div>
              <div style="font-size:14px;font-weight:600;">${u.name || "User"}</div>
              <div style="font-size:12px;color:#666;">${u.email || ""}</div>
              <div style="font-size:12px;color:${
                u.isBanned ? "red" : "#666"
              };">
                Status: ${u.isBanned ? "BANNED" : "Active"}
              </div>
            </div>
          </div>
          <button class="admin-toggle-ban-btn profile-edit-btn">
            ${u.isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      `;
    });

    usersDiv.innerHTML =
      htmlUsers ||
      "<p style='font-size:14px;color:#666;'>No users found.</p>";

    usersDiv.onclick = async (e) => {
      const row = e.target.closest(".suggested-user-item");
      if (!row) return;
      if (!e.target.classList.contains("admin-toggle-ban-btn")) return;

      const userId = row.dataset.userId;
      if (!userId) return;

      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const newStatus = !data.isBanned;

      await updateDoc(userRef, { isBanned: newStatus });

      row.querySelector(
        ".admin-toggle-ban-btn"
      ).textContent = newStatus ? "Unban" : "Ban";
      row.querySelector(
        "div[style*='Status']"
      ).innerHTML = `<div style="font-size:12px;color:${
        newStatus ? "red" : "#666"
      };">Status: ${newStatus ? "BANNED" : "Active"}</div>`;
    };
  } catch (err) {
    console.error("Admin dashboard error:", err);
    statsDiv.innerHTML =
      "<p style='color:red;font-size:14px;'>Error loading admin data.</p>";
  }
}

// ===============================
// Post Create + Feed Load
// ===============================

function setupCreatePostForm() {
  const createPostForm = document.getElementById("createPostForm");
  if (!createPostForm || !currentUser) return;

  createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textEl = document.getElementById("postText");
    const mediaInput = document.getElementById("postMedia");
    const text = textEl.value.trim();
    const file = mediaInput.files[0];

    if (!text && !file) {
      alert("কমপক্ষে কিছু লিখুন বা মিডিয়া দিন।");
      return;
    }

    try {
      createPostForm.querySelector("button[type='submit']").disabled = true;

      let mediaURL = "";
      let mediaType = "";

      if (file) {
        const path = `postsMedia/${currentUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        mediaURL = await getDownloadURL(fileRef);
        mediaType = file.type || "";
      }
      const postsCol = collection(db, "posts");

      // ⭐ এখানে currentUser.photoURL ব্যবহার করছি (signup + profile update থেকে already সেট করা)
      const newPost = {
        text: text || "",
        mediaURL,
        mediaType,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "User",
        authorPhotoURL: currentUser.photoURL || "",  // ⭐ ফিডে avatar এর জন্য (মেইন ফিক্স)
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        reportsCount: 0,
      };
      
      const docRef = await addDoc(postsCol, newPost);

      await logActivity("post_create", {
        postId: docRef.id,
        previewText: text.slice(0, 80),
      });

      const postsList = document.getElementById("postsList");
      const skeleton = document.getElementById("postsSkeleton");
      if (skeleton) skeleton.remove();

      // UI তে সাথে সাথে দেখানোর জন্য লোকাল createdAt ব্যবহার
      const localData = {
        ...newPost,
        createdAt: { toDate: () => new Date() },
      };
      const html = postCardTemplate(docRef.id, localData);
      postsList.insertAdjacentHTML("afterbegin", html);

      // নতুন পোস্টের কমেন্টগুলোর জন্য realtime listener
      attachCommentsListenerToPost(docRef.id);

      textEl.value = "";
      mediaInput.value = "";

    } catch (err) {
      console.error(err);
      alert("Post করতে সমস্যা হচ্ছে: " + err.message);
    } finally {
      createPostForm.querySelector("button[type='submit']").disabled = false;
    }
  });
}



async function loadInitialPosts() {
  const postsList = document.getElementById("postsList");
  if (!postsList) return;

  isLoadingPosts = true;

  try {
    const postsCol = collection(db, "posts");
    const qPosts = query(
      postsCol,
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );
    const snap = await getDocs(qPosts);

    const skeleton = document.getElementById("postsSkeleton");
    if (skeleton) skeleton.remove();

    if (snap.empty) {
      postsList.innerHTML =
        "<p style='margin-top:10px;font-size:14px;color:#666;'>No posts yet. Be the first to post!</p>";
      lastPostDoc = null;
      return;
    }

    let html = "";
    snap.forEach((docSnap) => {
      html += postCardTemplate(docSnap.id, docSnap.data());
    });

    postsList.innerHTML = html;

    // সব লোড হওয়া পোস্টের জন্য comments listener লাগাচ্ছি
    snap.forEach((docSnap) => {
      attachCommentsListenerToPost(docSnap.id);
    });

    lastPostDoc = snap.docs[snap.docs.length - 1];
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingPosts = false;
  }
}


async function loadMorePosts() {
  if (!lastPostDoc || isLoadingPosts) return;

  const postsList = document.getElementById("postsList");
  if (!postsList) return;

  isLoadingPosts = true;

  try {
    const postsCol = collection(db, "posts");
    const qPosts = query(
      postsCol,
      orderBy("createdAt", "desc"),
      startAfter(lastPostDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(qPosts);

    if (snap.empty) {
      lastPostDoc = null;
      return;
    }

    let html = "";
    snap.forEach((docSnap) => {
      html += postCardTemplate(docSnap.id, docSnap.data());
    });

    postsList.insertAdjacentHTML("beforeend", html);

    // নিচে লোড হওয়া নতুন পোস্টগুলোর জন্যও comments listener
    snap.forEach((docSnap) => {
      attachCommentsListenerToPost(docSnap.id);
    });

    lastPostDoc = snap.docs[snap.docs.length - 1];
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingPosts = false;
  }
}


// ===============================
// Follow System
// ===============================

async function setupFollowButton(targetUserIdOrBtn, maybeBtn) {
  if (!currentUser) return;

  let targetUserId = null;
  let btn = null;

  // দুইভাবে কল সাপোর্ট করি:
  // 1) setupFollowButton(userId, button)
  // 2) setupFollowButton(button) → button.dataset.userId থেকে নেবে
  if (typeof targetUserIdOrBtn === "string") {
    targetUserId = targetUserIdOrBtn;
    btn = maybeBtn;
  } else if (targetUserIdOrBtn && targetUserIdOrBtn.dataset) {
    btn = targetUserIdOrBtn;
    targetUserId = targetUserIdOrBtn.dataset.userId;
  }

  if (!targetUserId || !btn) {
    console.warn("setupFollowButton: missing targetUserId or button");
    return;
  }

  // নিজের প্রোফাইলে follow দেখাব না
  if (targetUserId === currentUser.uid) {
    btn.style.display = "none";
    return;
  }

  // Profile পেইজে থাকলে এই দুইটা থাকবে, না থাকলে null হবে
  const followersCountEl = document.getElementById("profileFollowersCount");
  const followingCountEl = document.getElementById("profileFollowingCount");

  const getCount = (el) =>
    el ? parseInt(el.textContent || "0", 10) || 0 : 0;
  const setCount = (el, val) => {
    if (el) el.textContent = String(val);
  };

  try {
    const followDocId = `${currentUser.uid}_${targetUserId}`;
    const followRef = doc(db, "follows", followDocId);
    const snap = await getDoc(followRef);

    // প্রথমে বাটনের স্টেট সেট করি
    btn.textContent = snap.exists() ? "Following" : "Follow";

    btn.onclick = async () => {
      if (!currentUser) return;
      btn.disabled = true;

      try {
        const snapNow = await getDoc(followRef);
        const targetUserRef = doc(db, "users", targetUserId);
        const currentUserRef = doc(db, "users", currentUser.uid);

        if (!snapNow.exists()) {
          // 👉 FOLLOW
          await setDoc(followRef, {
            followerId: currentUser.uid,
            followingId: targetUserId,
            createdAt: serverTimestamp(),
          });

          await updateDoc(targetUserRef, {
            followersCount: increment(1),
          });
          await updateDoc(currentUserRef, {
            followingCount: increment(1),
          });

          btn.textContent = "Following";

          // UI কাউন্ট আপডেট (শুধু প্রোফাইল পেইজে থাকলে আপডেট হবে)
          setCount(followersCountEl, getCount(followersCountEl) + 1);

          // Notification থাকলে পাঠাই
          if (typeof createNotification === "function") {
            await createNotification({
              userId: targetUserId,
              fromUserId: currentUser.uid,
              type: "follow",
            });
          }

          await logActivity("follow", { targetUserId });
        } else {
          // 👉 UNFOLLOW
          await deleteDoc(followRef);

          await updateDoc(targetUserRef, {
            followersCount: increment(-1),
          });
          await updateDoc(currentUserRef, {
            followingCount: increment(-1),
          });

          btn.textContent = "Follow";

          setCount(
            followersCountEl,
            Math.max(0, getCount(followersCountEl) - 1)
          );

          await logActivity("unfollow", { targetUserId });
        }
      } catch (err) {
        console.error("Follow/unfollow error:", err);
        alert("Follow করতে সমস্যা হচ্ছে, আবার চেষ্টা করুন");
      } finally {
        btn.disabled = false;
      }
    };
  } catch (err) {
    console.error(err);
  }
}




// ===============================
// Activity Logger
// ===============================

async function logActivity(type, details = {}) {
  if (!currentUser) return;
  try {
    const colRef = collection(db, "activityLogs");
    await addDoc(colRef, {
      userId: currentUser.uid,
      type,
      details,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Activity log error:", err);
  }
}

// ===============================
// Like / Comment / Save / Share / Report
// ===============================

async function handleLike(postId, btn) {
  if (!currentUser) return;

  try {
    const likeDocId = `${postId}_${currentUser.uid}`;
    const likeRef = doc(db, "postLikes", likeDocId);
    const snap = await getDoc(likeRef);
    const postRef = doc(db, "posts", postId);

    let currentCount = extractCountFromButton(btn.textContent);

    const postSnap = await getDoc(postRef);
    const postData = postSnap.data() || {};

    if (!snap.exists()) {
      await setDoc(likeRef, {
        postId,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, {
        likesCount: increment(1),
      });
      currentCount += 1;
      btn.textContent = `Like (${currentCount})`;

      await createNotification({
        userId: postData.authorId,
        fromUserId: currentUser.uid,
        type: "like",
        postId,
      });

      await logActivity("post_like", { postId });
    } else {
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1),
      });
      currentCount = Math.max(0, currentCount - 1);
      btn.textContent = `Like (${currentCount})`;

      await logActivity("post_unlike", { postId });
    }
  } catch (err) {
    console.error(err);
  }
}



async function handleComment(postId, btn) {
  if (!currentUser) return;

  // এই পোস্ট কার্ডটা বের করি
  const card = document.querySelector(`.post-card[data-id="${postId}"]`);
  if (!card) return;

  // কমেন্ট ইনলাইন ফর্ম আছে কিনা দেখি
  let form = card.querySelector(".inline-comment-form");
  if (!form) {
    const listEl = card.querySelector(".post-comments-list");

    form = document.createElement("div");
    form.className = "inline-comment-form";

    const name = currentUser.displayName || "You";
    const photoURL = currentUser.photoURL || "";
    const initials = name
      .split(" ")
      .map((p) => p[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    form.innerHTML = `
      <div class="comment-input-avatar">
        ${
          photoURL
            ? `<img src="${photoURL}" alt="${name}" />`
            : `<span>${initials}</span>`
        }
      </div>
      <input
        type="text"
        class="inline-comment-input"
        placeholder="Write a comment..."
      />
      <button type="button" class="inline-comment-send">Post</button>
    `;

    if (listEl) {
      // কমেন্টগুলোর নিচে input বসাই
      listEl.insertAdjacentElement("afterend", form);
    } else {
      card.appendChild(form);
    }
  }

  const input = form.querySelector(".inline-comment-input");
  const sendBtn = form.querySelector(".inline-comment-send");

  async function submitComment() {
    const text = input.value.trim();
    if (!text) return;

    try {
      const commentsCol = collection(db, "posts", postId, "comments");
      await addDoc(commentsCol, {
        text,
        userId: currentUser.uid,
        userName: currentUser.displayName || "User",
        userPhotoURL: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
      });

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentsCount: increment(1),
      });

      const postSnap = await getDoc(postRef);
      const postData = postSnap.data() || {};

      await createNotification({
        userId: postData.authorId,
        fromUserId: currentUser.uid,
        type: "comment",
        postId,
        previewText: text.slice(0, 60),
      });

      await logActivity("comment", {
        postId,
        previewText: text.slice(0, 60),
      });

      // বোতামে থাকা Comment (x) count আপডেট করি
      let currentCount = extractCountFromButton(btn.textContent);
      currentCount += 1;
      btn.textContent = `Comment (${currentCount})`;

      input.value = "";
    } catch (err) {
      console.error(err);
    }
  }

  // একবারই listener bind করার জন্য flag
  if (!form.dataset.listenersBound) {
    form.dataset.listenersBound = "1";

    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitComment();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      }
    });
  }

  // input এ focus
  input.focus();
}



// ===============================
// Comments Realtime Listener per Post (Updated UI)
// ===============================
function attachCommentsListenerToPost(postId) {
  const card = document.querySelector(`.post-card[data-id="${postId}"]`);
  if (!card) return;

  const listEl = card.querySelector(".post-comments-list");
  if (!listEl) return;

  const commentsCol = collection(db, "posts", postId, "comments");
  const qComments = query(
    commentsCol,
    orderBy("createdAt", "desc"),
    limit(50)
  );

  onSnapshot(qComments, (snap) => {
    const comments = [];
    snap.forEach((docSnap) => {
      comments.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (!comments.length) {
      listEl.innerHTML =
        '<div class="comments-empty">No comments yet.</div>';
      card.classList.remove("has-comments");
      return;
    }

    card.classList.add("has-comments");

    let html = "";

    comments.forEach((c, index) => {
      const name = escapeHtml(c.userName || "User");
      const text = escapeHtml(c.text || "");
      const time = c.createdAt ? formatDate(c.createdAt) : "";
      const avatarUrl = c.userPhotoURL || "";
      const initials = name
        .split(" ")
        .map((p) => p[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase();

      // default অবস্থায় ৩টার পরেরগুলো hide হবে (CSS দিয়ে)
      const extraClass = index >= 3 ? " comment-hidden" : "";

      html += `
        <div class="comment-item${extraClass}" data-comment-id="${c.id}">
          <div class="comment-avatar">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="${name}" />`
                : `<span>${initials}</span>`
            }
          </div>
          <div class="comment-body">
            <div class="comment-header-row">
              <span class="comment-author" data-profile-id="${c.userId}">
                ${name}
              </span>
              ${
                time
                  ? `<span class="comment-time">${time}</span>`
                  : ""
              }
            </div>
            <div class="comment-text">${text}</div>
          </div>
        </div>
      `;
    });

    // যদি ৩টার বেশি কমেন্ট থাকে, View all বাটন যোগ করি
    if (comments.length > 3) {
      html += `
        <button
          class="comments-view-toggle"
          data-view-all-comments="${postId}"
        >
          View all ${comments.length} comments
        </button>
      `;
      listEl.classList.remove("show-all");
    } else {
      listEl.classList.add("show-all");
    }

    listEl.innerHTML = html;
  });
}






async function handleSave(postId, btn) {
  if (!currentUser) return;

  try {
    const saveDocId = `${postId}_${currentUser.uid}`;
    const saveRef = doc(db, "postSaves", saveDocId);
    const snap = await getDoc(saveRef);
    const postRef = doc(db, "posts", postId);

    if (!snap.exists()) {
      await setDoc(saveRef, {
        postId,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, {
        savesCount: increment(1),
      });
      btn.textContent = "Saved";

      await logActivity("post_save", { postId });
    } else {
      await deleteDoc(saveRef);
      await updateDoc(postRef, {
        savesCount: increment(-1),
      });
      btn.textContent = "Save";

      await logActivity("post_unsave", { postId });
    }
  } catch (err) {
    console.error(err);
  }
}

function handleShare(postId) {
  const url = window.location.href.split("#")[0] + `?post=${postId}`;
  if (navigator.share) {
    navigator
      .share({
        title: "Check this post",
        url,
      })
      .catch(() => {});
  } else {
    navigator.clipboard
      ?.writeText(url)
      .then(() => alert("Post link copied!"))
      .catch(() =>
        alert("Couldn't copy link, but here is it:\n" + url)
      );
  }
}

async function handleReport(postId) {
  if (!currentUser) return;

  const reason = prompt(
    "Report reason (e.g. spam, abuse, misleading):"
  );
  if (!reason || !reason.trim()) return;

  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      alert("Post not found.");
      return;
    }
    const postData = postSnap.data();

    const existingQuery = query(
      collection(db, "reports"),
      where("postId", "==", postId),
      where("reporterId", "==", currentUser.uid),
      limit(1)
    );
    const exSnap = await getDocs(existingQuery);
    if (!exSnap.empty) {
      alert("You already reported this post.");
      return;
    }

    await addDoc(collection(db, "reports"), {
      postId,
      postAuthorId: postData.authorId || null,
      reporterId: currentUser.uid,
      reason: reason.trim(),
      status: "pending",
      createdAt: serverTimestamp(),
      postPreview: (postData.text || "").slice(0, 200),
    });

    await logActivity("post_report", {
      postId,
      reason: reason.trim().slice(0, 80),
    });

    alert("Thanks, your report has been submitted.");
  } catch (err) {
    console.error("Report error:", err);
    alert("Report করতে সমস্যা হচ্ছে।");
  }
}

function extractCountFromButton(text) {
  const match = text.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}




// =============================
// Auth State Listener
// =============================
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (notificationsUnsub) {
    notificationsUnsub();
    notificationsUnsub = null;
  }
  latestNotifications = [];
  updateNavNotificationBadge(0);
  updateNavMessagesHighlight(0);
  highlightUnreadChatsFromNotifications([]);

  if (user) {
    await checkAdminAndBanStatus();
    startPresenceTracking();

    notificationsUnsub = startNotificationsListener(currentUser.uid, {
      onUnreadChange: (count) => {
        updateNavNotificationBadge(count);
      },
      onListChange: (list) => {
        latestNotifications = list;

        const currentIds = list.map((n) => n.id);
        let unreadMessages = 0;

        list.forEach((n) => {
          // popup (যদি আগের popup ফিচার রাখো)
          if (!lastNotificationIds.includes(n.id) && !n.isRead) {
            let title = "New activity";
            let body = "";

            if (n.type === "like") title = "Someone liked your post";
            else if (n.type === "comment")
              title = "New comment on your post";
            else if (n.type === "follow")
              title = "You have a new follower";
            else if (n.type === "message") title = "New message";

            if (n.previewText) {
              body = n.previewText;
            }

            if (typeof showNativeNotification === "function") {
              showNativeNotification(title, body);
            }
          }

          // message unread গুনছি
          if (n.type === "message" && !n.isRead) {
            unreadMessages++;
          }
        });

        lastNotificationIds = currentIds;

        // Navbar icon highlight + chat list highlight
        updateNavMessagesHighlight(unreadMessages);
        highlightUnreadChatsFromNotifications(list);
      },
    });

    showFeedView();
    if (typeof requestBrowserNotificationPermission === "function") {
      requestBrowserNotificationPermission();
    }
  } else {
    if (presenceIntervalId) {
      clearInterval(presenceIntervalId);
      presenceIntervalId = null;
    }
    showLoginView();
  }
});


// ===============================
// Global click handler for comments UI
// ===============================
document.addEventListener("click", (e) => {
  // View all / hide comments
  const viewAllBtn = e.target.closest("[data-view-all-comments]");
  if (viewAllBtn) {
    const postId = viewAllBtn.dataset.viewAllComments;
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (!card) return;
    const listEl = card.querySelector(".post-comments-list");
    if (!listEl) return;

    const isAll = listEl.classList.contains("show-all");
    if (isAll) {
      listEl.classList.remove("show-all");
      viewAllBtn.textContent = `View all ${card.querySelectorAll(
        ".comment-item"
      ).length} comments`;
    } else {
      listEl.classList.add("show-all");
      viewAllBtn.textContent = "Hide comments";
    }
    return;
  }

  // কমেন্ট author-এর নাম এ ক্লিক করলে profile view
  const authorEl = e.target.closest(".comment-author[data-profile-id]");
  if (authorEl) {
    const uid = authorEl.dataset.profileId;
    if (uid) {
      showProfileView(uid);
    }
    return;
  }
});
