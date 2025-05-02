import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import {PrescriptionImg} from '@assets';
import {
  faMapPin,
  faCamera,
  faPhone,
  faFaceSmile,
  faTriangleExclamation,
  faExclamationCircle,
  faPrescriptionBottleMedical,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {useNavigation} from '@react-navigation/native';
import {Divider} from 'native-base';

const {width, height} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width > height;

const styles = StyleSheet.create({
  container: {
    minHeight: isDesktop ? 200 : undefined,
    width: '100.6%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    gap: 8,
    height: '100%',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 4,
  },
  leftSection: {
    flex: 0.4,
    flexDirection: 'column',
    gap: 0,
    padding: 12,
    backgroundColor: '#0F847D',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    // gap: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Helvetica Neue', // Use a modern font
    // marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#F0F0F0',
    lineHeight: 18,
    fontFamily: 'Helvetica Neue', // Use a modern font
  },
  buttonText: {
    color: '#0F847D',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica Neue', // Use a modern font
  },
  warningText: {
    fontSize: 10,
    color: '#FFA500',
    fontStyle: 'normal',
    marginTop: 16,
    // fontFamily: 'Helvetica Neue', // Use a modern font
  },
  rightSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSectionContent: {
    padding: 8,
    paddingVertical: 16,
    height: '96%',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F585D',
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  stepBox: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  numberCircle: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepNumber: {
    color: '#3661AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 16,
    color: '#4F585D',
  },
});

const BannerButtonCard = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handlePress = () => {
    navigation.navigate('PrescriptionOrder');
  };
  const steps = [
    {
      number: 1,
      icon: faPrescriptionBottleMedical,
      text: 'Enter medicine names and quantities or upload prescription photo.',
    },
    {
      number: 2,
      icon: faMapPin,
      text: 'Drop the pin! Enter your address and place your order.',
    },
    {
      number: 3,
      icon: faPhone,
      text: 'Stay tuned! We’ll call to confirm your medicines.',
    },
    {
      number: 4,
      icon: faFaceSmile,
      text: 'Relax and wait! Your medicines are on their way.',
    },
  ];

  const renderSteps = () => (
    <View style={styles.stepsContainer}>
      {steps.map(step => (
        <View key={step.number} style={styles.stepBox}>
          <View style={styles.numberCircle}>
            {step.icon ? (
              <FontAwesomeIcon icon={step.icon} color="#3661AF" size={24} />
            ) : (
              <Text style={styles.stepNumber}>{step.number}</Text>
            )}
          </View>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={styles.textContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 4,
                marginBottom: 8,
              }}>
              <Text style={styles.title}>Order via Prescription</Text>
              {/* <Image
                source={{uri: prescriptionImage}}
                style={{height: 80, width: 80, marginTop: 16, borderRadius: 12}}
              /> */}
              {width > 1024 && (
                <Image
                  source={{uri: PrescriptionImg}}
                  style={{height: 48, width: 48, marginTop: 8, marginRight: 8}}
                />
              )}
            </View>

            <Divider
              style={{
                backgroundColor: '#e5e5e5',
                height: 0.5,
                opacity: 0.7,
                marginBottom: 12,
              }}
            />
            <Text style={styles.subtitle}>
              <Text style={{fontWeight: 'bold'}}>Click here, </Text> Upload your
              prescription or enter medicine details for quick delivery.
            </Text>
            <Pressable
              style={{
                backgroundColor: '#EFEFEF',
                borderRadius: 4,
                padding: 12,
                marginTop: 16,
              }}
              onPress={handlePress}>
              <Text style={styles.buttonText}>Order Now</Text>
            </Pressable>

            <Text style={styles.warningText}>
              <FontAwesomeIcon
                icon={faExclamationCircle}
                size={12}
                color="#FFA500"
              />{' '}
              Only valid prescriptions from certified doctors are accepted.
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <View style={styles.rightSectionContent}>
            <Text style={styles.howItWorksTitle}>How does this work?</Text>
            {renderSteps()}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BannerButtonCard;
