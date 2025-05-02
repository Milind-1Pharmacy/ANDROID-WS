import {Platform} from 'react-native';

export const _1P_LOGO =
  Platform.OS === 'web'
    ? {
        uri: 'https://s3.ap-south-1.amazonaws.com/webstore.urmedz.com/1p_logo.png',
      }
    : require('@assets/1p_logo.png');
