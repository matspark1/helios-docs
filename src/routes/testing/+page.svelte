<script>
  import toast, { Toaster } from "svelte-french-toast";

  function handleClick() {
    toast.error("Incorrect password. Please try again.", {
      duration: 10000,
      style:
        "border-radius: 40px; padding: 16px; color: #c61a34;background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
      iconTheme: {
        primary: "#F1f1f1",
        secondary: "#c61a34",
      },
    });
  }
  function handleClick2() {
    toast.success("Successfully Signed In!", {
      duration: 300000,
      style:
        "border-radius: 40px; padding: 16px; color: #3ec956;background-color: #3ec956; color: #f1f1f1; font-weight: 600",
      iconTheme: {
        primary: "#f1f1f1",
        secondary: "#3ec956",
      },
    });
  }
</script>

#37b84d
<button type="button" on:click={handleClick}>Toast</button>
<button type="button" on:click={handleClick2}>Toast</button>
