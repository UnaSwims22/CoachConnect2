import { supabase } from "./supabase.js";

const statusMessage = document.querySelector("#profile-status");
const profile = document.querySelector("#coach-profile-content");

function showStatus(message, isError = false) {
  statusMessage.hidden = false;
  statusMessage.textContent = message;
  statusMessage.classList.toggle("notice-error", isError);
}

function addText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value ?? "";
  }
}

// Convert the database record into the format
// expected by the existing profile page.
function formatCoach(record) {
  const coachSport = record.coach_sports?.[0]?.sport || "Sport";

  return {
    id: record.prototype_id,
    name: record.name,
    sport: coachSport,
    location: record.location,
    level: record.coaching_level,
    sessions: record.session_types || [],
    focus: (record.coaching_specialties || []).join(" · "),
    experience: `${record.experience_years} years`,
    price: Number(record.hourly_rate),
    image: record.profile_image || "",
    alt: `${coachSport} coaching profile for ${record.name}`,
    bio: record.bio,
    about: record.about,
    approach: record.coaching_approach || [],
    suitableFor: record.suitable_for,
    sessionDetails: record.session_details,
    preparation: record.preparation
  };
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

  // Coach profile image.
  const image = document.querySelector("#profile-image");

  if (image) {
    image.src = coach.image;
    image.alt = coach.alt;
  }

  addText(
    "#profile-image-caption",
    `${coach.sport} · ${coach.location}`
  );

  // Coaching approach list.
  const approachList = document.querySelector("#profile-approach");

  if (approachList) {
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
  }

  // Available session types.
  const sessionTypes = document.querySelector("#profile-session-types");

  if (sessionTypes) {
    sessionTypes.replaceChildren();

    coach.sessions.forEach((type) => {
      const tag = document.createElement("span");

      tag.className = "session-type-tag";
      tag.textContent = type;

      sessionTypes.append(tag);
    });
  }

  // Pass the existing numeric coach ID to the request page.
  const requestUrl =
    `session-request.html?coach=${encodeURIComponent(coach.id)}`;

  const requestLink = document.querySelector("#request-session-link");
  const requestCard = document.querySelector("#request-session-card");

  if (requestLink) {
    requestLink.href = requestUrl;
  }

  if (requestCard) {
    requestCard.href = requestUrl;
  }

  statusMessage.hidden = true;
  profile.hidden = false;

  // GSAP entrance animation.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    import("https://esm.sh/gsap@3.13.0")
      .then(({ gsap }) => {
        gsap.timeline({
          defaults: { ease: "power2.out" }
        })
          .from(".profile-hero-copy > *", {
            y: 18,
            opacity: 0,
            duration: 0.35,
            stagger: 0.07
          })
          .from(".profile-portrait", {
            x: 22,
            opacity: 0,
            duration: 0.45
          }, "-=0.25")
          .from(".profile-facts > div", {
            y: 12,
            opacity: 0,
            duration: 0.25,
            stagger: 0.06
          }, "-=0.12");
      })
      .catch(() => {
        // Profile content remains available if GSAP fails to load.
      });
  }
}

// Retrieve the selected coach from Supabase.
async function loadCoach() {
  const params = new URLSearchParams(window.location.search);
  const coachId = Number(params.get("id"));

  if (
    !params.has("id") ||
    !Number.isInteger(coachId) ||
    coachId < 1
  ) {
    showStatus(
      "No coach was selected. Return to Find a Coach and choose a profile.",
      true
    );
    return;
  }

  try {
    const { data, error } = await supabase
      .from("coaches")
      .select(`
        id,
        prototype_id,
        name,
        location,
        bio,
        experience_years,
        hourly_rate,
        coaching_specialties,
        profile_image,
        coaching_level,
        session_types,
        about,
        coaching_approach,
        suitable_for,
        session_details,
        preparation,
        coach_sports (
          sport
        )
      `)
      .eq("prototype_id", coachId)
      .eq("is_active", true)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      showStatus(
        "We couldn't find that coach. The profile may have moved or the link may be incorrect.",
        true
      );
      return;
    }

    const coach = formatCoach(data);

    renderCoach(coach);

  } catch (error) {
    console.error("Could not load coach profile:", error);

    showStatus(
      "We couldn't load this coach's profile. Please refresh the page and try again.",
      true
    );
  }
}

loadCoach();

