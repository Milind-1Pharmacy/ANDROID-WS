import {Box, StatusBar, View} from 'native-base';
import React from 'react';
import {Platform} from 'react-native';

const ScreenBase = ({children}: {children?: JSX.Element | JSX.Element[]}) => {
  return (
    <>
      {!(Platform.OS === 'web') && <StatusBar barStyle="light-content" />}
      <Box safeAreaTop bg="#2E6ACF" />
      <View flex={1} overflow="auto">
        {children}
      </View>
    </>
  );
};

export default ScreenBase;
