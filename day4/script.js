// Select the HTML elements
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// Local storage keys
const draftKey = "day4-draft";
const themeKey = "day4-theme";

// Update character and word counters
function updateCounts() {
  const text = noteText.value;

  // Count characters
  const characterTotal = text.length;

  // Count words
  const trimmedText = text.trim();

  let words = 0;

  if (trimmedText.length > 0) {
    words = trimmedText.split(/\s+/).length;
  }

  // Update the text on the page
  charCount.textContent = `${characterTotal} / 200 characters`;
  wordCount.textContent = `${words} words`;

  // Remove old warning classes
  charCount.classList.remove("warning");
  charCount.classList.remove("over");

  // Add warning when over 180 characters
  if (characterTotal > 180 && characterTotal <= 200) {
    charCount.classList.add("warning");
  }

  // Add over class when over 200 characters
  if (characterTotal > 200) {
    charCount.classList.add("over");
  }
}

// Save the current draft
function saveDraft() {
  localStorage.setItem(draftKey, noteText.value);
}

// Clear the note
function clearNote() {
  noteText.value = "";

  localStorage.removeItem(draftKey);

  updateCounts();

  noteText.focus();
}

// Restore the saved draft
function restoreDraft() {
  const savedDraft = localStorage.getItem(draftKey);

  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }
}

// Apply the saved theme
function restoreTheme() {
  const savedTheme = localStorage.getItem(themeKey);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }
}

// Toggle between light and dark mode
function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light mode";
    localStorage.setItem(themeKey, "dark");
  } else {
    themeToggle.textContent = "Dark mode";
    localStorage.setItem(themeKey, "light");
  }
}

// Run whenever the user types
noteText.addEventListener("input", function () {
  updateCounts();
  saveDraft();
});

// Clear button
clearBtn.addEventListener("click", function () {
  clearNote();
});

// Dark mode button
themeToggle.addEventListener("click", function () {
  toggleTheme();
});

// Escape key inside textarea
noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});

// Restore saved information when the page loads
restoreDraft();
restoreTheme();
updateCounts();