const socket = io();

const token = localStorage.getItem("token");
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');
// socket.emit("join", userId);

// if (!token) {
//   alert("You are not logged in!");
//   window.location.href = "/login.html";
// }

if (token && userId ) {
  // Let server know this user has connected
  socket.emit("join", userId);
} else {
  alert("You must be logged in");
  window.location.href = "/login.html";
}


// Get user list
let users = []
async function fetchUsers() {
  // const token = localStorage.getItem("token");
  const res = await fetch("https://intouch-app.onrender.com/api/users", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  users = data.users;
  displayUsers(users);
}

function displayUsers(userList) {
  const userListDiv = document.getElementById("user-list");
  userListDiv.innerHTML = "";

  userList.forEach(user => {
    const userEl = document.createElement("div");
    userEl.textContent = user.username;
    userEl.classList.add("user-item");

    userEl.onclick = () => startChat(user); // Use your existing function
    userListDiv.appendChild(userEl);
  });
}
// fetch("https://intouch-app.onrender.com/api/users", {
//   headers: {
//     Authorization: `Bearer ${token}`
//   }
// })
//   .then(res => res.json())
//   .then(data => {
//     const userList = document.getElementById("user-list");
//     userList.innerHTML = "<h3>All Users:</h3>";
//     data.users.forEach(user => {
//       const userEl = document.createElement("div");
//       userEl.innerText = user.username;
//       userEl.style.cursor = "pointer";
//       userEl.onclick = () => startChat(user);
//       userList.appendChild(userEl);


      // userEl.addEventListener("click", () => {
      //   const recipientId = user._id;
      //   const message = prompt(`Send a message to ${user.username}:`);
      //   if (message) {
      //     socket.emit("private-message", {
      //       to: recipientId,
      //       message
      //     });
      //   }
      // });
  //   });
  // })
  // .catch(err => {
  //   console.error("Some Error in fetching users:", err);
  //   alert("couldn't load user")
  // });

function startChat(user) {
  document.getElementById("chat-box").style.display = "block";
  document.getElementById("chat-with").innerText = user.username;
  // Save selected user
  window.selectedUser = user;
  // TODO: Load previous messages and setup Socket.IO
}
// 🔍 Filter users as you type
document.getElementById("search-bar").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = users.filter(u => u.username.toLowerCase().includes(query));
  displayUsers(filtered);
});

fetchUsers(); // Call on page load

const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");


sendBtn.addEventListener("click", () => {
  const message = messageInput.value;
  const recipientId = window.selectedUser?._id;

  if (!recipientId || !message) return;

  socket.emit("private-message", {
    to: recipientId,
    message,
    username
  });

  appendMessage("You", message);
  messageInput.value = "";
});

const messages = document.getElementById("messages");

function appendMessage(sender, message) {
  const msgEl = document.createElement("div");
  msgEl.classList.add("message");
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  msgEl.innerText =`${sender}: ${message}, ${timestamp}`;
  messages.appendChild(msgEl);
}


socket.on("private-message", ({ from, message, username }) => {
  // alert(`📨 New message from ${from}: ${message}`);
  // if (!window.selectedUser || window.selectedUser._id !== from) return;

  const div = document.createElement("div");
  div.classList.add("replyer");
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerText = `username : ${message}, ${timestamp}`;
  messages.appendChild(div);
});


document.getElementById("logout-btn").addEventListener("click", () => {
  // Clear token from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("userId");

  // Optional: Disconnect socket if used
  // if (window.socket) {
  //   window.socket.disconnect();
  // }

  // Redirect to login
  window.location.href = "/index.html";
});
