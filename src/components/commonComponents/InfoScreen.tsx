import {Text, View} from 'native-base';
import {StyleSheet} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 75,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: '#3F3E60',
    marginBottom: 4,
  },
  message: {
    fontSize: 18,
    lineHeight: 20,
    color: '#3F3E60',
  },
});

const InfoScreen = (props: any) => {
  return (
    <View style={{...styles.container, ...(props.containerStyle || {})}}>
      {props.content && <View>{props.content}</View>}
      {props.title && (
        <Text style={{...styles.title, ...(props.titleStyle || {})}}>
          {`${props.title}`}
        </Text>
      )}
      {props.message && (
        <Text style={{...styles.message, ...(props.messageStyle || {})}}>
          {props.message}
        </Text>
      )}
    </View>
  );
};

export default InfoScreen;
