import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Keyboard,
  TextInput,
  Platform,
} from 'react-native';
import {Heading, Image, KeyboardAvoidingView, Text} from 'native-base';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthContext, ToastContext} from '@contextProviders';
import {RootStackParamList} from 'App';
import {fetchUserDetails, requestOTP, submitOTP} from '@auth';
import {ToastProfiles} from '@ToastProfiles';
import {LoadingOverlay} from '@commonComponents';
import {_1P_LOGO} from '@Constants';
import {parseError, triggerNotification} from '@helpers';
import {CommonActions} from '@react-navigation/native';
import {BackHandler} from 'react-native';
import notifee, {AndroidStyle} from '@notifee/react-native';

type VerifyOTPProps = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

// Completely redesigned approach using a hidden master input and visual displays
const VerifyOTP: React.FC<VerifyOTPProps> = ({navigation, route}) => {
  // Context hooks
  const {showToast, dismissAllToasts} = useContext(ToastContext);
  const {setLoggedInUser, authStatus, localAuthFetched, storeId} =
    useContext(AuthContext);

  // State hooks with single-source-of-truth approach
  const [otp, setOtp] = useState('');
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);
  const {phone} = route.params;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cursorAnim = useRef(new Animated.Value(0)).current;

  // Blinking cursor animation
  useEffect(() => {
    if (isFocused && otp.length < 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      cursorAnim.setValue(0);
    }
  }, [isFocused, otp.length, cursorAnim]);

  // Entrance animation
  useEffect(() => {
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

    // Auto-focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    };
  }, [fadeAnim, slideAnim]);

  // Navigation effects
  useEffect(() => {
    if (authStatus.loggedIn && localAuthFetched) {
      navigation.replace('Home');
    }
  }, [authStatus.loggedIn, localAuthFetched, navigation]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 4 && !verifyingOTP) {
      handleOTPSubmission(otp);
    }
  }, [otp, verifyingOTP]);

  // Handlers
  const handleOTPSubmission = useCallback(
    async (otpValue: string) => {
      if (verifyingOTP || otpValue.length !== 4) return;
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
        await triggerNotification(
          'Welcome to Webstore!',
          'Shop with ease and convenience.',
          {
            android: {
              color: '#2e6acf',
              sound: 'pop', // Add sound file to res/raw folder
            },
          },
        );

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Home'}],
          }),
        );
      } catch (error) {
        const errObject = parseError(error);
        showToast({
          ...ToastProfiles.error,
          title: errObject?.message || 'An unexpected error occurred',
          id: 'otp-verify-error',
          origin: 'top',
        });

        // Reset verification state to allow retry
        setVerifyingOTP(false);
      }
    },
    [phone, storeId, setLoggedInUser, showToast, dismissAllToasts, navigation],
  );

  const handleOtpChange = useCallback(
    (text: string) => {
      // Only keep digits and limit to 4 characters
      const sanitizedText = text.replace(/[^0-9]/g, '').substring(0, 4);
      setOtp(sanitizedText);
      dismissAllToasts();
    },
    [dismissAllToasts],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (authStatus.loggedIn) {
          BackHandler.exitApp();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [authStatus.loggedIn]);

  // Pre-calculate container styles
  const containerStyle = useMemo(
    () => [
      styles.card,
      {
        opacity: fadeAnim,
        transform: [{translateY: slideAnim}],
      },
    ],
    [fadeAnim, slideAnim],
  );

  // Render OTP digits with visual enhancements
  const renderOtpDigits = useMemo(() => {
    return Array(4)
      .fill(0)
      .map((_, index) => {
        const digit = otp[index] || '';
        const isActive = otp.length === index;

        return (
          <TouchableOpacity
            key={`digit-${index}`}
            style={[
              styles.otpDigit,
              {
                borderColor: isActive ? '#2E6ACF' : '#E0E0E0',
                backgroundColor: isActive ? '#F5F9FF' : '#FFFFFF',
              },
            ]}
            onPress={focusInput}
            activeOpacity={0.8}>
            {digit ? (
              <Text style={styles.otpText}>{digit}</Text>
            ) : isActive && isFocused ? (
              <Animated.View style={[styles.cursor, {opacity: cursorAnim}]} />
            ) : (
              <Text style={styles.placeholderText}>-</Text>
            )}
          </TouchableOpacity>
        );
      });
  }, [otp, isFocused, focusInput, cursorAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {verifyingOTP && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}>
          {<LoadingOverlay />}
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={20}>
        <Animated.View style={containerStyle}>
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

          {/* Hidden input that captures all keystokes */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={4}
            caretHidden={true}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Visual OTP display - completely decoupled from input logic */}
          <TouchableOpacity
            style={styles.otpContainer}
            activeOpacity={1}
            onPress={focusInput}>
            {renderOtpDigits}
          </TouchableOpacity>

          <Text textAlign="center" color="#a0a0a0" marginY={5}>
            Didn't receive OTP?{' '}
            <Text color="#5697FB" fontWeight="bold" onPress={resendOTP}>
              Resend OTP
            </Text>
          </Text>
        </Animated.View>
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  otpDigit: {
    height: 48,
    width: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholderText: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.3)',
  },
  cursor: {
    height: 24,
    width: 2,
    backgroundColor: '#2E6ACF',
  },
});

export default React.memo(VerifyOTP);
