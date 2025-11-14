import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// --- Firebase config ---
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

// --- DOM elements ---
const form = document.getElementById("postForm");
const postsList = document.getElementById("postsList");
const imageInput = document.getElementById("postImage");
const postTextInput = document.getElementById("postText");

// --- Add new post ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = postTextInput.value.trim();
  const file = imageInput.files[0];
  if (!text && !file) return alert("Please write something or add an image");

  let imageUrl = "";
  if (file) {
    const uniqueName = Date.now() + "_" + file.name;
    const imageRef = ref(storage, "images/" + uniqueName);
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

// --- Render posts & listen for updates ---
const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
onSnapshot(postsQuery, (snapshot) => {
  postsList.innerHTML = "";

  snapshot.forEach((doc) => {
    const post = doc.data();
    const postId = doc.id;

    // Create post card
    const div = document.createElement("div");
    div.classList.add("post-card");
    div.innerHTML = `
      <div class="meta">
  ${post.timestamp ? post.timestamp.toDate().toLocaleString() : ""}
</div>

      <p>${post.text}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image" />` : ""}
      <div class="replies" id="replies-${postId}"></div>
      <textarea placeholder="Reply..." class="reply-text" data-post-id="${postId}"></textarea>
      <button class="btn primary reply-btn" data-post-id="${postId}">Reply</button>
    `;
    postsList.appendChild(div);

    // --- Listen for replies on this post ---
    const repliesDiv = div.querySelector(`#replies-${postId}`);
    const repliesQuery = collection(db, "posts", postId, "replies");
    onSnapshot(repliesQuery, (repliesSnapshot) => {
      repliesDiv.innerHTML = "";
      repliesSnapshot.forEach(replyDoc => {
        const reply = replyDoc.data();
        const replyDiv = document.createElement("div");
        replyDiv.classList.add("reply-card");
        replyDiv.innerHTML = `
          <div class="meta">${reply.timestamp?.toDate ? new Date(reply.timestamp.toDate()).toLocaleString() : ""}</div>
          <p>${reply.text}</p>
        `;
        repliesDiv.appendChild(replyDiv);
      });
    });
  });

  // --- Attach event listeners for reply buttons ---
  document.querySelectorAll(".reply-btn").forEach((btn) => {
    btn.onclick = async () => {
      const postId = btn.dataset.postId;
      const textarea = document.querySelector(`.reply-text[data-post-id="${postId}"]`);
      const text = textarea.value.trim();
      if (!text) return alert("Please write a reply");
      await addDoc(collection(db, "posts", postId, "replies"), {
        text,
        timestamp: serverTimestamp()
      });
      textarea.value = "";
    };
  });
});
