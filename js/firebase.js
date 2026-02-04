// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "PASTE_YOUR_KEY",
  authDomain: "PROJECT.firebaseapp.com",
  projectId: "PROJECT",
  storageBucket: "PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);

/* EXPORTS */
export const db = getFirestore(app);
export const storage = getStorage(app);



// =======================
// 📁 COMMON FILE UPLOAD
// =======================
export async function uploadFile(file, folder) {
  const fileRef = ref(
    storage,
    `${folder}/${Date.now()}_${file.name}`
  );
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}



// =======================
// 👥 MEMBERS
// =======================

// ADD MEMBER (PUBLIC FORM)
export async function addMember(data) {
  return await addDoc(collection(db, "members"), {
    ...data,
    status: "pending",
    createdAt: Date.now()
  });
}

// GET ALL MEMBERS (ADMIN)
export async function getMembers(status = null) {
  let q = collection(db, "members");

  if (status) {
    q = query(q, where("status", "==", status));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// APPROVE MEMBER
export async function approveMember(id) {
  const refDoc = doc(db, "members", id);
  return await updateDoc(refDoc, {
    status: "approved",
    approvedAt: Date.now()
  });
}

// DELETE MEMBER
export async function deleteMember(id) {
  return await deleteDoc(doc(db, "members", id));
}



// =======================
// 📅 EVENTS
// =======================

// ADD EVENT
export async function addEvent(data) {
  return await addDoc(collection(db, "events"), {
    ...data,
    createdAt: Date.now()
  });
}

// GET EVENTS (PUBLIC + ADMIN)
export async function getEvents() {
  const q = query(
    collection(db, "events"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// UPDATE EVENT
export async function updateEvent(id, data) {
  return await updateDoc(doc(db, "events", id), data);
}

// DELETE EVENT
export async function deleteEvent(id) {
  return await deleteDoc(doc(db, "events", id));
}



// =======================
// 🖼️ GALLERY
// =======================

// ADD IMAGE
export async function addGalleryImage(url) {
  return await addDoc(collection(db, "gallery"), {
    url,
    createdAt: Date.now()
  });
}

// GET GALLERY
export async function getGalleryImages() {
  const q = query(
    collection(db, "gallery"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// DELETE IMAGE (Firestore only)
export async function deleteGalleryImage(id) {
  return await deleteDoc(doc(db, "gallery", id));
}
