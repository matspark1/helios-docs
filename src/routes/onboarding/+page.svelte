<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/FirebaseConfig";
  let canvas;
  let typedElement;
  let mouse = null;

  // typing effect strings
  const strings = [
    "Your Team. Your Documents. One Platform. ",
    "Chat, Share, and Get Things Done. ",
    "Your Workspace, Your Way. ",
  ];

  let currentStringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;
  let backSpeed = 34;
  let backDelay = 3000;
  let loop = true;
  let cursorChar = "";

  function typeEffect() {
    if (!typedElement) return;

    let currentString = strings[currentStringIndex];
    if (isDeleting) {
      typedElement.innerHTML =
        currentString.substring(0, charIndex) + cursorChar;
      charIndex--;
    } else {
      typedElement.innerHTML =
        currentString.substring(0, charIndex) + cursorChar;
      charIndex++;
    }

    let timeout = isDeleting ? backSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentString.length) {
      timeout = backDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      currentStringIndex = (currentStringIndex + 1) % strings.length;
    }

    setTimeout(typeEffect, timeout);
  }

  onMount(() => {
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // grid config
    let grid = [];
    const gridSpacing = 50;
    let cols, rows;
    const warpRadius = 500;
    const warpAmplitude = 12;

    function initGrid() {
      grid = [];
      cols = Math.floor(width / gridSpacing) + 2;
      rows = Math.floor(height / gridSpacing) + 2;
      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          let x = (i - 1) * gridSpacing;
          let y = (j - 1) * gridSpacing;
          grid[i][j] = { origX: x, origY: y, x, y };
        }
      }
    }

    initGrid();

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    });

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      const scaleX = canvas.width / canvas.clientWidth;
      const scaleY = canvas.height / canvas.clientHeight;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const pt = grid[i][j];
          if (mouse) {
            const adjustedMouseX = mouse.x * scaleX;
            const adjustedMouseY = mouse.y * scaleY;
            const dx = adjustedMouseX - pt.origX;
            const dy = adjustedMouseY - pt.origY;
            const dist = Math.hypot(dx, dy);
            if (dist < warpRadius) {
              const warp = (1 - dist / warpRadius) * warpAmplitude;
              const angle = Math.atan2(dy, dx);
              pt.x = pt.origX + Math.cos(angle) * warp;
              pt.y = pt.origY + Math.sin(angle) * warp;
            } else {
              pt.x = pt.origX;
              pt.y = pt.origY;
            }
          } else {
            pt.x = pt.origX;
            pt.y = pt.origY;
          }
        }
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
      ctx.lineWidth = 1;

      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const pt = grid[i][j];
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          const pt = grid[i][j];
          if (j === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    }

    animate();
    typedElement = document.getElementById("typed");
    typeEffect();
  });
</script>

<svelte:head>
  <title>Helios Docs</title>
  <meta name="description" content="Helios Docs Home Page" />
</svelte:head>

<div class="start-background">
  <div class="start">
    <div class="start-header">
      <h1>Helios <span>Docs</span></h1>
      <div class="type-wrap">
        <span id="typed" class="typed"></span>
        <span class="typed-cursor">|</span>
      </div>
      <a href="/signin">Get Started <i class="fa-solid fa-arrow-right"></i></a>
    </div>
  </div>

  <canvas class="startpage-background" bind:this={canvas}></canvas>
</div>
