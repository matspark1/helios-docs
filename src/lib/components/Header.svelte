<script>
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import { onMount } from "svelte";
  import logo from "$lib/images/heliosRED.png";
  import { openProfileModal } from "$lib/util/profileModal.js";

  let currentUser;
  let profilePic = pfp;

  const handleProfileClick = () => {
    openProfileModal();
  };

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser?.uid) fetchUserProfile(currentUser.uid);
  });

  async function fetchUserProfile(uid) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    profilePic =
      userSnap.exists() && userSnap.data().photoURL
        ? userSnap.data().photoURL
        : pfp;
  }

  onMount(() => {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mobileNav = document.querySelector(".mobile-nav");
    const body = document.body;
    const closeBtn = document.querySelector(".mobile-close");
    const mbProfileBtn = document.querySelector(".mobile-nav-profile-picture");

    const toggleMenu = () => {
      hamburgerMenu.classList.toggle("open");
      mobileNav.classList.toggle("open");
      closeBtn.classList.toggle("open");
      body.classList.toggle("mobile-overflow");
    };

    if (hamburgerMenu) hamburgerMenu.addEventListener("click", toggleMenu);
    if (closeBtn)
      closeBtn.addEventListener("click", () => {
        hamburgerMenu.classList.remove("open");
        mobileNav.classList.remove("open");
        closeBtn.classList.remove("open");
        body.classList.remove("mobile-overflow");
      });
    mbProfileBtn.addEventListener("click", () => {
      hamburgerMenu.classList.remove("open");
      mobileNav.classList.remove("open");
      closeBtn.classList.remove("open");
      body.classList.add("mobile-overflow");
    });
  });
</script>

<nav>
  <div class="desktop-nav">
    <a href="/home" class="navlogo" aria-label="Logo">
      <img src={logo} alt="Logo" />
    </a>
    <div class="nav-links-wrapper">
      <div class="nav-links">
        <div class="link-wrap">
          <a
            href="/docs"
            aria-label="Docs"
            data-tooltip="Documents"
            data-position="right"
          >
            <i class="fa-regular fa-file"></i>
          </a>
        </div>
        <div class="link-wrap">
          <a
            href="/shared"
            aria-label="Shared"
            class="groups"
            data-tooltip="Shared with me"
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
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </a>
        </div>
      </div>
      <div class="nav-chat">
        <div class="link-wrap">
          <a
            href="/"
            aria-label="Chats"
            data-tooltip="Chats"
            data-position="right"
          >
            <i class="fa-regular fa-comment"></i>
          </a>
        </div>
      </div>
    </div>
    <a
      class="nav-profile-picture"
      aria-label="profilebtn"
      data-tooltip="Profile"
      data-position="right"
      on:click={handleProfileClick}
    >
      <img src={profilePic} alt="Profile Picture" />
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
              <path
                d="M9 20H7C5.9 20 5 19.1 5 18V10.92C5 10.34 5.26 9.78 5.7 9.4L10.7 5.12C11.45 4.47 12.55 4.47 13.3 5.12L18.3 9.4C18.74 9.78 19 10.34 19 10.92V18C19 19.1 18.1 20 17 20H15M9 20V14C9 13.45 9.45 13 10 13H14C14.55 13 15 13.45 15 14V20H9Z"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Home
          </a>
        </div>
        <div class="link-wrap">
          <a href="/docs" aria-label="Docs">
            <i class="fa-regular fa-file"></i> Documents
          </a>
        </div>
        <div class="link-wrap">
          <a href="/shared" aria-label="Groups" class="groups">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-users"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Groups
          </a>
        </div>
        <div class="link-wrap">
          <a href="/" aria-label="Chats">
            <i class="fa-regular fa-comment"></i> Your Chats
          </a>
        </div>
      </div>
      <a
        class="mobile-nav-profile-picture"
        aria-label="profilebtn"
        on:click={handleProfileClick}
      >
        <img src={profilePic} alt="Profile Picture" /> Profile
      </a>
    </div>
  </div>
  <div class="mobile-close"></div>
</nav>
