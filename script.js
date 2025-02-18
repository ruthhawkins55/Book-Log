import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "./firebase-config.js";

const bookList = document.getElementById("bookList");
const addBookBtn = document.getElementById("addBook");

// Function to fetch and display books
async function fetchBooks() {
    bookList.innerHTML = ""; // Clear the list
    const querySnapshot = await getDocs(collection(db, "books"));
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

    // Attach event listeners to edit and delete buttons
    document.querySelectorAll(".editBtn").forEach(button => {
        button.addEventListener("click", (e) => {
            const { id, title, author, rating } = e.target.dataset;
            editBook(id, title, author, rating);
        });
    });

    document.querySelectorAll(".deleteBtn").forEach(button => {
        button.addEventListener("click", (e) => {
            const { id } = e.target.dataset;
            deleteBook(id);
        });
    });
}

// Function to add a book
async function addBook() {
    const title = prompt("Enter book title:");
    const author = prompt("Enter book author:");
    const rating = prompt("Rate the book (1-5):");
    if (title && author && rating) {
        await addDoc(collection(db, "books"), { title, author, rating: Number(rating) });
        fetchBooks(); // Refresh the list
    }
}

// Function to delete a book
async function deleteBook(id) {
    await deleteDoc(doc(db, "books", id));
    fetchBooks();
}

// Function to edit a book
async function editBook(id, oldTitle, oldAuthor, oldRating) {
    const newTitle = prompt("Enter new title:", oldTitle);
    const newAuthor = prompt("Enter new author:", oldAuthor);
    const newRating = prompt("Enter new rating (1-5):", oldRating);
    if (newTitle && newAuthor && newRating) {
        await updateDoc(doc(db, "books", id), { title: newTitle, author: newAuthor, rating: Number(newRating) });
        fetchBooks();
    }
}

// Event Listener for Adding a Book
addBookBtn.addEventListener("click", addBook);

// Load books on startup
fetchBooks();







