import P1Styles from '@P1StyleSheet';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {HStack, Text, VStack} from 'native-base';
import {StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React from 'react';

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 5,
    ...P1Styles.shadow,
  },
  title: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '500',
    color: '#3F3E60',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 14,
    color: '#808080',
  },
});

const IconTitleCard = (props: any) => {
  return (
    <TouchableOpacity onPress={props.onPress || (() => {})}>
      <HStack style={styles.cardBase}>
        {props.icon && (
          <FontAwesomeIcon icon={props.icon} size={17} color="#2E6ACF" />
        )}
        <VStack flex={1} space={2}>
          <Text style={styles.title} numberOfLines={2}>
            {props.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {props.subtitle}
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};

export default IconTitleCard;
