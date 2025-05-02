// utils/storeInfoStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveStoreInfo = async (
  storeId: string,
  isPickupMode: boolean,
  modeParam: string,
) => {
  try {
    await AsyncStorage.multiSet([
      ['storeId', storeId],
      ['pickupMode', isPickupMode.toString()],
      ['modeParam', modeParam.toString()],
    ]);
  } catch (error) {
    console.error('Failed to save store info:', error);
  }
};

export const loadStoreInfo = async () => {
  try {
    const [storeId, pickupMode, modeParam] = await AsyncStorage.multiGet([
      'storeId',
      'pickupMode',
      'modeParam',
    ]);
    return {
      storeId: storeId[1],
      isPickupMode: pickupMode[1] === 'true',
      modeParam: modeParam[1],
    };
  } catch (error) {
    console.error('Failed to load store info:', error);
    return {
      storeId: null,
      isPickupMode: false,
      modeParam: null,
    };
  }
};
