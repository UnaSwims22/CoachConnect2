import { supabase } from "./supabase";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        navigation.classList.toggle("is-open, !isOpen");
    });
}

if (supabase) {
    console.info("CoachConnect Supabase client initialised.");
} else {
    console.info("CoachConnnect is running without Supabase credentials");
}