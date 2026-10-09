const API_URL = "https://jsonplaceholder.typicode.com/users";
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");
let allUsers = [];

function renderUsers(users) {
  usersList.textContent = "";
  
  if (users.length === 0) {
    return;
  }
  
  users.forEach((user) => {
    const item = document.createElement("li");
    const name = document.createElement("h3");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;

    item.appendChild(name);
    item.appendChild(email);
    item.appendChild(city);
    item.appendChild(company);

    usersList.appendChild(item);
  });
}

function applyFilter() {
  if (allUsers.length === 0) {
    return;
  }
  
  const searchTerm = filterInput.value.trim().toLowerCase();
  
  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm)
  );
  
  renderUsers(filteredUsers);
  
  if (filteredUsers.length === 0) {
    statusText.textContent = "No users match your filter.";
  } else {
    // This is the line that was fixed with backticks
    statusText.textContent = `Showing ${filteredUsers.length} of ${allUsers.length} users.`;
  }
}

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadButton.disabled = true;
  usersList.textContent = "";
  allUsers = [];
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    allUsers = await response.json();

    if (allUsers.length === 0) {
      statusText.textContent = "No users were returned by the server.";
      return;
    }

    applyFilter();
  } catch (error) {
    statusText.textContent = "Could not load users. Please check your connection and try again.";
    usersList.textContent = "";
    console.error("Error loading users:", error);
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);
filterInput.addEventListener("input", applyFilter);