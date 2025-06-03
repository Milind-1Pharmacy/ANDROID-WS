import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Keyboard,
  Linking,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  StatusBar,
} from 'react-native';
import {
  Button,
  Heading,
  Image,
  Input,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  VStack,
  HStack,
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCircleExclamation} from '@fortawesome/free-solid-svg-icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {AuthContext, ToastContext} from '@contextProviders';
import {RootStackParamList} from 'App';
import {requestOTP} from '@auth';
import {ToastProfiles, getCustomToastProfile} from '@ToastProfiles';
import {PRIVACY_POLICY_URL, TnC_URL, _1P_LOGO} from '@Constants';
import {parseError} from '@helpers';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  // Context hooks
  const {showToast, dismissAllToasts} = useContext(ToastContext);
  const {authStatus, localAuthFetched} = useContext(AuthContext);

  // State hooks
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const hasNavigated = useRef(false);
  const phoneFieldRef = useRef<any>(null);
  const isFocused = navigation.isFocused();

  // Animation refs - Simplified to just what we need for mobile
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Effects
  useEffect(() => {
    // Simple fade-in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Clean up animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    };
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (localAuthFetched && authStatus.loggedIn && !hasNavigated.current) {
      hasNavigated.current = true;
      navigation.replace('Home');
    }
  }, [localAuthFetched, authStatus.loggedIn, navigation]);

  useEffect(() => {
    if (isFocused) {
      phoneFieldRef.current?.focus();
    }
  }, [isFocused]);

  // Handlers
  const onPhoneChange = useCallback((text: string) => {
    if (!/[^0-9]/.test(text)) {
      setErrorMessage(null);
      setPhone(text);
    }
  }, []);

  const submitPhone = useCallback(async () => {
    if (!phone || phone.length < 10 || /[^0-9]/.test(phone)) {
      dismissAllToasts();
      showToast({
        ...getCustomToastProfile({
          title: 'Please enter a valid phone number.',
          template: 'error',
        }),
        id: 'invalid-phone',
      });
      setErrorMessage('Please enter a valid, 10-digit phone number.');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await requestOTP(phone);

      if (response?.statusCode === 200) {
        dismissAllToasts();
        showToast({
          ...ToastProfiles.success,
          title: 'OTP Sent!',
          id: 'otp-sent',
          timeLimit: 1800,
        });
        navigation.push('VerifyOTP', {phone});
      } else {
        throw response;
      }
    } catch (error) {
      showToast({
        ...ToastProfiles.error,
        title: parseError(error).message,
        id: 'otp-request-error',
      });
    } finally {
      setLoading(false);
    }
  }, [phone, navigation, showToast, dismissAllToasts]);

  const navigateAsGuest = useCallback(() => {
    navigation.navigate('Home', {initialTab: 'Dashboard'});
  }, [navigation]);

  const openTerms = useCallback(() => Linking.openURL(TnC_URL), []);
  const openPrivacyPolicy = useCallback(
    () => Linking.openURL(PRIVACY_POLICY_URL),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#2e6acf" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={20}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.logoContainer}>
              <Image
                source={_1P_LOGO}
                style={styles.logo}
                accessibilityLabel="1p_logo"
                alt="1p_logo"
              />
            </View>

            <View style={styles.formContainer}>
              <VStack space={6}>
                <VStack space={2}>
                  <Heading size="xl" color="#1A1A1A" textAlign="center">
                    Welcome Back
                  </Heading>
                  <Text color="gray.600" fontSize="sm" textAlign="center">
                    Enter your phone number to continue
                  </Text>
                </VStack>

                <VStack space={4}>
                  <Input
                    ref={phoneFieldRef}
                    autoFocus
                    size="lg"
                    placeholder="Enter your mobile number"
                    value={phone}
                    maxLength={10}
                    onChangeText={onPhoneChange}
                    keyboardType="phone-pad"
                    onSubmitEditing={submitPhone}
                    height="56px"
                    fontSize="md"
                    borderRadius="16"
                    borderWidth={2}
                    _focus={{
                      borderColor: '#2E6ACF',
                      backgroundColor: '#F8FAFC',
                    }}
                  />

                  {errorMessage && (
                    <HStack alignItems="center" space={2}>
                      <FontAwesomeIcon
                        color="#FF0000"
                        icon={faCircleExclamation}
                        size={16}
                      />
                      <Text color="#FF0000">{errorMessage}</Text>
                    </HStack>
                  )}
                </VStack>

                <VStack>
                  <Button
                    isLoading={loading}
                    disabled={loading}
                    onPress={submitPhone}
                    height="56px"
                    borderRadius="16"
                    backgroundColor="#2E6ACF"
                    _pressed={{backgroundColor: '#1E4A9B'}}
                    mb="2">
                    <Text color="white" fontSize="lg" fontWeight="600">
                      Continue with Phone
                    </Text>
                  </Button>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Button
                    onPress={navigateAsGuest}
                    height="56px"
                    borderRadius="16"
                    backgroundColor="#F0F0F0"
                    _pressed={{backgroundColor: '#E0E0E0'}}>
                    <Text color="#2E6ACF" fontSize="lg" fontWeight="500" bold>
                      Explore as Guest
                    </Text>
                  </Button>
                </VStack>

                <Text textAlign="center" color="gray.600" fontSize="sm">
                  By providing the phone number, I hereby agree and accept the{' '}
                  <TouchableOpacity onPress={openTerms}>
                    <Text color="#2E6ACF" fontWeight="600">
                      Terms of Service
                    </Text>
                  </TouchableOpacity>{' '}
                  and{' '}
                  <TouchableOpacity onPress={openPrivacyPolicy}>
                    <Text color="#2E6ACF" fontWeight="600">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </Text>
              </VStack>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2e6acf',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 450,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d3d3d3',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
});

export default React.memo(LoginScreen);
