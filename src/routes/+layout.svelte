<script>
  import { onMount } from "svelte";
  import Header from "../lib/components/Header.svelte";
  import "./styles.css";
  import toast, { Toaster } from "svelte-french-toast";
  import { user } from "../stores/authStore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { initializeApp } from "firebase/app";
  import { firebaseConfig, auth } from "$lib/FirebaseConfig";
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  let currentUser;
  let profilePic;

  const unsubscribe = user.subscribe((value) => {
    currentUser = value;
  });

  onMount(() => {
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

<div class="site-wrapper">
  <Toaster />
  <div class="app">
    <slot />
  </div>
</div>
