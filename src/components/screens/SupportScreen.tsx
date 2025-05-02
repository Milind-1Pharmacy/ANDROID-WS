import P1Styles from '@P1StyleSheet';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Text, VStack, View} from 'native-base';
import {useEffect, useState, useContext} from 'react';
import {Dimensions, Linking, Platform, StyleSheet} from 'react-native';
import IconTitleCard from '../displayBlocks/HouseOfCards/IconTitleCard';
import {APIContext, AuthContext, ToastContext} from '@contextProviders';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import {Header, LoadingScreen} from '@commonComponents';
import {ScreenBase} from '@Containers';
import {parseError} from '@helpers';
import React from 'react';


const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: isDesktop ? '99%' : '100%',
    marginHorizontal: isDesktop ? 10 : 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
});

const getSupportOptions = (supportData: any) => [
  {
    active: !!supportData?.whatsappLink,
    icon: ['fab', 'whatsapp'],
    title: 'Whatsapp chat',
    subtitle: 'Start a new conersation now',
    onPress: () => Linking.openURL.call(Linking, supportData?.whatsappLink),
  },
  {
    active: !!supportData?.phoneNumber,
    icon: 'phone',
    title: 'Call',
    subtitle: 'Find answers instantly',
    onPress: () =>
      Linking.openURL.call(Linking, `tel://${supportData?.phoneNumber}`),
  },
  // {
  //     active: !!supportData?.email,
  //     icon: 'envelope',
  //     title: 'E-mail',
  //     subtitle: 'Get solutions beamed into your inbox',
  //     onPress: () => Linking.openURL.call(Linking, `mailto://${supportData?.email || ''}`)
  // },
];

const SupportScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Support'>) => {
  const [supportData, setSupportData] = useState<{
    [key: string]: any | undefined;
  }>();
  const [loading, setLoading] = useState<boolean>(true);

  const {storeId} = useContext(AuthContext);

  const {APIGet} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  useEffect(() => {
    APIGet({
      url: getURL({
        key: 'SUPPORT',
        pathParams: storeId,
      }),
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        setSupportData(response.data);

        setLoading(false);
      },
      reject: (error: any) => {
        showToast({...ToastProfiles.error, title: parseError(error).message});
      },
    });
  }, []);

  return (
    <ScreenBase>
      <VStack
        h="100%"
        bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
        alignItems="center">
        <Header
          screenTitle="Support / Contact Us"
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        <View style={styles.contentBase}>
          {loading ? (
            <LoadingScreen />
          ) : (
            <>
              <VStack w="100%" alignItems="center">
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    fontSize: 20,
                    fontWeight: '600',
                  }}>
                  Tell us, how we can help.
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 14,
                    fontWeight: '500',
                  }}>
                  Our crew of superheroes is standing by
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 14,
                    fontWeight: '500',
                  }}>
                  for services and support.
                </Text>
              </VStack>
              <VStack w="100%" px={5} mt={4} space={1}>
                {getSupportOptions(supportData)
                  .filter(option => option.active)
                  .map((option, index) => (
                    <IconTitleCard
                      key={index}
                      icon={option.icon}
                      title={option.title}
                      subtitle={option.subtitle}
                      onPress={option.onPress}
                    />
                  ))}
              </VStack>
            </>
          )}
        </View>
      </VStack>
    </ScreenBase>
  );
};

export default SupportScreen;
