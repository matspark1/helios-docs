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
  import meta from "$lib/images/meta.png";

  let firstName = "";
  let lastName = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let showPassword = false;
  let showConfirmPassword = false;

  // Password validation states
  let passwordValid = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  };

  let formErrors = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  $: {
    passwordValid.minLength = password.length >= 8;
    passwordValid.hasUppercase = /[A-Z]/.test(password);
    passwordValid.hasLowercase = /[a-z]/.test(password);
    passwordValid.hasNumber = /[0-9]/.test(password);
  }

  $: passwordsMatch = password === confirmPassword;

  function generateInitialsAvatar(name) {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=101010&size=300`;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm() {
    let isValid = true;

    formErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!firstName.trim()) {
      formErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!lastName.trim()) {
      formErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!email.trim()) {
      formErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      formErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      formErrors.password = "Password is required";
      isValid = false;
    } else if (
      !passwordValid.minLength ||
      !passwordValid.hasUppercase ||
      !passwordValid.hasLowercase ||
      !passwordValid.hasNumber
    ) {
      formErrors.password = "Password does not meet all requirements";
      isValid = false;
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    return isValid;
  }

  const signUp = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        duration: 3000,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      return;
    }

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

      firstName = "";
      lastName = "";
      email = "";
      password = "";
      confirmPassword = "";
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

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }
</script>

<svelte:head>
  <title>Sign Up | Helios Docs</title>
  <meta
    name="description"
    content="Create your account to start editing and collaborating on documents in real-time with your team."
  />
  <meta
    name="keywords"
    content="document library, document management, create documents, search documents, helios docs"
  />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://heliosdocs.com/signup" />
  <meta property="og:title" content="Sign Up | Helios Docs" />
  <meta
    property="og:description"
    content="Join Helios Docs today. Create your account to start editing and collaborating on documents in real-time with your team."
  />
  <meta property="og:image" content={meta} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Helios Docs" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://heliosdocs.com/signup" />
  <meta name="twitter:title" content="Sign Up | Helios Docs" />
  <meta
    name="twitter:description"
    content="Join Helios Docs today. Create your account to start editing and collaborating on documents in real-time with your team."
  />
  <meta name="twitter:image" content={meta} />
</svelte:head>

<a href="/signin" class="backbtn" aria-label="Back">
  <i class="fa-solid fa-arrow-left"></i>
</a>
<div class="login-wrapper2">
  <div class="login">
    <h1><span>Sign Up</span></h1>

    <div class="user-login-input">
      <i class="fa-solid fa-user-tie"></i>
      <input type="text" bind:value={firstName} placeholder="First Name" />
      {#if formErrors.firstName}
        <div class="error-message">{formErrors.firstName}</div>
      {/if}
    </div>

    <div class="user-login-input">
      <i class="fa-solid fa-user-tie"></i>
      <input type="text" bind:value={lastName} placeholder="Last Name" />
      {#if formErrors.lastName}
        <div class="error-message">{formErrors.lastName}</div>
      {/if}
    </div>

    <div class="user-login-input">
      <i class="fa-solid fa-envelope"></i>
      <input type="email" bind:value={email} placeholder="Email" />
      {#if formErrors.email}
        <div class="error-message">{formErrors.email}</div>
      {/if}
    </div>

    <div class="user-login-input">
      <i class="fa-solid fa-lock"></i>
      <input
        type={showPassword ? "text" : "password"}
        bind:value={password}
        placeholder="Password"
      />
      <button
        class="password-toggle"
        on:click={togglePasswordVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <i class={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}
        ></i>
      </button>
      {#if formErrors.password}
        <div class="error-message">{formErrors.password}</div>
      {/if}
    </div>

    <div class="user-login-input">
      <i class="fa-solid fa-lock"></i>
      <input
        type={showConfirmPassword ? "text" : "password"}
        bind:value={confirmPassword}
        placeholder="Confirm Password"
      />
      <button
        class="password-toggle"
        on:click={toggleConfirmPasswordVisibility}
        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
      >
        <i
          class={showConfirmPassword
            ? "fa-solid fa-eye-slash"
            : "fa-solid fa-eye"}
        ></i>
      </button>
      {#if formErrors.confirmPassword}
        <div class="error-message">{formErrors.confirmPassword}</div>
      {/if}
    </div>

    <div class="password-requirements">
      <p>Password must have:</p>
      <ul>
        <li class={passwordValid.minLength ? "valid" : "invalid"}>
          <i
            class={passwordValid.minLength
              ? "fa-solid fa-check"
              : "fa-solid fa-xmark"}
          ></i>
          At least 8 characters
        </li>
        <li class={passwordValid.hasUppercase ? "valid" : "invalid"}>
          <i
            class={passwordValid.hasUppercase
              ? "fa-solid fa-check"
              : "fa-solid fa-xmark"}
          ></i>
          At least one uppercase letter
        </li>
        <li class={passwordValid.hasLowercase ? "valid" : "invalid"}>
          <i
            class={passwordValid.hasLowercase
              ? "fa-solid fa-check"
              : "fa-solid fa-xmark"}
          ></i>
          At least one lowercase letter
        </li>
        <li class={passwordValid.hasNumber ? "valid" : "invalid"}>
          <i
            class={passwordValid.hasNumber
              ? "fa-solid fa-check"
              : "fa-solid fa-xmark"}
          ></i>
          At least one number
        </li>
      </ul>
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

<style>
  .user-login-input {
    position: relative;
    margin-bottom: 1rem;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    i {
      margin-top: 20px;
      position: relative;
    }
  }

  .password-toggle:hover {
    color: #000;
  }

  .error-message {
    color: #c61a34;
    font-size: 12px;
    margin-top: 4px;
    text-align: left;
  }

  .password-requirements {
    margin: 10px 0 10px;
    text-align: left;
    font-size: 12px;
  }

  .password-requirements p {
    margin-bottom: 5px;
    font-weight: 600;
  }

  .password-requirements ul {
    list-style: none;
    padding-left: 5px;
  }

  .password-requirements li {
    margin-bottom: 3px;
    display: flex;
    align-items: center;
  }

  .password-requirements li i {
    margin-right: 5px;
    width: 15px;
  }

  .password-requirements .valid {
    color: #37b84d;
  }

  .password-requirements .invalid {
    color: #888;
  }

  .login.light .password-requirements .invalid {
    color: #aaa;
  }
</style>
