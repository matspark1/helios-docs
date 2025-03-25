<script>
  import { onMount } from "svelte";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
  } from "firebase/auth";
  import { doc, setDoc } from "firebase/firestore";
  import { auth, db } from "$lib/FirebaseConfig";
  import { handleFirebaseAuthError } from "$lib/util/firebaseAuthErrors";
  import toast from "svelte-5-french-toast";
  import { handleGoogleSignIn } from "$lib/util/googleAuth";

  let firstName = "";
  let lastName = "";
  let email = "";
  let password = "";

  function generateInitialsAvatar(name) {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=101010&size=300`;
  }

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const fullName = `${firstName} ${lastName}`;
      const profilePicture = generateInitialsAvatar(fullName);

      await updateProfile(user, {
        displayName: fullName,
        photoURL: profilePicture,
      });

      await user.reload();

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            name: fullName,
            email: user.email,
            photoURL: profilePicture,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Firestore write failed:", firestoreError);
        toast.error(
          "Account created but profile sync failed. Please try again later.",
          {
            duration: 5500,
            style:
              "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
            iconTheme: {
              primary: "#F1f1f1",
              secondary: "#c61a34",
            },
          }
        );
        return;
      }

      toast.success("Your Account Has Been Created.", {
        duration: 3000,
        style:
          "border-radius: 40px; padding: 16px; color: #37b84d;background-color: #37b84d; color: #f1f1f1; font-weight: 600",
        iconTheme: {
          primary: "#f1f1f1",
          secondary: "#37b84d",
        },
      });
    } catch (error) {
      console.error("Sign up failed:", error);
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
  <title>Sign Up | Helios Docs</title>
  <meta name="description" content="Sign Up Helios Docs" />
</svelte:head>

<a href="/signin" class="backbtn" aria-label="Back">
  <i class="fa-solid fa-arrow-left"></i>
</a>
<div class="login-wrapper">
  <div class="login">
    <h1><span>Sign Up</span></h1>
    <div class="user-login-input">
      <i class="fa-solid fa-user-tie"></i>
      <input type="text" bind:value={firstName} placeholder="First Name" />
    </div>
    <div class="user-login-input">
      <i class="fa-solid fa-user-tie"></i>
      <input type="text" bind:value={lastName} placeholder="Last Name" />
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
      <p>Have an existing Account?</p>
      <a href="/signin">Sign In</a>
    </div>
  </div>
</div>
