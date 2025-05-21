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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
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

const SelectLocation = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SelectLocation'>) => {
  const {location, updateLocation} = useContextSelector(
    FormStateContext,
    state => ({
      location: state.location,
      updateLocation: state.updateLocation,
    }),
  );
  const {showToast} = useContext(ToastContext);
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [markerKey, setMarkerKey] = useState(0); // Add this line

  const recenter = useCallback(
    (coords = location) => {
      if (!mapRef.current || !isMapReady) return;

      const fallbackCoords = {
        lat: 12.9716, // Bangalore latitude
        lng: 77.5946, // Bangalore longitude
      };

      const targetLat =
        coords.lat && !isNaN(coords.lat) ? coords.lat : fallbackCoords.lat;
      const targetLng =
        coords.lng && !isNaN(coords.lng) ? coords.lng : fallbackCoords.lng;

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
    [location, isMapReady],
  );

  const updateAddress = useCallback(
    (position: any) => {
      setIsLoading(true);
      getCurrentAddress(
        position,
        (address: any) => {
          const pos = address?.[0]?.position || position.coords;
          const newLocation = {
            address: address[0]?.formattedAddress || '',
            lat: +pos.lat || position.coords.latitude,
            lng: +pos.lng || position.coords.longitude,
          };

          if (!isNaN(newLocation.lat) && !isNaN(newLocation.lng)) {
            updateLocation(newLocation);
            recenter(newLocation);
            setMarkerKey(prev => prev + 1); // Force marker re-render
          } else {
            showToast({
              ...ToastProfiles.error,
              title: 'Invalid coordinates received',
            });
          }
          setIsLoading(false);
        },
        (error: any) => {
          showToast({...ToastProfiles.error, title: 'Failed to fetch address'});
          console.error('Geocoding error:', error);
          setIsLoading(false);
        },
      );
    },
    [updateLocation, recenter, showToast],
  );

  const setCurrentLocation = useCallback(async () => {
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

      getCurrentLocation(
        (position: any) => {
          updateAddress(position);
        },
        (error: any) => {
          throw new Error('Failed to fetch location: ' + error.message);
        },
      );
    } catch (error: any) {
      showToast({
        ...ToastProfiles.error,
        title: error.message || 'Location error occurred',
      });
      setIsLoading(false);
    }
  }, [updateAddress, showToast]);

  useEffect(() => {
    if (location.lat && location.lng && isMapReady) {
      recenter();
    }
  }, [location.lat, location.lng, recenter, isMapReady]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
    recenter();
  }, [recenter]);

  const handleMarkerDragEnd = useCallback(
    (event: MarkerDragStartEndEvent) => {
      updateAddress({coords: event.nativeEvent.coordinate});
    },
    [updateAddress],
  );

  console.log('lat type:', typeof location.lat); // should be 'number'
  console.log('lng type:', typeof location.lng); // should be 'number'

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
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
          loadingEnabled={true}
          loadingIndicatorColor="#2E6ACF"
          loadingBackgroundColor="#FFFFFF">
          {/* Render the Marker component conditionally */}
          {!!(location.lat && location.lng) ? (
            <Marker
              key={`marker-${markerKey}`}
              draggable
              onDragEnd={handleMarkerDragEnd}
              coordinate={{
                latitude: location.lat,
                longitude: location.lng,
              }}
            />
          ) : null}
        </MapView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Spinner size="lg" color="#2E6ACF" />
          </View>
        )}

        <VStack style={styles.dataBlock} space={2}>
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
                onPress={navigation.goBack}
              />
            </HStack>
          </HStack>
          <VStack p={4} pt={3} pb={0}>
            <HStack justifyContent="space-between" mb={2}>
              <Button
                px={2}
                py={1}
                style={styles.changeLocationButton}
                onPress={() => navigation.navigate('SearchAddress')}>
                {!location.address ? 'Search Location' : 'Change'}
              </Button>
              <Button
                px={2}
                py={1}
                style={styles.changeLocationButton}
                onPress={setCurrentLocation}
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
              onPress={() => navigation.navigate('AddressForm')}>
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

export default SelectLocation;
