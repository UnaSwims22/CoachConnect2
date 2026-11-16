import { coaches } from "./coaches-data.js";

// Get the page elements.
const form = document.querySelector("#session-request-form");
const statusMessage = document.querySelector("#request-status");
const requestContent = document.querySelector("#request-content");
const confirmation = document.querySelector("#request-confirmation");

const coachName = document.querySelector("#request-coach-name");
const coachDetails = document.querySelector("#request-coach-details");
const coachPrice = document.querySelector("#request-coach-price");
const sessionType = document.querySelector("#session-type");

// Read the selected coach ID from the URL.
const params = new URLSearchParams(window.location.search);
const coachId = Number(params.get("coach"));

// Find the matching coach in the shared data.
const coach = coaches.find((item) => item.id === coachId);

// Show a message if something goes wrong.
function showStatus(message, isError = false) {
  statusMessage.hidden = false;
  statusMessage.textContent = message;
  statusMessage.classList.toggle("notice-error", isError);
}

// Set the earliest selectable date to today.
const dateInput = document.querySelector("#session-date");
const today = new Date();
const localToday = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.min = localToday;

// Display the selected coach.
function displayCoach() {
  if (!coach) {
    showStatus(
      "We couldn't find the selected coach. Please return to Find a Coach and select a profile.",
      true
    );

    form.hidden = true;
    return;
  }

  document.title = `Request ${coach.name} | CoachConnect`;

  coachName.textContent = coach.name;
  coachDetails.textContent = `${coach.sport} · ${coach.location}`;
  coachPrice.textContent = `Session price: R${coach.price}`;

  // Use the session formats already defined for this coach.
  coach.sessions.forEach((session) => {
    const option = document.createElement("option");
    option.value = session;
    option.textContent = session;
    sessionType.append(option);
  });
}

// Save the request in the browser for this prototype.
function saveRequest(request) {
  const savedRequests = JSON.parse(
    localStorage.getItem("coachconnectRequests") || "[]"
  );

  savedRequests.push(request);

  localStorage.setItem(
    "coachconnectRequests",
    JSON.stringify(savedRequests)
  );
}

// Handle form submission.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!coach) {
    showStatus("A valid coach must be selected before submitting.", true);
    return;
  }

  // Collect the form information.
  const formData = new FormData(form);

  const selectedDate = formData.get("date");

  // Check that the selected date is not in the past.
  if (selectedDate < localToday) {
    showStatus("Please select today or a future date.", true);
    return;
  }

  // Create a session request object.
  const request = {
    id: Date.now(),
    coachId: coach.id,
    coachName: coach.name,
    sport: coach.sport,
    price: coach.price,
    sessionType: formData.get("sessionType"),
    date: selectedDate,
    time: formData.get("time"),
    location: formData.get("location").trim(),
    message: formData.get("message").trim(),
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  // Store the request in the browser.
  try {
    saveRequest(request);
  } catch (error) {
    showStatus(
      "Your request could not be saved in this browser. Please try again.",
      true
    );
    return;
  }

  // Display the confirmation screen.
  requestContent.hidden = true;
  confirmation.hidden = false;

  document.querySelector("#confirmation-message").textContent =
    `Your session request for ${coach.name} has been recorded. Its current status is Pending.`;

  // Animate the confirmation using GSAP, if available.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    import("https://esm.sh/gsap@3.13.0")
      .then(({ gsap }) => {
        gsap.from(".request-confirmation > *", {
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out"
        });
      })
      .catch(() => {
        // The confirmation still works if GSAP cannot load.
      });
  }
});

// Load the selected coach when the page opens.
displayCoach();