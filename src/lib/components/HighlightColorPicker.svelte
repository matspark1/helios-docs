<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  export let editor;
  export let defaultColor = "#ffff00";
  let colorValue = defaultColor;

  function openPicker() {
    if (browser) {
      document.getElementById("highlight-color-input").click();
    }
  }

  function applyHighlightColor() {
    if (editor) {
      editor.chain().focus().toggleHighlight({ color: colorValue }).run();
    }
  }

  onMount(async () => {
    if (browser) {
      const { init, setInstance } = await import("@melloware/coloris");
      init();
      setInstance("#highlight-color-input", {
        alpha: true,
        inline: true,
        formatToggle: true,
        clearButton: false,
        closeButton: false,
        themeMode: document.body.classList.contains("dark-theme")
          ? "dark"
          : "light",
        swatches: [
          "transparent",
          "#FFF176",
          "#FFECB3",
          "#C8E6C9",
          "#BBDEFB",
          "#D1C4E9",
          "#FFCDD2",
          "#FFE0B2",
          "#B2DFDB",
          "#E0F7FA",
          "#F0F4C3",
        ],
      });
    }
  });
</script>

<button
  on:click={openPicker}
  aria-label="Highlight Color"
  class="hightlightcolor"
>
  <i class="fi fi-bs-highlighter"></i>
  <div class="color-bg" style="background-color: {colorValue};"></div>
</button>

<input
  type="text"
  id="highlight-color-input"
  data-coloris
  bind:value={colorValue}
  on:change={applyHighlightColor}
  style="opacity: 0; width: 0; height: 0; border: none; position: absolute; top: 24px; left: 0"
/>

<div class="tooltip">Highlight Color</div>
