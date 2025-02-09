import { getFirestore, doc, getDoc } from "firebase/firestore";

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getUserData(uid) {
  const db = getFirestore();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists() && userSnap.data().createdAt
    ? userSnap.data().createdAt
    : "";
}
