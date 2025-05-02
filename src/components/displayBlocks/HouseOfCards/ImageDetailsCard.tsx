import P1Styles from '@P1StyleSheet';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Image, Text, VStack, View} from 'native-base';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

const displayWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardBase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  imageThumbnail: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    marginRight: 5,
    width: 80,
  },
  textBlock: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    maxHeight: 120,
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 5,
    flexWrap: 'wrap',
    width: '80%',
  },
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    marginTop: 2,
    marginLeft: 5,
  },
  detailItem: {
    fontSize: 12,
    lineHeight: 17,
    color: '#707070',
    overflow: 'hidden',
    marginRight: 10,
  },
  highlightDetailItem: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    overflow: 'hidden',
    marginRight: 10,
  },
});

const ImageDetailsCard = (props: any) => {
  const {title, imgURL, details, highlightDetails} = props.item;

  return (
    <TouchableOpacity onPress={props.onPress || (() => {})}>
      <View style={P1Styles.shadow}>
        <View
        // colors={['#3F7BE0', '#2E6ACF', '#1D59BE']} style={styles.cardBase}
        >
          {imgURL ? (
            <Image
              source={{
                uri: imgURL,
              }}
              alt="IMG"
              accessibilityLabel="IMG"
              size="sm"
              style={styles.imageThumbnail}
            />
          ) : (
            <View
              style={{
                ...styles.imageThumbnail,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <FontAwesomeIcon icon="pills" size={30} color="#FFFFFF" />
            </View>
          )}
          <VStack style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.detailsBlock}>
              {details.map((detailItem: any) => (
                <Text
                  style={styles.detailItem}
                  numberOfLines={1}
                  key={detailItem}>
                  {detailItem}
                </Text>
              ))}
            </View>
            <View style={styles.detailsBlock}>
              {highlightDetails.map((detailItem: any) => (
                <Text
                  style={styles.highlightDetailItem}
                  numberOfLines={1}
                  key={detailItem}>
                  {detailItem}
                </Text>
              ))}
            </View>
          </VStack>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ImageDetailsCard;
