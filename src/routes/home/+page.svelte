<script>
  import { user } from "../../stores/authStore";
  import Header from "../Header.svelte";
  let currentUser;

  $: user.subscribe((value) => {
    currentUser = value;
  });
</script>

{#if currentUser}
  <h1>Welcome, {currentUser.displayName}!</h1>
{:else}
  <h1>Loading...</h1>
{/if}
