import { supabase } from "./supabase.js";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(isOpen));
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


// Animate the Find a Coach page hero.
async function initialiseFindHeroAnimation() {
    const hero = document.querySelector(".find-hero");

    // Only run this animation on the Find a Coach page.
    if (!hero) return;

    // Respect the visitor's motion preferences.
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    try {
        const { gsap } = await import("https://esm.sh/gsap@3.13.0");

        // Create a timeline for the hero elements.
        const timeline = gsap.timeline({
            defaults: {
                ease: "power2.out"
            }
        });

        timeline
            // 1. Introduce the small heading.
            .from(".find-hero .eyebrow", {
                y: 18,
                opacity: 0,
                duration: 0.35
            })

            // 2. Reveal the main heading.
            .from(".find-hero h1", {
                y: 34,
                opacity: 0,
                duration: 0.55
            }, "-=0.12")

            // 3. Reveal the supporting description.
            .from(".find-hero-inner > p:not(.eyebrow)", {
                y: 18,
                opacity: 0,
                duration: 0.35
            }, "-=0.18")

            // 4. Reveal the page index.
            .from(".find-hero-index", {
                opacity: 0,
                duration: 0.3
            }, "-=0.1");

    } catch (error) {
        console.info(
            "Find a Coach hero animation unavailable.",
            error
        );
    }
}

// Start the Find a Coach hero animation.
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
function getWeatherDescription(code) {
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
function getTrainingAdvice(weather) {
    
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
