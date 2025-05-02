import {useState, useRef, useContext} from 'react';
import {ScreenBase} from '@Containers';
import {
  Button,
  HStack,
  Heading,
  Input,
  ScrollView,
  Text,
  VStack,
  View,
} from 'native-base';
import {Dimensions, Platform, StyleSheet, TextInput} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {
  CartControlPanel,
  Counter,
  Header,
  P1AlertDialog,
} from '@commonComponents';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {update} from 'lodash';
import {RootStackParamList} from 'App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {uploadToServer} from '@fileHandler';
import {ToastProfiles} from '@ToastProfiles';
import {Buffer} from 'buffer';
import {extensionFromBase64, mimeFromBase64, parseError} from '@helpers';
import {getURL} from '@APIRepository';
import { useContextSelector } from 'use-context-selector';
import React from 'react';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

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
});

const PrescriptionOrder = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'PrescriptionOrder'>) => {
  const [submitting, setSubmitting] = useState(false);
  const [localItem, setLocalItem] = useState('');
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);

  const toggleLogOutDialogOpen = () => {
    // if (logOutDialogOpen) {
    //     navigation.goBack();
    // }

    setLogOutDialogOpen(!logOutDialogOpen);
  };

  const inputRef = useRef<TextInput>(null);

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

  const addItem = () => {
    if (localItem && localItem.trim() !== '') {
      updatePrescriptionCart({
        texts: [
          ...prescriptionCart.texts,
          {
            text: localItem,
            qty: 1,
          },
        ],
      });
      setLocalItem('');
      inputRef.current?.focus();
    }
  };

  const removeItem = (index: number, value: string) => {
    const localItems = [...prescriptionCart.texts];
    localItems.splice(index, 1);
    updatePrescriptionCart({
      texts: localItems,
    });
  };

  const editItem = (index: number, value: string) => {
    const localItems = [...prescriptionCart.texts];
    localItems[index].text = value;
    updatePrescriptionCart({
      texts: localItems,
    });
  };

  const editItemComplete = (index: number, value: string) => {
    if (value.trim() === '') {
      removeItem(index, value);
    }
  };

  const manipulateItemQuantity = (index: number, operation: '+' | '-') => {
    const localItems = [...prescriptionCart.texts];
    if (operation === '+') {
      localItems[index].qty += 1;
    } else {
      if (localItems[index].qty === 1) {
        localItems.splice(index, 1);
      } else {
        localItems[index].qty -= 1;
      }
    }

    updatePrescriptionCart({
      texts: localItems,
    });
  };

  const setShippingType = (value: boolean, locationsReference: any) => {
    updatePrescriptionCart({
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
      uploadToServer(
        {
          data: Buffer.from(image.base64 || '', 'base64'),
          name:
            image.fileName ||
            `prescription-${Date.now()}.${extensionFromBase64(image.uri)}`,
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
              updatePrescriptionCart({
                prescriptionIds: [
                  ...(prescriptionCart.prescriptionIds || []),
                  response.data.id,
                ],
              });
              setAddedOVPPrescriptions([
                ...addedOVPPrescriptions,
                {id: response.data.id, imageUrl: res},
              ]);
            })
            .catch((error: any) => {
              showToast({
                ...ToastProfiles.error,
                title: parseError(error).message,
                id: 'prescription-save-error',
              });
            });
        })
        .catch((error: any) => {
          showToast({
            ...ToastProfiles.error,
            title: parseError(error).message,
            id: 'image-upload-error',
          });
        });
    }
  };

  const removePrescription = (id: string) => {
    const updatedPrescriptions = addedOVPPrescriptions.filter(
      (item: any) => item.id !== id,
    );
    updatePrescriptionCart({
      prescriptionIds: prescriptionCart.prescriptionIds?.filter(
        (item: string) => item !== id,
      ),
    });
    setAddedOVPPrescriptions(updatedPrescriptions);
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

    if (
      prescriptionCart.texts.length === 0 &&
      (!prescriptionCart.prescriptionIds ||
        prescriptionCart.prescriptionIds === '')
    ) {
      showToast({
        ...ToastProfiles.error,
        title:
          'Please either enter the prescription items by typing in, \n or upload a picture of the prescription',
        id: 'empty-cart',
      });
      return;
    }

    if (
      prescriptionCart.shippingType === 0 &&
      (!prescriptionCart.locationId || prescriptionCart.locationId === '')
    ) {
      showToast({
        ...ToastProfiles.error,
        title: 'Please select a delivery address',
        id: 'empty-location',
      });
      return;
    }

    const cartBody = {
      texts: prescriptionCart.texts,
      shippingType: prescriptionCart.shippingType,
      locationId: prescriptionCart.locationId,
      prescriptionIds: prescriptionCart.prescriptionIds,
    };

    setSubmitting(true);

    APIPost({
      url: getURL({
        key: 'PLACE_ORDER',
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
        });

        setSubmitting(false);

        resetPrescriptionCart();

        resetAddedOVPPrescriptions();

        navigation.replace('OrderDetails', {
          orderId: response.data.id,
        });
      },
      reject: (error: any) => {
        setSubmitting(false);
        showToast({
          ...ToastProfiles.error,
          title: parseError(error).message,
          id: 'bill-submit-error',
        });
      },
    });
  };

  const goToLogin = () => {
    toggleLogOutDialogOpen();
    navigation.navigate('Login');
  };

  return (
    <ScreenBase>
      <VStack
        h="100%"
        bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
        alignItems="center">
        <Header
          screenTitle="Order via Prescription"
          controls={
            <Button p={0} variant="unstyled" onPress={resetPrescriptionCart}>
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
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                marginBottom: 10,
              }}
            />
            {(prescriptionCart.texts || []).map((item: any, index: number) => (
              <HStack
                key={index}
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
            ))}
            <HStack space={2} p={2} px={5} alignItems="center">
              <Text fontSize={22} color="#858585">
                {prescriptionCart.texts?.length + 1}
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
                placeholder={'Type Here'}
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
        heading="You need to log-in first"
        body="To place an order via prescription, you need to be logged in. Please login to continue."
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
