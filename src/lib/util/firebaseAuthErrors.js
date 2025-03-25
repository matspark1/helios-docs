import toast from "svelte-5-french-toast";

export function handleFirebaseAuthError(error) {
  switch (error.code) {
    case "auth/email-already-exists":
      toast.error("The email address is already in use by another account.");
      break;
    case "auth/email-already-in-use":
      toast.error("The email address is already in use by another account.");
      break;
    case "auth/invalid-email":
      toast.error(
        "The email address is not valid. Please enter a correct email format."
      );
      break;
    case "auth/user-not-found":
      toast.error("No user found with this email address.");
      break;
    case "auth/wrong-password":
      toast.error("Incorrect password. Please try again.");
      break;
    case "auth/user-disabled":
      toast.error("This user account has been disabled.");
      break;
    case "auth/too-many-requests":
      toast.error(
        "Access to this account has been temporarily disabled due to multiple failed login attempts. Try again later."
      );
      break;
    case "auth/operation-not-allowed":
      toast.error(
        "This authentication method is not enabled. Contact support for assistance."
      );
      break;
    case "auth/invalid-credential":
      toast.error("Incorrect username or password. Please try again.");
      break;
    default:
      toast.error("An unknown error occurred. Please try again later.");
  }
}
