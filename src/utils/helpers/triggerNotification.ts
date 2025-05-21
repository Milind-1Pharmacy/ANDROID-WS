import notifee, {
  AndroidImportance,
  AndroidStyle,
  AndroidVisibility,
} from '@notifee/react-native';

/**
 * Trigger a styled notification with optional sound/icon/colors.
 */
export const triggerNotification = async (
  title: string,
  body: string,
  options?: {
    android?: {
      channelId?: string;
      sound?: string;
      smallIcon?: string;
      color?: string;
      largeIcon?: string;
      pressActionId?: string;
      style?: {
        type: AndroidStyle;
        picture?: string;
        bigText?: string;
      };
      visibility?: AndroidVisibility;
    };
    ios?: {
      sound?: string;
      badge?: boolean;
    };
  },
) => {
  try {
    await notifee.requestPermission();

    // Default values
    const androidDefaults = {
      channelId: 'default',
      sound: 'pop', // must match res/raw/pop.wav
      smallIcon: 'ic_notification', // must exist in res/drawable
      color: '#4CAF50',
      visibility: AndroidVisibility.PRIVATE,
      largeIcon: 'ic_notification',
    };

    const iosDefaults = {
      sound: 'mixkit-long-pop-2358.wav',
      badge: true,
    };

    const androidOpts = {...androidDefaults, ...(options?.android || {})};
    const iosOpts = {...iosDefaults, ...(options?.ios || {})};

    await notifee.createChannel({
      id: androidOpts.channelId,
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: androidOpts.sound,
    });

    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: androidOpts.channelId,
        smallIcon: androidOpts.smallIcon,
        color: androidOpts.color,
        largeIcon: androidOpts.largeIcon,
        sound: androidOpts.sound,
        pressAction: androidOpts.pressActionId
          ? {id: androidOpts.pressActionId}
          : undefined,
        style: androidOpts.style
          ? androidOpts.style.type === AndroidStyle.BIGPICTURE &&
            androidOpts.style.picture
            ? {
                type: AndroidStyle.BIGPICTURE,
                picture: androidOpts.style.picture,
              }
            : androidOpts.style.type === AndroidStyle.BIGTEXT &&
              androidOpts.style.bigText
            ? {type: AndroidStyle.BIGTEXT, text: androidOpts.style.bigText}
            : undefined
          : undefined,
        visibility: androidOpts.visibility,
      },
      ios: {
        sound: iosOpts.sound,
        foregroundPresentationOptions: {
          badge: iosOpts.badge,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  } catch (err) {
    console.warn('Notification Error:', err);
  }
};
