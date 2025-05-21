import {config} from '@APIConfig';
import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {Platform, PermissionsAndroid} from 'react-native';

// Initialize Geocoder once (matches the old API key behavior)
Geocoder.init(config.gAPIKey);

// Same function signature as before
export const geolocationInit = async () => {
  if (Platform.OS === 'android') {
    // For Android, request permissions explicitly
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn('Location permission error', err);
    }
  } else if (Platform.OS === 'ios') {
    // For iOS, request authorization
    const status = await Geolocation.requestAuthorization('whenInUse');
    if (status !== 'granted') {
      console.log('Location permission denied');
    }
  }
};

// Identical signature: (onSuccess: Function, onError: Function) => void
export const getCurrentLocation = (
  onSuccess: (position: GeoPosition) => void,
  onError: (error: GeoError) => void,
) => {
  Geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  });
};

// Identical signature: (position: any, onSuccess: any, onError: any) => void
export const getCurrentAddress = (
  position: any,
  onSuccess: any,
  onError: any,
) => {
  Geocoder.from({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  })
    .then(response => {
      // console.log('Geocoding response:', response);
      const firstResult = response.results[0];
      if (firstResult) {
        const formattedAddress = firstResult.formatted_address || '';
        const location = firstResult.geometry?.location || {};

        // Pass both the formatted address and the coordinates
        onSuccess([
          {
            formattedAddress,
            position: {
              lat: location.lat,
              lng: location.lng,
            },
          },
        ]);
      } else {
        onError(new Error('No address found'));
      }
    })
    .catch(onError);
};
