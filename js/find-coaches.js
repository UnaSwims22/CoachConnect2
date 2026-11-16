import { coaches} from "./coaches-data.js" 


const selected = new Set();
const $ = (selector) => document.querySelector(selector);
const search = $("#coach-search"), sport = $("#sport-filter"), level = $("#level-filter");
const session = $("#session-filter"), sort = $("#sort-coaches"), grid = $("#coach-grid");
const count = $("#result-count"), tray = $("#compare-tray"), compareButton = $("#compare-button");
const comparisonPanel = $("#comparison-panel"), comparisonContent = $("#comparison-content");

function filteredCoaches() {

 const term = search.value.trim().toLowerCase();

 let list = coaches.filter(coach => {
  const text = [coach.name,coach.sport,coach.location,coach.focus,coach.bio].join(" ").toLowerCase();
  return (!term || text.includes(term)) &&
   (!sport.value || coach.sport === sport.value) &&
   (!level.value || coach.level === level.value) &&
   (!session.value || coach.sessions.includes(session.value));
 });
 
 if (sort.value === "price-low") list.sort((a,b)=>a.price-b.price);
 else if (sort.value === "price-high") list.sort((a,b)=>b.price-a.price);
 else if (sort.value === "name") list.sort((a,b)=>a.name.localeCompare(b.name));
 else list.sort((a,b)=>a.id-b.id);
 return list;
}

function card(coach) {
 const checked = selected.has(coach.id) ? "checked" : "";
 return `
 <article class="directory-card">
    <a class="directory-card-image" href="coach-profile.html?id=${coach.id}" aria-label="View ${coach.name}'s profile">
      <img src="${coach.image}" alt="${coach.alt}" loading="lazy">
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
        <span><small>LEVEL</small>${coach.level}</span>
        <span><small>SESSIONS</small>${coach.sessions.join(" · ")}</span>
      </div>

      <div class="directory-card-footer">
        <p class="directory-price"><strong>R${coach.price}</strong><span>/ session</span></p>
        <a class="profile-link" href="coach-profile.html?id=${coach.id}">View profile </a>
      </div>

      <label class="compare-checkbox">
        <input type="checkbox" data-compare-id="${coach.id}" ${checked}>
        <span class="custom-check" aria-hidden="true"></span>Add to compare
      </label>
    </div>
  </article>`;
}

function updateTray() {
 const chosen = coaches.filter(c=>selected.has(c.id));
 tray.hidden = chosen.length === 0;
 if (!chosen.length) return;
 $("#compare-count").textContent = `${chosen.length} of 2 coaches selected`;
 $("#compare-names").textContent = chosen.map(c=>c.name).join(" / ");
 compareButton.disabled = chosen.length !== 2;
}

function render() {

 const results = filteredCoaches();
 grid.innerHTML = results.map(card).join("");
 grid.setAttribute("aria-busy","false");
 count.textContent = `${results.length} ${results.length === 1 ? "coach" : "coaches"} found`;
 $("#empty-state").hidden = results.length !== 0;
 updateTray();

 const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if (results.length && !reduceMotion) {
  import("https://esm.sh/gsap@3.13.0").then(({gsap}) => {
   gsap.fromTo(".directory-card",{opacity:0,y:14},{opacity:1,y:0,duration:.3,stagger:.035,ease:"power2.out",overwrite:true});
  }).catch(()=>{});
 }
}

function clearFilters() { $("#coach-filter-form").reset(); comparisonPanel.hidden = true; render(); }
$("#coach-filter-form").addEventListener("submit",e=>{e.preventDefault();render();});
$("#coach-filter-form").addEventListener("reset",()=>setTimeout(render,0));

let searchTimer;
search.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(render,180);});
[sport,level,session,sort].forEach(control=>control.addEventListener("change",render));
grid.addEventListener("change",e=>{
 const input=e.target.closest("[data-compare-id]");
 if(!input)return;
 const id=Number(input.dataset.compareId);
 if(input.checked && selected.size>=2){input.checked=false;count.textContent="You can compare up to 2 coaches at a time.";return;}
 input.checked?selected.add(id):selected.delete(id);
 updateTray();
});
compareButton.addEventListener("click",()=>{

 const chosen=coaches.filter(c=>selected.has(c.id));
 if(chosen.length!==2)return;

 const rows=[["Sport","sport"],["Location","location"],["Coaching level","level"],["Experience","experience"],["Specialities","focus"],["Session types","sessions"],["Price per session","price"]];
 comparisonContent.innerHTML=`<div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th scope="col">COMPARE</th>${chosen.map(c=>`<th scope="col">${c.name}</th>`).join("")}</tr></thead><tbody>${rows.map(([label,key])=>`<tr><th scope="row">${label}</th>${chosen.map(c=>`<td>${key==="sessions"?c[key].join(", "):key==="price"?"R"+c[key]:c[key]}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
 comparisonPanel.hidden=false;
 comparisonPanel.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
});
$("#compare-clear").addEventListener("click",()=>{selected.clear();comparisonPanel.hidden=true;render();});
$("#close-comparison").addEventListener("click",()=>{comparisonPanel.hidden=true;});
$("#empty-reset").addEventListener("click",clearFilters);

render();
