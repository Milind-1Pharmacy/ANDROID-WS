import {Spinner, Text, VStack, View} from 'native-base';
import {StyleSheet} from 'react-native';
import P1Styles from '@P1StyleSheet';
import React from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBlock: {
    backgroundColor: '#FFFFFF',
    height: 125,
    width: 100,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <VStack style={styles.loadingBlock}>
        <Spinner color="#2E6ACF" />
        <Text>Loading...</Text>
      </VStack>
    </View>
  );
};

export default LoadingScreen;
