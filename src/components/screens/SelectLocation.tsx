import {useContext, useEffect, useRef, useState, useCallback} from 'react';
import {
  Button,
  HStack,
  IconButton,
  StatusBar,
  Text,
  VStack,
  View,
  Spinner,
} from 'native-base';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import P1Styles from '@P1StyleSheet';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import MapView, {Marker, MarkerDragStartEndEvent} from 'react-native-maps';
import {APIContext, FormStateContext, ToastContext} from '@contextProviders';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import {getCurrentAddress, getCurrentLocation} from '@location';
import {ToastProfiles} from '@ToastProfiles';
import {useContextSelector} from 'use-context-selector';
import React from 'react';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10000,
  },
  headerButton: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  contentContainer: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  mapBlock: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height,
  },
  dataBlock: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    marginHorizontal: '5%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
  changeLocationButton: {
    borderRadius: 20,
    backgroundColor: '#2E6ACF',
    ...P1Styles.shadow,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
});

type LocationData = {
  address: string;
  lat: number;
  lng: number;
};

type LocationManagerProps = {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  onBack?: () => void;
  showMap?: boolean;
  navigation?: NativeStackNavigationProp<RootStackParamList, 'SelectLocation'>;
  redirectTo?: string;
};

type SelectLocationProps = NativeStackScreenProps<
  RootStackParamList,
  'SelectLocation'
> & {
  route: {
    params?: {
      onLocationSelect?: (location: LocationData) => void;
      initialLocation?: LocationData;
      redirectTo?: string;
    };
  };
};

export const LocationManager = ({
  initialLocation = {address: '', lat: 0, lng: 0},
  onLocationSelect,
  onBack,
  showMap = true,
  navigation,
  redirectTo,
}: LocationManagerProps) => {
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [markerKey, setMarkerKey] = useState(0);
  const mapRef = useRef<MapView>(null);
  const {showToast} = useContext(ToastContext);

  const recenter = useCallback(
    (coords = location) => {
      if (!mapRef.current || !isMapReady) return;

      const fallbackCoords = {
        lat: 12.9716, // Bangalore latitude
        lng: 77.5946, // Bangalore longitude
      };

      const targetLat = !isNaN(coords.lat) ? coords.lat : fallbackCoords.lat;
      const targetLng = !isNaN(coords.lng) ? coords.lng : fallbackCoords.lng;

      mapRef.current.animateCamera(
        {
          center: {
            latitude: targetLat,
            longitude: targetLng,
          },
          zoom: 20,
          altitude: 1000,
        },
        {duration: 1000},
      );
    },
    [isMapReady, location],
  );

  const updateAddress = useCallback(
    async (position: any) => {
      setIsLoading(true);
      try {
        const address = await new Promise((resolve, reject) => {
          getCurrentAddress(
            position,
            (result: any) => resolve(result),
            (error: any) => reject(error),
          );
        });
        const pos =
          (address as {position: {lat: number; lng: number}}[])?.[0]
            ?.position || position.coords;
        const newLocation = {
          address:
            (address as {formattedAddress: string}[])[0]?.formattedAddress ||
            '',
          lat: +pos.lat || position.coords.latitude,
          lng: +pos.lng || position.coords.longitude,
        };

        if (!isNaN(newLocation.lat) && !isNaN(newLocation.lng)) {
          setLocation(newLocation);
          recenter(newLocation);
          setMarkerKey(prev => prev + 1);
        } else {
          throw new Error('Invalid coordinates received');
        }
      } catch (error: any) {
        showToast({
          ...ToastProfiles.error,
          title: error.message || 'Failed to fetch address',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [recenter, showToast],
  );

  const getCurrentLocationandAddress = useCallback(async () => {
    setIsLoading(true);
    try {
      const platformPermission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (!platformPermission) {
        throw new Error('Platform not supported for location permissions');
      }

      const status = await Permissions.check(platformPermission);
      if (status !== RESULTS.GRANTED) {
        const newStatus = await Permissions.request(platformPermission);
        if (newStatus !== RESULTS.GRANTED) {
          throw new Error('Location permission denied');
        }
      }

      const position = await new Promise((resolve, reject) => {
        getCurrentLocation(
          position => resolve(position),
          error => reject(error),
        );
      });
      await updateAddress(position);
    } catch (error: any) {
      showToast({
        ...ToastProfiles.error,
        title: error.message || 'Location error occurred',
      });
      setIsLoading(false);
    }
  }, [updateAddress, showToast]);

  const handleMarkerDragEnd = useCallback(
    (event: MarkerDragStartEndEvent) => {
      updateAddress({coords: event.nativeEvent.coordinate});
    },
    [updateAddress],
  );

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
    recenter();
  }, [recenter]);

  useEffect(() => {
    if (location.lat && location.lng && isMapReady) {
      recenter();
    }
  }, [location.lat, location.lng, recenter, isMapReady]);

  const handleConfirm = useCallback(() => {
    onLocationSelect(location);

    if (redirectTo) {
      if (redirectTo === 'RegistrationForm') {
        navigation?.navigate('RegistrationForm', {
          selectedLocation: location,
        });
      } else if (redirectTo === 'AddressForm') {
        navigation?.navigate('AddressForm');
      } else {
        console.error('Invalid redirectTo value:', redirectTo);
      }
    } else {
      navigation?.navigate('AddressForm');
    }
  }, [location, onLocationSelect, redirectTo, navigation]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        {showMap && (
          <MapView
            provider="google"
            ref={mapRef}
            onMapReady={handleMapReady}
            mapPadding={{top: 0, right: 0, bottom: height * 0.19, left: 0}}
            style={styles.mapBlock}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
            showsUserLocation={true}
            loadingEnabled={true}
            loadingIndicatorColor="#2E6ACF"
            loadingBackgroundColor="#FFFFFF">
            {!!(location.lat && location.lng) && (
              <Marker
                key={`marker-${markerKey}`}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
              />
            )}
          </MapView>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Spinner size="lg" color="#2E6ACF" />
          </View>
        )}

        <VStack style={styles.dataBlock} space={2}>
          {onBack && (
            <HStack style={{...styles.header, top: -60, paddingHorizontal: 2}}>
              <HStack alignItems="center">
                <IconButton
                  variant="solid"
                  style={styles.headerButton}
                  icon={
                    <FontAwesomeIcon
                      icon="arrow-left"
                      style={{color: '#2E6ACF'}}
                      size={16}
                      color="#2E6ACF"
                    />
                  }
                  onPress={onBack}
                />
              </HStack>
            </HStack>
          )}
          <VStack p={4} pt={onBack ? 3 : 4} pb={0}>
            <HStack justifyContent="space-between" mb={2}>
              <Button
                px={2}
                py={1}
                style={styles.changeLocationButton}
                onPress={() => {
                  /* navigation to search would go here */
                  navigation?.navigate('SearchAddress');
                }}>
                {!location.address ? 'Search Location' : 'Change'}
              </Button>
              <Button
                px={2}
                py={1}
                style={styles.changeLocationButton}
                onPress={getCurrentLocationandAddress}
                disabled={isLoading}>
                <HStack alignItems="center" space={1}>
                  {isLoading ? (
                    <Spinner color="#FFFFFF" size="sm" />
                  ) : (
                    <FontAwesomeIcon
                      icon="location-crosshairs"
                      color="#FFFFFF"
                      size={15}
                    />
                  )}
                  <Text fontSize={14} lineHeight={14} color="#FFFFFF">
                    Use Current Location
                  </Text>
                </HStack>
              </Button>
            </HStack>
            <Text bold>Set your delivery location</Text>
          </VStack>
          <VStack space={2} p={4} pt={0}>
            <Text fontSize="sm">
              {location.address || 'No address selected'}
            </Text>
            <Button
              disabled={!location.address || isLoading}
              style={styles.submitButton}
              onPress={handleConfirm}>
              {isLoading ? (
                <Spinner color="#FFFFFF" size="sm" />
              ) : (
                'Confirm Location'
              )}
            </Button>
          </VStack>
        </VStack>
      </View>
    </>
  );
};

const SelectLocation = ({navigation, route}: SelectLocationProps) => {
  const {location, updateLocation} = useContextSelector(
    FormStateContext,
    state => ({
      location: state.location,
      updateLocation: state.updateLocation,
    }),
  );

  // Use the location from route params if available, otherwise from context
  const initialLocation = route.params?.initialLocation || location;
  const externalOnLocationSelect = route.params?.onLocationSelect;
  const redirectTo = route.params?.redirectTo;

  const handleLocationSelect = (selectedLocation: LocationData) => {
    if (externalOnLocationSelect) {
      externalOnLocationSelect(selectedLocation);
    } else {
      updateLocation(selectedLocation);
    }
  };

  return (
    <LocationManager
      initialLocation={initialLocation}
      onLocationSelect={handleLocationSelect}
      onBack={navigation.goBack}
      navigation={navigation}
      redirectTo={redirectTo}
    />
  );
};

export default SelectLocation;
