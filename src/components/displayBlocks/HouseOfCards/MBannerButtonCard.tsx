import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faFileImport,
  faPrescriptionBottleMedical,
  faMapPin,
  faPhone,
  faFaceSmile,
} from '@fortawesome/free-solid-svg-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {useNavigation} from '@react-navigation/native';
import {ChevronDownIcon, ChevronUpIcon, Divider} from 'native-base';
import bannerImg from '../../../assets/prescription.png';

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    width: '102.2%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d3d3d384',
  },
  contentWrapper: {},
  leftSection: {
    flexDirection: 'row',
    backgroundColor: '#E1EEFF',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#E1EEFF',
    borderRadius: 12,
    justifyContent: 'center',
    padding: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#0F847D',
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contentRow: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EFEFEF',
    flex: 1,
  },
  subtitle: {
    color: '#e5e5e5',
    fontSize: 12,
    fontWeight: '400',
  },
  divider: {
    backgroundColor: '#e5e5e5',
    height: 0.5,
    opacity: 0.7,
    marginVertical: 8,
  },
  rightSection: {
    backgroundColor: '#FFFFFF',
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  howItWorksTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F585D',
  },
  stepsContainer: {
    padding: 12,
  },
  stepBox: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#4F585D',
    flex: 1,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#FFA500',
    fontStyle: 'normal',
    textAlign: 'center',
    fontWeight: '600',
  },
});

const MBannerButtonCard = () => {
  const [collapsed, setCollapsed] = useState(true);
  const contentHeight = useRef(new Animated.Value(0)).current;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('PrescriptionOrder');
  };

  const toggleCollapse = () => {
    Animated.timing(contentHeight, {
      toValue: collapsed ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCollapsed(!collapsed);
  };

  const steps = [
    {
      icon: faPrescriptionBottleMedical,
      text: 'Enter medicine names and quantities or upload prescription photo.',
    },
    {
      icon: faMapPin,
      text: 'Drop the pin! Enter your address and place your order.',
    },
    {
      icon: faPhone,
      text: "Stay tuned! We'll call to confirm your medicines.",
    },
    {
      icon: faFaceSmile,
      text: 'Relax and wait! Your medicines are on their way.',
    },
  ];

  const renderSteps = () => (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepBox}>
          <View style={styles.numberCircle}>
            <FontAwesomeIcon icon={step.icon} color="#3661AF" size={22} />
          </View>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
      <Text style={styles.disclaimerText}>
        * Only valid prescriptions from certified doctors are accepted.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Top Section */}
        <Pressable style={styles.leftSection} onPress={handlePress}>
          <View style={styles.iconContainer}>
            <Image
              source={bannerImg}
              style={{height: 48, width: 48}}
              resizeMode="contain"
              alt="banner"
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Order via Prescription</Text>
              <FontAwesomeIcon icon={faFileImport} size={16} color="#EFEFEF" />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.contentRow}>
              <Text style={styles.subtitle}>
                <Text style={{fontWeight: 'bold'}}>Click here</Text>, upload
                your prescription or enter medicine details for quick delivery.
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Bottom Section */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={toggleCollapse}
            style={styles.howItWorksHeader}>
            <Text style={styles.howItWorksTitle}>How does this work?</Text>
            {collapsed ? (
              <ChevronDownIcon color="#1A1A1A" size={4} />
            ) : (
              <ChevronUpIcon color="#1A1A1A" size={4} />
            )}
          </TouchableOpacity>
          <Animated.View
            style={{
              height: contentHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 240], // Adjust this based on your content height
              }),
              overflow: 'hidden',
            }}>
            {renderSteps()}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default MBannerButtonCard;
