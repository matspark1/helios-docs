<script>
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import { auth } from "$lib/FirebaseConfig";
  import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
  import { onMount } from "svelte";
  import logo from "$lib/images/heliosRED.png";
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
      <img src={logo} alt="" />
    </a>
    <div class="nav-links-wrapper">
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
              ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              ></path><circle cx="9" cy="7" r="4"></circle><path
                d="M23 21v-2a4 4 0 0 0-3-3.87"
              ></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
            >
          </a>
        </div>
      </div>
      <div class="nav-chat">
        <div class="link-wrap">
          <a
            href="/"
            aria-label="Your Chats"
            data-tooltip="Your Chats"
            data-position="right"><i class="fa-regular fa-comment"></i></a
          >
        </div>
      </div>
    </div>

    <a
      href="/profile"
      class="nav-profile-picture"
      aria-label="profilebtn"
      data-tooltip="My Profile"
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
                  stroke="currentColor"
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
