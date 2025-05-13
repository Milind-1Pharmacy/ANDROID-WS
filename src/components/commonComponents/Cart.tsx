import React, {useContext, useState} from 'react';
import {Dimensions, StyleSheet, Platform, Alert, Linking} from 'react-native';
import {
  FlatList,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Text,
  VStack,
  View,
  Divider,
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCartPlus,
  faTrashAlt,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Buffer} from 'buffer';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

// Contexts
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
  useIsPickupMode,
} from '@contextProviders';

// Constants
import {RUPEE_SYMBOL, UserRole, UserRoleAlias} from '@Constants';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';

// Helpers
import {
  extensionFromBase64,
  getCartTotalCalculator,
  getCartBodyProcessor,
  getItemPriceKey,
  mimeFromBase64,
  placeOrderAPIKey,
  parseError,
} from '@helpers';

// Components
import InfoScreen from './InfoScreen';
import Counter from './Counter';
import CartControlPanel from './CartControlPanel';
import P1AlertDialog from './P1AlertDialog';

// Utils
import {uploadToServer} from '@fileHandler';
import {useContextSelector} from 'use-context-selector';

const {width: screenWidth} = Dimensions.get('window');
const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
    backgroundColor: '#2E6ACF',
  },
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  contentContainerStyle: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 300,
  },
  productImage: {
    height: 65,
    width: 65,
    borderRadius: 10,
    objectFit: 'contain',
    backgroundColor: '#EDCAD1',
  },
  cartItemCounter: {
    borderRadius: 8,
    width: 100,
    padding: 1,
  },
  bottomSheetOption: {
    marginVertical: 5,
    marginHorizontal: 15,
    width: screenWidth - 30,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postOrderListThumbnail: {
    height: 45,
    width: 45,
    borderRadius: 10,
    objectFit: 'contain',
    backgroundColor: '#EDCAD1',
  },
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cartItemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});

interface CartProps {
  navigation: any;
  bottomTabsMounted?: boolean;
}

const Cart: React.FC<CartProps> = ({navigation, bottomTabsMounted}) => {
  const [submitting, setSubmitting] = useState(false);
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);
  const [orderSPDialogOpen, setOrderSPDialogOpen] = useState(false);

  const isPickupMode = useIsPickupMode();
  const {authStatus, appMode} = useContext(AuthContext);
  const {APIPost} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);

  const {
    cart,
    updateCart,
    resetCart,
    addedPrescriptions,
    setAddedPrescriptions,
    resetAddedPrescriptions,
    handleAdd,
    handleSubtract,
  } = useContextSelector(FormStateContext, state => ({
    cart: state.cart,
    updateCart: state.updateCart,
    resetCart: state.resetCart,
    addedPrescriptions: state.addedPrescriptions,
    setAddedPrescriptions: state.setAddedPrescriptions,
    resetAddedPrescriptions: state.resetAddedPrescriptions,
    handleAdd: state.handleAdd,
    handleSubtract: state.handleSubtract,
  }));

  const priceKey = getItemPriceKey(appMode as string);
  const cartTotalCalculator = getCartTotalCalculator(appMode as string);
  const cartBodyProcessor = getCartBodyProcessor(appMode as string);

  // ======================
  // Permission Handling
  // ======================
  const requestCameraPermission = async (): Promise<boolean> => {
    let cameraPermission;
    let storagePermission;

    if (Platform.OS === 'android') {
      cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
      if (Platform.Version >= 33) {
        storagePermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      } else {
        storagePermission = await check(
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );
      }

      if (
        cameraPermission === RESULTS.DENIED ||
        storagePermission === RESULTS.DENIED
      ) {
        cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
        storagePermission =
          Platform.Version >= 33
            ? await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
            : await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }

      const allGranted =
        cameraPermission === RESULTS.GRANTED &&
        storagePermission === RESULTS.GRANTED;

      return allGranted;
    }

    if (Platform.OS === 'ios') {
      const iosCameraPermission = await check(PERMISSIONS.IOS.CAMERA);

      if (iosCameraPermission === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);
        return requestResult === RESULTS.GRANTED;
      }

      return iosCameraPermission === RESULTS.GRANTED;
    }

    return false;
  };

  const toggleOrderSPDialogOpen = () =>
    setOrderSPDialogOpen(!orderSPDialogOpen);
  const toggleLogOutDialogOpen = () => setLogOutDialogOpen(!logOutDialogOpen);

  const removeItemFromCart = (item: any) => {
    const updatedItems = cart.items.filter(
      (cartItem: any) => cartItem.id !== item.id,
    );
    updateCart({
      items: updatedItems,
      totalAmount: cartTotalCalculator(updatedItems),
    });
  };

  const setShippingType = (value: boolean, locationsReference: any) => {
    updateCart({
      shippingType: value ? 1 : 0,
      locationId: value
        ? ''
        : locationsReference.list.find((location: any) => location.selected)
            ?.id,
    });
  };

  // ======================
  // Image Handling
  // ======================
  const handleImageUpload = async (response: any) => {
    if (!response?.assets?.[0]) {
      console.log('No image selected or captured');
      showToast({
        ...ToastProfiles.error,
        title: 'No image was selected',
        id: `no-image-selected-${Date.now()}`, // Add timestamp to make unique
        origin: 'top',
      });
      return;
    }

    const image = response.assets[0];
    console.log('Image details:', {
      uri: image.uri,
      type: image.type,
      fileSize: image.fileSize,
      width: image.width,
      height: image.height,
      base64: image.base64 ? `${image.base64.substring(0, 30)}...` : 'none',
    });

    // Validate image
    if (!image.uri || (!image.base64 && Platform.OS === 'android')) {
      showToast({
        ...ToastProfiles.error,
        title: 'Invalid image data',
        id: `invalid-image-data-${Date.now()}`, // Add timestamp to make unique
        origin: 'top',
      });
      return;
    }

    try {
      const fileName =
        image.fileName ||
        `prescription-${Date.now()}.${extensionFromBase64(image.uri)}`;

      console.log('Starting image upload...');
      const uploadResponse = await uploadToServer(
        {
          data: Buffer.from(image.base64 || '', 'base64'),
          name: fileName,
          type: image.type || mimeFromBase64(image.uri),
        },
        {APIPost},
      );

      console.log('Upload successful, saving prescription...');
      const prescriptionResponse = await APIPost({
        url: getURL({key: 'PRESCRIPTION'}),
        body: {imageUrl: uploadResponse},
      });

      console.log('Prescription saved successfully');
      updateCart({
        prescriptionIds: [
          ...(cart.prescriptionIds || []),
          prescriptionResponse.data.id,
        ],
      });
      setAddedPrescriptions([
        ...(Array.isArray(addedPrescriptions) ? addedPrescriptions : []),
        {id: prescriptionResponse.data.id, imageUrl: uploadResponse},
      ]);

      showToast({
        ...ToastProfiles.success,
        title: 'Prescription uploaded successfully',
        id: `prescription-upload-success-${Date.now()}`, // Add timestamp to make unique
        origin: 'top',
      });
    } catch (error) {
      console.error('Image processing error:', error);
      handleImageProcessingError(error);
    }
  };

  const handleImageProcessingError = (error: any) => {
    const errorDetails = parseError(error);
    console.log('Image processing failed:', errorDetails);

    showToast({
      ...ToastProfiles.error,
      title: errorDetails.message || 'Failed to process image',
      id: `image-processing-error-${Date.now()}`, // Add timestamp to make unique
      origin: 'top',
    });
  };

  // const handlePrescriptionSaveError = (error: any) => {
  //   console.log('ERROR==LOL==========', parseError(error));
  //   showToast({
  //     ...ToastProfiles.error,
  //     title: parseError(error).message,
  //     id: 'prescription-save-error',
  //     origin: 'top',
  //   });
  // };

  // const handleImageUploadError = (error: any) => {
  //   console.log('LOL=====', error);
  //   showToast({
  //     ...ToastProfiles.error,
  //     title: parseError(error).message,
  //     id: 'image-upload-error',
  //     origin: 'top',
  //   });
  // };

  const removePrescription = (id: string) => {
    const updatedPrescriptions = addedPrescriptions.filter(
      (item: any) => item.id !== id,
    );
    updateCart({
      prescriptionIds: cart.prescriptionIds?.filter(
        (item: string) => item !== id,
      ),
    });
    setAddedPrescriptions(updatedPrescriptions);
  };

  // ======================
  // Camera/Gallery Functions
  // ======================
  const takePhoto = async () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();
      return;
    }

    try {
      const hasPermission = await requestCameraPermission();
      console.log('Camera permission:', hasPermission);

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera and storage permissions are required to take photos. Please enable them in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return;
      }

      console.log('Launching camera...');
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.3,
        includeBase64: true,
        saveToPhotos: true,
        cameraType: 'back',
      });

      console.log('Camera result:', result);
      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      await handleImageUpload(result);
    } catch (error) {
      console.error('Camera error:', error);
      handleImageProcessingError(error);
    }
  };

  const pickImage = async () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          showToast({
            ...ToastProfiles.error,
            title: 'Storage permission denied',
            id: `storage-permission-denied-${Date.now()}`, // Add timestamp to make unique
            origin: 'top',
          });
          return;
        }
      }

      console.log('Launching image picker...');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.3,
        includeBase64: true,
        selectionLimit: 1,
      });

      console.log('Image picker result:', result);
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      await handleImageUpload(result);
    } catch (error) {
      console.error('Image picker error:', error);
      handleImageProcessingError(error);
    }
  };

  // const pickImage = () => {
  //   if (!authStatus.loggedIn) {
  //     toggleLogOutDialogOpen();
  //     return;
  //   }

  //   launchImageLibrary({
  //     mediaType: 'photo',
  //     quality: 0.3,
  //     includeBase64: true,
  //   }).then(handleImageUpload);
  // };

  const validateOrder = () => {
    if (cart.items.length === 0) {
      showToast({
        ...ToastProfiles.error,
        title: 'Your cart is empty',
        id: 'empty-cart',
        origin: 'top',
      });
      return false;
    }

    if (
      appMode === UserRoleAlias.CUSTOMER &&
      cart.shippingType === 0 &&
      !cart.locationId
    ) {
      showToast({
        ...ToastProfiles.error,
        title: 'Please select a delivery address',
        id: 'empty-location',
        origin: 'top',
      });
      return false;
    }

    return true;
  };

  const placeOrder = () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();
      return;
    }

    if (!validateOrder()) return;

    const cartBody = cartBodyProcessor(cart);
    setSubmitting(true);

    APIPost({
      url: getURL({key: placeOrderAPIKey[appMode as string]}),
      body: cartBody,
      resolve: handleOrderSuccess,
      reject: handleOrderError,
    });
  };

  const handleOrderSuccess = (response: any) => {
    if (!response.data) throw response;

    showToast({
      ...ToastProfiles.success,
      title: response.data.userMessage,
      id: 'order-submit-success',
      origin: 'top-left',
    });

    setSubmitting(false);

    if (appMode === UserRoleAlias.CUSTOMER) {
      resetCartAndNavigate(response.data.id);
    } else {
      toggleOrderSPDialogOpen();
    }
  };

  const handleOrderError = (error: any) => {
    setSubmitting(false);

    if (error.error) {
      showToast({
        ...ToastProfiles.error,
        title: parseError(error).message,
        id: 'order-submit-error',
        origin: 'top',
      });
      return;
    }

    showToast({...ToastProfiles.error, id: 'bill-submit-error'});
  };

  const resetCartAndNavigate = (orderId: string) => {
    resetCart();
    resetAddedPrescriptions();
    navigation.navigate('OrderDetails', {orderId});
  };

  const onOrderComplete = () => {
    resetCart();
    resetAddedPrescriptions();
    toggleOrderSPDialogOpen();

    if (bottomTabsMounted) {
      navigation.push('Home');
    } else {
      navigation.navigate('Home', {initialTab: 'Dashboard'});
    }
  };

  const goToLogin = () => {
    toggleLogOutDialogOpen();
    navigation.navigate('Login');
  };

  const renderCartItem = ({item, index}: {item: any; index: number}) => (
    <View style={styles.cartItemContainer} key={`${item.id}_${index}`}>
      <HStack space={2} alignItems="center">
        <Image
          source={{uri: item.imageUrl}}
          style={styles.productImage}
          alt={item.name}
          accessibilityLabel={item.name}
        />
        <VStack flex={1} alignItems="flex-start">
          <HStack
            width="100%"
            alignItems="center"
            justifyContent="space-between">
            <Text fontSize={14} lineHeight={14} fontWeight="500">
              {item.name}
            </Text>
            <IconButton
              icon={
                <FontAwesomeIcon icon={faTrashAlt} color="#FF0000" size={16} />
              }
              onPress={() => removeItemFromCart(item)}
            />
          </HStack>
          <HStack
            width="100%"
            alignItems="center"
            justifyContent="space-between">
            <Text fontSize={16} lineHeight={16} fontWeight="600">
              {`${RUPEE_SYMBOL} ${(
                item[priceKey] ??
                item.price ??
                0
              ).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}`}
            </Text>
            <Counter
              value={item.qty || 0}
              zeroCounterLabel="Add to Cart"
              add={() => handleAdd(item)}
              subtract={() => handleSubtract(item)}
              containerStyle={styles.cartItemCounter}
              buttonPadding={2}
            />
          </HStack>
        </VStack>
      </HStack>
    </View>
  );

  const renderOrderSummaryItem = (item: any, index: number) => (
    <>
      <HStack justifyContent="space-between">
        <HStack space={2} alignItems="center">
          <Image
            source={{uri: item.imageUrl}}
            style={styles.postOrderListThumbnail}
            alt={item.name}
            accessibilityLabel={item.name}
          />
          <Text
            flex={1}
            fontSize={14}
            lineHeight={14}
            fontWeight="500"
            numberOfLines={1}>
            {item.name}
          </Text>
        </HStack>
        <VStack alignItems="flex-end" space={1}>
          <Text fontSize={14} lineHeight={14} fontWeight="600">
            {`${
              [UserRoleAlias.CUSTOMER, UserRoleAlias.B2C_SALESMAN, ''].includes(
                appMode as UserRole,
              )
                ? 'MRP: '
                : 'PTR: '
            }${RUPEE_SYMBOL} ${(
              item[priceKey] ??
              item.price ??
              0
            ).toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}`}
          </Text>
          <Text fontSize={14} lineHeight={14}>
            {`Qty: ${item.qty}`}
          </Text>
        </VStack>
      </HStack>
      {index < cart.items.length - 1 && <Divider orientation="horizontal" />}
    </>
  );

  return (
    <VStack flex={1} bgColor="#2E6ACF" alignItems="center">
      {/* Header */}
      <HStack style={styles.header}>
        <HStack space={2} alignItems="center">
          <IconButton
            variant="unstyled"
            onPress={navigation.goBack}
            p={0}
            icon={
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
            }
          />
          <FontAwesomeIcon icon={faCartPlus} size={25} color="#FFFFFF" />
          <Text style={styles.whiteText} fontSize={20} fontWeight="400">
            Shopping Cart
          </Text>
        </HStack>
        <Text style={styles.whiteText} fontSize={20} fontWeight="400">
          {`${RUPEE_SYMBOL} ${(cart.totalAmount ?? 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}`}
        </Text>
      </HStack>

      {/* Cart Content */}
      <View style={styles.contentBase}>
        <VStack position="absolute" height="100%" width="100%">
          <Text style={styles.sectionHeader}>Items in your Cart:</Text>
          <FlatList
            height="100%"
            bounces={false}
            data={cart.items}
            contentContainerStyle={styles.contentContainerStyle}
            ListEmptyComponent={() => (
              <InfoScreen message="Your cart is empty" />
            )}
            renderItem={renderCartItem}
          />
        </VStack>

        {/* Control Panel */}
        <CartControlPanel
          cartItems={cart.items}
          bottomTabsMounted={bottomTabsMounted ?? false}
          shippingType={cart.shippingType}
          setShippingType={setShippingType}
          submitting={submitting}
          updateCart={updateCart}
          navigation={navigation}
          placeOrder={placeOrder}
          locationId={cart.locationId}
          retailerId={cart.retailerId}
          imageUploadEnabled
          takePhoto={takePhoto}
          pickImage={pickImage}
          addedPrescriptions={addedPrescriptions}
          removePrescription={removePrescription}
        />
      </View>

      {/* Login Required Dialog */}
      <P1AlertDialog
        heading="You need to log-in first"
        body="To place an order, you need to be logged in. Please login to continue."
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

      {/* Order Success Dialog */}
      <P1AlertDialog
        heading="Order Placed Successfully"
        body={
          <ScrollView maxHeight={80} contentContainerStyle={{gap: 10}}>
            {cart.items.map((item: any, index: number) =>
              renderOrderSummaryItem(item, index),
            )}
          </ScrollView>
        }
        hideCancel
        isOpen={orderSPDialogOpen}
        toggleOpen={toggleOrderSPDialogOpen}
        onClose={onOrderComplete}
        buttons={[
          {
            label: 'Done',
            variant: 'solid',
            style: styles.logOutConfirmButton,
            action: onOrderComplete,
          },
        ]}
      />
    </VStack>
  );
};

export default Cart;
