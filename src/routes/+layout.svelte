<script>
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import "./styles.css";
  import toast, { Toaster } from "svelte-french-toast";
  import { user } from "../stores/authStore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { initializeApp } from "firebase/app";
  import { firebaseConfig } from "$lib/FirebaseConfig";

  onMount(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.set({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });
        goto("/home");
      } else {
        user.set(null);
        goto("/onboarding");
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
