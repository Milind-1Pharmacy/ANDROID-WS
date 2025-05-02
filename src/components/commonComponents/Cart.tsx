import P1Styles from '@P1StyleSheet';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
  useIsPickupMode,
} from '@contextProviders';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  Divider,
  FlatList,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Text,
  VStack,
  View,
} from 'native-base';
import React, {useContext, useState} from 'react';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import {RUPEE_SYMBOL, UserRole, UserRoleAlias} from '@Constants';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {uploadToServer} from '@fileHandler';
import {
  extensionFromBase64,
  getCartTotalCalculator,
  getCartBodyProcessor,
  getItemPriceKey,
  mimeFromBase64,
  placeOrderAPIKey,
  parseError,
} from '@helpers';
import {Buffer} from 'buffer';
import InfoScreen from './InfoScreen';
import Counter from './Counter';
import CartControlPanel from './CartControlPanel';
import P1AlertDialog from './P1AlertDialog';
import {faCartPlus} from '@fortawesome/free-solid-svg-icons';
import {useContextSelector} from 'use-context-selector';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  contentBase: {
    flex: 1,
    width: isDesktop ? '99%' : '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
    marginHorizontal: isDesktop ? 10 : 0,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
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
  actionSheetStyle: {
    alignItems: 'flex-start',
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
  deliveryTypeHandle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
  postOrderListThumbnail: {
    height: 45,
    width: 45,
    borderRadius: 10,
    objectFit: 'contain',
    backgroundColor: '#EDCAD1',
  },
});

const Cart = (props: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);
  const [orderSPDialogOpen, setOrderSPDialogOpen] = useState(false);
  const isPickupMode = useIsPickupMode();
  const toggleOrderSPDialogOpen = () =>
    setOrderSPDialogOpen(!orderSPDialogOpen);

  const toggleLogOutDialogOpen = () => {
    // if (logOutDialogOpen) {
    //     props.navigation.goBack();
    // }

    setLogOutDialogOpen(!logOutDialogOpen);
  };

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

  const {authStatus, appMode} = useContext(AuthContext);

  const {APIPost} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  const priceKey = getItemPriceKey(appMode as string);

  const cartTotalCalculator = getCartTotalCalculator(appMode as string);

  const cartBodyProcessor = getCartBodyProcessor(appMode as string);

  const removeItemFromCart = (item: any) => {
    const cartItems = [...cart.items];

    const itemIndex = cartItems.findIndex(
      (cartItem: any) => cartItem.id === item.id,
    );

    cartItems.splice(itemIndex, 1);

    updateCart({
      items: cartItems,
      totalAmount: cartTotalCalculator(cartItems),
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

  const uploadImage = (response: any) => {
    if (response) {
      const image = response?.assets[0];
      const fileName =
        image.fileName ||
        `prescription-${Date.now()}.${extensionFromBase64(image.uri)}`;
      uploadToServer(
        {
          data: Buffer.from(image.base64 || '', 'base64'),
          name: fileName,
          type: image.type || mimeFromBase64(image.uri),
        },
        {
          APIPost,
        },
      )
        .then((res: any) => {
          APIPost({
            url: getURL({
              key: 'PRESCRIPTION',
            }),
            body: {
              imageUrl: res,
            },
          })
            .then((response: any) => {
              updateCart({
                prescriptionIds: [
                  ...(cart.prescriptionIds || []),
                  response.data.id,
                ],
              });
              setAddedPrescriptions([
                ...addedPrescriptions,
                {id: response.data.id, imageUrl: res},
              ]);
            })
            .catch((error: any) => {
              showToast({
                ...ToastProfiles.error,
                title: parseError(error).message,
                id: 'prescription-save-error',
                origin: 'top',
              });
            });
        })
        .catch((error: any) => {
          showToast({
            ...ToastProfiles.error,
            title: parseError(error).message,
            id: 'image-upload-error',
            origin: 'top',
          });
        });
    }
  };

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

  const takePhoto = () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();

      return;
    }

    launchCamera({
      mediaType: 'photo',
      quality: 0.3,
      includeBase64: true,
      saveToPhotos: true,
    }).then(uploadImage);
  };

  const pickImage = () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();

      return;
    }

    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.3,
      includeBase64: true,
    }).then(uploadImage);
  };

  const placeOrder = () => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();

      return;
    }

    if (cart.items.length === 0) {
      showToast({
        ...ToastProfiles.error,
        title: 'Your cart is empty',
        id: 'empty-cart',
        origin: 'top',
      });
      return;
    }

    if (
      appMode === UserRoleAlias.CUSTOMER &&
      cart.shippingType === 0 &&
      (!cart.locationId || cart.locationId === '')
    ) {
      showToast({
        ...ToastProfiles.error,
        title: 'Please select a delivery address',
        id: 'empty-location',
        origin: 'top',
      });
      return;
    }

    const cartBody = cartBodyProcessor(cart);

    setSubmitting(true);

    APIPost({
      url: getURL({
        key: placeOrderAPIKey[appMode as string],
      }),
      body: cartBody,
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        showToast({
          ...ToastProfiles.success,
          title: response.data.userMessage,
          id: 'order-submit-success',
          origin: 'top-left',
        });

        setSubmitting(false);

        if (appMode === UserRoleAlias.CUSTOMER) {
          resetCart();

          resetAddedPrescriptions();

          props.navigation.navigate('OrderDetails', {
            orderId: response.data.id,
          });
        } else {
          toggleOrderSPDialogOpen();
        }
      },
      reject: (error: any) => {
        if (error.error) {
          showToast({
            ...ToastProfiles.error,
            title: parseError(error).message,
            id: 'order-submit-error',
            origin: 'top',
          });
          setSubmitting(false);
          return;
        }
        setSubmitting(false);
        showToast({...ToastProfiles.error, id: 'bill-submit-error'});
      },
    });
  };

  const onOrderComplete = () => {
    resetCart();

    resetAddedPrescriptions();

    toggleOrderSPDialogOpen();

    if (props.bottomTabsMounted) props.navigation.push('Home');
    else props.navigation.navigate('Home', {initialTab: 'Dashboard'});
  };

  const goToLogin = () => {
    toggleLogOutDialogOpen();
    props.navigation.navigate('Login');
  };

  return (
    <VStack
      h="100%"
      bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
      alignItems="center">
      <HStack style={styles.header}>
        <HStack space={2} alignItems="center">
          <IconButton
            variant="unstyled"
            onPress={props.navigation.goBack}
            p={0}
            icon={
              <FontAwesomeIcon
                icon="arrow-left"
                size={20}
                color={isDesktop ? '#2E6ACF' : '#FFFFFF'}
              />
            }
          />
          <FontAwesomeIcon
            icon={faCartPlus}
            size={25}
            style={{color: isDesktop ? '#2E6ACF' : '#FFFFFF'}}
          />
          <Text
            color={isDesktop ? '#2E6ACF' : '#FFFFFF'}
            fontSize={20}
            fontWeight="400">
            Shopping Cart
          </Text>
        </HStack>
        <Text
          color={isDesktop ? '#2E6ACF' : '#FFFFFF'}
          fontSize={20}
          fontWeight="400">
          {RUPEE_SYMBOL +
            ' ' +
            (cart.totalAmount ?? 0).toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
        </Text>
      </HStack>
      <View style={styles.contentBase}>
        <VStack position="absolute" height="100%" width="100%">
          <Text
            fontSize={14}
            bold
            p={3}
            borderBottomWidth={1}
            borderBottomColor="#E0E0E0">
            Items in your Cart:
          </Text>
          <FlatList
            height="100%"
            bounces={false}
            data={cart.items}
            contentContainerStyle={styles.contentContainerStyle}
            ListEmptyComponent={() => (
              <InfoScreen message="Your cart is empty" />
            )}
            renderItem={({item, index}: {item: any; index: number}) => (
              <VStack
                key={`${item.id.toString()}_${index}_${Date.now()}`}
                p={3}
                borderBottomWidth={index === cart.items.length - 1 ? 0 : 1}
                borderBottomColor="#E0E0E0">
                <HStack space={2} alignItems="center">
                  <View>
                    <Image
                      source={{
                        uri: item.imageUrl,
                      }}
                      style={styles.productImage}
                      alt={item.name}
                      accessibilityLabel={item.name}
                    />
                  </View>
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
                          <FontAwesomeIcon icon="trash-alt" color="#FF0000" />
                        }
                        onPress={() => removeItemFromCart(item)}
                      />
                    </HStack>
                    <HStack
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between">
                      <Text fontSize={16} lineHeight={16} fontWeight="600">
                        {RUPEE_SYMBOL +
                          ' ' +
                          (item[priceKey] ?? item.price ?? 0).toLocaleString(
                            'en-US',
                            {maximumFractionDigits: 2},
                          )}
                      </Text>
                      <Counter
                        value={
                          cart.items.find(
                            (cartItem: any) => cartItem.id === item.id,
                          )?.qty || 0
                        }
                        zeroCounterLabel="Add to Cart"
                        add={() => handleAdd(item)}
                        subtract={() => handleSubtract(item)}
                        containerStyle={styles.cartItemCounter}
                        buttonPadding={2}
                      />
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            )}
          />
        </VStack>
        <CartControlPanel
          cartItems={cart.items}
          bottomTabsMounted={props.bottomTabsMounted}
          shippingType={cart.shippingType}
          setShippingType={setShippingType}
          submitting={submitting}
          updateCart={updateCart}
          navigation={props.navigation}
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
      <P1AlertDialog
        heading="You need to log-in first"
        body="To place an order, you need to be logged in. Please login to continue."
        isOpen={logOutDialogOpen}
        toggleOpen={toggleLogOutDialogOpen}
        buttons={[
          {
            label: 'Proceed to Login',
            variant: 'solid',
            style: {
              ...styles.logOutConfirmButton,
              backgroundColor: '#D00000',
            },
            action: goToLogin,
          },
        ]}
      />
      <P1AlertDialog
        heading="Order Placed Successfully"
        body={
          <ScrollView maxHeight={80} contentContainerStyle={{gap: 10}}>
            {cart.items?.map((item: any, index: number) => (
              <>
                <HStack justifyContent="space-between">
                  <HStack space={2} alignItems="center">
                    <Image
                      source={{
                        uri: item.imageUrl,
                      }}
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
                      {([
                        UserRoleAlias.CUSTOMER,
                        UserRoleAlias.B2C_SALESMAN,
                        ``,
                      ].includes(appMode as UserRole)
                        ? 'MRP: '
                        : 'PTR: ') +
                        RUPEE_SYMBOL +
                        ' ' +
                        (item[priceKey] ?? item.price ?? 0).toLocaleString(
                          'en-US',
                          {maximumFractionDigits: 2},
                        )}
                    </Text>
                    <Text fontSize={14} lineHeight={14}>
                      {'Qty: ' + item.qty}
                    </Text>
                  </VStack>
                </HStack>
                {index < cart.items?.length - 1 && (
                  <Divider orientation="horizontal" />
                )}
              </>
            ))}
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
            style: {...styles.logOutConfirmButton},
            action: onOrderComplete,
          },
        ]}
      />
    </VStack>
  );
};
export default Cart;
