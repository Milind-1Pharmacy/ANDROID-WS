import {Spinner, View} from 'native-base';
import React from 'react';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
    backgroundColor: '#00000077',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const LoadingOverlay = () => {
  return (
    <View style={styles.container}>
      <Spinner color="#2E6ACF" />
    </View>
  );
};

export default LoadingOverlay;
