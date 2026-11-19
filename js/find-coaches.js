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

const homepageParams = new URLSearchParams(window.location.search);

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

let homepageLocation = homepageParams.get("location")?.trim() || "";

const requestedSport = homepageParams.get("sport");

if (requestedSport) {
  const matchingSportOption = [...sport.options].find(
    (option) =>
      normalize(option.value) === normalize(requestedSport) ||
      normalize(option.textContent) === normalize(requestedSport)
  );

  if (matchingSportOption) {
    sport.value = matchingSportOption.value;
  }
}


if (homepageLocation) {
  search.value = homepageLocation;
}

// Track whether the directory has rendered for the first time.
let hasRenderedDirectory = false;

// Load GSAP once and reuse it for future animations.
let gsapPromise;
// Cache the ScrollTrigger import.
let scrollTriggerPromise;

// Keep track of the horizontal animation.
let horizontalScrollTween = null;

// Prevent multiple resize listeners.
let horizontalResizeListenerAdded = false;

// Keep track of the current filtering animation.
let activeFilterTimeline = null;

// Prevent older animations from updating newer search results.
let renderVersion = 0;


function animateDirectoryCards(isInitialLoad) {

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) return;

  const cards = grid.querySelectorAll(".directory-card");

  if (!cards.length) return;

  if (!gsapPromise) {
    gsapPromise = import("https://esm.sh/gsap@3.13.0");
  }

  gsapPromise
    .then(({ gsap }) => {

      // Wait until the browser has had an opportunity to render the cards.
      requestAnimationFrame(() => {

        const currentCards = grid.querySelectorAll(".directory-card");

        if (!currentCards.length) return;

        // Set the starting appearance.
        gsap.set(currentCards, {
          autoAlpha: 0,
          y: 24,
          scale: 0.98
        });

        // Animate the cards into view.
        gsap.to(currentCards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: isInitialLoad ? 0.65 : 0.4,
          stagger: isInitialLoad ? 0.12 : 0.07,
          ease: "power3.out",
          clearProps: "transform"
        });

      });

    })
    .catch((error) => {
      console.warn("Directory animation unavailable:", error);
    });
}

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
  const term = normalize(search.value);
  

  let list = coaches.filter((coach) => {
    const text = [
      coach.name,
      coach.sport,
      coach.location,
      coach.focus,
      coach.bio
    ].join(" ").toLowerCase();

    const matchesSearch =
      !term || text.includes(term);

    const matchesHomepageLocation =
      !homepageLocation ||
      normalize(coach.location).includes(normalize(homepageLocation));

    const matchesSport =
      !sport.value ||
      normalize(coach.sport) === normalize(sport.value);

    const matchesLevel =
      !level.value ||
      normalize(coach.level) === normalize(level.value);

    const matchesSession =
      !session.value ||
      coach.sessions.some(
        (item) => normalize(item) === normalize(session.value)
      );

    return (
      matchesSearch &&
      matchesHomepageLocation &&
      matchesSport &&
      matchesLevel &&
      matchesSession
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

  const currentRender = ++renderVersion;
  const results = filteredCoaches();

  const isInitialLoad = !hasRenderedDirectory;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  // Update the directory after the exit animation.
  function updateDirectory() {

    // Ignore outdated filtering operations.
    if (currentRender !== renderVersion) return;

    grid.innerHTML = results.map(card).join("");

    grid.setAttribute("aria-busy", "false");

    count.textContent =
      `${results.length} ${results.length === 1 ? "coach" : "coaches"} found`;

    $("#empty-state").hidden = results.length !== 0;

    updateTray();

    hasRenderedDirectory = true;

    // Reuse the working entrance animation.
    animateDirectoryCards(false);
    initialiseHorizontalCoachScroll();
  }

  if (
    isInitialLoad ||
    reduceMotion ||
    !grid.querySelector(".directory-card")
  ) {

    if (activeFilterTimeline) {
      activeFilterTimeline.kill();
      activeFilterTimeline = null;
    }

    if (isInitialLoad) {
      grid.innerHTML = results.map(card).join("");

      grid.setAttribute("aria-busy", "false");

      count.textContent =
        `${results.length} ${results.length === 1 ? "coach" : "coaches"} found`;

      $("#empty-state").hidden = results.length !== 0;

      updateTray();

      hasRenderedDirectory = true;

      animateDirectoryCards(true);
      initialiseHorizontalCoachScroll();

    } else {
      updateDirectory();
    }

    return;
  }


  grid.setAttribute("aria-busy", "true");


  if (!gsapPromise) {
    gsapPromise = import("https://esm.sh/gsap@3.13.0");
  }


  gsapPromise
    .then(({ gsap }) => {

      if (currentRender !== renderVersion) return;

      if (activeFilterTimeline) {
        activeFilterTimeline.kill();
      }

      const existingCards = grid.querySelectorAll(".directory-card");

      if (!existingCards.length) {
        updateDirectory();
        return;
      }

      // Animate the current cards out.
      activeFilterTimeline = gsap.to(existingCards, {

        autoAlpha: 0,
        y: -12,
        scale: 0.985,

        duration: 0.2,
        stagger: 0.035,

        ease: "power2.in",

        onComplete: () => {

          if (currentRender !== renderVersion) return;

          updateDirectory();

          activeFilterTimeline = null;
        }

      });

    })
    .catch((error) => {

      console.warn("Filtering animation unavailable:", error);

      updateDirectory();

    });

}



async function initialiseHorizontalCoachScroll() {

  const viewport = document.querySelector(
    ".directory-horizontal-viewport"
  );

  if (!viewport) return;

  // Remove the previous horizontal animation before rebuilding it.
  if (horizontalScrollTween) {
    horizontalScrollTween.scrollTrigger?.kill();
    horizontalScrollTween.kill();
    horizontalScrollTween = null;
  }

  // Reset the horizontal track.
  if (!gsapPromise) {
    gsapPromise = import("https://esm.sh/gsap@3.13.0");
  }

  try {
    const { gsap } = await gsapPromise;

    gsap.set(grid, {
      clearProps: "transform"
    });

    // Only activate horizontal scrolling on desktop.
    if (
      window.innerWidth < 900 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Load ScrollTrigger.
    if (!scrollTriggerPromise) {
      scrollTriggerPromise = import(
        "https://esm.sh/gsap@3.13.0/ScrollTrigger"
      );
    }

    const { ScrollTrigger } = await scrollTriggerPromise;

    gsap.registerPlugin(ScrollTrigger);

    // Wait for the cards to finish rendering.
    requestAnimationFrame(() => {

      const distance =
        grid.scrollWidth - viewport.clientWidth;

      // No animation is needed if all cards already fit.
      if (distance <= 0) return;

      // Move the cards horizontally as the user scrolls vertically.
      horizontalScrollTween = gsap.to(grid, {

        x: () => -(
          grid.scrollWidth - viewport.clientWidth
        ),

        ease: "none",

        scrollTrigger: {

          trigger: viewport,

          start: "top top+=90",

          end: () => `+=${grid.scrollWidth - viewport.clientWidth}`,

          pin: true,

          scrub: 1,

          anticipatePin: 1,

          invalidateOnRefresh: true

        }

      });

      // Recalculate the scroll distance.
      ScrollTrigger.refresh();

    });

  } catch (error) {
    console.warn(
      "Horizontal coach scrolling unavailable:",
      error
    );
  }
}


function initialiseHorizontalResize() {

  if (horizontalResizeListenerAdded) return;

  horizontalResizeListenerAdded = true;

  window.addEventListener("resize", () => {
    initialiseHorizontalCoachScroll();
  });
}


function clearFilters() {
  homepageLocation ="";
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
  homepageLocation = "";
  
  const currentUrl = new URL(window.location.href);

  currentUrl.searchParams.delete("sport");
  currentUrl.searchParams.delete("location");

  window.history.replaceState({}, "", currentUrl);

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



initialiseHorizontalResize();
loadCoaches();



