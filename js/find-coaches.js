import { supabase } from "./supabase.js";

const selected = new Set();

const $ = (selector) => document.querySelector(selector);

const search = $("#coach-search");
const sport = $("#sport-filter");
const level = $("#level-filter");
const session = $("#session-filter");
const sort = $("#sort-coaches");
const grid = $("#coach-grid");
const count = $("#result-count");
const tray = $("#compare-tray");
const compareButton = $("#compare-button");
const comparisonPanel = $("#comparison-panel");
const comparisonContent = $("#comparison-content");

// This array will be populated using Supabase.
let coaches = [];

// Track whether the directory has rendered for the first time.
let hasRenderedDirectory = false;

// Load GSAP once and reuse it for future animations.
let gsapPromise;

function animateDirectoryCards(isInitialLoad) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Do not animate if the user prefers reduced motion.
  if (reduceMotion) return;

  const cards = grid.querySelectorAll(".directory-card");

  if (!cards.length) return;

  // Import GSAP only once.
  if (!gsapPromise) {
    gsapPromise = import("https://esm.sh/gsap@3.13.0");
  }

  gsapPromise
    .then(({ gsap }) => {
      // Prevent overlapping animations.
      gsap.killTweensOf(cards);

      if (isInitialLoad) {
        // More noticeable entrance animation on initial page load.
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.035,
            ease: "power2.out",
            overwrite: true
          }
        );
      } else {
        // Shorter transition when search results or filters change.
        gsap.fromTo(
          cards,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: "power1.out",
            overwrite: true
          }
        );
      }
    })
    .catch((error) => {
      console.warn("Directory animation unavailable:", error);
    });
}


// Convert a Supabase record into the structure
// already used by the website.
function formatCoach(record) {
  const coachSport = record.coach_sports?.[0]?.sport || "Sport";

  return {
    id: record.prototype_id,
    databaseId: record.id,
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
    bio: record.bio
  };
}

// Retrieve coaches and their sports from Supabase.
async function loadCoaches() {
  grid.setAttribute("aria-busy", "true");
  count.textContent = "Loading coaches...";

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
        coach_sports (
          sport
        )
      `)
      .eq("is_active", true)
      .order("prototype_id");

    if (error) {
      throw error;
    }

    coaches = (data || []).map(formatCoach);

    render();

  } catch (error) {
    console.error("Could not load coaches:", error);

    grid.innerHTML = `
      <p class="notice notice-error">
        We couldn't load the coaches. Please refresh the page and try again.
      </p>
    `;

    count.textContent = "Unable to load coaches";
    grid.setAttribute("aria-busy", "false");
  }
}

function filteredCoaches() {
  const term = search.value.trim().toLowerCase();

  let list = coaches.filter((coach) => {
    const text = [
      coach.name,
      coach.sport,
      coach.location,
      coach.focus,
      coach.bio
    ].join(" ").toLowerCase();

    return (
      (!term || text.includes(term)) &&
      (!sport.value || coach.sport === sport.value) &&
      (!level.value || coach.level === level.value) &&
      (!session.value || coach.sessions.includes(session.value))
    );
  });

  if (sort.value === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort.value === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort.value === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => a.id - b.id);
  }

  return list;
}

function card(coach) {
  const checked = selected.has(coach.id) ? "checked" : "";

  return `
    <article class="directory-card">

      <a class="directory-card-image"
         href="coach-profile.html?id=${coach.id}"
         aria-label="View ${coach.name}'s profile">

        <img src="${coach.image}"
             alt="${coach.alt}"
             loading="lazy">

        <span class="directory-sport-tag">${coach.sport}</span>
      </a>

      <div class="directory-card-body">

        <div class="directory-card-meta">
          <span>${coach.location.toUpperCase()}</span>
          <span>${coach.experience.toUpperCase()} EXPERIENCE</span>
        </div>

        <h3>${coach.name}</h3>

        <p class="directory-speciality">${coach.focus}</p>

        <p class="directory-bio">${coach.bio}</p>

        <div class="directory-facts">
          <span>
            <small>LEVEL</small>
            ${coach.level}
          </span>

          <span>
            <small>SESSIONS</small>
            ${coach.sessions.join(" · ")}
          </span>
        </div>

        <div class="directory-card-footer">

          <p class="directory-price">
            <strong>R${coach.price}</strong>
            <span>/ session</span>
          </p>

          <a class="profile-link"
             href="coach-profile.html?id=${coach.id}">
            View profile
          </a>

        </div>

        <label class="compare-checkbox">
          <input type="checkbox"
                 data-compare-id="${coach.id}"
                 ${checked}>
          <span class="custom-check" aria-hidden="true"></span>
          Add to compare
        </label>

      </div>
    </article>
  `;
}

function updateTray() {
  const chosen = coaches.filter((coach) =>
    selected.has(coach.id)
  );

  tray.hidden = chosen.length === 0;

  if (!chosen.length) return;

  $("#compare-count").textContent =
    `${chosen.length} of 2 coaches selected`;

  $("#compare-names").textContent =
    chosen.map((coach) => coach.name).join(" / ");

  compareButton.disabled = chosen.length !== 2;
}

function render() {
  const results = filteredCoaches();

  grid.innerHTML = results.map(card).join("");

  grid.setAttribute("aria-busy", "false");

  count.textContent =
    `${results.length} ${results.length === 1 ? "coach" : "coaches"} found`;

  $("#empty-state").hidden = results.length !== 0;

  updateTray();

   // Determine whether this is the first directory render.
  const isInitialLoad = !hasRenderedDirectory;

  hasRenderedDirectory = true;

  // Animate the newly displayed cards.
  animateDirectoryCards(isInitialLoad);
}


function clearFilters() {
  $("#coach-filter-form").reset();
  comparisonPanel.hidden = true;
  render();
}

// Search and filter events.
$("#coach-filter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

$("#coach-filter-form").addEventListener("reset", () => {
  setTimeout(render, 0);
});

let searchTimer;

search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(render, 180);
});

[sport, level, session, sort].forEach((control) => {
  control.addEventListener("change", render);
});

// Compare selection.
grid.addEventListener("change", (event) => {
  const input = event.target.closest("[data-compare-id]");

  if (!input) return;

  const id = Number(input.dataset.compareId);

  if (input.checked && selected.size >= 2) {
    input.checked = false;
    count.textContent = "You can compare up to 2 coaches at a time.";
    return;
  }

  if (input.checked) {
    selected.add(id);
  } else {
    selected.delete(id);
  }

  updateTray();
});

// Compare two selected coaches.
compareButton.addEventListener("click", () => {
  const chosen = coaches.filter((coach) =>
    selected.has(coach.id)
  );

  if (chosen.length !== 2) return;

  const rows = [
    ["Sport", "sport"],
    ["Location", "location"],
    ["Coaching level", "level"],
    ["Experience", "experience"],
    ["Specialities", "focus"],
    ["Session types", "sessions"],
    ["Price per session", "price"]
  ];

  comparisonContent.innerHTML = `
    <div class="comparison-table-wrap">
      <table class="comparison-table">

        <thead>
          <tr>
            <th scope="col">COMPARE</th>
            ${chosen.map((coach) =>
              `<th scope="col">${coach.name}</th>`
            ).join("")}
          </tr>
        </thead>

        <tbody>
          ${rows.map(([label, key]) => `
            <tr>
              <th scope="row">${label}</th>

              ${chosen.map((coach) => {
                let value = coach[key];

                if (key === "sessions") {
                  value = value.join(", ");
                }

                if (key === "price") {
                  value = `R${value}`;
                }

                return `<td>${value}</td>`;
              }).join("")}

            </tr>
          `).join("")}
        </tbody>

      </table>
    </div>
  `;

  comparisonPanel.hidden = false;

  comparisonPanel.scrollIntoView({
    behavior: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches ? "auto" : "smooth"
  });
});

$("#compare-clear").addEventListener("click", () => {
  selected.clear();
  comparisonPanel.hidden = true;
  render();
});

$("#close-comparison").addEventListener("click", () => {
  comparisonPanel.hidden = true;
});

$("#empty-reset").addEventListener("click", clearFilters);

// Start the directory by retrieving the database records.
loadCoaches();



