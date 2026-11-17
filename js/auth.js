
import { supabase } from "./supabase.js";

// Get the page elements.
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

const loginTab = document.querySelector("#show-login");
const registerTab = document.querySelector("#show-register");

const authMessage = document.querySelector("#auth-message");
const accountPanel = document.querySelector("#account-panel");
const accountName = document.querySelector("#account-name");
const logoutButton = document.querySelector("#logout-button");

const PENDING_BOOKING_KEY = "coachconnectPendingBooking";
const BOOKING_EXPIRY = 24 * 60 * 60 * 1000;

let redirectingToBooking = false;

function getPendingBooking() {
  const saved = localStorage.getItem(PENDING_BOOKING_KEY);

  if (!saved) return null;

  try {
    const booking = JSON.parse(saved);

    if (
      !booking.savedAt ||
      Date.now() - booking.savedAt > BOOKING_EXPIRY ||
      !Number.isInteger(Number(booking.coachId)) ||
      Number(booking.coachId) <= 0
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

// Return the user to the booking they were completing.
function resumePendingBooking() {
  if (redirectingToBooking) return;

  const booking = getPendingBooking();

  if (!booking) return;

  redirectingToBooking = true;

  const requestUrl =
    `./session-request.html?coach=${encodeURIComponent(booking.coachId)}&resumeBooking=1`;

  window.location.replace(requestUrl);
}

// Display messages to the user.
function showMessage(message, isError = false) {
  authMessage.hidden = false;
  authMessage.textContent = message;
  authMessage.classList.toggle("notice-error", isError);
}

// Switch between login and registration.
function showLogin() {
  loginForm.hidden = false;
  registerForm.hidden = true;

  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  loginTab.setAttribute("aria-pressed", "true");
  registerTab.setAttribute("aria-pressed", "false");

  authMessage.hidden = true;
}

function showRegister() {
  loginForm.hidden = true;
  registerForm.hidden = false;

  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  registerTab.setAttribute("aria-pressed", "true");
  loginTab.setAttribute("aria-pressed", "false");

  authMessage.hidden = true;
}

loginTab.addEventListener("click", showLogin);
registerTab.addEventListener("click", showRegister);

// Display the signed-in user's account.
function showAccount(user) {
  loginForm.hidden = true;
  registerForm.hidden = true;

  loginTab.hidden = true;
  registerTab.hidden = true;

  accountPanel.hidden = false;

  const name =
    user.user_metadata?.full_name || user.email;

  accountName.textContent = `Signed in as ${name}.`;
}

// Check whether someone is already signed in.
async function checkUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not check user:", error.message);
    return;
  }

  if (data.user) {
    if (getPendingBooking()) {
      resumePendingBooking();
      return;
    }

    showAccount(data.user);
  }
}

// Register a new athlete.
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document
    .querySelector("#register-name")
    .value.trim();

  const email = document
    .querySelector("#register-email")
    .value.trim();

  const password = document
    .querySelector("#register-password")
    .value;

  const button = registerForm.querySelector("button[type='submit']");

  button.disabled = true;
  button.textContent = "CREATING ACCOUNT...";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      },

      // Return the user to CoachConnect after email confirmation.
      emailRedirectTo:
        `${window.location.origin}/html/auth.html?resumeBooking=1`
    }
  });

  button.disabled = false;
  button.textContent = "CREATE ACCOUNT";

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (data.session && data.user) {
    if (getPendingBooking()) {
      resumePendingBooking();
      return;
    }

    showAccount(data.user);

  } else {
    showMessage(
      "Your account has been created. Please check your email to confirm your account before logging in."
    );
  }
});

// Log in an existing athlete.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document
    .querySelector("#login-email")
    .value.trim();

  const password = document
    .querySelector("#login-password")
    .value;

  const button = loginForm.querySelector("button[type='submit']");

  button.disabled = true;
  button.textContent = "LOGGING IN...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  button.disabled = false;
  button.textContent = "LOG IN";

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (getPendingBooking()) {
    resumePendingBooking();
    return;
  }

  showAccount(data.user);
});

// Log out the current user.
logoutButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    showMessage(error.message, true);
    return;
  }

  accountPanel.hidden = true;

  loginTab.hidden = false;
  registerTab.hidden = false;

  showLogin();

  loginForm.reset();
  registerForm.reset();

  showMessage("You have successfully logged out.");
});

// Respond to authentication changes.
supabase.auth.onAuthStateChange((event, session) => {
   if (event === "SIGNED_IN" && session?.user) {
    if (getPendingBooking()) {
      resumePendingBooking();
    } else {
      showAccount(session.user);
    }
  }
});

// Run the initial authentication check.
checkUser();
