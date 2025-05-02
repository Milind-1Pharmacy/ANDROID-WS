
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIPost from '../APIHandler/APIPost';
import {getURL} from '@APIRepository';
import APIGet from '../APIHandler/APIGet';

export const getUserSessionData = async () => {
  try {
    const userData = JSON.parse(
      (await AsyncStorage.getItem('userData')) as string,
    );

    return userData;
  } catch (err) {
    return null;
  }
};

export const getStoreConfig = async () => {
  try {
    const storeId = await AsyncStorage.getItem('storeId');

    const storeConfig = await AsyncStorage.getItem('store-config');

    return {storeId: storeId, config: JSON.parse(storeConfig || '{}')};
  } catch (err) {
    return null;
  }
};

export const requestOTP = async (phone: string) => {
  return APIPost({
    url: getURL({
      key: 'GENERATE_LOGIN_OTP',
    }),
    body: {
      phone: phone,
    },
  });
};

export const submitOTP = async (
  phone: string,
  OTP: string,
  storeId: string,
) => {
  return APIPost({
    url: getURL({
      key: 'USER_LOGIN',
    }),
    body: {
      phone: phone,
      otp: OTP,
      storeCode: storeId,
    },
  });
};

export const fetchUserDetails = async (sessionToken: string) => {
  return APIGet({
    url: getURL({
      key: 'USER_DETAIL',
    }),
    customHeaders: {
      'session-token': sessionToken,
    },
  });
};

export const setUserData = async (userData: string) => {
  await AsyncStorage.setItem(
    'userData',
    JSON.stringify({userData, loggedIn: true}),
  );

  return userData;
};

export const setLocalStoreId = async (storeId: string) => {
  await AsyncStorage.setItem('storeId', JSON.stringify(storeId));

  return storeId;
};

export const setLocalStoreConfig = async (config: any) => {
  await AsyncStorage.setItem('config', JSON.stringify(config));

  return config;
};

export const logOut = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (err) {
    console.log(err);
  }
};
