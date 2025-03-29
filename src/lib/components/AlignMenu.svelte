<script>
  import { onMount, onDestroy } from "svelte";
  export let editor;
  import { clickOutside } from "$lib/util/clickOutside";

  let currentAlignment = "left";
  let isOpen = false;
  let updateAlignment;

  function closeDropdown() {
    isOpen = false;
  }

  // Update the currentAlignment based on the editor’s state
  function checkAlignment() {
    if (!editor) return;
    if (editor.isActive({ textAlign: "justify" })) {
      currentAlignment = "justify";
    } else if (editor.isActive({ textAlign: "right" })) {
      currentAlignment = "right";
    } else if (editor.isActive({ textAlign: "center" })) {
      currentAlignment = "center";
    } else {
      currentAlignment = "left";
    }
  }

  function setAlignment(alignment) {
    editor.chain().focus().setTextAlign(alignment).run();
    isOpen = false;
  }

  onMount(() => {
    if (editor) {
      updateAlignment = () => {
        checkAlignment();
      };
      editor.on("transaction", updateAlignment);
      editor.on("selectionUpdate", updateAlignment);
      editor.on("focus", updateAlignment);
      checkAlignment();
    }
  });

  onDestroy(() => {
    if (editor && updateAlignment) {
      editor.off("transaction", updateAlignment);
      editor.off("selectionUpdate", updateAlignment);
      editor.off("focus", updateAlignment);
    }
  });
</script>

<div class="align-menu">
  <button
    class="align-menu__button"
    on:click={() => (isOpen = !isOpen)}
    aria-label="Text Alignment"
  >
    {#if currentAlignment === "left"}
      <i class="fi fi-br-align-left"></i>
    {:else if currentAlignment === "center"}
      <i class="fi fi-br-align-center"></i>
    {:else if currentAlignment === "right"}
      <i class="fi fi-br-symbol"></i>
    {:else}
      <i class="fi fi-br-align-justify"></i>
    {/if}
    <span class="align-menu__arrow">&#9662;</span>
  </button>

  {#if isOpen}
    <div
      class="align-menu__dropdown"
      use:clickOutside
      on:outclick={closeDropdown}
    >
      <button class="align-menu__option" on:click={() => setAlignment("left")}>
        <i class="fi fi-br-align-left"></i> Left
      </button>
      <button
        class="align-menu__option"
        on:click={() => setAlignment("center")}
      >
        <i class="fi fi-br-align-center"></i> Center
      </button>
      <button class="align-menu__option" on:click={() => setAlignment("right")}>
        <i class="fi fi-br-symbol"></i> Right
      </button>
      <button
        class="align-menu__option"
        on:click={() => setAlignment("justify")}
      >
        <i class="fi fi-br-align-justify"></i> Justify
      </button>
    </div>
  {/if}

  <div class="tooltip">Text Align</div>
</div>
