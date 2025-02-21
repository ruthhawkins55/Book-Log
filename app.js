import { GoogleGenerativeAI } from '@google/generative-ai';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; 

const db = getFirestore(); 
let genAI, model;

async function getApiKey() {
  const snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
  const apiKey = snapshot.data().key;

  // Initialize the generative model with the API key
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function askChatBot(request) {
  return await model.generateContent(request);
}

// Chatbot logic: Modify according to your app's needs
function ruleChatBot(request) {
  if (request.startsWith("recommend book")) {
    let genre = request.replace("recommend book", "").trim();
    if (genre) {
      getBookRecommendations(genre);
      appendMessage('Fetching book recommendations for ' + genre + '...');
    } else {
      appendMessage("Please specify a genre for recommendations.");
    }
    return true;
  } else if (request.startsWith("rate book")) {
    let bookName = request.replace("rate book", "").trim();
    if (bookName) {
      askChatBot('Rate the book ' + bookName);
      appendMessage('Fetching rating for ' + bookName);
    } else {
      appendMessage("Please specify the book to rate.");
    }
    return true;
  }

  return false;
}

// Function to get book recommendations
async function getBookRecommendations(genre) {
  const response = await askChatBot('Recommend books for genre ' + genre);
  appendMessage(response.text);
}

// Chat UI: For user interaction with the chatbot
document.getElementById("send-btn").addEventListener("click", () => {
  let userMessage = document.getElementById("chat-input").value.trim().toLowerCase();
  if (userMessage) {
    if (!ruleChatBot(userMessage)) {
      askChatBot(userMessage).then(response => {
        appendMessage(response.text);
      });
    }
  } else {
    appendMessage("Please enter a prompt.");
  }
});

// Append messages to chat history
function appendMessage(message) {
  const chatHistory = document.getElementById("chat-history");
  const newMessage = document.createElement("div");
  newMessage.textContent = message;
  newMessage.className = 'history';
  chatHistory.appendChild(newMessage);
  document.getElementById("chat-input").value = "";
}

