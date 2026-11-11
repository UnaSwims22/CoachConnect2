import { supabase } from "./supabase";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        navigation.classList.toggle("is-open, !isOpen");
    });

    // Close the mobile menu after a visitor chooses a page.
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
           menuButton.setAttribute("aria-expanded", "false");
           navigation.classList.remove("is-open");
        });
    });
}

async function initialiseHomeAnimation() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  // Check the visitor's motion preference before loading or running animation.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  try {
    const { gsap } = await import("https://esm.sh/gsap@3.13.0");

    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

    timeline
      .from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.35 })
      .from(".hero-title", { y: 34, opacity: 0, duration: 0.55 }, "-=0.12")
      .from(".hero-copy", { y: 18, opacity: 0, duration: 0.35 }, "-=0.18")
      .from(".hero-actions", { y: 14, opacity: 0, duration: 0.3 }, "-=0.12")
      .from(".hero-index, .hero-location", { opacity: 0, duration: 0.25 }, "-=0.1");
  } catch (error) {
    // The content remains visible and usable if GSAP or the network is unavailable.
    console.info("GSAP animation was not loaded; continuing without motion.", error);
  }
}

initialiseHomeAnimation();




if (supabase) {
    console.info("CoachConnect Supabase client initialised.");
} else {
    console.info("CoachConnnect is running without Supabase credentials");
}