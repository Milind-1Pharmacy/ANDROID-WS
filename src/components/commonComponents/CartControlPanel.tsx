import React from 'react';
import {memo, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAnglesDown, faAnglesUp} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Divider,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Spinner,
  Switch,
  Text,
  View,
  VStack,
} from 'native-base';
import {
  Animated,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import BottomActionSheet from './BottomActionSheet';
import P1Styles from '@P1StyleSheet';
import {getURL} from '@APIRepository';
import {
  APIContext,
  AuthContext,
  ToastContext,
  useIsPickupMode,
} from '@contextProviders';
import Emitter from '@Emitter';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ToastProfiles} from '@ToastProfiles';
import {UserRoleAlias, UserRole} from '@Constants';
import {parseError} from '@helpers';
import moment from 'moment';
import {faTruckMedical} from '@fortawesome/free-solid-svg-icons'; // or '@fortawesome/pro-solid-svg-icons' for pro version

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  actionSheetStyle: {
    alignItems: 'flex-start',
    ...P1Styles.shadowLarge,
  },
  bottomSheetOption: {
    marginVertical: 5,
    marginHorizontal: 15,
    width: screenWidth - 30,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    ...P1Styles.shadow,
  },
  controlPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 10,
    ...P1Styles.shadow,
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    ...P1Styles.shadow,
  },
  shippingDetailsASHandle: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  collapsibleList: {
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  collapsibleListContent: {
    zIndex: 1000,
  },
  firstControlHandle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  retailerSelectHandle: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 10,
    gap: 10,
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  prescriptionBlock: {
    padding: 2,
  },
  prescriptionItem: {
    width: 58,
    height: 48,
    position: 'relative',
    marginRight: 5,
  },
  prescriptionThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
    position: 'absolute',
  },
  prescriptionRemoveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  prescriptionPreviewOverlay: {
    position: 'absolute',
    zIndex: 10000,
    height: height,
    width: screenWidth,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000AA',
  },
  prescriptionPreview: {
    borderRadius: 10,
    width: screenWidth - 60,
    height: height - 250,
    objectFit: 'contain',
  },
});
// To Do: Replace all the uses of 'any' with the actual type signature
const CartControlPanel = memo(
  ({
    cartItems,
    bottomTabsMounted,
    shippingType,
    setShippingType,
    submitting,
    updateCart,
    navigation,
    placeOrder,
    locationId,
    retailerId,
    imageUploadEnabled,
    takePhoto,
    pickImage,
    addedPrescriptions,
    removePrescription,
  }: {
    cartItems: [];
    bottomTabsMounted: boolean;
    shippingType: number;
    setShippingType: any;
    submitting: boolean;
    updateCart: Function;
    navigation: any;
    placeOrder: any;
    locationId?: string;
    retailerId?: string;
    imageUploadEnabled?: boolean;
    takePhoto?: any;
    pickImage?: any;
    addedPrescriptions?: {id: string; imageUrl: string}[];
    removePrescription?: Function;
  }) => {
    const [shippingDetailsCollapsed, setShippingDetailsCollapsed] =
      useState(true);
    const [shippingDetailsContentHeight, setShippingDetailsContentHeight] =
      useState(screenWidth >= 414 ? 110 : screenWidth >= 375 ? 100 : 90);
    const [locationsReference, setLocationsReference] = useState<{
      list: any[];
      loaded: boolean;
    }>({
      list: [],
      loaded: false,
    });
    const [retailersReference, setRetailersReference] = useState<{
      list: any[];
      loaded: boolean;
    }>({
      list: [],
      loaded: false,
    });
    const [selectedPrescription, setSelectedPrescription] = useState<
      string | undefined
    >();

    const isPickupMode = useIsPickupMode();

    const {bottom} = useSafeAreaInsets();

    const controlPanelBottomMargin = isDesktop
      ? 20
      : bottomTabsMounted
      ? bottom > 0
        ? 80
        : 80
      : bottom > 0
      ? 65
      : 10;

    const maxHeight = screenWidth >= 414 ? 110 : screenWidth >= 375 ? 100 : 90;

    const openCLoseAnim = useRef(new Animated.Value(0)).current;

    const {authStatus, appMode, storeConfig} = useContext(AuthContext);

    const {APIGet} = useContext(APIContext);

    const {showToast} = useContext(ToastContext);

    const collapse = (event?: any | undefined) => {
      event?.stopPropagation();

      Animated.timing(openCLoseAnim, {
        toValue: 40,
        duration: 180,
        useNativeDriver: false,
      }).start(() => setShippingDetailsCollapsed(true));
    };

    const expand = (event?: any | undefined) => {
      event?.stopPropagation();

      Animated.timing(openCLoseAnim, {
        toValue: shippingDetailsContentHeight + 20,
        duration: 180,
        useNativeDriver: false,
      }).start(() => setShippingDetailsCollapsed(false));
    };

    const roleBasedReferenceListProfiles = {
      [UserRoleAlias.CUSTOMER]: [
        {
          key: 'USER_LOCATION',
          onComplete: (response: any) => {
            setLocationsReference({
              list: response.data?.locations,
              loaded: true,
            });

            updateCart({
              locationId: response.data?.locations.find(
                (location: any) => location.selected,
              )?.id,
            });
          },
        },
      ],
      [UserRoleAlias.B2C_SALESMAN]: [
        {
          key: 'USER_LOCATION',
          onComplete: (response: any) => {
            setLocationsReference({
              list: response.data?.locations,
              loaded: true,
            });

            updateCart({
              locationId: response.data?.locations.find(
                (location: any) => location.selected,
              )?.id,
            });
          },
        },
      ],
      [UserRoleAlias.SALESMAN]: [
        {
          key: 'STORE_RETAILER',
          onComplete: (response: any) => {
            setRetailersReference({
              list: response.data?.items,
              loaded: true,
            });
          },
        },
      ],
      [UserRoleAlias.RETAILER]: [],
    };

    const fetchReferenceLists = () => {
      if (authStatus.loggedIn) {
        (roleBasedReferenceListProfiles[appMode] || []).forEach(
          (profile: {key: string; onComplete: Function}) => {
            APIGet({
              url: getURL({
                key: profile.key,
              }),
              resolve: (response: any) => {
                if (!response.data) {
                  throw response;
                }

                profile.onComplete(response);
              },
              reject: (error: any) => {
                showToast({
                  ...ToastProfiles.error,
                  title: parseError(error).message,
                });
              },
            });
          },
        );
      }
    };

    // const handleShippingTypeChange = (value: boolean) => setShippingType(value, locationsReference);
    useEffect(() => {
      if (isPickupMode) {
        setShippingType(1);
      }
    }, [isPickupMode]);

    useEffect(() => {
      fetchReferenceLists();

      Emitter.on('ADDRESS_ADDED', fetchReferenceLists);

      return () => {
        Emitter.off('ADDRESS_ADDED', fetchReferenceLists);
      };
    }, [authStatus.loggedIn]);

    const selectedLocation = useMemo(() => {
      return (locationsReference?.list || []).find(
        location => location.id === locationId,
      );
    }, [locationsReference.list, locationId]);

    useEffect(() => {
      if (locationsReference.loaded) {
        setShippingDetailsContentHeight(maxHeight + 20);
        collapse();
        if (selectedLocation) {
          setTimeout(() => expand(), 50); // Small delay ensures collapse completes
        }
      }
    }, [locationsReference.loaded, selectedLocation, shippingType]);

    useEffect(() => {
      (shippingType ? collapse : expand)();
    }, [shippingType]);

    return (
      <>
        <VStack
          style={{
            ...styles.controlPanel,
            marginBottom: controlPanelBottomMargin,
          }}>
          {/* <TouchableOpacity disabled={shippingType === 1} onPress={shippingDetailsCollapsed ? expand : collapse}>
                    <VStack style={styles.shippingDetailsASHandle}>
                        <HStack space={2} alignItems="center" justifyContent="space-between">
                            {
                                appMode === UserRoleAlias.SALESMAN
                                    ? (
                                        <BottomActionSheet
                                            handle={(
                                                <>
                                                    <HStack style={styles.retailerSelectHandle}>
                                                        <Text flex={1} fontSize={12} lineHeight={13} fontWeight="500">
                                                            {retailersReference.loaded ? (retailersReference.list.find((retailer: any) => retailer.id === retailerId)?.name || 'Select Retailer') : 'Loading...'}
                                                        </Text>
                                                        <FontAwesomeIcon icon="chevron-up" color="#2E6ACF" size={20} />
                                                    </HStack>
                                                </>
                                            )}
                                            handleContainerStyle={{ ...styles.firstControlHandle, width: '100%' }}
                                            actionSheetStyle={styles.actionSheetStyle}
                                            SheetContent={
                                                ({ onClose }: { onClose: Function }) => (
                                                    retailersReference.list.map((retailer: any, index: number) => (
                                                        (
                                                            <TouchableOpacity
                                                                key={retailer.id}
                                                                style={styles.bottomSheetOption}
                                                                onPress={() => {
                                                                    updateCart({ retailerId: retailer.id });
                                                                    onClose();
                                                                }}
                                                            >
                                                                <Text flex={1} fontSize={14} fontWeight="500">
                                                                    {retailer.name}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )
                                                    ))
                                                )
                                            }
                                        />
                                    )
                                    : (
                                        (appMode === UserRoleAlias.RETAILER)
                                            ? <></>
                                            :
                                            <>
                                                <TouchableOpacity onPress={e => e.preventDefault()} style={styles.firstControlHandle}>
                                                    <TouchableOpacity onPress={() => handleShippingTypeChange(false)}>
                                                        <Text bold>Delivery</Text>
                                                    </TouchableOpacity>
                                                    <Switch
                                                        ref={switchRef}
                                                        isChecked={!!shippingType}
                                                        onToggle={handleShippingTypeChange}
                                                        onTrackColor="#2E6ACF"
                                                        offTrackColor="#2E6ACF"
                                                        size={Platform.OS === 'ios' ? 'sm' : 'md'}
                                                    />
                                                    <TouchableOpacity onPress={() => handleShippingTypeChange(true)}>
                                                        <Text bold>Pick-Up</Text>
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                                {!shippingType && <FontAwesomeIcon icon={shippingDetailsCollapsed ? 'angle-double-up' : 'angle-double-down'} size={16} color='#3C3C3C' />}
                                            </>
                                    )
                            }

                        </HStack>
                    </VStack>
                </TouchableOpacity> */}
          {[UserRoleAlias.CUSTOMER, UserRoleAlias.B2C_SALESMAN].includes(
            appMode as UserRole,
          ) ? (
            !isPickupMode ? (
              <Animated.View
                style={{
                  height: openCLoseAnim,
                  ...styles.collapsibleList,
                }}>
                <ScrollView
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={(width, height) => {
                    setShippingDetailsContentHeight(
                      (height > maxHeight ? maxHeight : height) + 20,
                    );
                  }}
                  style={{
                    maxHeight: shippingDetailsContentHeight,
                    ...styles.collapsibleListContent,
                  }}
                  contentContainerStyle={{
                    zIndex: 1000,
                  }}>
                  <VStack p={2} pt={3}>
                    <HStack justifyContent={'space-between'} mx={2}>
                      <Text fontSize={14} mx={2} fontWeight="500">
                        Delivery Address:
                      </Text>
                      <TouchableOpacity
                        onPress={shippingDetailsCollapsed ? expand : collapse}>
                        {!shippingDetailsCollapsed ? (
                          <FontAwesomeIcon icon={faAnglesDown} size={16} />
                        ) : (
                          <FontAwesomeIcon icon={faAnglesUp} size={16} />
                        )}
                      </TouchableOpacity>
                    </HStack>
                    {authStatus.loggedIn ? (
                      <BottomActionSheet
                        disabled={!locationsReference.loaded}
                        handle={
                          <>
                            <HStack
                              space={2}
                              my={2}
                              alignItems="center"
                              width="100%">
                              <FontAwesomeIcon
                                icon="location-dot"
                                color="#2E6ACF"
                                size={20}
                              />
                              <VStack flex={1} space={1}>
                                {locationsReference.loaded ? (
                                  <>
                                    {selectedLocation?.customerName && (
                                      <Text
                                        flex={1}
                                        fontSize={12}
                                        lineHeight={13}
                                        fontWeight="600">
                                        {selectedLocation?.customerName}
                                      </Text>
                                    )}
                                    {selectedLocation?.customerPhone && (
                                      <Text
                                        flex={1}
                                        fontSize={12}
                                        lineHeight={13}
                                        fontWeight="500">
                                        {selectedLocation?.customerPhone}
                                      </Text>
                                    )}
                                    <Text
                                      flex={1}
                                      fontSize={12}
                                      lineHeight={13}
                                      fontWeight="500"
                                      maxWidth={'80%'}
                                      textAlign="left"
                                      numberOfLines={4}>
                                      {selectedLocation?.address ||
                                        'Select Delivery Address'}
                                    </Text>
                                  </>
                                ) : (
                                  <Text
                                    flex={1}
                                    fontSize={12}
                                    lineHeight={13}
                                    fontWeight="500">
                                    Loading...
                                  </Text>
                                )}
                              </VStack>
                              {!locationsReference.loaded ? (
                                <Spinner />
                              ) : (
                                <FontAwesomeIcon
                                  icon="chevron-up"
                                  color="#2E6ACF"
                                  size={17}
                                />
                              )}
                            </HStack>
                          </>
                        }
                        actionSheetStyle={styles.actionSheetStyle}
                        SheetContent={({onClose}: {onClose: Function}) => (
                          <>
                            <TouchableOpacity
                              style={{
                                ...styles.bottomSheetOption,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                              }}
                              onPress={() => {
                                navigation.navigate(
                                  storeConfig?.restrictAddress
                                    ? 'AddressForm'
                                    : 'SelectLocation',
                                );
                                onClose();
                              }}>
                              <FontAwesomeIcon
                                icon="plus"
                                color="#2E6ACF"
                                size={20}
                              />
                              <Text color="#2E6ACF">Add New Address</Text>
                            </TouchableOpacity>
                            <ScrollView>
                              {locationsReference.list.map(
                                (location: any, index: number) => {
                                  return (
                                    <TouchableOpacity
                                      key={
                                        location.id +
                                        '_' +
                                        index +
                                        '_' +
                                        Date.now()
                                      }
                                      style={styles.bottomSheetOption}
                                      onPress={() => {
                                        updateCart({locationId: location.id});
                                        onClose();
                                      }}>
                                      <FontAwesomeIcon
                                        icon="location-dot"
                                        color="#2E6ACF"
                                        size={20}
                                      />
                                      <View maxWidth={screenWidth - 80}>
                                        <Text
                                          flex={1}
                                          fontSize={14}
                                          fontWeight="500">
                                          {location.customerName}
                                        </Text>
                                        <Text
                                          flex={1}
                                          fontSize={14}
                                          fontWeight="500">
                                          {location.customerPhone}
                                        </Text>
                                        <Text
                                          flex={1}
                                          fontSize={14}
                                          fontWeight="500">
                                          {location.address}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                },
                              )}
                            </ScrollView>
                          </>
                        )}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}>
                        <HStack
                          space={2}
                          my={2}
                          alignItems="center"
                          width="100%">
                          <FontAwesomeIcon
                            icon="location-dot"
                            color="#2E6ACF"
                            size={20}
                          />
                          <Text
                            flex={1}
                            fontSize={12}
                            lineHeight={13}
                            fontWeight="500">
                            Please Login to select Delivery Address
                          </Text>
                          <FontAwesomeIcon
                            icon="right-to-bracket"
                            color="#2E6ACF"
                            size={20}
                          />
                        </HStack>
                      </TouchableOpacity>
                    )}
                  </VStack>
                </ScrollView>
              </Animated.View>
            ) : authStatus.loggedIn ? (
              <VStack>
                <Text
                  fontSize={14}
                  bold
                  style={{
                    padding: 10,
                    color: '#2e6acf',
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingHorizontal: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5',
                  }}>
                  PickUp Address :
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    storeConfig.pickupLocation &&
                    Linking.openURL(storeConfig?.pickupLocation)
                  }
                  style={{
                    borderBottomColor: '#E5E5E5',
                    borderBottomWidth: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 10,
                    gap: 8,
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'row',
                  }}>
                  <FontAwesomeIcon
                    icon="location-dot"
                    color="#2E6ACF"
                    size={20}
                  />
                  <Text flex={1} fontSize={13} lineHeight={18} fontWeight="500">
                    {storeConfig?.pickupAddress || 'No Store Linked'}
                  </Text>
                </TouchableOpacity>
              </VStack>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <HStack
                  space={2}
                  my={2}
                  alignItems="center"
                  width="100%"
                  style={{
                    borderBottomColor: '#E5E5E5',
                    borderBottomWidth: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 10,
                  }}>
                  <FontAwesomeIcon
                    icon="location-dot"
                    color="#2E6ACF"
                    size={20}
                  />
                  <Text flex={1} fontSize={13} lineHeight={13} fontWeight="500">
                    Please Login to place an Order
                  </Text>
                  <FontAwesomeIcon
                    icon="right-to-bracket"
                    color="#2E6ACF"
                    size={20}
                  />
                </HStack>
              </TouchableOpacity>
            )
          ) : (
            <></>
          )}
          <VStack w="full">
            {imageUploadEnabled &&
              [UserRoleAlias.CUSTOMER, UserRoleAlias.B2C_SALESMAN].includes(
                appMode as UserRole,
              ) && (
                <VStack>
                  {/* <HStack
                  p={3}
                  space={2}
                  alignItems="center"
                  borderBottomWidth={1}
                  borderBottomColor="#E0E0E0">
                  <FontAwesomeIcon
                    icon={faTruckMedical}
                    size={25}
                    color="#3F3E60"
                  />
                  <Text
                    fontSize={13}
                    color="#3F3E60"
                    overflowX="hidden"
                    flexWrap="wrap">
                    {moment().isBefore(
                      moment().set({hour: 15, minute: 0, second: 0}),
                    )
                      ? 'Place the order before 3:00PM, to get it delivered by today'
                      : 'The order will be delivered by tomorrow'}
                  </Text>
                </HStack> */}
                  <HStack
                    py={3}
                    borderBottomWidth={1}
                    borderBottomColor="#E0E0E0">
                    {!(Platform.OS === 'web') && (
                      <>
                        <TouchableOpacity
                          onPress={takePhoto}
                          style={styles.uploadButton}>
                          <FontAwesomeIcon
                            icon="camera"
                            size={25}
                            color="#2E6ACF"
                          />
                          <Text fontSize={12} color="#2E6ACF">
                            Take a Photo
                          </Text>
                        </TouchableOpacity>
                        <Divider
                          orientation="vertical"
                          backgroundColor="#E0E0E0"
                        />
                      </>
                    )}
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.uploadButton}>
                      <FontAwesomeIcon
                        icon="images"
                        size={25}
                        color="#2E6ACF"
                      />
                      <Text fontSize={12} color="#2E6ACF">
                        Upload Prescription
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  {(addedPrescriptions?.length || 0) > 0 && (
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      style={styles.prescriptionBlock}>
                      {addedPrescriptions?.map((item: any, index: number) => (
                        <TouchableOpacity
                          onPress={() => setSelectedPrescription(item.imageUrl)}
                          key={item.id.toString() + Date.now().toString()}
                          style={styles.prescriptionItem}>
                          <Image
                            source={{uri: item.imageUrl}}
                            alt={item.title}
                            style={styles.prescriptionThumbnail}
                          />
                          <IconButton
                            onPress={(event: any) => {
                              event.preventDefault();

                              (removePrescription || (() => {}))(item.id);
                            }}
                            icon={
                              <FontAwesomeIcon
                                icon="circle-xmark"
                                size={15}
                                color="#D00000"
                              />
                            }
                            colorScheme="danger"
                            size="xs"
                            variant="unstyled"
                            p={0}
                            style={styles.prescriptionRemoveButton}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </VStack>
              )}
            <Button
              isLoading={submitting}
              style={{
                ...styles.submitButton,
                marginTop: appMode === UserRoleAlias.SALESMAN ? 0 : 10,
              }}
              onPress={placeOrder}>
              Place Order
            </Button>
          </VStack>
        </VStack>
        {selectedPrescription && (
          <TouchableOpacity
            onPress={() => setSelectedPrescription(undefined)}
            style={styles.prescriptionPreviewOverlay}>
            <Image
              source={{uri: selectedPrescription}}
              alt="prescription"
              style={styles.prescriptionPreview}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </>
    );
  },
);

export default CartControlPanel;
