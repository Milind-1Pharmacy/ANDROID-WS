import React from 'react';
import {Image, Text} from 'native-base';
import {StyleSheet, TouchableOpacity, Animated, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {useNavigation} from '@react-navigation/native';

const CARD_WIDTH = 120; // Reduced from previous larger width

const BrandCard = ({
  id,
  imageUrl,
  name,
  TABLET_CAPSULE_IMAGE_FALLBACK,
}: {
  id: string;
  imageUrl?: string;
  name: string;
  TABLET_CAPSULE_IMAGE_FALLBACK: string;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() =>
        navigation.navigate('ItemsListing', {listBy: 'brand', type: id})
      }
      activeOpacity={0.9}>
      <Animated.View
        style={[styles.cardBase, {transform: [{scale: scaleAnim}]}]}>
        <Image
          source={{uri: imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}}
          alt={name}
          accessibilityLabel={name}
          style={styles.img}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.brandName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.viewMore}>View Products →</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 2,
    overflow: 'hidden',
    elevation: 0.2,
    borderColor: '#d3d3d3',
    borderWidth: 1,
  },
  img: {
    width: '100%',
    height: CARD_WIDTH * 0.75, // Maintains proportion with width
    backgroundColor: '#f8f9fa',
  },
  textContainer: {
    padding: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  viewMore: {
    fontSize: 12,
    color: '#2335de',
    fontWeight: '500',
  },
});

export default BrandCard;
