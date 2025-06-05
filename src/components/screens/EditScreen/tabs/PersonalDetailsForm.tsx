import React, {useCallback, useContext, useState} from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {chipProps, PersonalDetailsFormInterface} from '../types';
import {useForm} from 'react-hook-form';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {ToastContext} from '@contextProviders';
import {parseError} from '@helpers';

type Gender = 'male' | 'female' | '';

// Constants
const GENDER_OPTIONS = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
];

const BLOOD_GROUP_OPTIONS = [
  {label: 'A+', value: 'A+'},
  {label: 'A-', value: 'A-'},
  {label: 'B+', value: 'B+'},
  {label: 'B-', value: 'B-'},
  {label: 'AB+', value: 'AB+'},
  {label: 'AB-', value: 'AB-'},
  {label: 'O+', value: 'O+'},
  {label: 'O-', value: 'O-'},
];

const PersonalDetailsForm: React.FC<chipProps> = ({
  initialData,
  handleSubmit,
}) => {
  const {showToast} = useContext(ToastContext);
  const [profilePic, setProfilePic] = useState<string | null>(
    initialData.profilePic ?? null,
  );
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: {errors, isDirty},
    setValue,
    watch,
    reset,
  } = useForm<PersonalDetailsFormInterface>({
    defaultValues: initialData,
  });

  const formValues = watch();

  // Simple date formatting without date-fns
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Select your date of birth';

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
        const storagePermission =
          Platform.Version >= 33
            ? await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
            : await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

        if (
          [cameraPermission, storagePermission].some(p => p === RESULTS.DENIED)
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

  const takePhoto = useCallback(async () => {
    try {
      const hasPermission = await requestCameraPermission();
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

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.3,
        includeBase64: true,
        saveToPhotos: true,
        cameraType: 'back',
      });

      if (result.assets?.[0]?.uri) {
        setProfilePic(result.assets[0].uri);
        setValue('profilePic', result.assets[0].uri, {shouldDirty: true});
      }
    } catch (error) {
      console.error('Camera error:', error);
      showToast({
        title: parseError(error).message,
      });
    }
  }, [requestCameraPermission, setValue, showToast]);

  const uploadPhoto = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      },
      response => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets?.[0]?.uri
        ) {
          setProfilePic(response.assets[0].uri);
          setValue('profilePic', response.assets[0].uri, {shouldDirty: true});
        }
      },
    );
  }, [setValue]);

  const onSubmit = (data: PersonalDetailsFormInterface) => {
    // Only submit changed fields
    const changedFields: Partial<PersonalDetailsFormInterface> = {};

    Object.keys(data).forEach(key => {
      const field = key as keyof PersonalDetailsFormInterface;
      if (data[field] !== initialData[field]) {
        changedFields[field] = data[field];
      }
    });

    if (Object.keys(changedFields).length > 0) {
      handleSubmit(changedFields);
    } else {
      showToast({title: 'No changes detected'});
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profilePicContainer}>
        <View style={styles.profilePicButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={uploadPhoto}>
            <Text style={styles.buttonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={formValues.firstName}
          onChangeText={text =>
            setValue('firstName', text, {shouldDirty: true})
          }
          placeholder="Enter first name"
        />
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName.message}</Text>
        )}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={formValues.lastName}
          onChangeText={text => setValue('lastName', text, {shouldDirty: true})}
          placeholder="Enter last name"
        />
        {errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName.message}</Text>
        )}

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={formValues.mobileNumber}
          onChangeText={text =>
            setValue('mobileNumber', text, {shouldDirty: true})
          }
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
        />
        {errors.mobileNumber && (
          <Text style={styles.errorText}>{errors.mobileNumber.message}</Text>
        )}

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}>
          <Text>{formatDate(formValues.dateOfBirth)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <View style={styles.datePicker}>
            {/* Implement your date picker logic here */}
            <Text>Date picker would appear here</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowGenderPicker(true)}>
          <Text>
            {formValues.gender
              ? GENDER_OPTIONS.find(g => g.value === formValues.gender)?.label
              : 'Select gender'}
          </Text>
        </TouchableOpacity>
        {showGenderPicker && (
          <View style={styles.picker}>
            {GENDER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  setValue('gender', option.value, {shouldDirty: true});
                  setShowGenderPicker(false);
                }}>
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Blood Group</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowBloodGroupPicker(true)}>
          <Text>
            {formValues.bloodGroup
              ? BLOOD_GROUP_OPTIONS.find(b => b.value === formValues.bloodGroup)
                  ?.label
              : 'Select blood group'}
          </Text>
        </TouchableOpacity>
        {showBloodGroupPicker && (
          <View style={styles.picker}>
            {BLOOD_GROUP_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  setValue('bloodGroup', option.value, {shouldDirty: true});
                  setShowBloodGroupPicker(false);
                }}>
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowBloodGroupPicker(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={formValues.height}
          onChangeText={text => setValue('height', text, {shouldDirty: true})}
          placeholder="Enter height"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={formValues.weight}
          onChangeText={text => setValue('weight', text, {shouldDirty: true})}
          placeholder="Enter weight"
          keyboardType="numeric"
        />
      </View>

      {/* Form Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => reset(initialData)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleFormSubmit(onSubmit)}
          disabled={!isDirty}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicText: {
    color: '#666',
  },
  profilePicButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  photoButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  picker: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePicker: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default PersonalDetailsForm;
