import { writable } from "svelte/store";

export const profileModalVisible = writable(false);

export function openProfileModal() {
  profileModalVisible.set(true);
}

export function closeProfileModal() {
  profileModalVisible.set(false);
}

export function toggleProfileModal() {
  profileModalVisible.update((visible) => !visible);
}
