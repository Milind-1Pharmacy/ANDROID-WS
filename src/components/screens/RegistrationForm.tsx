import React, {useContext, useState} from 'react';
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
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import {set} from 'lodash';
import {Header} from '@commonComponents';
import {AuthContext} from '@contextProviders';

interface FormData {
  fullName: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: Date;
  flatNumber: string;
  blockNumber: string;
  buildingNumber: string;
  address: string;
  email: string;
}

interface Errors {
  fullName?: string;
  mobileNumber?: string;
  flatNumber?: string;
  address?: string;
  profilePic?: string;
  email?: string;
}
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    gender: '',
    dateOfBirth: new Date(),
    flatNumber: '',
    blockNumber: '',
    buildingNumber: '',
    address: '',
    email: '', // Added email property
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | 'profilePic', string>>
  >({});
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [profilePicModalVisible, setProfilePicModalVisible] = useState(false);
  const [date, setDate] = useState<Date>(new Date('2000-01-01'));

  const genderOptions = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Other', value: 'other'},
    {label: 'Prefer not to say', value: 'prefer_not_to_say'},
  ];
  const photoOptions = [
    {label: 'Take Photo', value: 'take', icon: '📷'},
    {label: 'Upload Photo', value: 'upload', icon: '📁'},
  ];

  const {authStatus} = useContext(AuthContext);

  console.log(authStatus.user.phone.slice(2));

  //   Default Loging mobile number
  formData.mobileNumber = authStatus.user.phone.slice(2);

  const updateField = (field: keyof FormData, value: string | Date) => {
    setFormData({...formData, [field]: value});
    // Clear error when user types
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.7,
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
  };
  const uploadPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1, // Only allow single selection
      },
      handleImageResponse,
    );
  };

  const handleImageResponse = (response: any) => {
    if (
      !response.didCancel &&
      !response.errorCode &&
      response.assets?.[0]?.uri
    ) {
      setProfilePic(response.assets[0].uri);
    }

    if (response.errorCode) {
      console.log('Image Error:', response.errorMessage);
      // You could show an error toast here if you want
    }
  };
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // if (!formData.flatNumber) {
    //   newErrors.flatNumber = 'Flat number is required';
    // }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!profilePic) {
      newErrors.profilePic = 'Profile photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      // Format data for submission
      const submissionData = {
        ...formData,
        profilePic,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
      };

      console.log(submissionData);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        // Handle success response here
      }, 1500);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderGenderPicker = () => {
    if (!showGenderPicker) return null;

    return (
      <Modal
        visible={showGenderPicker}
        transparent={true}
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
                {genderOptions.map(option => (
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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Header
        screenTitle="Registration Form"
        headerBaseStyle={styles.header}
        screenTitleLoadingPlaceholder="Registration Form"
      />

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
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  {profilePic ? 'Change Profile Photo' : 'Add Profile Photo *'}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={profilePicModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setProfilePicModalVisible(false)}>
                <TouchableWithoutFeedback
                  onPress={() => setProfilePicModalVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <Animated.View style={styles.bottomSheet}>
                      <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>
                          Select Photo Option
                        </Text>
                        <TouchableOpacity
                          onPress={() => setProfilePicModalVisible(false)}>
                          <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.sheetContent}>
                        {photoOptions.map(option => (
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
                            <Text style={styles.photoOptionIcon}>
                              {option.icon}
                            </Text>
                            <Text style={styles.photoOptionText}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </Animated.View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
            {errors.profilePic && (
              <Text style={styles.errorText}>{errors.profilePic}</Text>
            )}

            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Full Name <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.fullName ? styles.inputError : null,
                ]}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={text => updateField('fullName', text)}
                autoCapitalize="words"
                returnKeyType="next"
                placeholderTextColor="#aaa"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
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

            {/* Gender */}
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
                onPress={() => setShowGenderPicker(!showGenderPicker)}>
                <Text
                  style={
                    formData.gender
                      ? styles.selectedText
                      : styles.placeholderText
                  }>
                  {formData.gender
                    ? genderOptions.find(
                        option => option.value === formData.gender,
                      )?.label
                    : 'Select your gender'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              {renderGenderPicker()}
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputBoxDate}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.inputTextDate}>
                  {date ? formatDate(date) : 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>

              <DatePicker
                modal
                open={showDatePicker}
                date={date}
                mode="date"
                theme="light"
                maximumDate={new Date()}
                minimumDate={new Date('1900-01-01')}
                onConfirm={selectedDate => {
                  setShowDatePicker(false);
                  setDate(selectedDate);
                }}
                onCancel={() => setShowDatePicker(false)}
              />
            </View>
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.email ? styles.inputError : null,
                ]}
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
            <Text style={styles.sectionTitle}>Address Details</Text>

            {/* Flat Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Flat/Apartment Number{' '}
                {/* <Text style={styles.requiredIndicator}>*</Text> */}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  ...(errors.flatNumber ? [styles.inputError] : []),
                ]}
                placeholder="Enter your flat/apartment number"
                value={formData.flatNumber}
                onChangeText={text => updateField('flatNumber', text)}
                returnKeyType="next"
                placeholderTextColor="#aaa"
              />
              {/* {errors.flatNumber && (
                <Text style={styles.errorText}>{errors.flatNumber}</Text>
              )} */}
            </View>

            {/* Block and Building Numbers */}
            <View style={styles.rowContainer}>
              <View style={[styles.fieldContainer, {flex: 1, marginRight: 8}]}>
                <Text style={styles.label}>Block Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder=" block number"
                  value={formData.blockNumber}
                  onChangeText={text => updateField('blockNumber', text)}
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={[styles.fieldContainer, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.label}>Building Number/Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder=" building number"
                  value={formData.buildingNumber}
                  onChangeText={text => updateField('buildingNumber', text)}
                  returnKeyType="next"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            {/* Full Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Full Address <Text style={styles.requiredIndicator}>*</Text>
              </Text>
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
const styles = StyleSheet.create({
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
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholderText: {
    color: '#888',
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#2E6ACF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  requiredIndicator: {
    color: '#E53935',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#E53935',
    borderWidth: 1,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#777',
  },
  placeholderText: {
    color: '#999',
  },
  selectedText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2E6ACF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Bottom Action Sheet styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 16,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#777',
    padding: 4,
  },
  sheetContent: {
    paddingVertical: 8,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    fontWeight: '500',
  },
  checkmark: {
    color: '#2E6ACF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputBoxDate: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  inputTextDate: {
    color: '#333',
    fontSize: 16,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoOptionIcon: {
    fontSize: 24,
    marginHorizontal: 15,
  },
  photoOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default RegistrationForm;
