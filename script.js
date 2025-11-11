// --- script.js ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2zXDQMoUZcBj4pG3sfF0uUQRSt7EAbag",
  authDomain: "new-buffalo-bee-committee.firebaseapp.com",
  projectId: "new-buffalo-bee-committee",
  storageBucket: "new-buffalo-bee-committee.firebasestorage.app",
  messagingSenderId: "1081211282185",
  appId: "1:1081211282185:web:77cba79818673d32c429d8",
  measurementId: "G-CPJ70R3L7J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
console.log("Firebase connected successfully 🐝");

// DOM elements
const form = document.getElementById("postForm");
const postsList = document.getElementById("postsList");
const imageInput = document.getElementById("postImage");

// Live Firestore listener
const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
onSnapshot(postsQuery, (snapshot) => {
  postsList.innerHTML = "";
  snapshot.forEach((doc) => {
    const post = doc.data();
    const div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `
      <div class="meta">${new Date(post.timestamp?.toDate()).toLocaleString()}</div>
      <p>${post.text}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image" />` : ""}
    `;
    postsList.appendChild(div);
  });
});

// Handle submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("postText").value.trim();
  const file = imageInput.files[0];
  if (!text && !file) return alert("Please write something or add an image");

  let imageUrl = "";
  if (file) {
    const imageRef = ref(storage, "images/" + file.name);
    await uploadBytes(imageRef, file);
    imageUrl = await getDownloadURL(imageRef);
  }

  await addDoc(collection(db, "posts"), {
    text,
    imageUrl,
    timestamp: serverTimestamp()
  });

  form.reset();
});
