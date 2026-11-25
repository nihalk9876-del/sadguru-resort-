import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { api } from './api';

let isInitialized = false;

export async function initPushNotifications({ onNotificationReceived, onNotificationTapped } = {}) {
  // Only execute on native Android / iOS devices
  if (!Capacitor.isNativePlatform()) {
    console.log('[FCM Service] Running in web browser environment. Push notifications active only on native Android/iOS.');
    return { status: 'web_environment' };
  }

  if (isInitialized) {
    return { status: 'already_initialized' };
  }

  try {
    // 1. Create Dedicated Android Notification Channel with Sound & Vibration
    if (Capacitor.getPlatform() === 'android') {
      await PushNotifications.createChannel({
        id: 'sadguru_bookings_channel',
        name: 'Sadguru Resort Bookings & Checkouts',
        description: 'Instant notification alerts for room bookings, allotments, and check-outs',
        importance: 5, // High / Max priority
        visibility: 1, // Public on lockscreen
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#DFB06C'
      });
      console.log('[FCM Service] Android notification channel "sadguru_bookings_channel" created successfully.');
    }

    // 2. Check and Request Permissions
    let permStatus = await PushNotifications.checkPermissions();
    console.log('[FCM Service] Initial notification permission:', permStatus.receive);

    if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[FCM Service] Push notification permission not granted by user.');
      return { status: 'permission_denied' };
    }

    // 3. Setup FCM Event Listeners Before Registration
    await PushNotifications.removeAllListeners();

    // Registration Success
    PushNotifications.addListener('registration', async (token) => {
      console.log('=============================================');
      console.log('[FCM Service] FCM Device Token Generated Successfully:');
      console.log(token.value);
      console.log('=============================================');

      try {
        localStorage.setItem('sadguru_fcm_token', token.value);
        await api.registerDeviceToken({
          token: token.value,
          deviceName: `${Capacitor.getPlatform().toUpperCase()} Device`,
          platform: Capacitor.getPlatform()
        });
        console.log('[FCM Service] Device token synchronized with backend MongoDB database.');
      } catch (err) {
        console.warn('[FCM Service] Error saving device token to backend:', err.message);
      }
    });

    // Registration Error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[FCM Service] Push registration error:', error);
    });

    // Foreground Notification Received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[FCM Service] Push notification received in foreground:', notification);
      if (typeof onNotificationReceived === 'function') {
        onNotificationReceived(notification);
      }
    });

    // Notification Tapped by User
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[FCM Service] User tapped notification action:', action);
      if (typeof onNotificationTapped === 'function') {
        onNotificationTapped(action.notification);
      }
    });

    // 4. Trigger Native FCM Device Registration safely
    try {
      await PushNotifications.register();
      isInitialized = true;
    } catch (regError) {
      console.warn('[FCM Service] Push registration deferred or warning:', regError);
    }

    return { status: 'registered' };
  } catch (err) {
    console.error('[FCM Service] Initialization failure:', err);
    return { status: 'error', error: err.message };
  }
}

export async function unregisterPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const cachedToken = localStorage.getItem('sadguru_fcm_token');
    if (cachedToken) {
      await api.unregisterDeviceToken(cachedToken).catch(() => {});
      localStorage.removeItem('sadguru_fcm_token');
    }
    await PushNotifications.unregister();
    isInitialized = false;
  } catch (e) {
    console.warn('[FCM Service] Unregister notice:', e.message);
  }
}
