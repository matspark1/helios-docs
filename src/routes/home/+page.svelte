<script>
  import { user } from "../../stores/authStore";
  import Header from "../Header.svelte";
  let currentUser;

  $: user.subscribe((value) => {
    currentUser = value;
  });
</script>

<div class="app-container">
  <Header />
  {#if currentUser}
    <h1 style="display: none">Welcome, {currentUser.displayName}!</h1>
  {:else}
    <h1>Loading...</h1>
  {/if}
</div>
