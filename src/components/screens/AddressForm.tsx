import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, HStack, Input, Text, VStack} from 'native-base';
import {Chip} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ScreenBase} from '@Containers';
import {Header} from '@commonComponents';
import P1Styles from '@P1StyleSheet';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {RootStackParamList} from 'App';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import Emitter from '@Emitter';
import {UserRoleAlias} from '@Constants';
import {parseError, triggerNotification} from '@helpers';
import {useContextSelector} from 'use-context-selector';

// Constants
const TITLE_OPTIONS = ['Home', 'Work', 'Other'];
const VALIDATION_MESSAGES = {
  customerName: 'Please add a Customer Name',
  customerPhone: 'Please enter the Customer Phone',
  house: 'Please enter the House Number',
  area: 'Please enter the area',
  title: 'Please select the title of the address',
  direction: 'Please enter the direction', // Added validation message for direction
};

const APARTMENT_MODE_VALIDATION_MESSAGES = {
  customerName: 'Please add a Customer Name',
  customerPhone: 'Please enter the Customer Phone',
  house: 'Please enter the House Number',
  title: 'Please select the title of the address',
};

type AddressFormProps = NativeStackScreenProps<
  RootStackParamList,
  'AddressForm'
>;

const AddressForm = ({navigation}: AddressFormProps) => {
  // Hooks
  const {bottom} = useSafeAreaInsets();
  const {showToast} = React.useContext(ToastContext);
  const {APIPost} = React.useContext(APIContext);
  const {storeConfig, authStatus, appMode, setLoggedInUser} =
    React.useContext(AuthContext);

  const {location, updateLocation, resetLocation} = useContextSelector(
    FormStateContext,
    state => ({
      location: state.location,
      updateLocation: state.updateLocation,
      resetLocation: state.resetLocation,
    }),
  );

  // State
  const [submitting, setSubmitting] = useState(false);
  const [erroredFields, setErroredFields] = useState<string[]>([]);

  // Memoized values
  const isApartmentMode = useMemo(
    () => storeConfig?.restrictAddress,
    [storeConfig],
  );
  const validationMessages = useMemo(
    () =>
      isApartmentMode
        ? APARTMENT_MODE_VALIDATION_MESSAGES
        : VALIDATION_MESSAGES,
    [isApartmentMode],
  );
  const isOtherTitleSelected = useMemo(
    () => !TITLE_OPTIONS.includes(location.title) || location.title === 'Other',
    [location.title],
  );

  // Effects
  useEffect(() => {
    if (storeConfig?.address) {
      updateLocation({
        address: storeConfig.address,
        lat: storeConfig.lat,
        lng: storeConfig.lng,
      });
    }
  }, [storeConfig, updateLocation]);

  // Handlers
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      updateLocation({[field]: value});
      // Remove from errors if corrected
      if (erroredFields.includes(field) && value) {
        setErroredFields(prev => prev.filter(f => f !== field));
      }
    },
    [erroredFields, updateLocation],
  );

  const validateForm = useCallback(() => {
    const requiredFields = isApartmentMode
      ? Object.keys(APARTMENT_MODE_VALIDATION_MESSAGES)
      : Object.keys(VALIDATION_MESSAGES);

    const newErroredFields = requiredFields.filter(
      field => !location[field] || location[field] === '',
    );

    setErroredFields(newErroredFields);
    return newErroredFields.length === 0;
  }, [isApartmentMode, location]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      showToast({
        ...ToastProfiles.error,
        title: 'Please fill in the required fields',
        id: 'address-submit-error',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await APIPost({
        url: getURL({key: 'USER_LOCATION'}),
        body: location,
      });

      if (!response.data) {
        throw response;
      }
      await triggerNotification(
        'Address Added',
        'Your address has been added successfully',
        {
          android: {
            color: '#2e6acf',
            sound: 'pop',
          },
        },
      );

      showToast({
        ...ToastProfiles.success,
        title: response.data?.userMessage || 'Successfully added Address',
        id: 'address-submit-success',
      });

      setLoggedInUser({
        ...(authStatus?.user || {}),
        name: location.customerName,
      });

      resetLocation();
      Emitter.emit('ADDRESS_ADDED');
      navigation.pop(2);
    } catch (error) {
      showToast({
        ...ToastProfiles.error,
        title:
          parseError(error).message ||
          'Please ensure that the details are correct',
        id: 'address-submit-error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    APIPost,
    authStatus?.user,
    location,
    navigation,
    resetLocation,
    setLoggedInUser,
    showToast,
    validateForm,
  ]);

  const renderField = (
    field: any,
    label: string,
    placeholder: string,
    isRequired = true,
  ) => (
    <View style={styles.referenceField}>
      <Text fontSize={12} marginLeft={1} marginTop={1}>
        {label}
        {isRequired && '*'}
      </Text>
      <View style={styles.inputBox}>
        <Input
          borderColor="transparent"
          size="xl"
          placeholder={placeholder}
          w="100%"
          value={location[field] || ''}
          onChangeText={(text: string) => handleFieldChange(field, text)}
          _focus={{
            borderColor: 'transparent',
            backgroundColor: 'transparent',
          }}
        />
      </View>
      {erroredFields.includes(field) && (
        <Text fontSize={12} color="#FF0000" marginLeft={2}>
          {validationMessages[field as keyof typeof validationMessages]}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenBase>
      <VStack flex={1} bgColor="#2E6ACF" alignItems="center">
        <Header screenTitle="Add Address" />
        <VStack style={styles.contentBase}>
          <Text fontSize={14} px={5} pt={5} pb={3} bold>
            {location.address}
          </Text>

          {renderField('customerName', 'Customer Name', 'Customer Name')}

          {appMode === UserRoleAlias.B2C_SALESMAN &&
            renderField(
              'customerPhone',
              'Customer Phone',
              'Customer Phone',
              false,
            )}

          {renderField(
            'house',
            isApartmentMode
              ? 'House/Flat/Block No./Room No.*'
              : 'House/Flat/Block No.',
            isApartmentMode ? 'Ex: Eden A-0909' : 'House Number',
          )}

          {!isApartmentMode && (
            <>
              {renderField(
                'area',
                'Apartment/Road/Area*',
                'Apartment/Road/Area',
              )}
              {renderField(
                'direction',
                'Direction',
                'Direction (Optional)',
                false,
              )}
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
            {TITLE_OPTIONS.map(option => (
              <Chip
                key={option}
                title={option}
                type="outline"
                titleProps={{
                  style: {
                    color:
                      option === location.title ||
                      (isOtherTitleSelected && option === 'Other')
                        ? '#FFFFFF'
                        : '#192f6a',
                  },
                }}
                onPress={() => handleFieldChange('title', option)}
                containerStyle={styles.filterChip}
                buttonStyle={
                  option === location.title ||
                  (isOtherTitleSelected && option === 'Other')
                    ? styles.selectedChip
                    : styles.unSelectedChip
                }
              />
            ))}
          </HStack>

          {isOtherTitleSelected &&
            renderField('title', 'Custom Title', 'Title')}

          <View style={{...styles.footer, paddingBottom: bottom || 15}}>
            <Button
              isLoading={submitting}
              style={styles.submitButton}
              onPress={handleSubmit}>
              Save Address
            </Button>
          </View>
        </VStack>
      </VStack>
    </ScreenBase>
  );
};

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
    backgroundColor: '#efefef',
    borderColor: '#FFFFFF',
    // ...P1Styles.shadow,
  },
  selectedChip: {
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

export default AddressForm;
