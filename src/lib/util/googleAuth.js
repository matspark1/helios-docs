import {
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import toast, { Toaster } from "svelte-5-french-toast";

export const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // check if user exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      const profilePicture = generateInitialsAvatar(user.displayName);

      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: profilePicture,
          googleProvider: true,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });

        await updateProfile(user, {
          photoURL: profilePicture,
        });

        await user.reload();

        toast.success("Your Account Has Been Created!", {
          duration: 5000,
          style:
            "border-radius: 40px; padding: 16px; background-color: #37b84d; color: #f1f1f1; font-weight: 600",
          iconTheme: {
            primary: "#f1f1f1",
            secondary: "#37b84d",
          },
        });
      } catch (firestoreError) {
        console.error("Firestore write failed:", firestoreError);
        toast.error(
          "Sign-in successful but profile sync failed. Please try again later."
        );
        return;
      }
    } else {
      toast.success("Welcome Back", {
        duration: 5000,
        style:
          "border-radius: 40px; padding: 16px; background-color: #37b84d; color: #f1f1f1; font-weight: 600",
        iconTheme: {
          primary: "#f1f1f1",
          secondary: "#37b84d",
        },
      });
    }
  } catch (error) {
    console.error("Google sign-in failed:", error);
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.log("Popup closed");
    } else {
      handleFirebaseAuthError(error);
    }
  }
};

function generateInitialsAvatar(name) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=101010&size=100`;
}
