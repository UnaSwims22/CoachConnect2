import { supabase } from "./supabase.js";

// Find the elements where session information will appear.
const sessionsList = document.querySelector("#sessions-list");
const sessionsStatus = document.querySelector("#sessions-status");

// Display a message on the page.
function showStatus(message, isError = false) {
  sessionsStatus.hidden = false;
  sessionsStatus.textContent = message;
  sessionsStatus.classList.toggle("notice-error", isError);
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

// Format the request status for display.
function formatStatus(status) {
  if (!status) return "Pending";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
  sport.textContent =
    request.coaches?.coach_sports?.[0]?.sport || "Coaching session";

  const heading = document.createElement("h3");
  heading.textContent = request.coaches?.name || "Selected coach";

  const format = document.createElement("p");
  format.textContent =
    `Session format: ${request.session_type || "Not provided"}`;

  const date = document.createElement("p");
  date.textContent =
    `Preferred date: ${formatDate(request.requested_date)}`;

  const time = document.createElement("p");
  time.textContent =
    `Preferred time: ${request.requested_time || "Not provided"}`;

  const location = document.createElement("p");
  location.textContent =
    `Location: ${request.preferred_location || "Not provided"}`;

  details.append(sport, heading, format, date, time, location);

  // Request status and price.
  const statusArea = document.createElement("div");
  statusArea.className = "session-card-status";

  const statusLabel = document.createElement("span");
  const status = formatStatus(request.status);

  statusLabel.className =
    `session-status status-${status.toLowerCase()}`;

  statusLabel.textContent = status;

  const price = document.createElement("p");
  price.className = "session-card-price";
  price.textContent = `R${request.coaches?.hourly_rate ?? "—"}`;

  statusArea.append(statusLabel, price);

  // Expandable section for additional request information.
  const moreDetails = document.createElement("details");
  moreDetails.className = "session-more-details";

  const summary = document.createElement("summary");
  summary.textContent = "View request details";

  const extraInformation = document.createElement("div");
  extraInformation.className = "session-extra-information";

  const requestLocation = document.createElement("p");
  requestLocation.textContent =
    `Preferred location: ${request.preferred_location || "Not provided"}`;

  const message = document.createElement("p");
  message.textContent =
    `Message: ${request.message || "No additional message provided."}`;

  const requestDate = document.createElement("p");
  requestDate.textContent =
    `Submitted: ${request.created_at
      ? new Date(request.created_at).toLocaleString("en-ZA")
      : "Not available"}`;

  extraInformation.append(requestLocation, message, requestDate);
  moreDetails.append(summary, extraInformation);

  card.append(details, statusArea, moreDetails);

  // Only allow pending requests to be cancelled.
  if (request.status === "pending") {
    const cancelButton = document.createElement("button");

    cancelButton.type = "button";
    cancelButton.className = "button button-cancel";
    cancelButton.textContent = "Cancel request";

    // Supabase request IDs are UUIDs.
    cancelButton.dataset.requestId = request.id;

    card.append(cancelButton);
  }

  return card;
}

// Retrieve the signed-in athlete's requests from Supabase.
async function loadSessions() {
  sessionsList.replaceChildren();
  showStatus("Loading your session requests...");

  // Check that an athlete is signed in.
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    sessionsStatus.replaceChildren();
    sessionsStatus.hidden = false;
    sessionsStatus.classList.remove("notice-error");

    sessionsStatus.append(
      document.createTextNode(
        "Please sign in to view your session requests. "
      )
    );

    const loginLink = document.createElement("a");
    loginLink.href = "./auth.html";
    loginLink.textContent = "Go to Log in / Sign up";

    sessionsStatus.append(loginLink);
    return;
  }

  // Retrieve only requests belonging to this athlete.
  const { data: requests, error } = await supabase
    .from("session_requests")
    .select(`
      id,
      requested_date,
      requested_time,
      session_type,
      preferred_location,
      message,
      status,
      created_at,
      coaches (
        name,
        location,
        hourly_rate,
        coach_sports (
          sport
        )
      )
    `)
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load session requests:", error);

    showStatus(
      "We couldn't load your session requests. Please refresh the page and try again.",
      true
    );

    return;
  }

  // Show an empty state if the athlete has no requests.
  if (!requests || requests.length === 0) {
    sessionsList.replaceChildren();

    showStatus(
      "You haven't requested any sessions yet. Find a coach to get started."
    );

    return;
  }

  // Display all retrieved requests.
  sessionsStatus.hidden = true;
  sessionsStatus.classList.remove("notice-error");

  requests.forEach((request) => {
    sessionsList.append(createSessionCard(request));
  });
}

// Cancel a pending request in Supabase.
async function cancelRequest(requestId, cancelButton) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this session request?"
  );

  if (!confirmed) return;

  cancelButton.disabled = true;
  cancelButton.textContent = "Cancelling...";

  const { data, error } = await supabase
    .from("session_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Could not cancel session request:", error);

    showStatus(
      "The request could not be cancelled. Please try again.",
      true
    );

    cancelButton.disabled = false;
    cancelButton.textContent = "Cancel request";
    return;
  }

  if (!data) {
    showStatus(
      "This request could not be cancelled. It may already have been updated.",
      true
    );

    await loadSessions();
    return;
  }

  // Reload the requests to show the updated status.
  await loadSessions();
}

// Listen for clicks on Cancel Request buttons.
sessionsList.addEventListener("click", async (event) => {
  const cancelButton = event.target.closest(".button-cancel");

  if (!cancelButton || cancelButton.disabled) return;

  const requestId = cancelButton.dataset.requestId;

  await cancelRequest(requestId, cancelButton);
});

// Load requests when the page opens.
loadSessions();