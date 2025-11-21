// js/notifications.js
// শুধু Firestore ভিত্তিক in-app notifications
// কোনো extra index বা FCM (vapid key) লাগবে না

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  limit,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let dbRef = null;

// app.js থেকে initNotifications(app, db) কল হবে
export function initNotifications(app, db) {
  dbRef = db;
}

// নতুন Notification তৈরি করা (Like / Comment / Follow / Message)
export async function createNotification(payload) {
  if (!dbRef) return;

  try {
    const colRef = collection(dbRef, "notifications");
    await addDoc(colRef, {
      userId: payload.userId,        // যার জন্য নোটিফিকেশন
      fromUserId: payload.fromUserId || null,
      type: payload.type || "activity", // like/comment/follow/message
      postId: payload.postId || null,
      chatId: payload.chatId || null,
      previewText: payload.previewText || "",
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("createNotification error:", err);
  }
}

// Notification listener (index ছাড়া কাজ করবে)
export function startNotificationsListener(
  userId,
  { onUnreadChange, onListChange }
) {
  if (!dbRef || !userId) return () => {};

  const colRef = collection(dbRef, "notifications");

  // 👉 শুধু userId = currentUser.uid দিয়ে filter করেছি
  // কোনো orderBy ব্যবহার করিনি, তাই Firestore composite index লাগবে না
  const q = query(colRef, where("userId", "==", userId), limit(50));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const list = [];
      let unreadCount = 0;

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
        if (!data.isRead) unreadCount++;
      });

      if (onUnreadChange) onUnreadChange(unreadCount);
      if (onListChange) onListChange(list);
    },
    (err) => {
      console.error("Notification listener error:", err);
    }
  );

  return unsub;
}

// সব unread notification-কে read করে দেয়
export async function markAllNotificationsRead(userId) {
  if (!dbRef || !userId) return;

  try {
    const colRef = collection(dbRef, "notifications");

    // এখানেও শুধু userId দিয়ে filter করছি
    const q = query(colRef, where("userId", "==", userId), limit(100));
    const snap = await getDocs(q);

    const tasks = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isRead) {
        const ref = doc(dbRef, "notifications", docSnap.id);
        tasks.push(updateDoc(ref, { isRead: true }));
      }
    });

    if (tasks.length) {
      await Promise.all(tasks);
    }
  } catch (err) {
    console.error("markAllNotificationsRead error:", err);
  }
}

// FCM / Push Notification এখন ব্যবহার করছি না
// শুধু dummy function রেখে দিলাম যাতে app.js এ error না দেয়
export async function requestFcmTokenForUser(userId) {
  console.log("FCM push notification এখন কনফিগ করা নেই (ঠিক আছে)।");
}
