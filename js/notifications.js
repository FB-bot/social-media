// js/notifications.js
// Firestore based notification system + optional FCM

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    arrayUnion,
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  
  import {
    getMessaging,
    getToken,
    onMessage,
    isSupported,
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";
  
  let db = null;
  let app = null;
  let messaging = null;
  
  // ===============================
  // Init with existing app + db
  // ===============================
  
  export async function initNotifications(firebaseApp, firebaseDb) {
    app = firebaseApp;
    db = firebaseDb;
  
    // Messaging optional (https domain + proper setup লাগবে)
    try {
      if (await isSupported()) {
        messaging = getMessaging(app);
  
        // Foreground message listener
        onMessage(messaging, (payload) => {
          console.log("FCM foreground message:", payload);
          if (payload?.notification?.title) {
            alert(
              `🔔 ${payload.notification.title}\n\n${
                payload.notification.body || ""
              }`
            );
          }
        });
      }
    } catch (err) {
      console.warn("Messaging not supported in this environment:", err);
    }
  }
  
  // ===============================
  // Create a notification document
  // ===============================
  /*
    createNotification({
      userId:       যাকে নোটিফিকেশন যাবে
      fromUserId:   কে action করলো
      type:         "like" | "comment" | "follow" | "message"
      postId?:      (optional)
      chatId?:      (optional)
      previewText?: (optional small text)
    })
  */
  
  export async function createNotification({
    userId,
    fromUserId,
    type,
    postId = null,
    chatId = null,
    previewText = "",
  }) {
    if (!db) return;
    if (!userId || !fromUserId) return;
    if (userId === fromUserId) return; // নিজের জন্য notification না
  
    try {
      const colRef = collection(db, "notifications");
      await addDoc(colRef, {
        userId,
        fromUserId,
        type,
        postId,
        chatId,
        previewText,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Notification create error:", err);
    }
  }
  
  // ===============================
  // Listen notifications (realtime)
  // ===============================
  /*
    const unsub = startNotificationsListener(currentUser.uid, {
      onUnreadChange: (count) => {...},
      onListChange: (list) => {...}
    });
  */
  
  export function startNotificationsListener(userId, callbacks = {}) {
    if (!db || !userId) return () => {};
  
    const colRef = collection(db, "notifications");
    const q = query(
      colRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(30)
    );
  
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = [];
        let unread = 0;
  
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
          });
          if (!data.isRead) unread++;
        });
  
        if (callbacks.onUnreadChange) {
          callbacks.onUnreadChange(unread);
        }
        if (callbacks.onListChange) {
          callbacks.onListChange(list);
        }
      },
      (err) => {
        console.error("Notification listener error:", err);
      }
    );
  
    return unsubscribe;
  }
  
  // ===============================
  // Mark all notifications as read
  // ===============================
  
  export async function markAllNotificationsRead(userId) {
    if (!db || !userId) return;
  
    try {
      const colRef = collection(db, "notifications");
      const q = query(
        colRef,
        where("userId", "==", userId),
        where("isRead", "==", false),
        limit(50)
      );
      const snap = await getDocs(q);
  
      const promises = [];
      snap.forEach((docSnap) => {
        const ref = doc(db, "notifications", docSnap.id);
        promises.push(updateDoc(ref, { isRead: true }));
      });
  
      if (promises.length) {
        await Promise.all(promises);
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  }
  
  // ===============================
  // FCM: request permission + save token
  // ===============================
  /*
    Optional future:
    await requestFcmTokenForUser(currentUser.uid);
  
    তারপর backend / cloud function থেকে
    notifications পাঠানো যাবে।
  */
  
  export async function requestFcmTokenForUser(userId) {
    if (!messaging || !db || !userId) return;
  
    if (!("Notification" in window)) return;
  
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission not granted");
        return;
      }
  
      // 👉 এখানে তোমার নিজস্ব VAPID public key বসাবে
      const vapidKey = "YOUR_VAPID_PUBLIC_KEY";
  
      const token = await getToken(messaging, { vapidKey });
      if (!token) return;
  
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
      });
  
      console.log("FCM token saved:", token);
    } catch (err) {
      console.error("FCM token error:", err);
    }
  }
  
