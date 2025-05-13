import React, {useState, useRef, useCallback, useContext} from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import {useContextSelector} from 'use-context-selector';
import {update} from 'lodash';
import {Buffer} from 'buffer';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  Button,
  HStack,
  Input,
  ScrollView,
  Text,
  VStack,
  View,
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import {ScreenBase} from '@Containers';
import {
  CartControlPanel,
  Counter,
  Header,
  P1AlertDialog,
} from '@commonComponents';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {uploadToServer} from '@fileHandler';
import {ToastProfiles} from '@ToastProfiles';
import {extensionFromBase64, mimeFromBase64, parseError} from '@helpers';
import {getURL} from '@APIRepository';
import {RootStackParamList} from 'App';
import P1Styles from '@P1StyleSheet';

const {width: screenWidth, height} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth > height;

// Constants
const LOGIN_REQUIRED_MESSAGE = 'You need to log-in first';
const LOGIN_REQUIRED_BODY =
  'To place an order via prescription, you need to be logged in. Please login to continue.';
const EMPTY_CART_MESSAGE =
  'Please either enter the prescription items by typing in, \n or upload a picture of the prescription';
const EMPTY_LOCATION_MESSAGE = 'Please select a delivery address';
const IMAGE_UPLOAD_SUCCESS = 'Prescription uploaded successfully';
const NO_IMAGE_SELECTED = 'No image was selected';
const INVALID_IMAGE_DATA = 'Invalid image data';
const PERMISSION_DENIED_TITLE = 'Permission Denied';
const PERMISSION_DENIED_MESSAGE =
  'Camera and storage permissions are required to take photos. Please enable them in settings.';

// Styles
const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    paddingTop: 15,
  },
  contentContainerStyle: {
    height: '100%',
    width: isDesktop ? '99%' : '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    marginHorizontal: isDesktop ? 10 : 0,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
  customHeaderBase: {
    marginTop: Platform.OS === 'web' ? 15 : 10,
    marginBottom: Platform.OS === 'web' ? 0 : 5,
  },
  qtyCounter: {
    backgroundColor: '#2e6acf',
    minWidth: 100,
    borderRadius: 8,
  },
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
  prescriptionIcon: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
});

type PrescriptionItem = {
  text: string;
  qty: number;
};

type PrescriptionImage = {
  id: string;
  imageUrl: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'PrescriptionOrder'>;

const PrescriptionOrder: React.FC<Props> = ({navigation}) => {
  // State
  const [submitting, setSubmitting] = useState(false);
  const [localItem, setLocalItem] = useState('');
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);

  // Context selectors
  const {
    prescriptionCart,
    updatePrescriptionCart,
    resetPrescriptionCart,
    addedOVPPrescriptions,
    setAddedOVPPrescriptions,
    resetAddedOVPPrescriptions,
  } = useContextSelector(FormStateContext, state => ({
    prescriptionCart: state.prescriptionCart,
    updatePrescriptionCart: state.updatePrescriptionCart,
    resetPrescriptionCart: state.resetPrescriptionCart,
    addedOVPPrescriptions: state.addedOVPPrescriptions,
    setAddedOVPPrescriptions: state.setAddedOVPPrescriptions,
    resetAddedOVPPrescriptions: state.resetAddedOVPPrescriptions,
  }));

  const {authStatus} = useContext(AuthContext);
  const {APIPost} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);

  // Helper functions
  const showErrorToast = useCallback(
    (message: string) => {
      showToast({
        ...ToastProfiles.error,
        title: message,
        id: `error-${Date.now()}`,
        origin: 'top',
      });
    },
    [showToast],
  );

  const showSuccessToast = useCallback(
    (message: string) => {
      showToast({
        ...ToastProfiles.success,
        title: message,
        id: `success-${Date.now()}`,
        origin: 'top',
      });
    },
    [showToast],
  );

  // Permission handling
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
        const storagePermission =
          Platform.Version >= 33
            ? await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
            : await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

        if (
          cameraPermission === RESULTS.DENIED ||
          storagePermission === RESULTS.DENIED
        ) {
          const requestedCamera = await request(PERMISSIONS.ANDROID.CAMERA);
          const requestedStorage =
            Platform.Version >= 33
              ? await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
              : await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

          return (
            requestedCamera === RESULTS.GRANTED &&
            requestedStorage === RESULTS.GRANTED
          );
        }

        return (
          cameraPermission === RESULTS.GRANTED &&
          storagePermission === RESULTS.GRANTED
        );
      }

      if (Platform.OS === 'ios') {
        const cameraPermission = await check(PERMISSIONS.IOS.CAMERA);
        if (cameraPermission === RESULTS.DENIED) {
          const result = await request(PERMISSIONS.IOS.CAMERA);
          return result === RESULTS.GRANTED;
        }
        return cameraPermission === RESULTS.GRANTED;
      }

      return false;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }, []);

  // Cart item manipulation
  const addItem = useCallback(() => {
    if (localItem.trim()) {
      updatePrescriptionCart({
        texts: [...prescriptionCart.texts, {text: localItem, qty: 1}],
      });
      setLocalItem('');
      inputRef.current?.focus();
    }
  }, [localItem, prescriptionCart.texts, updatePrescriptionCart]);

  const removeItem = useCallback(
    (index: number) => {
      const updatedItems = [...prescriptionCart.texts];
      updatedItems.splice(index, 1);
      updatePrescriptionCart({texts: updatedItems});
    },
    [prescriptionCart.texts, updatePrescriptionCart],
  );

  const editItem = useCallback(
    (index: number, value: string) => {
      const updatedItems = [...prescriptionCart.texts];
      updatedItems[index].text = value;
      updatePrescriptionCart({texts: updatedItems});
    },
    [prescriptionCart.texts, updatePrescriptionCart],
  );

  const editItemComplete = useCallback(
    (index: number, value: string) => {
      if (!value.trim()) {
        removeItem(index);
      }
    },
    [removeItem],
  );

  const manipulateItemQuantity = useCallback(
    (index: number, operation: '+' | '-') => {
      const updatedItems = [...prescriptionCart.texts];

      if (operation === '+') {
        updatedItems[index].qty += 1;
      } else if (updatedItems[index].qty === 1) {
        updatedItems.splice(index, 1);
      } else {
        updatedItems[index].qty -= 1;
      }

      updatePrescriptionCart({texts: updatedItems});
    },
    [prescriptionCart.texts, updatePrescriptionCart],
  );

  const setShippingType = useCallback(
    (value: boolean, locationsReference: any) => {
      updatePrescriptionCart({
        shippingType: value ? 1 : 0,
        locationId: value
          ? ''
          : locationsReference.list.find((location: any) => location.selected)
              ?.id,
      });
    },
    [updatePrescriptionCart],
  );

  // Image handling
  const handleImageUpload = useCallback(
    async (response: any) => {
      if (!response?.assets?.[0]) {
        showErrorToast(NO_IMAGE_SELECTED);
        return;
      }

      const image = response.assets[0];
      if (!image.uri || (!image.base64 && Platform.OS === 'android')) {
        showErrorToast(INVALID_IMAGE_DATA);
        return;
      }

      try {
        const fileName =
          image.fileName ||
          `prescription-${Date.now()}.${extensionFromBase64(image.uri)}`;
        const uploadResponse = await uploadToServer(
          {
            data: Buffer.from(image.base64 || '', 'base64'),
            name: fileName,
            type: image.type || mimeFromBase64(image.uri),
          },
          {APIPost},
        );

        const prescriptionResponse = await APIPost({
          url: getURL({key: 'PRESCRIPTION'}),
          body: {imageUrl: uploadResponse},
        });

        updatePrescriptionCart({
          prescriptionIds: [
            ...(prescriptionCart.prescriptionIds || []),
            prescriptionResponse.data.id,
          ],
        });

        setAddedOVPPrescriptions([
          ...(Array.isArray(addedOVPPrescriptions)
            ? addedOVPPrescriptions
            : []),
          {id: prescriptionResponse.data.id, imageUrl: uploadResponse},
        ]);

        showSuccessToast(IMAGE_UPLOAD_SUCCESS);
      } catch (error) {
        console.error('Image processing error:', error);
        showErrorToast(parseError(error).message);
      }
    },
    [
      APIPost,
      addedOVPPrescriptions,
      prescriptionCart.prescriptionIds,
      setAddedOVPPrescriptions,
      showErrorToast,
      showSuccessToast,
      updatePrescriptionCart,
    ],
  );

  const removePrescription = useCallback(
    (id: string) => {
      const updatedPrescriptions = addedOVPPrescriptions.filter(
        (item: any) => item.id !== id,
      );
      updatePrescriptionCart({
        prescriptionIds: prescriptionCart.prescriptionIds?.filter(
          (item: any) => item !== id,
        ),
      });
      setAddedOVPPrescriptions(updatedPrescriptions);
    },
    [
      addedOVPPrescriptions,
      prescriptionCart.prescriptionIds,
      setAddedOVPPrescriptions,
      updatePrescriptionCart,
    ],
  );

  // Camera/gallery functions
  const takePhoto = useCallback(async () => {
    if (!authStatus.loggedIn) {
      setLogOutDialogOpen(true);
      return;
    }

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(PERMISSION_DENIED_TITLE, PERMISSION_DENIED_MESSAGE, [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ]);
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.3,
        includeBase64: true,
        saveToPhotos: true,
        cameraType: 'back',
      });

      if (!result.didCancel) {
        await handleImageUpload(result);
      }
    } catch (error) {
      console.error('Camera error:', error);
      showErrorToast(parseError(error).message);
    }
  }, [
    authStatus.loggedIn,
    handleImageUpload,
    requestCameraPermission,
    showErrorToast,
  ]);

  const pickImage = useCallback(async () => {
    if (!authStatus.loggedIn) {
      setLogOutDialogOpen(true);
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          showErrorToast('Storage permission denied');
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.3,
        includeBase64: true,
        selectionLimit: 1,
      });

      if (!result.didCancel) {
        await handleImageUpload(result);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showErrorToast(parseError(error).message);
    }
  }, [
    authStatus.loggedIn,
    handleImageUpload,
    requestCameraPermission,
    showErrorToast,
  ]);

  // Order placement
  const placeOrder = useCallback(async () => {
    if (!authStatus.loggedIn) {
      setLogOutDialogOpen(true);
      return;
    }

    if (
      !prescriptionCart.texts.length &&
      !prescriptionCart.prescriptionIds?.length
    ) {
      showErrorToast(EMPTY_CART_MESSAGE);
      return;
    }

    if (prescriptionCart.shippingType === 0 && !prescriptionCart.locationId) {
      showErrorToast(EMPTY_LOCATION_MESSAGE);
      return;
    }

    setSubmitting(true);

    try {
      const response = await APIPost({
        url: getURL({key: 'PLACE_ORDER'}),
        body: {
          texts: prescriptionCart.texts,
          shippingType: prescriptionCart.shippingType,
          locationId: prescriptionCart.locationId,
          prescriptionIds: prescriptionCart.prescriptionIds,
        },
      });

      if (!response.data) {
        throw new Error('Invalid response data');
      }

      showSuccessToast(response.data.userMessage);
      resetPrescriptionCart();
      resetAddedOVPPrescriptions();
      navigation.replace('OrderDetails', {orderId: response.data.id});
    } catch (error) {
      showErrorToast(parseError(error).message);
    } finally {
      setSubmitting(false);
    }
  }, [
    APIPost,
    authStatus.loggedIn,
    navigation,
    prescriptionCart,
    resetAddedOVPPrescriptions,
    resetPrescriptionCart,
    showErrorToast,
    showSuccessToast,
  ]);

  // Navigation
  const goToLogin = useCallback(() => {
    setLogOutDialogOpen(false);
    navigation.navigate('Login');
  }, [navigation]);

  const toggleLogOutDialogOpen = useCallback(() => {
    setLogOutDialogOpen(prev => !prev);
  }, []);

  const resetCart = useCallback(() => {
    resetPrescriptionCart();
    resetAddedOVPPrescriptions();
  }, [resetAddedOVPPrescriptions, resetPrescriptionCart]);

  return (
    <ScreenBase>
      <VStack
        h="100%"
        bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
        alignItems="center">
        <Header
          screenTitle="Order via Prescription"
          controls={
            <Button p={0} variant="unstyled" onPress={resetCart}>
              <HStack space={2}>
                <Text color={isDesktop ? '#2E6ACF' : '#FFFFFF'} fontSize={16}>
                  Clear
                </Text>
              </HStack>
            </Button>
          }
          headerBaseStyle={styles.customHeaderBase}
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        <ScrollView
          width="100%"
          bounces={false}
          style={styles.contentBase}
          contentContainerStyle={styles.contentContainerStyle}>
          <ScrollView
            bounces={false}
            position="absolute"
            height="100%"
            width="100%">
            <FontAwesomeIcon
              icon="prescription"
              size={25}
              color="#2E6ACF"
              style={styles.prescriptionIcon}
            />
            {prescriptionCart.texts.map(
              (item: PrescriptionItem, index: number) => (
                <HStack
                  key={`item-${index}`}
                  space={2}
                  px={5}
                  py={3}
                  justifyContent="space-between">
                  <HStack space={2} flex={1} alignItems="center">
                    <Text fontSize={22} color="#5C5C5C">
                      {index + 1}
                    </Text>
                    <Input
                      flex={1}
                      size="xl"
                      p={0}
                      color="#5C5C5C"
                      variant="unstyled"
                      fontSize={22}
                      width="100%"
                      placeholder="Type Here"
                      value={item.text}
                      onChangeText={value => editItem(index, value)}
                      onBlur={() => editItemComplete(index, item.text)}
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Enter') {
                          addItem();
                        }
                      }}
                    />
                  </HStack>
                  <Counter
                    buttonPadding={2}
                    value={item.qty}
                    add={() => manipulateItemQuantity(index, '+')}
                    subtract={() => manipulateItemQuantity(index, '-')}
                    containerStyle={styles.qtyCounter}
                    labelColor="#ffffff"
                  />
                </HStack>
              ),
            )}
            <HStack space={2} p={2} px={5} alignItems="center">
              <Text fontSize={22} color="#858585">
                {prescriptionCart.texts.length + 1}
              </Text>
              <Input
                ref={inputRef}
                flex={1}
                size="xl"
                p={0}
                variant="unstyled"
                fontSize={22}
                width="100%"
                placeholderTextColor="#858585"
                placeholder="Type Here"
                value={localItem}
                onChangeText={setLocalItem}
                onBlur={addItem}
                onKeyPress={({nativeEvent}) => {
                  if (nativeEvent.key === 'Enter') {
                    addItem();
                  }
                }}
              />
            </HStack>
            <View height={300} />
          </ScrollView>
          <CartControlPanel
            cartItems={prescriptionCart.texts}
            bottomTabsMounted={false}
            shippingType={prescriptionCart.shippingType}
            setShippingType={setShippingType}
            submitting={submitting}
            updateCart={updatePrescriptionCart}
            navigation={navigation}
            placeOrder={placeOrder}
            locationId={prescriptionCart.locationId}
            retailerId={prescriptionCart.retailerId}
            imageUploadEnabled
            takePhoto={takePhoto}
            pickImage={pickImage}
            addedPrescriptions={addedOVPPrescriptions}
            removePrescription={removePrescription}
          />
        </ScrollView>
      </VStack>
      <P1AlertDialog
        heading={LOGIN_REQUIRED_MESSAGE}
        body={LOGIN_REQUIRED_BODY}
        isOpen={logOutDialogOpen}
        toggleOpen={toggleLogOutDialogOpen}
        buttons={[
          {
            label: 'Proceed to Login',
            variant: 'solid',
            style: {...styles.logOutConfirmButton, backgroundColor: '#D00000'},
            action: goToLogin,
          },
        ]}
      />
    </ScreenBase>
  );
};

export default PrescriptionOrder;
