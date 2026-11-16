import {coaches} from "./coaches-data.js";

const statusMessage = document.querySelector("#profile-status");
const profile = document.querySelector("#coach-profile-content");

function showStatus(message, isError = false) {
  statusMessage.hidden = false;
  statusMessage.textContent = message;
  statusMessage.classList.toggle("notice-error", isError);
}

function addText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function renderCoach(coach) {
  document.title = `${coach.name} | CoachConnect`;
  addText("#profile-sport-label", coach.sport.toUpperCase());
  addText("#profile-location", coach.location.toUpperCase());
  addText("#profile-name", coach.name);
  addText("#profile-focus", coach.focus);
  addText("#profile-bio", coach.bio);
  addText("#profile-sport", coach.sport);
  addText("#profile-level", coach.level);
  addText("#profile-experience", coach.experience);
  addText("#profile-price", `R${coach.price}`);
  addText("#about-name", coach.name.split(" ")[0]);
  addText("#profile-about", coach.about);
  addText("#profile-session-details", coach.sessionDetails);
  addText("#profile-suitable", coach.suitableFor);
  addText("#profile-preparation", coach.preparation);
  addText("#profile-price-card", `R${coach.price}`);

  const image = document.querySelector("#profile-image");
  image.src = coach.image;
  image.alt = coach.alt;
  addText("#profile-image-caption", `${coach.sport} · ${coach.location}`);

  const approachList = document.querySelector("#profile-approach");
  approachList.replaceChildren();
  coach.approach.forEach((point, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const text = document.createElement("p");
    number.className = "approach-number";
    number.textContent = String(index + 1).padStart(2, "0");
    text.textContent = point;
    item.append(number, text);
    approachList.append(item);
  });

  const sessionTypes = document.querySelector("#profile-session-types");
  sessionTypes.replaceChildren();
  coach.sessions.forEach((type) => {
    const tag = document.createElement("span");
    tag.className = "session-type-tag";
    tag.textContent = type;
    sessionTypes.append(tag);
  });

  // Pass the selected coach ID forward so the session-request milestone can use it.
  const requestUrl = `session-request.html?coach=${encodeURIComponent(coach.id)}`;

  document.querySelector("#request-session-link").href = requestUrl;

  document.querySelector("#request-session-card").href = requestUrl;


  statusMessage.hidden = true;
  profile.hidden = false;

  // A short GSAP timeline enhances the profile entrance; content remains usable without it.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    import("https://esm.sh/gsap@3.13.0").then(({ gsap }) => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from(".profile-hero-copy > *", { y: 18, opacity: 0, duration: 0.35, stagger: 0.07 })
        .from(".profile-portrait", { x: 22, opacity: 0, duration: 0.45 }, "-=0.25")
        .from(".profile-facts > div", { y: 12, opacity: 0, duration: 0.25, stagger: 0.06 }, "-=0.12");
    }).catch(() => {
      // Possible Animation here but profile content has already rendered.
    });
  }
}

const params = new URLSearchParams(window.location.search);
const coachId = Number(params.get("id"));

  if (!params.has("id") || !Number.isInteger(coachId) || coachId < 1) {
    showStatus("No coach was selected. Return to Find a Coach and choose a profile.", true);
  } else {
    const coach = coaches.find((item) => item.id === coachId);
  if (coach) {
    renderCoach(coach);
  } else {
    showStatus("We couldn't find that coach. The profile may have moved or the link may be incorrect.", true);
  }
}

