<script>
  import { onMount } from "svelte";
  export let data;

  onMount(() => {
    console.log(data);
  });
</script>

<p style="color: white;">Document ID: {data.documentId}</p>
