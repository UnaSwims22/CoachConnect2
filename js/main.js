import { supabase } from "./supabase.js";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        navigation.classList.toggle("is-open", !isOpen);
    });

    // Close the mobile menu after a visitor chooses a page.
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
           menuButton.setAttribute("aria-expanded", "false");
           navigation.classList.remove("is-open");
        });
    });
}

//Homepage Hero Entrance
async function initialiseHomeAnimation() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  // Check the visitor's motion preference before loading or running animation.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)").matches;
  
    if (reduceMotion) return;

    const heroImage = hero.querySelector(".hero-image");
    const heroEyebrow = hero.querySelector(".hero-eyebrow");
    const heroTitle = hero.querySelector(".hero-title");
    const heroCopy = hero.querySelector(".hero-copy");
    const heroActions = hero.querySelector(".hero-actions");
    const heroIndex = hero.querySelector(".hero-index");
    const heroLocation = hero.querySelector(".hero-location");

    const heroButtons = heroActions
        ? heroActions.querySelectorAll("a")
        : [];

    const heroDetails = [
        heroIndex,
        heroLocation
    ].filter(Boolean);

    if (!heroTitle) return;


  try {
        const { gsap } = await import("https://esm.sh/gsap@3.13.0");

        const heroTimeline = gsap.timeline({

            defaults: {
                ease: "power3.out"
            },

            onComplete: () => {
                gsap.set(
                   [
                       heroEyebrow,
                       heroTitle,
                       heroCopy,
                       heroActions,
                       heroIndex,
                       heroLocation
                    ].filter(Boolean),
                    {
                        autoAlpha: 1,
                        clearProps: "transform,opacity,visibility,clipPath"
                    }
               );

               if (heroImage) {
                    gsap.set(heroImage, {
                        scale: 1,
                        clearProps: "transform"
                    });
                }
            }
        });

        if (heroImage) {

            heroTimeline.fromTo(
                heroImage,

                {
                    scale: 1.12
                },

                {
                    scale: 1,
                    duration: 1.6,
                    ease: "power2.out"
                },

                0
            );

        }

        const eyebrowLine = heroEyebrow
            ? heroEyebrow.querySelector(".eyebrow-line")
            : null;

        if (eyebrowLine) {

            heroTimeline.fromTo(
                eyebrowLine,

                {
                    scaleX: 0,
                    transformOrigin: "left center"
                },

                {
                    scaleX: 1,
                    duration: 0.55,
                    ease: "power3.out"
                },

                0.2
            );

        }

        if (heroEyebrow) {

            heroTimeline.fromTo(
                heroEyebrow,

                {
                    x: -45,
                    autoAlpha: 0
                },

                {
                    x: 0,
                    autoAlpha: 1,
                    duration: 0.65
                },

                0.2
            );

        }

        heroTimeline.fromTo(
            heroTitle,
            {
                y: 75,
                autoAlpha: 0,
                clipPath: "inset(0 0 100% 0)"
            },

            {
                y: 0,
                autoAlpha: 1,
                clipPath: "inset(0 0 0% 0)",
                duration: 1.05,
                ease: "power4.out"
            },

            0.48
        );

        if (heroCopy) {

            heroTimeline.fromTo(
                heroCopy,

                {
                    y: 28,
                    autoAlpha: 0
                },

                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.65
                },

                "-=0.35"
            );

        }

        if (heroButtons.length) {

            heroTimeline.fromTo(
                heroButtons,

                {
                    y: 25,
                    autoAlpha: 0
                },

                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.55,
                    stagger: 0.14,
                    ease: "back.out(1.4)"
                },

                "-=0.25"
            );

        }

        if (heroDetails.length) {
            heroTimeline.fromTo(
                heroDetails,

                {
                    y: 18,
                    autoAlpha: 0
                },

                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.5,
                    stagger: 0.12
                },

                "-=0.1"
            );

        }

    } catch (error) {

        // Keep all content visible and usable if GSAP fails.
        console.info(
            "Homepage GSAP animation unavailable. Continuing without motion.",
            error
        );

    }

}


initialiseHomeAnimation();



async function initialiseScrollAnimations() {


    const homepage = document.querySelector(".hero");

    if (!homepage) return;


    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    try {

        // Load GSAP and ScrollTrigger.
        const { gsap } = await import(
            "https://esm.sh/gsap@3.13.0"
        );

        const { ScrollTrigger } = await import(
            "https://esm.sh/gsap@3.13.0/ScrollTrigger"
        );

        // Register ScrollTrigger with GSAP.
        gsap.registerPlugin(ScrollTrigger);

        function revealOnScroll(elements, options = {}) {

            const targets = gsap.utils.toArray(elements);

            if (!targets.length) return;

            gsap.fromTo(
                targets,
                {
                    y: options.y ?? 45,
                    autoAlpha: 0
                },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: options.duration ?? 0.8,
                    stagger: options.stagger ?? 0,
                    ease: options.ease ?? "power3.out",

                    scrollTrigger: {
                        trigger: options.trigger ?? targets[0],
                        start: options.start ?? "top 85%",
                        once: true
                    }
                }
            );
        }


        // 1. SEARCH SECTION
        const searchSection = document.querySelector(".search-band");

        if (searchSection) {

            revealOnScroll(
                searchSection.querySelector(".search-band-heading"),
                {
                    trigger: searchSection,
                    y: 35,
                    duration: 0.8
                }
            );

            revealOnScroll(
                searchSection.querySelector(".quick-search"),
                {
                    trigger: searchSection,
                    y: 35,
                    duration: 0.8
                }
            );

            revealOnScroll(
                searchSection.querySelector(".search-note"),
                {
                    trigger: searchSection,
                    y: 20,
                    duration: 0.6
                }
            );

        }

        //2. FEATURED COACHES
        const featuredSection = document.querySelector(
            ".featured-section"
        );

        if (featuredSection) {

            revealOnScroll(
                featuredSection.querySelector(".section-heading"),
                {
                    trigger: featuredSection,
                    y: 40,
                    duration: 0.8
                }
            );

            // Coach cards are inserted dynamically.
            const coachGrid = featuredSection.querySelector(".coach-grid");

            if (coachGrid) {

                // Wait for dynamically loaded coach cards.
                const observeCoachCards = () => {

                    const coachCards = coachGrid.querySelectorAll(
                        ".coach-card"
                    );

                    if (!coachCards.length) return false;

                    if (coachGrid.dataset.animationInitialised === "true") {
                        return true;
                    }

                    coachGrid.dataset.animationInitialised = "true";


                    revealOnScroll(
                        coachCards,
                        {
                            trigger: coachGrid,
                            y: 50,
                            duration: 0.75,
                            stagger: 0.15,
                            start: "top 90%"
                        }
                    );

                    return true;
                };

                // Check whether cards already exist.
                if (!observeCoachCards()) {

                    const observer = new MutationObserver(() => {

                        if (observeCoachCards()) {
                            observer.disconnect();
                        }

                    });

                    observer.observe(coachGrid, {
                        childList: true,
                        subtree: true
                    });

                }

            }

        }

        // 3. HOW IT WORKS
        const howSection = document.querySelector(".how-section");

        if (howSection) {

            revealOnScroll(
                howSection.querySelector(".how-intro"),
                {
                    trigger: howSection,
                    y: 45,
                    duration: 0.9
                }
            );

            revealOnScroll(
                howSection.querySelectorAll(".step-item"),
                {
                    trigger: howSection.querySelector(".steps-list"),
                    y: 35,
                    duration: 0.7,
                    stagger: 0.16,
                    start: "top 85%"
                }
            );

        }

        //4. CLOSING CTA
        const closingCTA = document.querySelector(".closing-cta");

        if (closingCTA) {

            revealOnScroll(
                closingCTA.querySelector("div"),
                {
                    trigger: closingCTA,
                    y: 40,
                    duration: 0.8
                }
            );

            revealOnScroll(
                closingCTA.querySelector(".button"),
                {
                    trigger: closingCTA,
                    y: 30,
                    duration: 0.8
                }
            );

        }

        // WEATHER SECTION
        const weatherSection = document.querySelector(
            ".weather-section"
        );

        if (weatherSection) {

            revealOnScroll(
                [
                    weatherSection.querySelector(".weather-heading"),
                    weatherSection.querySelector(".weather-panel")
                ].filter(Boolean),
                {
                    trigger: weatherSection,
                    y: 40,
                    duration: 0.85,
                    stagger: 0.18
                }
            );

        }

    } catch (error) {

        console.info(
            "Scroll animations unavailable. Continuing without motion.",
            error
        );

    }

}


initialiseScrollAnimations();


async function initialiseFindHeroAnimation() {
    const findHero = document.querySelector(".find-hero");

    // Only run this animation on the Find a Coach page.
    if (!findHero) return;

    // Respect the visitor's motion preferences.
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    try {
        const { gsap } = await import("https://esm.sh/gsap@3.13.0");

        const background = findHero.querySelector(".find-hero-image");
        const eyebrow = findHero.querySelector(".hero-eyebrow");
        const heading = findHero.querySelector(".hero-title");
        const description = findHero.querySelector(".hero-copy");
        const index = findHero.querySelector(".hero-index");

   
        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out"
            }
        });

        if (background) {
            timeline.fromTo(
                background,
                {
                    scale: 1.12,
                    autoAlpha: 0
                },
                {
                    scale: 1,
                    autoAlpha: 1,
                    duration: 1.4,
                    ease: "power2.out"
                }
            );
        }

        if (eyebrow) {
            timeline.from(
                eyebrow,
                {
                    x: -30,
                    autoAlpha: 0,
                    duration: 0.6
                },
                "-=0.9"
            );
        }

        if (heading) {
            timeline.from(
                heading,
                {
                    y: 65,
                    autoAlpha: 0,
                    duration: 0.85,
                    ease: "power4.out"
                },
                "-=0.5"
            );
        }

        if (description) {
            timeline.from(
                description,
                {
                    y: 25,
                    autoAlpha: 0,
                    duration: 0.6
                },
                "-=0.45"
            );
        }

        if (index) {
            timeline.from(
                index,
                {
                    x: 25,
                    autoAlpha: 0,
                    duration: 0.55
                },
                "-=0.4"
            );
        }

    } catch (error) {
        console.info(
            "Find a Coach hero animation unavailable.",
            error
        );
    }
}

initialiseFindHeroAnimation();



if (supabase) {
    console.info("CoachConnect Supabase client initialised.");
} else {
    console.info("CoachConnnect is running without Supabase credentials");
}

// ------------------------------------------
// OPEN-METEO WEATHER API
// ------------------------------------------

// Get the weather section elements.
const weatherLoading = document.querySelector("#weather-loading");
const weatherError = document.querySelector("#weather-error");
const weatherContent = document.querySelector("#weather-content");

const weatherTemperature = document.querySelector("#weather-temperature");
const weatherDescription = document.querySelector("#weather-description");
const weatherFeelsLike = document.querySelector("#weather-feels-like");
const weatherWind = document.querySelector("#weather-wind");
const weatherHumidity = document.querySelector("#weather-humidity");
const weatherRain = document.querySelector("#weather-rain");
const weatherUpdated = document.querySelector("#weather-updated");
const weatherAdvice = document.querySelector("#weather-advice");

// Convert Open-Meteo weather codes into readable descriptions.
export function getWeatherDescription(code) {
    const weatherConditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        80: "Rain showers",
        81: "Moderate rain showers",
        82: "Heavy rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherConditions[code] || "Conditions unavailable";
}

// Give a simple general outdoor-training note.
export function getTrainingAdvice(weather) {
    
    if ([95, 96, 99].includes(weather.weather_code)) {
        return "Thunderstorm conditions are reported. Postpone outdoor training until conditions are safe.";
    }

  
    if (weather.precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.weather_code)) {
        return "Rain is present or expected in the current conditions. Check your training surface and consider an indoor alternative.";
    }

    if ([45, 48].includes(weather.weather_code)) {
        return "Reduced visibility is possible. Take visibility into account when planning outdoor activity.";
    }

    
    if (weather.wind_speed_10m >= 30) {
        return "Wind speeds are elevated. Consider whether your planned outdoor session is suitable for these conditions.";
    }

    return "Conditions appear relatively settled. Check your training venue and local conditions before heading out.";
}

// Load current weather from Open-Meteo.
async function loadWeather() {
    // Do nothing if the weather section is not on this page.
    if (!weatherLoading || !weatherContent) return;

    try {
        const weatherURL = new URL("https://api.open-meteo.com/v1/forecast");

        // Johannesburg coordinates.
        weatherURL.search = new URLSearchParams({
            latitude: "-26.2041",
            longitude: "28.0473",
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "weather_code",
                "wind_speed_10m"
            ].join(","),
            timezone: "Africa/Johannesburg",
            temperature_unit: "celsius",
            wind_speed_unit: "kmh"
        });

        const response = await fetch(weatherURL);

        if (!response.ok) {
            throw new Error("Weather API request failed.");
        }

        const data = await response.json();

        if (!data.current) {
            throw new Error("Weather information was not returned.");
        }

        const weather = data.current;

        // Display the returned weather information.
        weatherTemperature.textContent =
            Math.round(weather.temperature_2m);

        weatherDescription.textContent =
            getWeatherDescription(weather.weather_code);

        weatherFeelsLike.textContent =
            Math.round(weather.apparent_temperature);

        weatherWind.textContent =
            `${Math.round(weather.wind_speed_10m)} km/h`;

        weatherHumidity.textContent =
            `${weather.relative_humidity_2m}%`;

        weatherRain.textContent =
            `${weather.precipitation} mm`;

        weatherAdvice.textContent =
            getTrainingAdvice(weather);

        // Format the API's local Johannesburg timestamp.
        const updatedTime = new Date(weather.time);

        weatherUpdated.textContent =
            `Last updated: ${updatedTime.toLocaleString("en-ZA", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            })}`;

        // Show the successful weather result.
        weatherLoading.hidden = true;
        weatherError.hidden = true;
        weatherContent.hidden = false;

    } catch (error) {
        console.error("Weather loading error:", error);

        // Show the error state if the API cannot be reached.
        weatherLoading.hidden = true;
        weatherContent.hidden = true;
        weatherError.hidden = false;

        weatherError.textContent =
            "Weather information is currently unavailable. Please try again later.";
    }
}

// Load weather when the homepage opens.
loadWeather();
