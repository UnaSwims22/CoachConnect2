
// Find the elements where session information will appear.
const sessionsList = document.querySelector("#sessions-list");
const sessionsStatus = document.querySelector("#sessions-status");

// Use the same storage key as the session request form.
const STORAGE_KEY = "coachconnectRequests";

// Retrieve the saved requests from localStorage.
function getSessionRequests() {
  try {
    const savedRequests = localStorage.getItem(STORAGE_KEY);

    // If no requests have been saved, return an empty array.
    if (!savedRequests) {
      return [];
    }

    const requests = JSON.parse(savedRequests);

    // Make sure the saved information is an array.
    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    console.error("Could not read session requests:", error);
    return null;
  }
}

// Format the date so it is easier to read.
function formatDate(dateString) {
  if (!dateString) return "Date not provided";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

// Create one session request card.
function createSessionCard(request) {
  const card = document.createElement("article");
  card.className = "session-card";

  // Coach and session information.
  const details = document.createElement("div");
  details.className = "session-card-details";

  const sport = document.createElement("p");
  sport.className = "eyebrow";
  sport.textContent = request.sport || "Coaching session";

  const heading = document.createElement("h3");
  heading.textContent = request.coachName || "Selected coach";

  const format = document.createElement("p");
  format.textContent = `Session format: ${request.sessionType || "Not provided"}`;

  const date = document.createElement("p");
  date.textContent = `Preferred date: ${formatDate(request.date)}`;

  const time = document.createElement("p");
  time.textContent = `Preferred time: ${request.time || "Not provided"}`;

  const location = document.createElement("p");
  location.textContent = `Location: ${request.location || "Not provided"}`;

  details.append(sport, heading, format, date, time, location);

  // Request status.
  const statusArea = document.createElement("div");
  statusArea.className = "session-card-status";

  const statusLabel = document.createElement("span");
  const status = request.status || "Pending";

  statusLabel.className =
    `session-status status-${status.toLowerCase()}`;

  statusLabel.textContent = status;

  const price = document.createElement("p");
  price.className = "session-card-price";
  price.textContent = `R${request.price ?? "—"}`;

  statusArea.append(statusLabel, price);

  // Optional message.
  card.append(details, statusArea);

  if (request.message) {
    const message = document.createElement("p");
    message.className = "session-card-message";
    message.textContent = `Your message: ${request.message}`;
    card.append(message);
  }

  return card;
}

// Display all saved session requests.
function displaySessions() {
  const requests = getSessionRequests();

  sessionsList.replaceChildren();

  if (requests === null) {
    sessionsStatus.hidden = false;
    sessionsStatus.textContent =
      "We couldn't read your saved requests. Please refresh the page and try again.";
    return;
  }

  if (requests.length === 0) {
    sessionsStatus.hidden = false;
    sessionsStatus.textContent =
      "You haven't requested any sessions yet. Find a coach to get started.";

    return;
  }

  // Sort requests so the newest appears first.
  requests.sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  sessionsStatus.hidden = true;

  requests.forEach((request) => {
    const card = createSessionCard(request);
    sessionsList.append(card);
  });
}

// Load requests when the page opens.
displaySessions();
