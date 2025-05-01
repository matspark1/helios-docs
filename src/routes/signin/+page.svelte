<script>
  import { onMount } from "svelte";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
  } from "firebase/auth";
  import { auth } from "$lib/FirebaseConfig";
  import { handleFirebaseAuthError } from "$lib/util/firebaseAuthErrors";
  import toast from "svelte-5-french-toast";
  import { handleGoogleSignIn } from "$lib/util/googleAuth";
  import meta from "$lib/images/meta.png";

  let email = "";
  let password = "";

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.success("Successfully Signed In!", {
        duration: 3000,
        style:
          "border-radius: 40px; padding: 16px; color: #37b84d;background-color: #37b84d; color: #f1f1f1; font-weight: 600",
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

  onMount(() => {
    const signInTheme = document.querySelector(".login");
    const savedTheme = localStorage.getItem("user-theme") || "system";

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        signInTheme.classList.add("light");
      } else {
        signInTheme.classList.remove("light");
      }
    };

    const applySavedTheme = () => {
      if (savedTheme === "dark") {
        signInTheme.classList.add("light");
      } else if (savedTheme === "light") {
        signInTheme.classList.remove("light");
      } else if (savedTheme === "system") {
        applySystemTheme();
      }
    };

    applySavedTheme();
  });
</script>

<svelte:head>
  <title>Sign In | Helios Docs</title>
  <meta
    name="description"
    content="Sign in to Helios Docs to access your documents. Our secure online document editor helps teams collaborate efficiently."
  />
  <meta
    name="keywords"
    content="helios docs login, sign in, account access, document collaboration, team workspace"
  />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://heliosdocs.com/signin" />
  <meta property="og:title" content="Sign In | Helios Docs" />
  <meta
    property="og:description"
    content="Access your Helios Docs workspace. Sign in to edit and collaborate on documents in real-time with your team."
  />
  <meta property="og:image" content={meta} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Helios Docs" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://heliosdocs.com/signin" />
  <meta name="twitter:title" content="Sign In | Helios Docs" />
  <meta
    name="twitter:description"
    content="Access your Helios Docs workspace. Sign in to edit and collaborate on documents in real-time with your team."
  />
  <meta name="twitter:image" content={meta} />
</svelte:head>

<a href="/onboarding" class="backbtn" aria-label="Back"
  ><i class="fa-solid fa-arrow-left"></i></a
>
<div class="login-wrapper">
  <div class="login">
    <h1><span>Sign In</span></h1>
    <div class="user-login-input">
      <i class="fa-solid fa-envelope"></i>
      <input type="text" bind:value={email} placeholder="Email" />
    </div>
    <div class="user-login-input">
      <i class="fa-solid fa-lock"></i>
      <input type="password" bind:value={password} placeholder="Password" />
    </div>

    <div class="login-btns">
      <button class="loginbtn" on:click={signIn}
        >Sign In <i class="fa-solid fa-arrow-right"></i></button
      >
      <button
        class="googlebtn"
        on:click={handleGoogleSignIn}
        aria-label="Sign in with Google"
        ><i class="fa-brands fa-google"></i></button
      >
    </div>
    <div class="login-bottom">
      <p>New here?</p>
      <a href="/signup">Create an Account</a>
    </div>
  </div>
</div>
