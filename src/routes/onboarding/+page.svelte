<script>
  import { onMount } from "svelte";
  let canvas;
  let typedElement;
  let mouse = null;

  const strings = [
    "Your Team. Your Documents. One Platform. ",
    "Chat, Share, and Get Things Done. ",
    "Your Workspace, Your Way. ",
  ];

  let currentStringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 80;
  const backSpeed = 34;
  const backDelay = 3000;
  const cursorChar = "";

  function typeEffect() {
    if (!typedElement) return;

    const currentString = strings[currentStringIndex];
    typedElement.innerHTML = currentString.substring(0, charIndex) + cursorChar;

    charIndex += isDeleting ? -1 : 1;
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
    let canvasColor = "";
    const savedTheme = localStorage.getItem("user-theme") || "system";

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      canvasColor = prefersDark
        ? "rgba(255, 255, 255, 0.16)"
        : "rgba(0, 0, 0, 0.16)";
    };

    const applySavedTheme = () => {
      if (savedTheme === "dark") {
        canvasColor = "rgba(255, 255, 255, 0.16)";
      } else if (savedTheme === "light") {
        canvasColor = "rgba(0, 0, 0, 0.16)";
      } else {
        applySystemTheme();
      }
    };

    applySavedTheme();

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const gridSpacing = 50;
    const warpRadius = 500;
    const warpAmplitude = 12;
    let grid = [];
    let cols, rows;

    function initGrid() {
      grid = [];
      cols = Math.floor(width / gridSpacing) + 2;
      rows = Math.floor(height / gridSpacing) + 2;
      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          const x = (i - 1) * gridSpacing;
          const y = (j - 1) * gridSpacing;
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

      grid.forEach((col) => {
        col.forEach((pt) => {
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
        });
      });

      ctx.strokeStyle = canvasColor;
      ctx.lineWidth = 1;

      grid.forEach((col, i) => {
        ctx.beginPath();
        col.forEach((pt, j) => {
          j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      });

      for (let j = 0; j < grid[0].length; j++) {
        ctx.beginPath();
        for (let i = 0; i < grid.length; i++) {
          const pt = grid[i][j];
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
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
