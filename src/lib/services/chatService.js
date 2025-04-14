import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import { fetchUserProfilePic } from "../util/getProfilePicture";
import toast from "svelte-5-french-toast";

export async function sendChatMessage(documentId, message) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to send messages");

    await addDoc(collection(db, "chats"), {
      documentId,
      senderId: user.uid,
      senderName: user.displayName || "Anonymous",
      message,
      timestamp: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export function subscribeToChat(documentId, callback) {
  const chatsQuery = query(
    collection(db, "chats"),
    where("documentId", "==", documentId),
    orderBy("timestamp", "asc"),
    limit(100)
  );

  return onSnapshot(
    chatsQuery,
    async (snapshot) => {
      const messages = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();

        try {
          let profilePic = "/default-avatar.png";

          if (data.senderId) {
            try {
              profilePic = await fetchUserProfilePic(data.senderId);
            } catch (error) {
              console.error("Error fetching profile pic:", error);
            }
          }

          messages.push({
            id: doc.id,
            ...data,
            profilePic,
          });
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }

      callback(messages);
    },
    (error) => {
      console.error("Error in chat subscription:", error);
    }
  );
}
