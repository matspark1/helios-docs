<script>
  export let editor;

  function isBoldActive() {
    if (!editor) return false;
    const attrs = editor.getAttributes("textStyle");
    return attrs && attrs.fontWeight === "700";
  }

  function toggleBold() {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }
</script>

<div class="tooltip-container">
  <button on:click={toggleBold} class:active={isBoldActive()} aria-label="Bold">
    <i class="fi fi-rs-bold"></i>
  </button>
  <div class="tooltip">Bold</div>
</div>
