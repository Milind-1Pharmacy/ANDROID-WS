import {useState, useEffect, useContext} from 'react';
import {IconButton, VStack} from 'native-base';
import {Dimensions, Platform} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {StyleSheet} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Header, LoadingScreen, P1AlertDialog} from '@commonComponents';
import {ScreenBase, ListView} from '@Containers';
import {ToastProfiles} from '@ToastProfiles';
import {APIContext, AuthContext, ToastContext} from '@contextProviders';
import {getURL} from '@APIRepository';
import {parseError} from '@helpers';
import React from 'react';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
    marginTop: 5,
  },
  contentContainerStyle: {
    width: isDesktop ? '99%' : '100%',
    flexGrow: 1,
    marginHorizontal: isDesktop ? 10 : 0,
    marginTop: isDesktop ? 10 : 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

const cardPropParser = (item: any) => ({
  id: item.id,
  icon: 'location-dot',
  title: item.title,
  subtitle: item.area,
  details: [item.customerName, item.customerPhone, item.address],
});

const AddressListScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AddressListing'>) => {
  const [mounted, setMounted] = useState(false);
  const [locationsData, setLocationsData] = useState<{
    [key: string]: any | undefined;
  }>({loaded: false});
  const [loading, setLoading] = useState<boolean>(true);
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);

  const toggleLogOutDialogOpen = () => {
    if (logOutDialogOpen) {
      navigation.goBack();
    }

    setLogOutDialogOpen(!logOutDialogOpen);
  };

  const {authStatus, storeConfig} = useContext(AuthContext);

  const {APIGet} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  const fetchRenderData = ({
    onCompleteCallback,
    isRefreshing,
  }: {
    onCompleteCallback?: Function;
    isRefreshing?: boolean;
  }) => {
    if (!isRefreshing) {
      setLoading(true);
      setLocationsData({...locationsData, loaded: false});
    }
    APIGet({
      url: getURL({
        key: 'USER_LOCATION',
      }),
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        setLocationsData({
          ...response.data,
          items: (response.data?.locations || []).map((item: any) => ({
            ...item,
            card_id: 'card_5',
          })),
          loaded: true,
        });

        if (!mounted) {
          setMounted(true);
        }

        setLoading(false);

        (onCompleteCallback || (() => {}))();
      },
      reject: (error: any) => {
        showToast({
          ...ToastProfiles.error,
          title:
            parseError(error).message ||
            'Please Ensure that the details are correct',
          id: 'address-submit-error',
        });
        if (!mounted) {
          setMounted(true);
        }

        (onCompleteCallback || (() => {}))();
      },
    });
  };

  useEffect(() => {
    if (!mounted && authStatus.loggedIn) {
      fetchRenderData({});
    }
  }, [mounted]);

  const onRefresh = (setRefreshing: Function) => {
    setRefreshing(true);
    fetchRenderData({
      onCompleteCallback: () => setRefreshing(false),
      isRefreshing: true,
    });
  };

  const goToLogin = () => {
    toggleLogOutDialogOpen();
    navigation.navigate('Login');
  };

  useEffect(() => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();
    }
  }, []);

  return (
    <ScreenBase>
      <VStack h="100%" bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}>
        <Header
          screenTitle="My Addresses"
          controls={
            <IconButton
              variant="unstyled"
              onPress={() =>
                navigation.navigate(
                  storeConfig?.restrictAddress
                    ? 'AddressForm'
                    : 'SelectLocation',
                )
              }
              p={0}
              icon={
                <FontAwesomeIcon
                  icon="plus"
                  size={20}
                  color={isDesktop ? '#2E6ACF' : '#FFFFFF'}
                />
              }
            />
          }
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        {loading ? (
          <LoadingScreen />
        ) : (
          <ListView
            style={styles.contentBase}
            contentContainerStyle={styles.contentContainerStyle}
            onRefresh={onRefresh}
            list={(locationsData.items || []).map((item: any) => item)}
            searchFilter={(keyword: string, item: any) => {
              const escapedKeyword = keyword.replace(
                /[-\/\\^$*+?.()|[\]{}]/g,
                '\\$&',
              );
              const regex = new RegExp(`^${escapedKeyword}`, 'i');
              return regex.test(item.address);
            }}
            cardPropParser={cardPropParser}
          />
        )}
      </VStack>
      <P1AlertDialog
        heading="You need to log-in first"
        body="To view your saved addresses, you need to be logged in. Please login to continue."
        isOpen={logOutDialogOpen}
        toggleOpen={toggleLogOutDialogOpen}
        buttons={[
          {
            label: 'Proceed to Login',
            variant: 'solid',
            style: {
              ...styles.logOutConfirmButton,
              backgroundColor: '#D00000',
            },
            action: goToLogin,
          },
        ]}
      />
    </ScreenBase>
  );
};

export default AddressListScreen;
