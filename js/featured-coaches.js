import { coaches } from "./coaches-data.js";

// Find the featured coach container on the homepage.
const featuredGrid = document.querySelector(".coach-grid");

// Stop if this script is loaded on a page without featured coaches.
if (featuredGrid) {

  // Select the first three coaches for the homepage.
  const featuredCoaches = coaches.slice(0, 3);

  // Generate the HTML for each featured coach.
  featuredGrid.innerHTML = featuredCoaches.map(coach => `
    <article class="coach-card">

      <a class="coach-image-link"
         href="/html/coach-profile.html?id=${coach.id}"
         aria-label="View ${coach.name}'s profile">

        <img src="${coach.image}"
             alt="${coach.alt}"
             loading="lazy">

        <span class="coach-sport-tag">
          ${coach.sport.toUpperCase()}
        </span>
      </a>

      <div class="coach-card-body">

        <div class="coach-card-topline">
          <span>${coach.location.toUpperCase()}</span>
          <span>${String(featuredCoaches.indexOf(coach) + 1).padStart(2, "0")} / 03</span>
        </div>

        <h3>${coach.name}</h3>

        <p class="coach-speciality">${coach.focus}</p>

        <p class="coach-description">${coach.bio}</p>

        <div class="coach-card-footer">

          <span>
            <strong>R${coach.price}</strong>
            <small>/ session</small>
          </span>

          <a href="/html/coach-profile.html?id=${coach.id}"
             aria-label="View ${coach.name}'s profile">
            View profile <span aria-hidden="true"></span>
          </a>

        </div>
      </div>
    </article>
  `).join("");
}
