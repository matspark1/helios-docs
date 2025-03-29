<script>
  export let editor;
  import { clickOutside } from "$lib/util/clickOutside";

  let isOpen = false;
  let linkUrl = "";
  let inputEl;

  function openDropdown() {
    isOpen = true;
    if (editor) {
      const attrs = editor.getAttributes("link");
      linkUrl = attrs.href || "";
    }
    setTimeout(() => {
      if (inputEl) inputEl.focus();
    }, 0);
  }

  function closeDropdown() {
    isOpen = false;
    linkUrl = "";
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      setLink();
    } else if (event.key === "Escape") {
      closeDropdown();
    }
  }

  function setLink() {
    if (!editor) return;
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      try {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl })
          .run();
      } catch (error) {
        alert(error.message);
      }
    }
    closeDropdown();
  }
</script>

<div class="link-dropdown">
  <button
    class="dropdown-button"
    on:click={openDropdown}
    aria-label="Insert Link"
  >
    <i class="fi fi-br-link"></i>
  </button>
  {#if isOpen}
    <div class="dropdown-menu" use:clickOutside on:outclick={closeDropdown}>
      <input
        type="text"
        placeholder="Paste link here..."
        bind:value={linkUrl}
        on:keydown={handleKeyDown}
        bind:this={inputEl}
        class="dropdown-input"
      />
      <div class="dropdown-actions">
        <button class="button ok" on:click={setLink}>OK</button>
        <button class="button cancel" on:click={closeDropdown}>Cancel</button>
      </div>
    </div>
  {/if}
</div>
<div class="tooltip">Insert Link</div>
