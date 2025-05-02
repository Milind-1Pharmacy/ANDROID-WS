import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import React, {useState, useMemo} from 'react';
import {Dimensions, StyleSheet, Animated} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {useNavigation} from '@react-navigation/native';
import {Box, Image, Text} from 'native-base';

const screenWidth = Dimensions.get('window').width;

// Color palette for card backgrounds
const CARD_COLORS = [
  '#F8F9FA', // Light Gray
  '#E8F4F8', // Light Blue
  '#F0F8F1', // Light Green
  '#FFF8E1', // Light Yellow
  '#FFF0F0', // Light Pink
  '#F5F0FF', // Light Purple
  '#E8F8F5', // Light Teal
  '#FFF3E0', // Light Orange
];

const styles = StyleSheet.create({
  cardContainer: {
    width: screenWidth * 0.28,
    maxWidth: 110,
    height: 110,

    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d3d3d384',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 5,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  titleText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333333',
  },
});

interface RoundImageTitleCardProps {
  id: string;
  imageUrl: string;
  title: string;
  onPress?: (id: string) => void;
  colorIndex?: number;
}

const RoundImageTitleCard: React.FC<RoundImageTitleCardProps> = ({
  id,
  imageUrl,
  title,
  onPress,
  colorIndex,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Animation states
  const [isPressed, setIsPressed] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  // Determine background color based on colorIndex or title hash
  const backgroundColor = useMemo(() => {
    if (colorIndex !== undefined) {
      return CARD_COLORS[colorIndex % CARD_COLORS.length];
    }
    // Create a hash from the title
    const titleHash = title
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return CARD_COLORS[titleHash % CARD_COLORS.length];
  }, [title, colorIndex]);

  // Animation for press effect
  const handlePressIn = () => {
    setIsPressed(true);

    // Scale down slightly
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);

    // Scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Add a subtle rotation wobble effect on press
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 0.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -0.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle navigation or custom onPress function

    navigation.navigate('ItemsListing', {
      listBy: 'category',
      type: id,
    });
  };

  // Combine animations
  const animatedStyle = {
    transform: [
      {scale: scaleAnim},
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-0.05, 0, 0.05],
          outputRange: ['-5deg', '0deg', '5deg'],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View style={animatedStyle}>
        <Box style={[styles.cardContainer, {backgroundColor}]}>
          <Box style={styles.contentContainer}>
            <Box style={styles.imageContainer}>
              <Image
                source={{uri: imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}}
                alt={title}
                accessibilityLabel={title}
                style={styles.image}
                fallbackSource={{uri: TABLET_CAPSULE_IMAGE_FALLBACK}}
              />
            </Box>

            <Box style={styles.titleContainer}>
              <Text numberOfLines={2} style={styles.titleText}>
                {title}
              </Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default RoundImageTitleCard;
