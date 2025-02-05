<script>
  import { onMount } from "svelte";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
  } from "firebase/auth";
  import { auth } from "$lib/FirebaseConfig";
  import { handleFirebaseAuthError } from "$lib/firebaseAuthErrors";
  import toast from "svelte-french-toast";

  let username = "";
  let email = "";
  let password = "";

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        toast.success("Your Account Has Been Created.", {
          duration: 5000,
          style:
            "border-radius: 40px; padding: 16px; color: #37b84d; background-color: #37b84d; color: #f1f1f1; font-weight: 600",
          iconTheme: {
            primary: "#f1f1f1",
            secondary: "#37b84d",
          },
        });
      }
    } catch (error) {
      console.error(error);
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        console.log("popup closed");
      } else {
        handleFirebaseAuthError(error);
      }
    }
  };

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: username });

      toast.success("Your Account Has Been Created.", {
        duration: 5000,
        style:
          "border-radius: 40px; padding: 16px; color: #37b84d; background-color: #37b84d; color: #f1f1f1; font-weight: 600",
        iconTheme: {
          primary: "#f1f1f1",
          secondary: "#37b84d",
        },
      });
    } catch (error) {
      console.error(error);
      handleFirebaseAuthError(error);
    }
  };
</script>

<svelte:head>
  <title>Sign Up | Helios Docs</title>
  <meta name="description" content="Sign Up Helios Docs" />
</svelte:head>

<a href="/onboarding" class="backbtn" aria-label="Back">
  <i class="fa-solid fa-arrow-left"></i>
</a>
<div class="login-wrapper">
  <div class="login">
    <h1><span>Sign Up</span></h1>
    <div class="user-login-input">
      <i class="fa-solid fa-user-tie"></i>
      <input type="text" bind:value={username} placeholder="Username" />
    </div>
    <div class="user-login-input">
      <i class="fa-solid fa-envelope"></i>
      <input type="text" bind:value={email} placeholder="Email" />
    </div>
    <div class="user-login-input">
      <i class="fa-solid fa-lock"></i>
      <input type="password" bind:value={password} placeholder="Password" />
    </div>

    <div class="login-btns">
      <button class="loginbtn" on:click={signUp}>
        Sign Up <i class="fa-solid fa-arrow-right"></i>
      </button>
      <button
        class="googlebtn"
        on:click={handleGoogleSignIn}
        aria-label="Sign in with Google"
      >
        <i class="fa-brands fa-google"></i>
      </button>
    </div>
    <div class="login-bottom">
      <p>Have an exsisting Account?</p>
      <a href="/signin">Sign In</a>
    </div>
  </div>
</div>
