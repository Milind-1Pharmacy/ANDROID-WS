import {useContext, useEffect, useState} from 'react';
import React from 'react';
import {ScreenBase} from '@Containers';
import {Header} from '@commonComponents';
import {StyleSheet} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {Button, HStack, Input, Text, VStack, View} from 'native-base';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Chip} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import Emitter from '@Emitter';
import {UserRoleAlias} from '@Constants';
import {parseError} from '@helpers';
import { useContextSelector } from 'use-context-selector';

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    ...P1Styles.shadowTopLarge,
  },
  contentContainerStyle: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 300,
  },
  referenceField: {
    marginHorizontal: 20,
    marginVertical: 5,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 5,
    ...P1Styles.shadow,
  },
  filterChip: {
    padding: 5,
    paddingVertical: 7.5,
    backgroundColor: '#FFFFFF',
  },
  unSelectedChip: {
    // paddingX: 10,
    // paddingY: 5,
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  selectedChip: {
    // paddingX: 10,
    // paddingY: 5,
    backgroundColor: '#2E6ACF',
    borderColor: '#2E6ACF',
    ...P1Styles.shadow,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 15,
    ...P1Styles.shadowTop,
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

const titleOptions = ['Home', 'Work', 'Other'];

const requiredItemsValidationMessages: {[key: string]: string} = {
  customerName: 'Please add a Customer Name',
  house: 'Please enter the House Number',
  area: 'Please enter the area',
  title: 'Please select the title of the address',
};

const appartmentModeRequiredItemsValidationMessages: {[key: string]: string} = {
  customerName: 'Please add a Customer Name',
  house: 'Please enter the House Number',
  title: 'Please select the title of the address',
};

const AddressForm = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AddressForm'>) => {
  const [submitting, setSubmitting] = useState(false);
  const {location, updateLocation, resetLocation} = useContextSelector(
      FormStateContext,
      state => ({
          location: state.location,
          updateLocation: state.updateLocation,
          resetLocation: state.resetLocation,
      })
  );
  const {storeConfig, authStatus, appMode, setLoggedInUser} =
    useContext(AuthContext);
  const [errored, setErrored] = useState<string[]>([]);

  const {bottom} = useSafeAreaInsets();

  const {showToast} = useContext(ToastContext);

  const {APIPost} = useContext(APIContext);

  const submit = () => {
    const erroredFields = [];

    for (let i in storeConfig.restrictAddress
      ? appartmentModeRequiredItemsValidationMessages
      : requiredItemsValidationMessages) {
      if (!location[i] || location[i] === '') {
        erroredFields.push(i);
      }
    }

    if (erroredFields.length > 0) {
      setErrored(erroredFields);
      showToast({
        ...ToastProfiles.error,
        title: 'Please fill in the required fields',
        id: 'address-submit-error',
      });

      return;
    }

    setSubmitting(true);

    APIPost({
      url: getURL({
        key: 'USER_LOCATION',
      }),
      body: location,
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        showToast({
          ...ToastProfiles.success,
          title: response.data?.userMessage || 'Successfully added Address',
          id: 'address-submit-success',
        });

        setSubmitting(false);

        setLoggedInUser({
          ...(authStatus?.user || {}),
          name: location?.customerName,
        });

        resetLocation();

        Emitter.emit('ADDRESS_ADDED');

        navigation.pop(2);
      },
      reject: (error: any) => {
        setSubmitting(false);
        showToast({
          ...ToastProfiles.error,
          title:
            parseError(error).message ||
            'Please Ensure that the details are correct',
          id: 'address-submit-error',
        });
      },
    });
  };

  useEffect(() => {
    if (storeConfig && storeConfig?.address) {
      updateLocation({
        address: storeConfig?.address,
        lat: storeConfig?.lat,
        lng: storeConfig?.lng,
      });
    }
  }, [storeConfig]);

  return (
    <ScreenBase>
      <VStack flex={1} bgColor="#2E6ACF" alignItems="center">
        <Header screenTitle="Add Address" />
        <VStack style={styles.contentBase}>
          <Text fontSize={14} px={5} pt={5} pb={3} bold>
            {location.address}
          </Text>
          <View style={styles.referenceField}>
            <Text fontSize={12} marginLeft={1} marginTop={1}>
              Customer Name
            </Text>
            <View style={styles.inputBox}>
              <Input
                borderColor="transparent"
                size="xl"
                placeholder="Customer Name"
                w="100%"
                value={location.customerName}
                onChangeText={(text: string) =>
                  updateLocation({customerName: text})
                }
                _focus={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                }}
              />
            </View>
            {errored.includes('customerName') && (
              <Text fontSize={12} color="#FF0000" marginLeft={2}>
                {requiredItemsValidationMessages['customerName']}
              </Text>
            )}
          </View>
          {appMode === UserRoleAlias.B2C_SALESMAN ? (
            <View style={styles.referenceField}>
              <Text fontSize={12} marginLeft={1} marginTop={1}>
                Customer Phone
              </Text>
              <View style={styles.inputBox}>
                <Input
                  borderColor="transparent"
                  size="xl"
                  placeholder="Customer Phone"
                  w="100%"
                  value={location.customerPhone}
                  onChangeText={(text: string) =>
                    updateLocation({customerPhone: text})
                  }
                  _focus={{
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
              {errored.includes('customerName') && (
                <Text fontSize={12} color="#FF0000" marginLeft={2}>
                  {requiredItemsValidationMessages['customerName']}
                </Text>
              )}
            </View>
          ) : (
            <></>
          )}
          <View style={styles.referenceField}>
            <Text fontSize={12} marginLeft={1} marginTop={1}>
              House/Flat/Block No./Room No.*
            </Text>
            <View style={styles.inputBox}>
              <Input
                borderColor="transparent"
                size="xl"
                placeholder="Ex: Eden A-0909"
                w="100%"
                value={location.house}
                onChangeText={(text: string) => updateLocation({house: text})}
                _focus={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                }}
              />
            </View>
            {errored.includes('house') && (
              <Text fontSize={12} color="#FF0000" marginLeft={2}>
                {requiredItemsValidationMessages['house']}
              </Text>
            )}
          </View>
          {!storeConfig.restrictAddress && (
            <>
              <View style={styles.referenceField}>
                <Text fontSize={12} marginLeft={1} marginTop={1}>
                  Apartment/Road/Area*
                </Text>
                <View style={styles.inputBox}>
                  <Input
                    borderColor="transparent"
                    size="xl"
                    placeholder="Apartment/Road/Area"
                    w="100%"
                    value={location.area}
                    onChangeText={(text: string) =>
                      updateLocation({area: text})
                    }
                    _focus={{
                      borderColor: 'transparent',
                      backgroundColor: 'transparent',
                    }}
                  />
                </View>
                {errored.includes('area') && (
                  <Text fontSize={12} color="#FF0000" marginLeft={2}>
                    {requiredItemsValidationMessages['area']}
                  </Text>
                )}
              </View>
              <View style={styles.referenceField}>
                <Text fontSize={12} marginLeft={1} marginTop={1}>
                  Direction
                </Text>
                <View style={styles.inputBox}>
                  <Input
                    borderColor="transparent"
                    size="xl"
                    placeholder="Direction (Optional)"
                    w="100%"
                    value={location.direction}
                    onChangeText={(text: string) =>
                      updateLocation({direction: text})
                    }
                    _focus={{
                      borderColor: 'transparent',
                      backgroundColor: 'transparent',
                    }}
                  />
                </View>
              </View>
            </>
          )}
          <Text fontSize={14} marginTop={1} textAlign="center">
            Save the address as:
          </Text>
          <HStack
            space={2}
            px={5}
            py={2}
            alignItems="center"
            justifyContent="center">
            {titleOptions.map((option: any) => (
              <Chip
                key={option}
                title={option}
                type="solid"
                titleProps={{
                  style: {
                    color:
                      option === location.title ||
                      (!titleOptions.includes(location.title) &&
                        option === 'Other')
                        ? '#FFFFFF'
                        : '#192f6a',
                  },
                }}
                onPress={() => updateLocation({title: option})}
                containerStyle={styles.filterChip}
                buttonStyle={
                  option === location.title ||
                  (!titleOptions.includes(location.title) && option === 'Other')
                    ? styles.selectedChip
                    : styles.unSelectedChip
                }
              />
            ))}
          </HStack>
          {(location.title === 'Other' ||
            !titleOptions.includes(location.title)) && (
            <View style={styles.referenceField}>
              <View style={styles.inputBox}>
                <Input
                  borderColor="transparent"
                  size="xl"
                  placeholder="Title"
                  w="100%"
                  value={location.title}
                  onChangeText={(text: string) => updateLocation({title: text})}
                  _focus={{
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
            </View>
          )}
          {errored.includes('title') && (
            <Text fontSize={12} color="#FF0000" marginLeft={2}>
              {requiredItemsValidationMessages['title']}
            </Text>
          )}
          <View style={{...styles.footer, paddingBottom: bottom || 15}}>
            <Button
              isLoading={submitting}
              style={styles.submitButton}
              onPress={submit}>
              Save Address
            </Button>
          </View>
        </VStack>
      </VStack>
    </ScreenBase>
  );
};

export default AddressForm;
