import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Linking, Platform} from 'react-native';

const customDeeplinkHandles: {
  [key: string]: {
    action: Function;
  };
} = {
  'onepharmacy://category': {
    action: (navigation: NativeStackNavigationProp<RootStackParamList>) =>
      navigation.navigate('DynamicGridScreen', {listByType: 'category'}),
  },
  'onepharmacy://brand': {
    action: (navigation: NativeStackNavigationProp<RootStackParamList>) =>
      navigation.navigate('DynamicGridScreen', {listByType: 'brand'}),
  },
};

export const fireDeeplink = (
  url: string,
  navigation?: NativeStackNavigationProp<RootStackParamList>,
) => {
  const customDeeplinkHandle = customDeeplinkHandles[url];

  if (customDeeplinkHandle) {
    customDeeplinkHandle.action(navigation);

    return;
  }

  Linking.openURL.call(
    Linking,
    Platform.OS === 'web'
      ? url.replace('onepharmacy://', 'https://webstore.1pharmacy.io/')
      : url,
  );
};
