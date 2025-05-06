import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Keyboard,
} from 'react-native';
import {Heading, Image, Input, KeyboardAvoidingView, Text} from 'native-base';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthContext, ToastContext} from '@contextProviders';
import {RootStackParamList} from 'App';
import {fetchUserDetails, requestOTP, submitOTP} from '@auth';
import {ToastProfiles} from '@ToastProfiles';
import {LoadingOverlay} from '@commonComponents';
import {_1P_LOGO} from '@Constants';
import {parseError} from '@helpers';

type VerifyOTPProps = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

const VerifyOTP: React.FC<VerifyOTPProps> = ({navigation, route}) => {
  // Context hooks
  const {showToast, dismissAllToasts} = useContext(ToastContext);
  const {setLoggedInUser, authStatus, localAuthFetched, storeId} =
    useContext(AuthContext);

  // State hooks
  const [OTP, setOTP] = useState<string[]>(['', '', '', '']);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Refs
  const inputsRef = useRef<any[]>([]);
  const {phone} = route.params;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

    // Auto-focus first input when screen loads
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }

    return () => {
      // Clean up animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    };
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (authStatus.loggedIn && localAuthFetched) {
      navigation.replace('Home');
    }
  }, [authStatus.loggedIn, localAuthFetched, navigation]);

  // Handlers
  const handleOTPSubmission = useCallback(
    async (otpValue: string) => {
      setVerifyingOTP(true);
      Keyboard.dismiss();

      try {
        const response = await submitOTP(
          phone as string,
          otpValue,
          storeId as string,
        );

        if (!response.data) {
          throw response;
        }

        const sessionToken = response.data['session-token'];
        const userType = response.data.userType;

        const userDetails = await fetchUserDetails(sessionToken);
        if (!userDetails.data) {
          throw userDetails;
        }

        setLoggedInUser({
          ...userDetails.data,
          userType,
          sessionToken,
        });

        dismissAllToasts();
        showToast({...ToastProfiles.success, origin: 'top'});

        // Navigation logic
        navigation.replace('Home');
      } catch (error) {
        const errObject = parseError(error);
        showToast({
          ...ToastProfiles.error,
          title: errObject?.message || 'An unexpected error occurred',
          id: 'otp-verify-error',
          origin: 'top',
        });
      } finally {
        setVerifyingOTP(false);
      }
    },
    [phone, storeId, setLoggedInUser, showToast, dismissAllToasts, navigation],
  );

  const handleOTPInputChange = useCallback(
    (text: string, index: number) => {
      dismissAllToasts();

      // Only allow numeric input
      if (/^[0-9]*$/.test(text)) {
        const newOTP = [...OTP];
        newOTP[index] = text;
        setOTP(newOTP);

        // Auto-focus to next input if not last input
        if (text && index < 3) {
          inputsRef.current[index + 1]?.focus();
        }

        // Trigger OTP verification when last input is filled
        if (text.length === 1 && index === 3) {
          handleOTPSubmission(newOTP.join(''));
        }
      }
    },
    [OTP, handleOTPSubmission, dismissAllToasts],
  );

  const handleKeyPress = useCallback(
    (event: any, index: number) => {
      if (event.nativeEvent.key === 'Backspace' && !OTP[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    },
    [OTP],
  );

  const resendOTP = useCallback(async () => {
    try {
      const response = await requestOTP(phone as string);
      if (response?.statusCode === 200) {
        showToast({
          ...ToastProfiles.success,
          title: 'OTP Sent!',
          id: 'otp-sent',
          origin: 'top',
          timeLimit: 1500,
        });
      } else {
        throw response;
      }
    } catch (error) {
      showToast({
        ...ToastProfiles.error,
        title: parseError(error)?.message,
        id: 'otp-resend-error',
        origin: 'top',
      });
    }
  }, [phone, showToast]);

  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={20}>
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

          <Heading marginY={3} textAlign="center">
            Verify your Mobile Number
          </Heading>

          <Text
            textAlign="center"
            fontSize={14}
            color="#a0a0a0"
            marginBottom={3}>
            We sent an OTP to +91 {phone}
          </Text>

          <TouchableOpacity onPress={navigateBack}>
            <Text
              textAlign="center"
              color="#5697FB"
              fontSize={14}
              fontWeight="bold"
              marginBottom={5}>
              Click here to change number
            </Text>
          </TouchableOpacity>

          <View style={styles.otpContainer}>
            {OTP.map((digit, index) => (
              <Input
                key={index}
                variant="unstyled"
                autoFocus={index === 0}
                size="xl"
                textAlign="center"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={text => handleOTPInputChange(text, index)}
                onKeyPress={event => handleKeyPress(event, index)}
                ref={ref => (inputsRef.current[index] = ref)}
                height={12}
                width={12}
                fontSize={20}
                borderRadius={12}
                borderWidth={1}
                borderColor="#E0E0E0"
                backgroundColor="#FFFFFF"
                placeholder="-"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                _focus={{
                  borderColor: '#2E6ACF',
                  backgroundColor: '#F5F9FF',
                }}
              />
            ))}
          </View>

          <Text textAlign="center" color="#a0a0a0" marginY={5}>
            Didn't receive OTP?{' '}
            <TouchableOpacity onPress={resendOTP}>
              <Text color="#5697FB" fontWeight="bold">
                Resend OTP
              </Text>
            </TouchableOpacity>
          </Text>
        </Animated.View>

        {verifyingOTP && <LoadingOverlay />}
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

export default React.memo(VerifyOTP);
