<script>
  export let editor;
  import { clickOutside } from "$lib/util/clickOutside";

  const options = [
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
  ];

  let selected = "1";
  let isOpen = false;

  $: if (editor) {
    const attrs = editor.getAttributes("paragraph");
    selected = attrs.lineSpacing || "1";
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  function selectOption(option) {
    selected = option.value;
    editor?.commands.setLineSpacing(option.value);
    isOpen = false;
  }
</script>

<div class="align-menu" use:clickOutside on:outclick={closeDropdown}>
  <button class="align-menu__button" on:click={toggleDropdown}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      version="1.1"
      style="width: 20px; height: 20px;"
    >
      <path d="" stroke="none" fill="currentColor" fill-rule="evenodd" />
      <path
        d="M 88.411 81.569 C 86.713 82.408, 73.594 94.885, 59.258 109.297 C 36.866 131.807, 33.033 136.099, 32.058 139.750 C 30.541 145.430, 32.168 151.368, 36.400 155.600 C 39.546 158.746, 46.433 161.444, 49.143 160.593 C 49.889 160.359, 51.800 159.880, 53.389 159.530 C 55.240 159.121, 60.541 154.720, 68.139 147.281 L 80 135.671 80 256.068 L 80 376.466 69.250 365.834 C 56.684 353.406, 53.670 351.585, 46.760 352.249 C 35.274 353.353, 28.564 365.441, 33.814 375.574 C 36.362 380.492, 85.486 429.496, 89.315 430.939 C 92.920 432.298, 99.080 432.298, 102.685 430.939 C 106.514 429.496, 155.638 380.492, 158.186 375.574 C 163.436 365.441, 156.726 353.353, 145.240 352.249 C 138.330 351.585, 135.316 353.406, 122.750 365.834 L 112 376.466 112 256 L 112 135.534 122.750 146.166 C 135.316 158.594, 138.330 160.415, 145.240 159.751 C 156.726 158.647, 163.436 146.559, 158.186 136.426 C 155.638 131.508, 106.514 82.504, 102.685 81.061 C 98.678 79.551, 92.022 79.788, 88.411 81.569 M 216.500 107.896 C 208.240 111.720, 203.986 118.989, 204.022 129.218 C 204.047 136.420, 206.256 142.101, 210.624 146.197 C 217.172 152.338, 209.739 152.002, 338.718 151.978 C 451.229 151.957, 456.679 151.873, 460.500 150.104 C 468.684 146.315, 473 139.028, 473 129 C 473 118.972, 468.684 111.685, 460.500 107.896 C 456.678 106.126, 451.249 106.044, 338.500 106.044 C 225.751 106.044, 220.322 106.126, 216.500 107.896 M 216.500 236.896 C 208.240 240.720, 203.986 247.989, 204.022 258.218 C 204.047 265.420, 206.256 271.101, 210.624 275.197 C 217.172 281.338, 209.739 281.002, 338.718 280.978 C 451.229 280.957, 456.679 280.873, 460.500 279.104 C 468.684 275.315, 473 268.028, 473 258 C 473 247.972, 468.684 240.685, 460.500 236.896 C 456.678 235.126, 451.249 235.044, 338.500 235.044 C 225.751 235.044, 220.322 235.126, 216.500 236.896 M 216.500 362.896 C 208.240 366.720, 203.986 373.989, 204.022 384.218 C 204.047 391.420, 206.256 397.101, 210.624 401.197 C 217.172 407.338, 209.739 407.002, 338.718 406.978 C 451.229 406.957, 456.679 406.873, 460.500 405.104 C 468.684 401.315, 473 394.028, 473 384 C 473 373.972, 468.684 366.685, 460.500 362.896 C 456.678 361.126, 451.249 361.044, 338.500 361.044 C 225.751 361.044, 220.322 361.126, 216.500 362.896"
        stroke="none"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </svg>
    <span class="align-menu__arrow">&#9662;</span>
  </button>
  {#if isOpen}
    <div class="align-menu__dropdown">
      {#each options as option}
        <button
          class="align-menu__option"
          on:click={() => selectOption(option)}
        >
          {#if option.value === selected}
            <i
              class="fi fi-br-check"
              style="font-size: 12px; margin-top: 4px; color: var(--green);"
            ></i>{/if}
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
<div class="tooltip">Line Spacing</div>
