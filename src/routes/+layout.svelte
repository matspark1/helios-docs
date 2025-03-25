<script>
  import { onMount } from "svelte";
  import "./styles.css";
  import toast, { Toaster } from "svelte-5-french-toast";
  import { user } from "../stores/authStore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/FirebaseConfig";
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  let currentUser;

  user.subscribe((value) => {
    currentUser = value;
  });

  onMount(() => {
    const savedTheme = localStorage.getItem("user-theme") || "system";

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-theme", prefersDark);
      document.body.classList.toggle("light-theme", !prefersDark);
    };

    const applySavedTheme = () => {
      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      } else {
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

        if (["/", "/onboarding", "/signin", "/signup"].includes(currentPath)) {
          goto("/home");
        }
      } else {
        user.set(null);

        if (!["/onboarding", "/signin", "/signup"].includes(currentPath)) {
          goto("/onboarding");
        }
      }
    });
  });
</script>

<div class="site-wrapper">
  <Toaster />
  <div class="app">
    <slot />
  </div>
</div>
