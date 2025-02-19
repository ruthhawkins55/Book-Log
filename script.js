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

// Function to edit a book
async function editBook(id, title, author, rating) {
    const newTitle = prompt("Edit book title:", title);
    const newAuthor = prompt("Edit book author:", author);
    const newRating = prompt("Rate the book (1-5):", rating);

    if (!newTitle || !newAuthor || isNaN(newRating) || newRating < 1 || newRating > 5) {
        showFeedback("Invalid input. Book not updated.");
        return;
    }

    try {
        await updateDoc(doc(db, "books", id), { title: newTitle, author: newAuthor, rating: Number(newRating) });
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

// Function to interact with Google Gemini AI
async function askGeminiAI(userMessage) {
    const API_KEY = "AIzaSyBxZHlgtfDjEZk7dNuNlsIasvYoNGRgzQg"; // Use your actual API key here
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



































