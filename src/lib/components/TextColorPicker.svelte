<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  export let editor;
  export let defaultColor = "#000000";
  let colorValue = defaultColor;

  function openPicker() {
    if (browser) {
      document.getElementById("text-color-input").click();
    }
  }

  function applyTextColor() {
    if (editor) {
      editor.chain().focus().setColor(colorValue).run();
    }
  }

  onMount(async () => {
    if (browser) {
      const { init, setInstance } = await import("@melloware/coloris");
      init();
      setInstance("#text-color-input", {
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
          "#000",
          "#fff",
          "#34D399",
          "#60A5FA",
          "#A78BFA",
          "#FB7185",
          "#F59E0B",
          "#10B981",
          "#3B82F6",
          "#8B5CF6",
        ],
      });
    }
  });
</script>

<button on:click={openPicker} aria-label="Text Color" class="textcolor">
  <p>A</p>
  <div class="color-bg" style="background-color: {colorValue};"></div>
</button>
<input
  type="text"
  id="text-color-input"
  data-coloris
  bind:value={colorValue}
  on:change={applyTextColor}
  style="opacity: 0; width: 0; height: 0; border: none; position: absolute;"
/>
<div class="tooltip">Text Color</div>
