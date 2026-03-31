import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { updateNotificationFcmToken } from '../api/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);

  // Request notification permission and get FCM token
  const initializeNotifications = useCallback(async () => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Get current permission
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        // Request FCM token
        const token = await requestForToken();
        if (token) {
          setFcmToken(token);
          // Send token to backend
          await updateNotificationFcmToken(token);
          console.log('FCM token updated successfully');
        }
      } else if (currentPermission === 'default') {
        // Permission not yet requested, will be handled by UI
        console.log('Notification permission not requested yet');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        toast.error('This browser does not support notifications');
        return 'unsupported';
      }

      // Check current permission
      const currentPermission = Notification.permission;
      console.log('Current permission:', currentPermission);

      if (currentPermission === 'denied') {
        toast.error('Notifications are blocked. Please enable them in your browser settings.');
        // Provide instructions for common browsers
        const browserInfo = navigator.userAgent.toLowerCase();
        if (browserInfo.includes('chrome')) {
          toast('📍 Click the lock icon in the address bar → Site settings → Notifications → Allow', { duration: 8000 });
        } else if (browserInfo.includes('firefox')) {
          toast('📍 Click the lock icon in the address bar → Permissions → Notifications → Allow', { duration: 8000 });
        }
        return 'denied';
      }

      if (currentPermission === 'granted') {
        toast.success('Notifications are already enabled!');
        return 'granted';
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        const token = await requestForToken();
        if (token) {
          setFcmToken(token);
          await updateNotificationFcmToken(token);
          toast.success('Notifications enabled! You\'ll receive real-time updates.');
        }
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. You won\'t receive push notifications.');
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return 'error';
    }
  };

  // Handle foreground messages
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = onMessageListener((payload) => {
      console.log('Received foreground message:', payload);
      
      const { notification, data } = payload;
      
      // Show toast notification for foreground messages
      if (notification?.title) {
        toast.success(`${notification.title}: ${notification.body}`, {
          duration: 5000,
          icon: '🔔',
        });
      }
      
      // Dispatch custom event for UI update
      window.dispatchEvent(new CustomEvent('newNotification', { detail: payload }));
    });

    return unsubscribe;
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const value = {
    fcmToken,
    permission,
    isInitialized,
    requestPermission,
    initializeNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
