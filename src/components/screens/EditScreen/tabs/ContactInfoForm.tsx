import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {ContactInfoFormProps} from '../types';

const screenWidth = Dimensions.get('window').width;

type InitialData = {
  email?: string;
  mobileNumber?: string;
  flatNumber?: string;
  blockNumber?: string;
  buildingNumber?: string;
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  onSubmit,
  initialData = {} as InitialData,
  onLocationSelect = () => {},
  navigation = {navigate: () => {}},
}) => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<InitialData>({
    email: initialData.email || '',
    mobileNumber: initialData.mobileNumber || '',
    flatNumber: initialData.flatNumber || '',
    blockNumber: initialData.blockNumber || '',
    buildingNumber: initialData.buildingNumber || '',
    address: initialData.address || '',
    location: initialData.location || {latitude: 0, longitude: 0},
  });

  const {
    control,
    handleSubmit,
    formState: {errors, isValid}, // Add `isValid`
    getValues,
  } = useForm({
    defaultValues: {
      email: initialData.email || '',
      mobileNumber: initialData.mobileNumber || '',
      flatNumber: initialData.flatNumber || '',
      blockNumber: initialData.blockNumber || '',
      buildingNumber: initialData.buildingNumber || '',
      address: initialData.address || '',
      ...initialData,
    },
    mode: 'onChange', // Validate on every change
  });

  const handleFormSubmit = (data: any) => {
    const contactDetails = {
      email: data.email,
      mobileNumber: data.mobileNumber,
      address: data.address,
      flatNumber: data.flatNumber,
      blockNumber: data.blockNumber,
      buildingNumber: data.buildingNumber,
    };

    onSubmit(contactDetails);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Email Input - Optional */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && typeof errors.email?.message === 'string' && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Mobile Number Input - Mandatory */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mobile Number <Text style={{color: 'red'}}>*</Text>
            </Text>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit mobile number',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.mobileNumber && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              )}
            />
            {errors.mobileNumber &&
              typeof errors.mobileNumber?.message === 'string' && (
                <Text style={styles.errorText}>
                  {errors.mobileNumber.message}
                </Text>
              )}
          </View>

          {/* Address Details Section */}
          <Text style={[styles.sectionTitle, {marginTop: 16}]}>
            Address Details
          </Text>

          {/* Flat Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Flat/Apartment Number</Text>
            <Controller
              control={control}
              name="flatNumber"
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter flat/apartment number"
                />
              )}
            />
          </View>

          {/* Block and Building Numbers */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Block Number</Text>
              <Controller
                control={control}
                name="blockNumber"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Block number"
                  />
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Building Number/Name</Text>
              <Controller
                control={control}
                name="buildingNumber"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Building number/name"
                  />
                )}
              />
            </View>
          </View>

          {/* Full Address - Mandatory */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Address <Text style={{color: 'red'}}>*</Text>
            </Text>
            <Controller
              control={control}
              name="address"
              rules={{required: 'Address is required'}}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  style={[styles.textArea, errors.address && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your complete address"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.address && typeof errors.address?.message === 'string' && (
              <Text style={styles.errorText}>{errors.address.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                !isValid && styles.disabledButton,
              ]}
              disabled={!isValid}
              onPress={handleSubmit(handleFormSubmit)}>
              <Text style={styles.submitButtonText}>
                Save Contact Information
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    borderBottomColor: '#e1e5e9',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 0.8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    color: '#1a1a1a',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ContactInfoForm;
