<script>
  import { createEventDispatcher } from "svelte";

  export let maxRows = 10;
  export let maxCols = 10;

  let showPicker = false;

  let hoverRows = 0;
  let hoverCols = 0;

  const dispatch = createEventDispatcher();

  function togglePicker() {
    showPicker = !showPicker;
  }

  function handleHover(r, c) {
    hoverRows = r;
    hoverCols = c;
  }

  function handleSelection() {
    dispatch("insertTable", { rows: hoverRows, cols: hoverCols });
    showPicker = false;
  }
</script>

<button on:click={togglePicker} aria-label="Insert Table">
  <i class="fa-solid fa-table"></i>
</button>

{#if showPicker}
  <div class="table-picker">
    <div class="grid">
      {#each Array(maxRows) as _, row}
        <div class="row">
          {#each Array(maxCols) as __, col}
            <div
              class="cell"
              style="background: {row < hoverRows && col < hoverCols
                ? 'var(--blue)'
                : 'var(--white)'}"
              on:mouseenter={() => handleHover(row + 1, col + 1)}
              on:click={handleSelection}
            />
          {/each}
        </div>
      {/each}
    </div>
    <p>
      {hoverRows} Rows × {hoverCols} Columns
    </p>
  </div>
{/if}
