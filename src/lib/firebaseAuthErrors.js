import toast from "svelte-french-toast";

export function handleFirebaseAuthError(error) {
  switch (error.code) {
    case "auth/email-already-exists":
      toast.error("The email address is already in use by another account.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      break;
    case "auth/invalid-email":
      toast.error(
        "The email address is not valid. Please enter a correct email format.",
        {
          duration: 7500,
          style:
            "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
          iconTheme: {
            primary: "#F1f1f1",
            secondary: "#c61a34",
          },
        }
      );
      break;
    case "auth/user-not-found":
      toast.error("No user found with this email address.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      break;
    case "auth/wrong-password":
      toast.error("Incorrect password. Please try again.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      break;
    case "auth/user-disabled":
      toast.error("This user account has been disabled.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      break;
    case "auth/too-many-requests":
      toast.error(
        "Access to this account has been temporarily disabled due to multiple failed login attempts. Try again later.",
        {
          duration: 7500,
          style:
            "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
          iconTheme: {
            primary: "#F1f1f1",
            secondary: "#c61a34",
          },
        }
      );
      break;
    case "auth/operation-not-allowed":
      toast.error(
        "This authentication method is not enabled. Contact support for assistance.",
        {
          duration: 7500,
          style:
            "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
          iconTheme: {
            primary: "#F1f1f1",
            secondary: "#c61a34",
          },
        }
      );
      break;
    case "auth/invalid-credential":
      toast.error("Incorrect username or password. Please try again.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
      break;
    default:
      toast.error("An unknown error occurred. Please try again later.", {
        duration: 7500,
        style:
          "border-radius: 40px; padding: 16px; color: #c61a34; background-color: #c61a34; color: #f1f1f1; font-weight: 600; font-size: 14px",
        iconTheme: {
          primary: "#F1f1f1",
          secondary: "#c61a34",
        },
      });
  }
}
