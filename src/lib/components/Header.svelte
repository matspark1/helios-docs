<script>
  import logo from "$lib/images/helios.png";
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import { auth } from "$lib/FirebaseConfig";
  import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
  import { onMount } from "svelte";
  let currentUser;
  let profilePic = pfp;

  $: if (currentUser?.uid) {
    fetchUserProfile(currentUser.uid);
  }

  $: user.subscribe((value) => {
    currentUser = value;
  });

  async function fetchUserProfile(uid) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      profilePic = userData.photoURL ? userData.photoURL : pfp;
    } else {
      console.log("No user data found, using default profile picture.");
      profilePic = pfp;
    }
  }

  onMount(() => {
    // MOBILE MENU
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mobileNav = document.querySelector(".mobile-nav");
    const body = document.body;
    const logo = document.querySelector(".mobile-close");

    if (hamburgerMenu) {
      hamburgerMenu.addEventListener("click", function () {
        hamburgerMenu.classList.toggle("open");
        mobileNav.classList.toggle("open");
        logo.classList.toggle("open");
        body.classList.toggle("mobile-overflow");
      });
    }

    if (logo) {
      logo.addEventListener("click", function () {
        if (hamburgerMenu) {
          hamburgerMenu.classList.remove("open");
          mobileNav.classList.remove("open");
          logo.classList.remove("open");
        }
      });
    }
  });
</script>

<nav>
  <div class="desktop-nav">
    <a href="/home" class="navlogo" aria-label="Logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 500 500"
      >
        <image
          xlink:href="data:image/png;base64,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"
          x="0"
          y="0"
          width="500"
          height="500"
        />
      </svg>
    </a>
    <div class="nav-links">
      <div class="link-wrap">
        <a
          href="/"
          aria-label="Docs"
          data-tooltip="Documents"
          data-position="right"><i class="fa-regular fa-file"></i></a
        >
      </div>
      <div class="link-wrap">
        <a
          href="/"
          aria-label="Groups"
          class="groups"
          data-tooltip="Groups"
          data-position="right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-users"
            ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle
              cx="9"
              cy="7"
              r="4"
            ></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path
              d="M16 3.13a4 4 0 0 1 0 7.75"
            ></path></svg
          >
        </a>
      </div>
      <div class="link-wrap">
        <a
          href="/"
          aria-label="Your Chats"
          data-tooltip="Your Chats"
          data-position="right"><i class="fa-regular fa-comment"></i></a
        >
      </div>
    </div>
    <a
      href="/profile"
      class="nav-profile-picture"
      aria-label="profilebtn"
      data-tooltip={currentUser ? currentUser.displayName : "Profile"}
      data-position="right"
    >
      <img src={profilePic} alt="pfp" />
    </a>
  </div>

  <div class="hamburger-menu">
    <span class="line1"></span>
    <span class="line2"></span>
    <span class="line3"></span>
  </div>
  <div class="mobile-nav">
    <div class="mobile-menu">
      <div class="mobile-nav-links">
        <div class="link-wrap">
          <a href="/home" aria-label="Home" class="mb-home">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                <path
                  d="M9 20H7C5.89543 20 5 19.1046 5 18V10.9199C5 10.336 5.25513 9.78132 5.69842 9.40136L10.6984 5.11564C11.4474 4.47366 12.5526 4.47366 13.3016 5.11564L18.3016 9.40136C18.7449 9.78132 19 10.336 19 10.9199V18C19 19.1046 18.1046 20 17 20H15M9 20V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V20M9 20H15"
                  stroke="#f1f1f1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>Home
          </a>
        </div>
        <div class="link-wrap">
          <a href="/" aria-label="Docs"
            ><i class="fa-regular fa-file"></i>Documents</a
          >
        </div>

        <div class="link-wrap">
          <a href="/" aria-label="Groups" class="groups">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-users"
              ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              ></path><circle cx="9" cy="7" r="4"></circle><path
                d="M23 21v-2a4 4 0 0 0-3-3.87"
              ></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
            > Groups
          </a>
        </div>
        <div class="link-wrap">
          <a href="/" aria-label="Your Chats"
            ><i class="fa-regular fa-comment"></i>Your Chats</a
          >
        </div>
      </div>
      <a
        href="/profile"
        class="mobile-nav-profile-picture"
        aria-label="profilebtn"
      >
        <img src={profilePic} alt="pfp" />
        My Profile
      </a>
    </div>
  </div>
  <div class="mobile-close"></div>
</nav>
