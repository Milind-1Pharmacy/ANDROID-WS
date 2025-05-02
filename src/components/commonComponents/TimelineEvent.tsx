import P1Styles from '@P1StyleSheet';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Button, Divider, HStack, Text, VStack, View} from 'native-base';
import {Linking, StyleSheet} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#3F3E60',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 17,
    color: '#808080',
  },
  milestoneMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    ...P1Styles.shadow,
  },
});

const TimelineEvent = (props: any) => {
  const {title, subtitle, isLast, status, index, button} = props.event;
  return (
    <HStack width="100%" px={4} py={1} space={2} minH={32}>
      <VStack alignItems="center">
        <View
          style={styles.milestoneMarker}
          backgroundColor={
            status === 0 ? '#2E6ACF' : status === 1 ? '#505050' : 'transparent'
          }>
          {status === 0 ? (
            <FontAwesomeIcon icon="check" size={20} color="#FFFFFF" />
          ) : status === 1 ? (
            <Text color="#FFFFFF">{index}</Text>
          ) : (
            <FontAwesomeIcon
              icon="triangle-exclamation"
              size={20}
              color="#EED202"
            />
          )}
        </View>
        {!isLast && (
          <Divider
            bg="#A0A0A0"
            height="90%"
            my={2}
            flex={1}
            orientation="vertical"
          />
        )}
      </VStack>
      <VStack flex={1} pt={2}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {button && [0, 2, 3].includes(status) && (
          <Button
            style={styles.submitButton}
            onPress={() =>
              Linking.openURL.call(Linking, button.deepLink || 'onepharma:')
            }>
            {button.title}
          </Button>
        )}
      </VStack>
    </HStack>
  );
};

export default TimelineEvent;
