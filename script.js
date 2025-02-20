import { db, collection, getDocs, doc, addDoc, deleteDoc, updateDoc } from "./firebase-config.js"; // Import Firestore methods

const bookList = document.getElementById("bookList");
const addBookBtn = document.getElementById("addBook");
const chatBtn = document.getElementById("chatBtn");
const chatInput = document.getElementById("chatInput");
const chatArea = document.getElementById("chatArea");

// Your API keys
const API_KEY_GEMINI = "AIzaSyBxZHlgtfDjEZk7dNuNlsIasvYoNGRgzQg"; // Gemini AI key
const API_KEY_VISION = "AIzaSyBm1YrMnJtDi7Snm4eGqS_DelyXLiXzbFM"; // Vision API key

// Function to fetch and display books
async function fetchBooks() {
    bookList.innerHTML = "Loading books..."; // Show loading text

    try {
        const querySnapshot = await getDocs(collection(db, "books"));
        bookList.innerHTML = ""; // Clear after fetching
        querySnapshot.forEach((bookDoc) => {
            const book = bookDoc.data();
            const li = document.createElement("li");

            // Add book cover image if available
            const bookCover = book.cover ? `<img src="${book.cover}" alt="Cover of ${book.title}" class="book-cover" />` : "";

            li.innerHTML = ` 
                ${bookCover}
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
    const cover = prompt("Enter a URL for the book cover image (optional):");

    if (!title || !author || isNaN(rating) || rating < 1 || rating > 5) {
        showFeedback("Invalid input. Please enter valid book details.");
        return;
    }

    try {
        await addDoc(collection(db, "books"), { title, author, rating: Number(rating), cover });
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

// Function to edit a book
async function editBook(id, title, author, rating) {
    const newTitle = prompt("Edit book title:", title);
    const newAuthor = prompt("Edit book author:", author);
    const newRating = prompt("Rate the book (1-5):", rating);
    const newCover = prompt("Enter a new book cover image URL (optional):");

    if (!newTitle || !newAuthor || isNaN(newRating) || newRating < 1 || newRating > 5) {
        showFeedback("Invalid input. Book not updated.");
        return;
    }

    try {
        await updateDoc(doc(db, "books", id), { title: newTitle, author: newAuthor, rating: Number(newRating), cover: newCover });
        fetchBooks();
        showFeedback("✏️ Book updated successfully!");
    } catch (error) {
        console.error("Error updating book:", error);
        showFeedback("❌ Error updating book.");
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

// **Google Cloud Vision API Face Authentication**
async function detectFaceGoogleCloud(imageData) {
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY_VISION}`;

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

// Webcam Setup for Face Recognition with User Consent
async function setupFaceRecognition() {
    const video = document.getElementById("video");
    const consentMessage = document.getElementById("consentMessage");

    if (localStorage.getItem('hasGivenConsent') === 'true') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = "block";

        video.onloadedmetadata = () => {
            video.play();
            captureImage(video); // Start face detection once video starts playing
        };
    } else {
        consentMessage.style.display = "block";

        document.getElementById("consentBtn").addEventListener("click", async () => {
            localStorage.setItem('hasGivenConsent', 'true');
            consentMessage.style.display = "none";

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                video.style.display = "block";
                video.onloadedmetadata = () => {
                    video.play();
                    captureImage(video); // Start face detection once video starts playing
                };
            } catch (error) {
                console.error("Error accessing webcam:", error);
                alert("Failed to access camera.");
            }
        });
    }
}

// Capture Image & Send to Google Vision API
let detectionInterval;

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

    if (faceDetected) {
        clearInterval(detectionInterval); // Stop the loop once face is detected
        showLoginSuccess(); // Trigger login success
        stopVideoStream(video); // Hide the video stream and stop webcam
    } else {
        detectionInterval = setTimeout(() => captureImage(video), 2000); // Continue detecting every 2 seconds
    }
}

// Function to show login success and stop face recognition
function showLoginSuccess() {
    const successMessage = document.createElement("div");
    successMessage.id = "login-success";
    successMessage.innerHTML = "<h2>You are logged in!</h2>";
    document.body.appendChild(successMessage);
    console.log("User authenticated successfully!");
}

// Function to stop the video stream and hide the camera
function stopVideoStream(video) {
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.style.display = "none";
}

setupFaceRecognition();

// **Gemini AI Chatbot Interaction**
async function askGeminiAI(userMessage) {
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY_GEMINI}`;

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
        console.log("API Response:", data);  // Log the full response for debugging

        // Check if the response is in the expected format
        if (data && data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];
            if (candidate.content) {
                // Check if the content is an object and convert to string
                const aiResponse = typeof candidate.content === 'object' ? JSON.stringify(candidate.content) : candidate.content;
                return aiResponse;  // Return the AI response as a string
            } else {
                console.error("Content not found in response", candidate);
                return "AI response unavailable.";
            }
        } else {
            console.error("Unexpected API response format", data);
            return "AI response unavailable.";
        }
    } catch (error) {
        console.error("Error with Gemini API:", error);
        return "❌ AI error. Please try again later.";
    }
}

// Chatbot Interaction
chatBtn.addEventListener("click", async () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    chatInput.value = ""; // Clear input field
    chatArea.value += `User: ${userInput}\nAI: Thinking...\n`;

    try {
        const aiResponse = await askGeminiAI(userInput);
        chatArea.value = chatArea.value.replace("AI: Thinking...\n", `AI: ${aiResponse}\n`);
    } catch (error) {
        chatArea.value += "AI: Sorry, an error occurred.\n";
    }
});

// AI-Powered Book Recommendations
async function getBookRecommendations() {
    const userGenre = prompt("Enter your favorite book genre:");

    if (!userGenre) {
        alert("Please enter a genre!");
        return;
    }

    const aiPrompt = `Suggest 5 great books in the ${userGenre} genre.`;
    const recommendation = await askGeminiAI(aiPrompt);

    alert(`📚 AI Book Recommendations:\n${recommendation}`);
}

// Example button to trigger book recommendations
const recommendBtn = document.createElement("button");
recommendBtn.textContent = "📖 Get Book Recommendations";
recommendBtn.style.display = "block";
recommendBtn.style.margin = "10px 0";
recommendBtn.onclick = getBookRecommendations;

document.body.appendChild(recommendBtn);






