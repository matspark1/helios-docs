import pfp from "$lib/images/pfp.png";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export async function fetchUserProfilePic(uid) {
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    return userData.photoURL ? userData.photoURL : pfp;
  } else {
    console.log("No user data found, using default profile picture.");
    return pfp;
  }
}
