<script>
  import { onMount } from "svelte";
  import "./styles.css";
  import toast, { Toaster } from "svelte-french-toast";
  import { user } from "../stores/authStore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { initializeApp } from "firebase/app";
  import { firebaseConfig, auth } from "$lib/FirebaseConfig";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { doc } from "firebase/firestore";

  let currentUser;
  let profilePic;

  const unsubscribe = user.subscribe((value) => {
    currentUser = value;
  });

  onMount(() => {
    const signInTheme = document.querySelector(".login");
    const savedTheme = localStorage.getItem("user-theme") || "system";

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      }
    };

    const applySavedTheme = () => {
      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      } else if (savedTheme === "system") {
        applySystemTheme();
      }
    };

    applySavedTheme();

    if (savedTheme === "system") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", applySystemTheme);
    }
    onAuthStateChanged(auth, (firebaseUser) => {
      const currentPath = get(page).url.pathname;

      if (firebaseUser) {
        user.set({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });

        const restrictedPaths = ["/", "/onboarding", "/signin", "/signup"];
        if (restrictedPaths.includes(currentPath)) {
          goto("/home");
        }
      } else {
        user.set(null);

        const publicPaths = ["/onboarding", "/signin", "/signup"];
        if (!publicPaths.includes(currentPath)) {
          goto("/onboarding");
        }
      }
    });
  });
</script>

<div class="site-wrapper" style="background-color: #101010;">
  <Toaster />
  <div class="app">
    <slot />
  </div>
</div>
