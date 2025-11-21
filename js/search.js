// js/search.js
// User search + Post search + Hashtag search (simple Firestore scan)

import {
    collection,
    query,
    getDocs,
    limit,
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  
  let db = null;
  
  // ===============================
  // Init
  // ===============================
  export function initSearchSystem(firebaseDb) {
    db = firebaseDb;
  }
  
  // ===============================
  // 🔍 USER SEARCH
  // ===============================
  /*
    searchUsers("john")
  
    name / username এ case-insensitive match করবে
  */
  export async function searchUsers(keyword) {
    if (!db) return [];
  
    const kw = keyword.toLowerCase();
  
    const usersCol = collection(db, "users");
    // ছোট প্রোজেক্টের জন্য simple limit
    const qUsers = query(usersCol, limit(50));
    const snap = await getDocs(qUsers);
  
    const results = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        data.name?.toLowerCase().includes(kw) ||
        data.username?.toLowerCase().includes(kw)
      ) {
        results.push({ id: docSnap.id, ...data });
      }
    });
  
    return results;
  }
  
  // ===============================
  // 🔍 POST SEARCH
  // ===============================
  /*
    searchPosts("love")
  
    posts collection থেকে text এর ভেতর keyword আছে কিনা দেখবে
  */
  export async function searchPosts(keyword) {
    if (!db || !keyword) return [];
  
    const kw = keyword.toLowerCase();
  
    const postsCol = collection(db, "posts");
    const qPosts = query(postsCol, limit(80));
    const snap = await getDocs(qPosts);
  
    const results = [];
    snap.forEach((docSnap) => {
      const p = docSnap.data();
      if (p.text?.toLowerCase().includes(kw)) {
        results.push({
          id: docSnap.id,
          ...p,
        });
      }
    });
  
    return results;
  }
  
  // ===============================
  // #️⃣ HASHTAG SEARCH
  // ===============================
  /*
    searchByHashtag("#travel")
    অথবা
    searchByHashtag("travel")
  
    text থেকে hashtag শব্দ হিসেবে match করবে
  */
  export async function searchByHashtag(tag) {
    if (!db) return [];
    if (!tag) return [];
  
    if (!tag.startsWith("#")) tag = "#" + tag;
    const cleanTag = tag.toLowerCase();
  
    const postsCol = collection(db, "posts");
    const qPosts = query(postsCol, limit(80));
    const snap = await getDocs(qPosts);
  
    const results = [];
    snap.forEach((docSnap) => {
      const p = docSnap.data();
      if (!p.text) return;
  
      // টেক্সটকে শব্দে ভেঙে দেখি
      const words = p.text.toLowerCase().split(/[\s,.!?]+/);
      if (words.includes(cleanTag)) {
        results.push({
          id: docSnap.id,
          ...p,
        });
      }
    });
  
    return results;
  }
  
