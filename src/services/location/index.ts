import {config} from '@APIConfig';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {PermissionsAndroid, Platform} from 'react-native';

// ================== PERMISSION HANDLING ================== //

/**
 * Request location permission (Android + iOS)
 */
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Location permission error:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    // iOS handles permissions via Info.plist
    return true; // Assume permission is granted (check in runtime)
  }
  return false;
};

// ================== LOCATION FUNCTIONS ================== //

/**
 * Get current device location
 */
export const getCurrentLocation = async (
  onSuccess: (position: Geolocation.GeoPosition) => void,
  onError: (error: Geolocation.GeoError) => void,
) => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    onError({code: 1, message: 'Location permission denied'}); // Code 1 corresponds to PERMISSION_DENIED
    return;
  }

  Geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  });
};

/**
 * Reverse geocode coordinates into an address
 */
export const getCurrentAddress = async (
  position: {coords: {latitude: number; longitude: number}},
  onSuccess: (address: any) => void,
  onError: (error: any) => void,
) => {
  try {
    const {latitude, longitude} = position.coords;
    Geocoder.init(config.gAPIKey); // Initialize with your API key
    const addresses = await Geocoder.from({latitude, longitude});
    onSuccess(addresses);
  } catch (error) {
    onError(error);
  }
};
