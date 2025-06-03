import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Pressable,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import {Header} from '@commonComponents';
import {AuthContext, ToastContext} from '@contextProviders';
import DocumentPicker from 'react-native-document-picker';
import CheckBox from '@react-native-community/checkbox';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {parseError} from '@helpers';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileZipper,
  faFileLines,
  faFile,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from 'App';

// Types
type Gender = 'male' | 'female' | '';
type FamilyMemberType = 'male' | 'female' | 'children';
type HealthIssue =
  | 'bloodPressure'
  | 'diabetes'
  | 'kidneyProblems'
  | 'neurologicalProblems'
  | 'cancer'
  | 'other';
type RegistrationFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegistrationForm'
>;

interface FormData {
  firstName: string;
  lastName: string;
  fullName: string;
  mobileNumber: string;
  bloodGroup: string;
  gender: Gender;
  dateOfBirth: Date;
  age: string;
  flatNumber: string;
  blockNumber: string;
  buildingNumber: string;
  address: string;
  email: string;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  familyMembers: Record<FamilyMemberType, string>;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  prescription: {
    uri: string;
    name: string;
    type: string;
  }[];
  healthIssues: Record<HealthIssue, boolean | string>;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: string;
  address?: string;
  profilePic?: string;
  familyMembers?: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

// Constants
const GENDER_OPTIONS = [
  {label: 'Male', value: 'male' as Gender},
  {label: 'Female', value: 'female' as Gender},
];

const PHOTO_OPTIONS = [
  {label: 'Take Photo', value: 'take', icon: '📷'},
  {label: 'Upload Photo', value: 'upload', icon: '📁'},
];

const HEALTH_ISSUES = [
  {id: 'bloodPressure' as HealthIssue, label: 'Blood Pressure'},
  {id: 'diabetes' as HealthIssue, label: 'Diabetes'},
  {id: 'kidneyProblems' as HealthIssue, label: 'Kidney problems'},
  {id: 'neurologicalProblems' as HealthIssue, label: 'Neurological problems'},
  {id: 'cancer' as HealthIssue, label: 'Cancer'},
];

const FILE_ICONS: Record<string, any> = {
  pdf: faFilePdf,
  msword: faFileWord,
  wordprocessingml: faFileWord,
  spreadsheetml: faFileExcel,
  excel: faFileExcel,
  zip: faFileZipper,
  compressed: faFileZipper,
  text: faFileLines,
};

const INITIAL_FORM_DATA: FormData = {
  firstName: '',
  lastName: '',
  fullName: '',
  mobileNumber: '',
  gender: '',
  bloodGroup: '',
  dateOfBirth: new Date('2000-01-01'),
  age: '',
  flatNumber: '',
  blockNumber: '',
  buildingNumber: '',
  address: '',
  email: '',
  location: {
    latitude: null,
    longitude: null,
  },
  familyMembers: {
    male: '0',
    female: '0',
    children: '0',
  },
  emergencyContacts: [
    {
      name: '',
      relationship: '',
      phone: '',
    },
  ],
  prescription: [],
  healthIssues: {
    bloodPressure: false,
    diabetes: false,
    kidneyProblems: false,
    neurologicalProblems: false,
    cancer: false,
    other: '',
  },
};

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

const RegistrationForm = () => {
  // State
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [profilePicModalVisible, setProfilePicModalVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);

  const navigation = useNavigation<RegistrationFormNavigationProp>();

  // Context
  const {showToast} = useContext(ToastContext);
  const {authStatus} = useContext(AuthContext);

  // Memoized values
  const formattedDate = useMemo(
    () => formatDate(formData.dateOfBirth),
    [formData.dateOfBirth],
  );
  const selectedGenderLabel = useMemo(
    () =>
      formData.gender
        ? GENDER_OPTIONS.find(option => option.value === formData.gender)?.label
        : 'Select your gender',
    [formData.gender],
  );

  // Effects
  useEffect(() => {
    // Set mobile number from auth status if available
    if (authStatus?.user?.phone) {
      updateField('mobileNumber', authStatus.user.phone.slice(2));
    }
  }, [authStatus?.user?.phone]);

  useEffect(() => {
    // Update fullName when first or last name changes
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (fullName !== formData.fullName) {
      setFormData(prev => ({...prev, fullName}));
    }
  }, [formData.firstName, formData.lastName, formData.fullName]);

  // Helper functions
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const updateHealthIssue = (issue: HealthIssue, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      healthIssues: {
        ...prev.healthIssues,
        [issue]: value,
      },
    }));
  };

  const updateFamilyMember = (type: FamilyMemberType, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0).toString();
    setFormData(prev => ({
      ...prev,
      familyMembers: {
        ...prev.familyMembers,
        [type]: numValue,
      },
    }));
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
      }
    } catch (error) {
      console.error('Camera error:', error);
      showToast({
        title: parseError(error).message,
      });
    }
  }, [requestCameraPermission, showToast]);

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
        }
      },
    );
  }, []);

  const handleLocationSelect = (selectedLocation: LocationData) => {
    setFormData(prev => ({
      ...prev,
      address: selectedLocation.address || '',
      latitude: selectedLocation.lat ?? null,
      longitude: selectedLocation.lng ?? null,
    }));
  };

  const getCurrentLocationAndRedirect = async () => {
    setLocationLoading(true);
    try {
      navigation.navigate('SelectLocation', {
        onLocationSelect: handleLocationSelect,
        initialLocation: {
          address: formData.address,
          lat: formData.location.latitude ?? 0,
          lng: formData.location.longitude ?? 0,
        },
        redirectTo: 'RegistrationForm',
        showSearchLocation: false,
      });
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const uploadPrescription = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      const selectedFiles = result.map(file => ({
        uri: file.uri,
        name: file.name ?? '',
        type: file.type ?? '',
      }));

      setFormData(prev => ({
        ...prev,
        prescription: [...prev.prescription, ...selectedFiles],
      }));
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
        Alert.alert(
          'Error',
          'Failed to upload prescription. Please try again.',
        );
      }
    }
  }, []);

  const handleRemovePrescription = useCallback((indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      prescription: prev.prescription.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  }, []);

  const calculateAge = useCallback((birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  }, []);

  const handleDateChange = useCallback(
    (selectedDate: Date) => {
      setShowDatePicker(false);
      updateField('dateOfBirth', selectedDate);
      updateField('age', calculateAge(selectedDate));
    },
    [calculateAge],
  );
  const addEmergencyContact = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        {
          name: '',
          relationship: '',
          phone: '',
        },
      ],
    }));
  }, []);

  const removeEmergencyContact = useCallback(
    (index: number) => {
      if (formData.emergencyContacts.length > 1) {
        setFormData(prev => ({
          ...prev,
          emergencyContacts: prev.emergencyContacts.filter(
            (_, i) => i !== index,
          ),
        }));
      }
    },
    [formData.emergencyContacts.length],
  );

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!profilePic) {
      newErrors.profilePic = 'Profile photo is required';
    }

    const totalFamilyMembers = Object.values(formData.familyMembers).reduce(
      (sum, val) => sum + parseInt(val),
      0,
    );

    if (totalFamilyMembers <= 0) {
      newErrors.familyMembers = 'Please add at least one family member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, profilePic]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      setIsSubmitting(true);

      const submissionData = {
        ...formData,
        profilePic,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
      };

      console.log('Submitting:', submissionData);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert('Success', 'Registration form submitted successfully!');
      }, 1500);
    }
  }, [formData, profilePic, validateForm]);

  const getFileIcon = useCallback((type: string) => {
    if (!type) return faFile;

    const fileType = Object.keys(FILE_ICONS).find(key => type.includes(key));
    return fileType ? FILE_ICONS[fileType] : faFile;
  }, []);

  // Render functions
  const renderGenderPicker = useCallback(() => {
    if (!showGenderPicker) return null;

    return (
      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowGenderPicker(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Gender</Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetContent}>
                {GENDER_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.gender === option.value && styles.selectedGender,
                    ]}
                    onPress={() => {
                      updateField('gender', option.value);
                      setShowGenderPicker(false);
                    }}>
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === option.value &&
                          styles.selectedGenderText,
                      ]}>
                      {option.label}
                    </Text>
                    {formData.gender === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [showGenderPicker, formData.gender]);

  const renderProfilePhotoModal = useCallback(
    () => (
      <Modal
        visible={profilePicModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfilePicModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setProfilePicModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Photo Option</Text>
                <TouchableOpacity
                  onPress={() => setProfilePicModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetContent}>
                {PHOTO_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.photoOption}
                    onPress={() => {
                      if (option.value === 'take') {
                        takePhoto();
                      } else {
                        uploadPhoto();
                      }
                      setProfilePicModalVisible(false);
                    }}>
                    <Text style={styles.photoOptionIcon}>{option.icon}</Text>
                    <Text style={styles.photoOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    ),
    [profilePicModalVisible, takePhoto, uploadPhoto],
  );

  const renderPrescriptionFiles = useCallback(
    () => (
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
        {formData.prescription.map((file, index) => (
          <View key={index} style={styles.prescriptionFileContainer}>
            <TouchableOpacity
              onPress={() => handleRemovePrescription(index)}
              style={styles.removeFileButton}>
              <Text style={styles.removeFileButtonText}>✕</Text>
            </TouchableOpacity>

            {file.type?.startsWith('image/') ? (
              <Image
                source={{uri: file.uri}}
                style={styles.prescriptionImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.prescriptionFileIcon}>
                <FontAwesomeIcon
                  icon={getFileIcon(file.type)}
                  size={24}
                  color="#555"
                />
              </View>
            )}
          </View>
        ))}
      </View>
    ),
    [formData.prescription, getFileIcon, handleRemovePrescription],
  );

  const renderBloodGroupPicker = useCallback(() => {
    if (!showBloodGroupPicker) return null;

    return (
      <Modal
        visible={showBloodGroupPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBloodGroupPicker(false)}>
        <TouchableWithoutFeedback
          onPress={() => setShowBloodGroupPicker(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Blood Group</Text>
                <TouchableOpacity
                  onPress={() => setShowBloodGroupPicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetContent}>
                {BLOOD_GROUP_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.bloodGroup === option.value &&
                        styles.selectedGender,
                    ]}
                    onPress={() => {
                      updateField('bloodGroup', option.value);
                      setShowBloodGroupPicker(false);
                    }}>
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.bloodGroup === option.value &&
                          styles.selectedGenderText,
                      ]}>
                      {option.label}
                    </Text>
                    {formData.bloodGroup === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [showBloodGroupPicker, formData.bloodGroup]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex1}>
      <Header
        screenTitle="Registration Form"
        headerBaseStyle={styles.header}
        screenTitleLoadingPlaceholder="Registration Form"
      />
      <StatusBar backgroundColor="#2e6acf" barStyle="light-content" />

      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          {/* Profile Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>

            <View style={styles.photoContainer}>
              {profilePic ? (
                <Image source={{uri: profilePic}} style={styles.profileImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Photo</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => setProfilePicModalVisible(true)}>
                <Text style={styles.photoButtonText}>
                  {profilePic ? 'Change Profile Photo' : 'Add Profile Photo *'}
                </Text>
              </TouchableOpacity>
              {renderProfilePhotoModal()}
              {errors.profilePic && (
                <Text style={styles.errorText}>{errors.profilePic}</Text>
              )}
            </View>

            {/* First Name & Last Name */}
            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.rightMargin,
                ]}>
                <Text style={styles.label}>
                  First Name <Text style={styles.requiredIndicator}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    ...(errors.firstName ? [styles.inputError] : []),
                  ]}
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={text => updateField('firstName', text)}
                  autoCapitalize="words"
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.leftMargin,
                ]}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.requiredIndicator}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    ...(errors.lastName ? [styles.inputError] : []),
                  ]}
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={text => updateField('lastName', text)}
                  autoCapitalize="words"
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  ...(errors.mobileNumber ? [styles.inputError] : []),
                ]}
                placeholder="Enter your mobile number"
                placeholderTextColor="#aaa"
                value={formData.mobileNumber}
                onChangeText={text => updateField('mobileNumber', text)}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              )}
            </View>

            {/* Gender and Blood Group*/}
            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.rightMargin,
                ]}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>
                    Gender <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      styles.dropdownField,
                      errors.gender ? styles.inputError : undefined,
                    ]}
                    onPress={() => setShowGenderPicker(true)}>
                    <Text
                      style={
                        formData.gender
                          ? styles.selectedText
                          : styles.placeholderText
                      }>
                      {selectedGenderLabel}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                  </TouchableOpacity>
                  {renderGenderPicker()}
                  {errors.gender && (
                    <Text style={styles.errorText}>{errors.gender}</Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.leftMargin,
                ]}>
                <Text style={styles.label}>Blood Group</Text>
                <TouchableOpacity
                  style={[styles.textInput, styles.dropdownField]}
                  onPress={() => setShowBloodGroupPicker(true)}>
                  <Text
                    style={
                      formData.bloodGroup
                        ? styles.selectedText
                        : styles.placeholderText
                    }>
                    {formData.bloodGroup || 'Select Blood Group'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
                {renderBloodGroupPicker()}
              </View>
            </View>
            {/* Date of Birth and Age */}
            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.fieldContainer,
                  styles.twoThirdsWidth,
                  styles.rightMargin,
                ]}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.inputBoxDate}
                  onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.inputTextDate}>
                    {formattedDate || 'Select Date of Birth'}
                  </Text>
                </TouchableOpacity>

                <DatePicker
                  modal
                  open={showDatePicker}
                  date={formData.dateOfBirth}
                  mode="date"
                  theme="light"
                  maximumDate={new Date()}
                  minimumDate={new Date('1900-01-01')}
                  onConfirm={handleDateChange}
                  onCancel={() => setShowDatePicker(false)}
                />
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.oneThirdWidth,
                  styles.leftMargin,
                ]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.age}
                  placeholder="Age"
                  keyboardType="phone-pad"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email (Optional)"
                value={formData.email}
                onChangeText={text => updateField('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.rowContainer}>
              <Text style={styles.sectionTitle}>Address Details</Text>

              <Pressable
                style={styles.locationButton}
                onPress={getCurrentLocationAndRedirect}>
                <Text style={styles.locationButtonText}>
                  {locationLoading
                    ? 'Getting Location...'
                    : 'Get Current Location'}
                </Text>
                <FontAwesomeIcon
                  icon={faLocationDot}
                  size={16}
                  style={{color: 'white', marginLeft: 5}}
                />
              </Pressable>
            </View>

            {/* Flat Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Flat/Apartment Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your flat/apartment number"
                value={formData.flatNumber}
                onChangeText={text => updateField('flatNumber', text)}
                returnKeyType="next"
                placeholderTextColor="#aaa"
              />
            </View>

            {/* Block and Building Numbers */}
            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.rightMargin,
                ]}>
                <Text style={styles.label}>Block Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Block number"
                  value={formData.blockNumber}
                  onChangeText={text => updateField('blockNumber', text)}
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.halfWidth,
                  styles.leftMargin,
                ]}>
                <Text style={styles.label}>Building Number/Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Building number"
                  value={formData.buildingNumber}
                  onChangeText={text => updateField('buildingNumber', text)}
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            {/* Full Address */}
            <View style={styles.fieldContainer}>
              <View style={styles.addressHeader}>
                <Text style={styles.label}>
                  Full Address <Text style={styles.requiredIndicator}>*</Text>
                </Text>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  ...(errors.address ? [styles.inputError] : []),
                ]}
                placeholder="Enter your complete address"
                value={formData.address}
                onChangeText={text => updateField('address', text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#aaa"
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>
          </View>

          {/* Family Members Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <Text style={styles.subSectionText}>
              Total number of family members (including yourself)
            </Text>

            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.fieldContainer,
                  styles.oneThirdWidth,
                  styles.rightMargin,
                ]}>
                <Text style={styles.label}>Male</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={formData.familyMembers.male}
                  onChangeText={text => updateFamilyMember('male', text)}
                  keyboardType="numeric"
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.oneThirdWidth,
                  styles.horizontalMargin,
                ]}>
                <Text style={styles.label}>Female</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={formData.familyMembers.female}
                  onChangeText={text => updateFamilyMember('female', text)}
                  keyboardType="numeric"
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View
                style={[
                  styles.fieldContainer,
                  styles.oneThirdWidth,
                  styles.leftMargin,
                ]}>
                <Text style={styles.label}>Children</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={formData.familyMembers.children}
                  onChangeText={text => updateFamilyMember('children', text)}
                  keyboardType="numeric"
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
            {errors.familyMembers && (
              <Text style={styles.errorText}>{errors.familyMembers}</Text>
            )}
          </View>
          {/* Emergency Contacts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.subSectionText}>
              Please provide your emergency contact
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emergencyContactsScrollContainer}>
              {formData.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.emergencyContactCard}>
                  <View style={styles.emergencyContactHeader}>
                    <Text style={styles.emergencyContactTitle}>
                      Contact {index + 1}
                    </Text>
                    {formData.emergencyContacts.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeEmergencyContact(index)}
                        style={styles.removeContactButton}>
                        <Text style={styles.removeContactButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.emergencyContactFields}>
                    <View style={styles.fieldContainer}>
                      <Text style={[styles.label, {marginBottom: 8}]}>
                        Full Name
                      </Text>
                      <TextInput
                        style={[styles.textInput]}
                        placeholder="Contact name"
                        value={contact.name}
                        onChangeText={text => {
                          const updatedContacts = [
                            ...formData.emergencyContacts,
                          ];
                          updatedContacts[index].name = text;
                          updateField('emergencyContacts', updatedContacts);
                        }}
                        placeholderTextColor="#aaa"
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={[styles.label, {marginBottom: 8}]}>
                        Relationship
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Spouse, Parent"
                        value={contact.relationship}
                        onChangeText={text => {
                          const updatedContacts = [
                            ...formData.emergencyContacts,
                          ];
                          updatedContacts[index].relationship = text;
                          updateField('emergencyContacts', updatedContacts);
                        }}
                        placeholderTextColor="#aaa"
                      />
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={[styles.label, {marginBottom: 8}]}>
                        Phone Number
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Contact phone"
                        value={contact.phone}
                        onChangeText={text => {
                          const updatedContacts = [
                            ...formData.emergencyContacts,
                          ];
                          updatedContacts[index].phone = text;
                          updateField('emergencyContacts', updatedContacts);
                        }}
                        keyboardType="phone-pad"
                        placeholderTextColor="#aaa"
                      />
                    </View>
                  </View>
                </View>
              ))}

              {/* Add More Contact Card */}
              <TouchableOpacity
                style={styles.addContactCard}
                onPress={addEmergencyContact}>
                <View style={styles.addContactContent}>
                  <Text style={styles.addContactIcon}>+</Text>
                  <Text style={styles.addContactText}>
                    Add More{'\n'}Contact
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Prescription Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescription</Text>
            <Text style={styles.subSectionText}>
              Upload a prescription if you have one (Optional)
            </Text>

            <View style={styles.prescriptionContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadPrescription}>
                <Text style={styles.uploadButtonText}>Upload Prescription</Text>
              </TouchableOpacity>

              {renderPrescriptionFiles()}
            </View>
          </View>

          {/* Health Issues Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Issues</Text>
            <Text style={styles.subSectionText}>Select all that apply</Text>

            {HEALTH_ISSUES.map(issue => (
              <View key={issue.id} style={styles.checkboxContainer}>
                <CheckBox
                  value={formData.healthIssues[issue.id] as boolean}
                  onValueChange={(value: boolean) =>
                    updateHealthIssue(issue.id, value)
                  }
                  tintColors={{true: '#2E6ACF', false: '#999'}}
                />
                <Text style={styles.checkboxLabel}>{issue.label}</Text>
              </View>
            ))}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Other Health Issues</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Specify any other health issues"
                value={formData.healthIssues.other as string}
                onChangeText={text => updateHealthIssue('other', text)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const formatDate = (date: Date) => {
  if (!date) return '';

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Styles
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  header: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2E6ACF',
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#e0e9fb',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subSectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
  },
  oneThirdWidth: {
    flex: 1,
  },
  twoThirdsWidth: {
    flex: 2,
  },
  rightMargin: {
    marginRight: 8,
  },
  leftMargin: {
    marginLeft: 8,
  },
  horizontalMargin: {
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  requiredIndicator: {
    color: 'red',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
    color: '#333',
  },
  inputError: {
    borderColor: 'red',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  selectedText: {
    color: '#333',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholderText: {
    color: '#999',
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#2E6ACF',
    padding: 10,
    borderRadius: 8,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
  },
  sheetContent: {
    paddingTop: 16,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedGender: {
    backgroundColor: '#f0f7ff',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGenderText: {
    color: '#2E6ACF',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#2E6ACF',
    fontSize: 18,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  photoOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  photoOptionText: {
    fontSize: 16,
    color: '#333',
  },
  inputBoxDate: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  inputTextDate: {
    fontSize: 16,
    color: '#333',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationButton: {
    backgroundColor: '#2E6ACF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    maxHeight: 30,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  prescriptionContainer: {
    marginVertical: 8,
  },
  uploadButton: {
    backgroundColor: '#2E6ACF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  prescriptionFileContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  removeFileButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeFileButtonText: {
    color: 'white',
    fontSize: 12,
  },
  prescriptionImage: {
    width: '100%',
    height: '100%',
  },
  prescriptionFileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f3f3',
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emergencyContactsScrollContainer: {
    paddingRight: 16,
  },
  emergencyContactCard: {
    width: 280,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e1e8ff',
  },
  emergencyContactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyContactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E6ACF',
  },
  removeContactButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeContactButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emergencyContactFields: {
    // gap: 8,
  },
  addContactCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E6ACF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  addContactContent: {
    alignItems: 'center',
  },
  addContactIcon: {
    fontSize: 32,
    color: '#2E6ACF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addContactText: {
    fontSize: 16,
    color: '#2E6ACF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RegistrationForm;
