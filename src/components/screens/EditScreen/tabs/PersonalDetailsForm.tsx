import React, {useCallback, useContext, useState, useMemo} from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {chipProps, PersonalDetailsFormInterface} from '../types';
import {useForm, Controller} from 'react-hook-form';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {ToastContext} from '@contextProviders';
import DatePicker from 'react-native-date-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPen} from '@fortawesome/free-solid-svg-icons';

const {width: screenWidth} = Dimensions.get('window');

// Constants
const GENDER_OPTIONS = [
  {label: 'Male', value: 'male', icon: '👨'},
  {label: 'Female', value: 'female', icon: '👩'},
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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: {errors, isDirty, isValid},
    setValue,
    watch,
    reset,
  } = useForm<PersonalDetailsFormInterface>({
    defaultValues: initialData,
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Calculate age from date of birth
  const calculatedAge = useMemo(() => {
    if (!watchedValues.dateOfBirth) return '';

    const birthDate = new Date(watchedValues.dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
      months--; // Subtract a month if current day is less than birth day
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${months} month${
      months !== 1 ? 's' : ''
    }`;
  }, [watchedValues.dateOfBirth]);

  // Memoized date formatting
  const formattedDate = useMemo(() => {
    if (!watchedValues.dateOfBirth) return 'Select Date of Birth';

    const date = new Date(watchedValues.dateOfBirth);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }, [watchedValues.dateOfBirth]);

  // Memoized selected gender
  const selectedGender = useMemo(() => {
    return GENDER_OPTIONS.find(g => g.value === watchedValues.gender);
  }, [watchedValues.gender]);

  // Memoized selected blood group
  const selectedBloodGroup = useMemo(() => {
    return BLOOD_GROUP_OPTIONS.find(b => b.value === watchedValues.bloodGroup);
  }, [watchedValues.bloodGroup]);

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
          'Permission Required',
          'Camera access is needed to take photos.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'front',
      });

      if (result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setProfilePic(uri);
        setValue('profilePic', uri, {shouldDirty: true});
      }
      setShowImagePicker(false);
    } catch (error) {
      console.error('Camera error:', error);
      showToast({
        title: 'Failed to take photo',
      });
    }
  }, [requestCameraPermission, setValue, showToast]);

  const uploadPhoto = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets?.[0]?.uri
        ) {
          const uri = response.assets[0].uri;
          setProfilePic(uri);
          setValue('profilePic', uri, {shouldDirty: true});
        }
        setShowImagePicker(false);
      },
    );
  }, [setValue]);

  const onSubmit = useCallback(
    (data: PersonalDetailsFormInterface) => {
      const changedFields: Partial<PersonalDetailsFormInterface> = {};
      let hasChanges = false;

      Object.keys(data).forEach(key => {
        const field = key as keyof PersonalDetailsFormInterface;
        if (data[field] !== initialData[field]) {
          changedFields[field] = data[field];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        handleSubmit(changedFields);
      } else {
        showToast({title: 'No changes to save'});
      }
    },
    [initialData, handleSubmit, showToast],
  );

  const resetForm = useCallback(() => {
    reset(initialData);
    setProfilePic(initialData.profilePic ?? null);
  }, [reset, initialData]);

  // Handle date change
  const handleDateChange = useCallback(
    (selectedDate: Date) => {
      setValue('dateOfBirth', selectedDate.toISOString(), {shouldDirty: true});
      setShowDatePicker(false);
    },
    [setValue],
  );

  // Render Methods
  const renderProfilePicture = () => (
    <View style={styles.profileSection}>
      <TouchableOpacity
        style={styles.profilePicContainer}
        onPress={() => setShowImagePicker(true)}
        activeOpacity={0.8}>
        {profilePic ? (
          <Image source={{uri: profilePic}} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>📷</Text>
            <Text style={styles.profileAddText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => setShowImagePicker(true)}>
        <Text style={styles.editProfileText}>
          <FontAwesomeIcon icon={faPen} style={{color: '#fff'}} size={12} />
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderImagePickerModal = () => (
    <Modal
      visible={showImagePicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowImagePicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.imagePickerModal}>
          <Text style={styles.modalTitle}>Select Photo</Text>
          <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
            <Text style={styles.modalOptionIcon}>📷</Text>
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={uploadPhoto}>
            <Text style={styles.modalOptionIcon}>🖼️</Text>
            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowImagePicker(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    options: Array<{label: string; value: string; icon?: string}>,
    onSelect: (value: string) => void,
    title: string,
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.optionsList}>
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionItem}
                onPress={() => onSelect(option.value)}>
                {option.icon && (
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                )}
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {renderProfilePicture()}

        <View style={styles.formSection}>
          {/* <Text style={styles.sectionTitle}>Personal Information</Text> */}

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                First Name <Text style={{color: 'red'}}>*</Text>
              </Text>
              <Controller
                control={control}
                name="firstName"
                rules={{required: 'First name is required'}}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="First name"
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Last Name <Text style={{color: 'red'}}>*</Text>
              </Text>
              <Controller
                control={control}
                name="lastName"
                rules={{required: 'Last name is required'}}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Last name"
                    placeholderTextColor="#999"
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>
          </View>

          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
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
              render={({field: {onChange, value}}) => (
                <TextInput
                  style={[
                    styles.input,
                    errors.mobileNumber && styles.inputError,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              )}
            />
            {errors.mobileNumber && (
              <Text style={styles.errorText}>
                {errors.mobileNumber.message}
              </Text>
            )}
          </View> */}

          <View style={styles.row}>
            <View style={[styles.halfWidth, {flex: 2}]}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowDatePicker(true)}>
                <Text
                  style={[
                    styles.selectText,
                    !watchedValues.dateOfBirth && styles.placeholder,
                  ]}>
                  {formattedDate}
                </Text>
                <Text style={styles.selectIcon}>📅 {calculatedAge}</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={[styles.halfWidth, {maxHeight: 36}]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input]}
                // value={calculatedAge}
                placeholder="Age"
                // placeholderTextColor="#999"
                // editable={false}
                keyboardType="numeric"
              />
            </View> */}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowGenderPicker(true)}>
                <Text
                  style={[
                    styles.selectText,
                    !selectedGender && styles.placeholder,
                  ]}>
                  {selectedGender
                    ? `${selectedGender.icon} ${selectedGender.label}`
                    : 'Select gender'}
                </Text>
                <Text style={styles.selectIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Blood Group</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowBloodGroupPicker(true)}>
                <Text
                  style={[
                    styles.selectText,
                    !selectedBloodGroup && styles.placeholder,
                  ]}>
                  {selectedBloodGroup
                    ? selectedBloodGroup.label
                    : 'Select blood group'}
                </Text>
                <Text style={styles.selectIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Height (cm)</Text>
              <Controller
                control={control}
                name="height"
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Height"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Weight (kg)</Text>
              <Controller
                control={control}
                name="weight"
                render={({field: {onChange, value}}) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Weight"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View> */}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={resetForm}>
            <Text style={styles.cancelButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!isDirty || !isValid) && styles.disabledButton,
            ]}
            onPress={handleFormSubmit(onSubmit)}
            disabled={!isDirty || !isValid}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderImagePickerModal()}

      {renderPickerModal(
        showGenderPicker,
        () => setShowGenderPicker(false),
        GENDER_OPTIONS,
        value => {
          setValue('gender', value, {shouldDirty: true});
          setShowGenderPicker(false);
        },
        'Select Gender',
      )}

      {renderPickerModal(
        showBloodGroupPicker,
        () => setShowBloodGroupPicker(false),
        BLOOD_GROUP_OPTIONS,
        value => {
          setValue('bloodGroup', value, {shouldDirty: true});
          setShowBloodGroupPicker(false);
        },
        'Select Blood Group',
      )}

      <DatePicker
        modal
        open={showDatePicker}
        date={
          watchedValues.dateOfBirth
            ? new Date(watchedValues.dateOfBirth)
            : new Date()
        }
        mode="date"
        theme="light"
        maximumDate={new Date()}
        minimumDate={new Date('1900-01-01')}
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
      />
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  profilePlaceholder: {
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  profileAddText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: (screenWidth - 120) / 2 - 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editProfileText: {
    fontSize: 14,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // marginBottom: 16,
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
  selectInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 12,
    color: '#1a1a1a',
    flex: 1,
  },
  selectIcon: {
    fontSize: 12,
    color: '#666',
  },
  placeholder: {
    color: '#999',
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
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: screenWidth - 60,
    maxWidth: 300,
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: screenWidth - 40,
    maxWidth: 320,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  modalOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalCancel: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default PersonalDetailsForm;
