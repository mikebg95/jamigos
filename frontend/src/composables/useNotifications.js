import { ref } from 'vue';

const isNotificationsOpen = ref(false);

export function useNotifications() {
  const openNotifications = () => {
    isNotificationsOpen.value = true;
  };

  const closeNotifications = () => {
    isNotificationsOpen.value = false;
  };

  const toggleNotifications = () => {
    isNotificationsOpen.value = !isNotificationsOpen.value;
  };

  return {
    isNotificationsOpen,
    openNotifications,
    closeNotifications,
    toggleNotifications
  };
}
