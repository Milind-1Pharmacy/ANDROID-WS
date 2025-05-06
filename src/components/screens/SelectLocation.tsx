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
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const recenter = useCallback(
    (coords = location) => {
      mapRef.current?.animateCamera({
        duration: 3000,
        center: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        zoom: 20,
        altitude: 400,
      });
    },
    [location],
  );

  const updateAddress = useCallback(
    (position: any) => {
      setIsLoading(true);
      getCurrentAddress(
        position,
        (address: any) => {
          const pos = address?.[0]?.position || {};
          updateLocation({
            address: address[0]?.formattedAddress,
            lat: +pos.lat,
            lng: +pos.lng,
          });
          recenter({lat: +pos.lat, lng: +pos.lng});
          setIsLoading(false);
        },
        () => {
          showToast({...ToastProfiles.error, title: 'Failed to fetch address'});
          setIsLoading(false);
        },
      );
    },
    [updateLocation, recenter, showToast],
  );

  const setCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    const platformPermission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!platformPermission) {
      showToast({
        ...ToastProfiles.error,
        title: 'Platform not supported for location permissions',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await Permissions.check(platformPermission);
      if (response === RESULTS.GRANTED) {
        getCurrentLocation(updateAddress, () => {
          showToast({
            ...ToastProfiles.error,
            title: 'Failed to fetch location',
          });
          setIsLoading(false);
        });
      } else {
        const newResponse = await Permissions.request(platformPermission);
        if (newResponse === RESULTS.GRANTED) {
          getCurrentLocation(updateAddress, () => {
            showToast({
              ...ToastProfiles.error,
              title: 'Failed to fetch location',
            });
            setIsLoading(false);
          });
        } else {
          showToast({
            ...ToastProfiles.error,
            title: 'Location permission denied',
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      showToast({
        ...ToastProfiles.error,
        title: 'Error requesting location permission',
      });
      setIsLoading(false);
    }
  }, [updateAddress, showToast]);

  useEffect(() => {
    if (location.lat && location.lng) {
      recenter();
    }
  }, [location.lat, location.lng, recenter]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <MapView
          provider="google"
          ref={mapRef}
          onMapLoaded={() => recenter()}
          mapPadding={{top: 0, right: 0, bottom: height * 0.19, left: 0}}
          style={styles.mapBlock}
          initialCamera={{
            center: {
              latitude: location.lat || 18.457874,
              longitude: location.lng || 71.005823,
            },
            zoom: 20,
            altitude: 400,
            heading: 0,
            pitch: 0,
          }}>
          <Text>
            {' '}
            {location.lat && location.lng && (
              <Marker
                draggable
                onDragEnd={(event: MarkerDragStartEndEvent) =>
                  updateAddress({coords: event.nativeEvent.coordinate})
                }
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
              />
            )}
          </Text>
        </MapView>
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
                    size={12}
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
            <Text fontSize="sm">{location.address}</Text>
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
