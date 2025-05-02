import {VStack} from 'native-base';
import React from 'react';
import {Dimensions, Platform, StyleSheet} from 'react-native';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  sectionBase: {
    marginHorizontal: isDesktop ? 'auto' : 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

const PassiveContainer = ({children}: any) => (
  <VStack style={styles.sectionBase}>{children}</VStack>
);

export default PassiveContainer;
