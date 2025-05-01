<script>
  import { user } from "../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import meta from "$lib/images/meta.png";
  import { page } from "$app/stores";

  const errorMessages = {
    400: {
      title: "Bad Request",
      message: "The request could not be understood by the server.",
    },
    401: {
      title: "Unauthorized",
      message: "Authentication is required to access this resource.",
    },
    403: {
      title: "Access Forbidden",
      message: "You do not have permission to view this document.",
    },
    404: {
      title: "Not Found",
      message: "The page you're looking for doesn't exist or has been moved.",
    },
    500: {
      title: "Internal Server Error",
      message: "Something went wrong on our end. Please try again later.",
    },
    502: {
      title: "Bad Gateway",
      message:
        "The server received an invalid response from the upstream server.",
    },
    503: {
      title: "Service Unavailable",
      message:
        "Our service is temporarily unavailable. Please try again later.",
    },
    504: {
      title: "Gateway Timeout",
      message: "The server timed out waiting for the request.",
    },
  };

  $: statusCode = $page.status;
  $: errorMessage = $page.error?.message || "";

  $: errorDetails = errorMessages[statusCode] || {
    title: "Error",
    message: "An unexpected error occurred.",
  };

  let currentUser;

  $: user.subscribe((value) => {
    currentUser = value;
  });
</script>

<svelte:head>
  <title>Error {statusCode} - {errorDetails.title}</title>
  <meta
    name="description"
    content="Error {statusCode} - {errorDetails.title}"
  />
  <meta
    name="keywords"
    content="document editor, team collaboration, online docs, real-time editing, document management"
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Error | Helios Docs" />
  <meta
    property="og:description"
    content="Error {statusCode} - {errorDetails.title}"
  />
  <meta property="og:image" content={meta} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Helios Docs" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Error | Helios Docs" />
  <meta
    name="twitter:description"
    content="Error {statusCode} - {errorDetails.title}"
  />
  <meta name="twitter:image" content={meta} />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      <div class="error-wrapper">
        <h1>{statusCode}</h1>
        <h3>{errorDetails.title}</h3>
        <p>{errorDetails.message}</p>
        <a href="/docs" class="error-back">Go Back</a>
      </div>
    </div>
  </div>
</div>
