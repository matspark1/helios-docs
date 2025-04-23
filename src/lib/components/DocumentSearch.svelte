<script>
  import { createEventDispatcher } from "svelte";

  export let placeholder = "Search documents...";
  export let value = "";

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    value = event.target.value;
    dispatch("search", value);
  }

  function clearSearch() {
    value = "";
    dispatch("search", value);
  }
</script>

<div class="docs-search">
  <i class="fa-solid fa-magnifying-glass"></i>
  <input
    type="text"
    class="docs-search-input"
    {placeholder}
    bind:value
    on:input={handleInput}
  />
  {#if value}
    <button
      class="clear-search"
      on:click={clearSearch}
      aria-label="Clear search"
    >
      <i class="fa-solid fa-times"></i>
    </button>
  {/if}
</div>

<style>
  .clear-search {
    position: absolute;
    right: 50px;
    top: 47px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray);
    padding: 0;
    font-size: 14px;
  }
</style>
