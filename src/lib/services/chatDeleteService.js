import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import toast from "svelte-5-french-toast";

/**
 * Delete a chat message
 * @param {string} messageId 
 * @returns {Promise<boolean>} 
 */
export async function deleteChatMessage(messageId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to delete messages");
      return false;
    }

    const messageRef = doc(db, "chats", messageId);

    await deleteDoc(messageRef);

    toast.success("Message deleted");
    return true;
  } catch (error) {
    console.error("Error deleting chat message:", error);
    toast.error("Failed to delete message");
    return false;
  }
}
