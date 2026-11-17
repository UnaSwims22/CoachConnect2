import { supabase } from "./supabase.js";

// Get the page elements.
const form = document.querySelector("#session-request-form");
const statusMessage = document.querySelector("#request-status");
const requestContent = document.querySelector("#request-content");
const confirmation = document.querySelector("#request-confirmation");

const coachName = document.querySelector("#request-coach-name");
const coachDetails = document.querySelector("#request-coach-details");
const coachPrice = document.querySelector("#request-coach-price");
const sessionType = document.querySelector("#session-type");

const dateInput = document.querySelector("#session-date");
const submitButton = form.querySelector('button[type="submit"]');

// Read the selected coach's prototype ID from the URL.
const params = new URLSearchParams(window.location.search);
const coachId = Number(params.get("coach"));

let coach = null;

const PENDING_BOOKING_KEY = "coachconnectPendingBooking";
const BOOKING_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function savePendingBooking(details) {
  const pendingBooking = {
    ...details,
    savedAt: Date.now()
  };

  localStorage.setItem(
    PENDING_BOOKING_KEY,
    JSON.stringify(pendingBooking)
  );
}

function getPendingBooking() {
  const saved = localStorage.getItem(PENDING_BOOKING_KEY);

  if (!saved) return null;

  try {
    const booking = JSON.parse(saved);

    // Remove incomplete or expired booking information.
    if (
      !booking.savedAt ||
      Date.now() - booking.savedAt > BOOKING_EXPIRY
    ) {
      localStorage.removeItem(PENDING_BOOKING_KEY);
      return null;
    }

    return booking;
  } catch (error) {
    localStorage.removeItem(PENDING_BOOKING_KEY);
    return null;
  }
}

function restorePendingBooking() {
  const booking = getPendingBooking();

  // Only restore information for the coach originally selected.
  if (!booking || Number(booking.coachId) !== coach.prototypeId) {
    return;
  }

  sessionType.value = booking.sessionType || "";
  dateInput.value = booking.date || "";

  form.querySelector('[name="time"]').value =
    booking.time || "";

  form.querySelector('[name="location"]').value =
    booking.location || "";

  form.querySelector('[name="message"]').value =
    booking.message || "";

  showStatus(
    "Your previous session request has been restored. Review your details and submit when you're ready."
  );
}

let gsapPromise;

function loadGSAP() {
  if (!gsapPromise) {
    gsapPromise = import("https://esm.sh/gsap@3.13.0");
  }

  return gsapPromise;
}

// Animate the Request a Session page when coach details load.
async function animateRequestPage() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) return;

  try {
    const { gsap } = await loadGSAP();

    const timeline = gsap.timeline({
      defaults: {
        ease: "power2.out"
      }
    });

    timeline
      // Introduce the page heading.
      .from(".session-request-heading .eyebrow", {
        y: 15,
        opacity: 0,
        duration: 0.3
      })

      // Reveal the main heading.
      .from(".session-request-heading h1", {
        y: 25,
        opacity: 0,
        duration: 0.45
      }, "-=0.1")

      // Reveal the supporting description.
      .from(".session-request-heading > p:last-child", {
        y: 15,
        opacity: 0,
        duration: 0.3
      }, "-=0.15")

      // Introduce the selected coach summary.
      .from(".request-coach-summary", {
        y: 20,
        opacity: 0,
        duration: 0.4
      }, "-=0.05")

      // Reveal the form fields in sequence.
      .from(".session-request-form > *", {
        y: 12,
        opacity: 0,
        duration: 0.3,
        stagger: 0.06
      }, "-=0.15");

  } catch (error) {
    console.info("Request page animation unavailable.", error);
  }
}

// Set the earliest selectable date to today.
const today = new Date();

const localToday = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.min = localToday;

// Display status messages.
function showStatus(message, isError = false) {
  statusMessage.hidden = false;
  statusMessage.textContent = message;
  statusMessage.classList.toggle("notice-error", isError);
}

// Show a sign-in link when the athlete is not authenticated.
function showLoginMessage() {
  statusMessage.hidden = false;
  statusMessage.classList.remove("notice-error");
  statusMessage.replaceChildren();

  statusMessage.append(
    document.createTextNode(
      "You need to sign in before requesting a session. "
    )
  );

  const loginLink = document.createElement("a");
  loginLink.href = "./auth.html";
  loginLink.textContent = "Go to Log in / Sign up";

  statusMessage.append(loginLink);
}

// Load the selected coach from Supabase.
async function loadCoach() {
  if (!Number.isInteger(coachId) || coachId <= 0) {
    showStatus("Please select a valid coach from Find a Coach.", true);
    form.hidden = true;
    return;
  }

  showStatus("Loading coach details...");

  const { data, error } = await supabase
    .from("coaches")
    .select(`
      id,
      prototype_id,
      name,
      location,
      hourly_rate,
      session_types,
      coach_sports(sport)
    `)
    .eq("prototype_id", coachId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Coach loading error:", error);

    showStatus(
      "We couldn't load this coach. Please return to Find a Coach and try again.",
      true
    );

    form.hidden = true;
    return;
  }

  // Keep the actual Supabase UUID in coach.id.
  coach = {
    id: data.id,
    prototypeId: data.prototype_id,
    name: data.name,
    location: data.location,
    price: Number(data.hourly_rate),
    sport: data.coach_sports?.[0]?.sport || "Sport",
    sessions: data.session_types || []
  };

  document.title = `Request ${coach.name} | CoachConnect`;

  coachName.textContent = coach.name;
  coachDetails.textContent = `${coach.sport} · ${coach.location}`;
  coachPrice.textContent = `Session price: R${coach.price}`;

  // Populate the session-type dropdown.
  sessionType.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a session type";
  placeholder.disabled = true;
  placeholder.selected = true;

  sessionType.append(placeholder);

  coach.sessions.forEach((session) => {
    const option = document.createElement("option");
    option.value = session;
    option.textContent = session;
    sessionType.append(option);
  });

  restorePendingBooking();

  animateRequestPage();
}

// Handle form submission.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!coach) {
    showStatus("Please select a valid coach before submitting.", true);
    return;
  }

  // Collect the booking details before checking authentication.
  const formData = new FormData(form);

  const selectedDate = formData.get("date");
  const selectedTime = formData.get("time");
  const selectedSessionType = formData.get("sessionType");
  const preferredLocation = formData.get("location")?.trim() || "";
  const message = formData.get("message")?.trim() || "";

  // Validate the selected date.
  if (!selectedDate || selectedDate < localToday) {
    showStatus("Please select today or a future date.", true);
    return;
  }

  // Validate all required fields.
  if (
    !selectedTime ||
    !selectedSessionType ||
    !preferredLocation
  ) {
    showStatus("Please complete all required fields.", true);
    return;
  }

  // Ensure the selected session type belongs to this coach.
  if (!coach.sessions.includes(selectedSessionType)) {
    showStatus("Please select a valid session type.", true);
    return;
  }

 
  // Check whether an athlete is signed in.
  const { data: { session }, error: sessionError } =
  await supabase.auth.getSession();

  if (sessionError) {
    console.error("Could not check authentication:", sessionError.message);
    showStatus("We couldn't verify your account. Please try again.", true);
    return;
  }

  // If there is no active session, save the booking and redirect.
  if (!session) {
    savePendingBooking({
    coachId: coach.prototypeId,
    sessionType: selectedSessionType,
    date: selectedDate,
    time: selectedTime,
    location: preferredLocation,
    message: message
  });

  window.location.href = "./auth.html?resumeBooking=1";
  return;
  }

  const user = session.user;


  // Prevent repeated submissions while the request is being saved.
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  showStatus("Saving your session request...");

  try {
    // Save the request directly to Supabase.
    const { error } = await supabase
      .from("session_requests")
      .insert({
        athlete_id: user.id,
        coach_id: coach.id,
        requested_date: selectedDate,
        requested_time: selectedTime,
        session_type: selectedSessionType,
        preferred_location: preferredLocation,
        message: message,
        status: "pending"
      });

    if (error) {
      throw error;
    }

    localStorage.removeItem(PENDING_BOOKING_KEY);

    // Display the confirmation screen.
    statusMessage.hidden = true;
    requestContent.hidden = true;
    confirmation.hidden = false;

    document.querySelector("#confirmation-message").textContent =
      `Your session request for ${coach.name} has been saved. Its current status is Pending.`;

    // Animate the confirmation screen
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      loadGSAP()
        .then(({ gsap }) => {
          gsap.from(".request-confirmation > *", {
            y: 18,
            opacity: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out"
          });
        })
        .catch(() => {
         
        });
    }


  } catch (error) {
    console.error("Session request error:", error);

    showStatus(
      "Your request could not be saved. Please try again.",
      true
    );

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Request";
  }
});

// Load the selected coach when the page opens.
loadCoach();