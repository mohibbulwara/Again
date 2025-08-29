
import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks'; 
import { toast } from '@/hooks/use-toast';

export function useFcmToken() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    async function requestPermission() {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted' && user) {
          const messaging = getMessaging();
          const currentToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
          
          if (currentToken) {
            setToken(currentToken);
            await setDoc(doc(db, 'fcmTokens', user.id), { token: currentToken, userId: user.id }, { merge: true });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    }

    if (user) {
      requestPermission();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging();
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: 'https://res.cloudinary.com/drewes4b7/image/upload/v1754783345/Untitled_design_hzm7wn.png' // Your app's logo
        };

        toast({
          title: notificationTitle,
          description: notificationOptions.body,
        });
        
        if (notificationPermission === 'granted') {
           navigator.serviceWorker.getRegistration().then((reg) => {
             if (reg) {
               reg.showNotification(notificationTitle, notificationOptions);
             }
           });
        }
      });
      return () => unsubscribe();
    }
  }, [notificationPermission]);

  return { token, notificationPermission };
}
