import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Box, StatusBar, View} from 'native-base';
import React, {useEffect} from 'react';
import {Dimensions, Platform} from 'react-native';
import HomeTabs from './HomeTabs';
import Emitter from '@Emitter';

const {width, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && width > height;

const Home = (props: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const onNavigate = (event: any) => {
    props.navigation.navigate(event.screen, event.params);
  };

  const onReplace = (event: any) => {
    props.navigation.replace(event.screen, event.params);
  };

  useEffect(() => {
    Emitter.on('NAVIGATE', onNavigate);
    Emitter.on('REPLACE', onReplace);

    return () => {
      Emitter.off('NAVIGATE', onNavigate);
      Emitter.off('REPLACE', onReplace);
    };
  }, []);

  return (
    <View
      overflow="hidden"
      style={{margin: 0, padding: 0, width: '100%', height: '100%'}}>
      {!(Platform.OS === 'web') && <StatusBar barStyle="light-content" />}
      <Box safeAreaTop bg={isDesktop ? '#EFEFEF' : '#2E6ACF'} />
      <HomeTabs
        stackNavigation={props.navigation}
        initialTab={props.route?.params?.initialTab}
      />
    </View>
  );
};

export default Home;
