<script>
  import toast, { Toaster } from "svelte-5-french-toast";

  function handleClick() {
    toast.error("Incorrect password. Please try again.", {});
  }
  function handleClick2() {
    toast.success("Successfully Signed In!", {});
  }
  const handleClick3 = async () => {
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        console.log("hello world");

        resolve();
      } catch (error) {
        console.error("Error updating profile:", error);
        reject(error);
      }
    });

    toast.promise(
      updatePromise,
      {
        loading: "Updating profile...",
        success: "Profile updated successfully",
        error: "Error updating profile",
      },
      {
        duration: 6000,
        style: "z-index: 99999;",
      }
    );

    await updatePromise;
  };
</script>

<button type="button" on:click={handleClick}>Failed</button>
<button type="button" on:click={handleClick2}>Success</button>
<button type="button" on:click={handleClick3}>Promise</button>
