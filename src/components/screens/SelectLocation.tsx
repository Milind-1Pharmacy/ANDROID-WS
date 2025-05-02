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
import {getURL} from '@APIRepository';
import {config} from '@APIConfig';
import {ToastProfiles} from '@ToastProfiles';
import { useContextSelector } from 'use-context-selector';
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
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  contentContainer: {
    height: '100%',
    justifyContent: 'flex-end',
    // overflowY: 'overlay',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const SelectLocation = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SelectLocation'>) => {
  const {location, updateLocation} = useContextSelector(FormStateContext,state=>({
    location: state.location,
    updateLocation: state.updateLocation,
  }));
  const {APIPost} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const recenter = useCallback(
    (coords: {lat: number; lng: number; address?: string} = location) => {
      mapRef.current?.animateCamera({
        duration: 3000,
        center: {
          latitude: coords.lat || location.lat,
          longitude: coords.lng || location.lng,
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
      if (Platform.OS === 'web') {
        APIPost({
          url: getURL({key: 'GET_ADDRESS'}),
          body: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          resolve: (response: any) => {
            if (response.statusCode !== 200) {
              throw response;
            }
            updateLocation({
              address: response.data.address,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            recenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setIsLoading(false);
          },
          reject: (error: any) => {
            showToast({
              ...ToastProfiles.error,
              title: 'Failed to fetch address',
            });
            setIsLoading(false);
          },
        });
      } else {
        getCurrentAddress(
          position,
          (address: any) => {
            const {lat, lng} = address[0]?.position;
            updateLocation({
              address: address[0]?.formattedAddress,
              lat: +lat,
              lng: +lng,
            });
            recenter({lat: +lat, lng: +lng});
            setIsLoading(false);
          },
          (error: any) => {
            showToast({
              ...ToastProfiles.error,
              title: 'Failed to fetch address',
            });
            setIsLoading(false);
          },
        );
      }
    },
    [APIPost, updateLocation, recenter, showToast],
  );

  const setCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    if (Platform.OS === 'web') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position: any) => {
            updateAddress(position);
          },
          (error: any) => {
            showToast({
              ...ToastProfiles.error,
              title: 'Failed to fetch location',
            });
            setIsLoading(false);
          },
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
        );
      } else {
        showToast({
          ...ToastProfiles.error,
          title: 'Geolocation is not supported by your browser',
        });
        setIsLoading(false);
      }
    } else {
      try {
        const response = await Permissions.check(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        if (response === RESULTS.GRANTED) {
          getCurrentLocation(updateAddress, (error: any) => {
            showToast({
              ...ToastProfiles.error,
              title: 'Failed to fetch location',
            });
            setIsLoading(false);
          });
        } else {
          const newResponse = await Permissions.request(
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          );
          if (newResponse === RESULTS.GRANTED) {
            getCurrentLocation(updateAddress, (error: any) => {
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
    }
  }, [updateAddress, showToast]);

  useEffect(() => {
    recenter();
  }, [location.lat, location.lng, location.address, recenter]);

  return (
    <>
      {!(Platform.OS === 'web') && <StatusBar barStyle="light-content" />}
      <View style={styles.contentContainer}>
        <MapView
          provider="google"
          // @ts-ignore
          googleMapsApiKey={config.gAPIKey}
          onMapLoaded={() => recenter()}
          ref={mapRef}
          mapPadding={{top: 0, right: 0, bottom: height * 0.19, left: 0}}
          style={styles.mapBlock}
          initialCamera={{
            center: {
              latitude: location.lat || 18.457874,
              longitude: location.lng || 71.005823,
            },
            zoom: location.lat && location.lng ? 20 : 0,
            altitude: 400,
            heading: 0,
            pitch: 0,
          }}
          region={{
            latitude: location.lat || 18.457874,
            longitude: location.lng || 71.005823,
            latitudeDelta: 1,
            longitudeDelta: 1,
          }}>
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
                {!location.address || location.address === ''
                  ? 'Search Location'
                  : 'Change'}
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
              disabled={
                !location.address || location.address === '' || isLoading
              }
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
