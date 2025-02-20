import { db, collection, getDocs, doc, addDoc, deleteDoc, updateDoc } from "./firebase-config.js"; // Import Firestore methods

const bookList = document.getElementById("bookList");
const addBookBtn = document.getElementById("addBook");
const chatBtn = document.getElementById("chatBtn");
const chatInput = document.getElementById("chatInput");
const chatArea = document.getElementById("chatArea");

// Function to fetch and display books
async function fetchBooks() {
    bookList.innerHTML = "Loading books..."; // Show loading text

    try {
        const querySnapshot = await getDocs(collection(db, "books"));
        bookList.innerHTML = ""; // Clear after fetching
        querySnapshot.forEach((bookDoc) => {
            const book = bookDoc.data();
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${book.title} by ${book.author} (⭐ ${book.rating})</span>
                <button class="editBtn" data-id="${bookDoc.id}" data-title="${book.title}" data-author="${book.author}" data-rating="${book.rating}">✏️</button>
                <button class="deleteBtn" data-id="${bookDoc.id}">❌</button>
            `;
            bookList.appendChild(li);
        });

        attachEventListeners(); // Attach edit/delete events
    } catch (error) {
        console.error("Error fetching books:", error);
        bookList.innerHTML = "Error loading books. Try again.";
    }
}

// Function to attach event listeners to edit/delete buttons
function attachEventListeners() {
    document.querySelectorAll(".editBtn").forEach(button => {
        button.onclick = (e) => {
            const { id, title, author, rating } = e.target.dataset;
            editBook(id, title, author, rating);
        };
    });

    document.querySelectorAll(".deleteBtn").forEach(button => {
        button.onclick = (e) => {
            const { id } = e.target.dataset;
            deleteBook(id);
        };
    });
}

// Function to add a book
async function addBook() {
    const title = prompt("Enter book title:");
    const author = prompt("Enter book author:");
    const rating = prompt("Rate the book (1-5):");

    if (!title || !author || isNaN(rating) || rating < 1 || rating > 5) {
        showFeedback("Invalid input. Please enter valid book details.");
        return;
    }

    try {
        await addDoc(collection(db, "books"), { title, author, rating: Number(rating) });
        fetchBooks();
        showFeedback("📚 Book added successfully!");
    } catch (error) {
        console.error("Error adding book:", error);
        showFeedback("❌ Error adding book.");
    }
}

// Function to delete a book
async function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
        await deleteDoc(doc(db, "books", id));
        fetchBooks();
        showFeedback("🗑️ Book deleted successfully!");
    } catch (error) {
        console.error("Error deleting book:", error);
        showFeedback("❌ Error deleting book.");
    }
}

// Function to show feedback messages
function showFeedback(message) {
    alert(message);
}

// Event listener to add book
addBookBtn.addEventListener("click", addBook);

// Initialize book list
fetchBooks();

// Chatbot Integration with Gemini AI
async function askGeminiAI(userMessage) {
    const API_KEY = "AIzaSyBxZHlgtfDjEZk7dNuNlsIasvYoNGRgzQg"; // Secure this in Firestore or .env
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }] // Correct request format
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.candidates && data.candidates[0]) {
            return data.candidates[0].content || "AI response unavailable.";
        }
        return "AI response unavailable.";
    } catch (error) {
        console.error("Error with Gemini API:", error);
        return "❌ AI error. Please try again later.";
    }
}

// Chatbot Interaction
chatBtn.addEventListener("click", async () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    chatInput.value = "";
    chatArea.value += `User: ${userInput}\nAI: Thinking...\n`;

    try {
        const aiResponse = await askGeminiAI(userInput);
        chatArea.value = chatArea.value.replace("AI: Thinking...\n", `AI: ${aiResponse}\n`);
    } catch (error) {
        chatArea.value += "AI: Sorry, an error occurred.\n";
    }
});

// **Google Cloud Vision API Face Authentication**
async function detectFaceGoogleCloud(imageData) {
    const API_KEY = "AIzaSyBm1YrMnJtDi7Snm4eGqS_DelyXLiXzbFM"; // Store securely
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

    const requestBody = {
        requests: [
            {
                image: { content: imageData },
                features: [{ type: "FACE_DETECTION" }],
            },
        ],
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        const faceAnnotations = data.responses[0].faceAnnotations;
        return faceAnnotations && faceAnnotations.length > 0;
    } catch (error) {
        console.error("Error with Vision API:", error);
        return false;
    }
}

// Webcam Setup for Face Recognition
async function setupFaceRecognition() {
    const video = document.getElementById("video");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play();
            captureImage(video);
        };
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

// Capture Image & Send to Google Vision API
async function captureImage(video) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg").split(",")[1]; // Convert to Base64
    const faceDetected = await detectFaceGoogleCloud(imageData);

    document.getElementById("face-status").textContent = faceDetected
        ? "✅ Face detected!"
        : "❌ No face detected. Try again.";

    setTimeout(() => captureImage(video), 2000); // Recheck every 2s
}

// Start Face Recognition on Page Load
window.onload = () => {
    setupFaceRecognition();
};





































