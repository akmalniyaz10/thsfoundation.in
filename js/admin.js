/*************************************************
  ADMIN LOGIN (STATIC)
*************************************************/
const ADMIN_ID = "THS-992267";
const ADMIN_PASS = "Ths992267";

window.adminLogin = async () => {
  if (!adminid.value || !adminpass.value) {
    adminMsg.innerText = "Invalid login";
    return;
  }

  if (adminid.value !== ADMIN_ID || adminpass.value !== ADMIN_PASS) {
    adminMsg.innerText = "Wrong ID or Password";
    return;
  }

  adminArea.style.display = "block";
  adminMsg.innerText = "Login successful";

  await loadMembersTable();
  await loadAdminEvents();
  await loadDocs();
};

/*************************************************
  FIREBASE IMPORTS
*************************************************/
import {
  getMembers,
  approveMember,
  addEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  uploadFile
} from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

/*************************************************
  MEMBERS (FIRESTORE)
*************************************************/
async function loadMembersTable() {
  const members = await getMembers();

  if (members.length === 0) {
    membersTable.innerHTML = "<p class='small-muted'>No members found</p>";
    return;
  }

  let html = `
  <table width="100%">
  <tr>
    <th>Name</th>
    <th>Email</th>
    <th>Phone</th>
    <th>Status</th>
    <th>Action</th>
  </tr>`;

  members.forEach(m => {
    html += `
    <tr>
      <td>${m.firstName || ""} ${m.lastName || ""}</td>
      <td>${m.email || ""}</td>
      <td>${m.mobile || ""}</td>
      <td>${m.status}</td>
      <td>
        ${
          m.status === "pending"
            ? `<button onclick="approve('${m.id}')">Approve</button>`
            : "Approved"
        }
      </td>
    </tr>`;
  });

  html += "</table>";
  membersTable.innerHTML = html;
}

window.approve = async (id) => {
  if (!confirm("Approve this member?")) return;
  await approveMember(id);
  loadMembersTable();
};

/*************************************************
  EVENTS (FIRESTORE)
*************************************************/
let editEventId = null;

window.addEventAdmin = async () => {
  if (!evTitle.value) return alert("Title required");

  if (editEventId) {
    await updateEvent(editEventId, {
      title: evTitle.value,
      date: evDate.value,
      location: evLoc.value,
      desc: evDesc.value
    });
    editEventId = null;
  } else {
    await addEvent({
      title: evTitle.value,
      date: evDate.value,
      location: evLoc.value,
      desc: evDesc.value
    });
  }

  clearEventForm();
  loadAdminEvents();
};

async function loadAdminEvents() {
  const events = await getEvents();

  if (events.length === 0) {
    adminEventsList.innerHTML = "<p class='small-muted'>No events</p>";
    return;
  }

  let html = "";
  events.forEach(e => {
    html += `
    <div class="card" style="margin-bottom:8px">
      <strong>${e.title}</strong><br>
      <small>${e.date} | ${e.location}</small>
      <p>${e.desc}</p>
      <button onclick="editEvent('${e.id}')">Edit</button>
      <button onclick="removeEvent('${e.id}')">Delete</button>
    </div>`;
  });

  adminEventsList.innerHTML = html;
}

window.editEvent = async (id) => {
  const events = await getEvents();
  const e = events.find(x => x.id === id);

  evTitle.value = e.title;
  evDate.value = e.date;
  evLoc.value = e.location;
  evDesc.value = e.desc;

  editEventId = id;
};

window.removeEvent = async (id) => {
  if (!confirm("Delete event?")) return;
  await deleteEvent(id);
  loadAdminEvents();
};

function clearEventForm() {
  evTitle.value = "";
  evDate.value = "";
  evLoc.value = "";
  evDesc.value = "";
}
// ===== GALLERY ADMIN =====
import {
  addGalleryImage,
  getGalleryImages,
  deleteGalleryImage
} from "./js/firebase.js";

window.addGallery = async ()=>{
  const file = galleryFile.files[0];
  if(!file){ alert("Select image"); return; }
  await addGalleryImage(file);
  galleryFile.value="";
  loadGallery();
};

async function loadGallery(){
  const data = await getGalleryImages();
  galleryList.innerHTML = data.map(i=>`
    <div class="card">
      <img src="${i.url}" style="width:100%;border-radius:8px">
      <button class="btn btn-del" onclick="removeGallery('${i.id}')">
        Delete
      </button>
    </div>
  `).join("");
}

window.removeGallery = async (id)=>{
  if(!confirm("Delete image?")) return;
  await deleteGalleryImage(id);
  loadGallery();
};

/*************************************************
  DOCUMENTS (STORAGE + FIRESTORE)
*************************************************/
window.uploadDoc = async () => {
  const file = docFile.files[0];
  if (!file) return alert("Select file");

  const type = docType.value;
  const url = await uploadFile(file, "documents");

  await setDoc(doc(db, "documents", type), {
    type,
    url,
    uploadedAt: Date.now()
  });

  loadDocs();
};

async function loadDocs() {
  const snap = await getDocs(collection(db, "documents"));
  if (snap.empty) {
    uploadedDocs.innerHTML = "<p class='small-muted'>No documents</p>";
    return;
  }

  let html = "";
  snap.forEach(d => {
    html += `
    <div>
      <a href="${d.data().url}" target="_blank">${d.id}</a>
      <button onclick="deleteDocAdmin('${d.id}')">Delete</button>
    </div>`;
  });

  uploadedDocs.innerHTML = html;
}

window.deleteDocAdmin = async (id) => {
  if (!confirm("Delete document?")) return;
  await deleteDoc(doc(db, "documents", id));
  loadDocs();
};
