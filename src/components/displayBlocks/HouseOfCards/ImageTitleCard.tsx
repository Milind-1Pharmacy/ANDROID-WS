import {Image, Text, View} from 'native-base';
import {Dimensions, Platform, StyleSheet, TouchableOpacity} from 'react-native';
import P1Styles from '@P1StyleSheet';
import React from 'react';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const blockWidth = (screenWidth - 40) / 2;

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 20,
    width: isDesktop ? 300 : blockWidth,
    alignItems: 'center',
    backgroundColor: '#2E6ACF',
    ...P1Styles.shadow,
  },
  detailsBlock: {
    backgroundColor: '#EDCAD1',
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    width: isDesktop ? 300 : blockWidth,
    height: isDesktop ? 150 : blockWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    elevation: 5,
  },
  imgBackground: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    objectFit: 'cover',
    opacity: 0.5,
  },
  img: {
    width: isDesktop ? '100%' : blockWidth,
    height: '100%',
    aspectRatio: 1,
    objectFit: 'contain',
  },
  textBlock: {
    height: isDesktop ? 70 : 80,
    width: isDesktop ? '100%' : blockWidth,
    maxWidth: isDesktop ? 300 : blockWidth,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    ...P1Styles.shadow,
  },
  label: {
    marginTop: 7,
    marginHorizontal: 7,
    marginVertical: 2,
    fontSize: isDesktop ? 16 : 14,
    lineHeight: isDesktop ? 16 : 18,
    fontWeight: '600',
  },
  priceTag: {
    marginHorizontal: 7,
    marginVertical: 2,
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '700',
    color: '#808080',
  },
});

const ImageTitleCard = (props: any) => {
  return (
    <TouchableOpacity
      style={styles.detailsBlock}
      onPress={() => props.controlProps.onPress(props.item)}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: props.item.imageUrl}}
          style={styles.imgBackground}
          alt={props.item.name}
          accessibilityLabel={props.item.name}
          blurRadius={20}
        />
        <Image
          source={{uri: props.item.imageUrl}}
          style={styles.img}
          alt={props.item.name}
          accessibilityLabel={props.item.name}
        />
      </View>
      <View style={styles.textBlock}>
        <Text numberOfLines={isDesktop ? 1 : 2} style={styles.label}>
          {props.item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ImageTitleCard;
