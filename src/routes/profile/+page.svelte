<script>
  import { onMount } from "svelte";
  import { signOut, getAuth } from "firebase/auth";
  import { handleFirebaseAuthError } from "$lib/firebaseAuthErrors";
  import toast from "svelte-french-toast";

  const auth = getAuth();

  const signUserOut = async () => {
    try {
      await signOut(auth).then(() => {
        console.log("User signed out");
      });
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };
</script>

<svelte:head>
  <title>Profile | Helios Docs</title>
  <meta name="description" content="Profile Helios Docs" />
</svelte:head>

<div class="login-btns">
  <button class="loginbtn" on:click={signUserOut}
    >Sign Out <i class="fa-solid fa-arrow-right"></i></button
  >
</div>
