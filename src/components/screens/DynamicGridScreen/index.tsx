import React, {useEffect, useState, useContext} from 'react';
import {VStack} from 'native-base';
import {Dimensions, Platform} from 'react-native';
import {StyleSheet} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Header, LoadingScreen, P1Badge} from '@commonComponents';
import {ScreenBase, GridView} from '@Containers';
import {ToastProfiles} from '@ToastProfiles';
import {APIContext, AuthContext, ToastContext} from '@contextProviders';
import {getURL} from '@APIRepository';
import {parseError} from '@helpers';
import ItemTypeProfiles from './ItemTypeProfiles';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
  },
  contentContainerStyle: {
    width: isDesktop ? '99%' : '100%',
    marginHorizontal: isDesktop ? 10 : 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
});

const DynamicGridScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'DynamicGridScreen'>) => {
  const [renderData, setRenderData] = useState<{
    [key: string]: any | undefined;
  }>({loaded: false});
  const [loading, setLoading] = useState<boolean>(true);

  const {storeId} = useContext(AuthContext);

  const {APIGet} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  const itemTypeProfile = ItemTypeProfiles[route.params.listByType];

  const fetchRenderData = ({
    onCompleteCallback,
    isRefreshing,
  }: {
    onCompleteCallback?: Function;
    isRefreshing?: boolean;
  }) => {
    if (!isRefreshing) {
      setLoading(true);
      setRenderData({...renderData, loaded: false});
    }
    APIGet({
      url: getURL({
        key: itemTypeProfile.getURLKey,
        queryParams: {
          ...(storeId ? {storeId} : {}),
        },
      }),
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        setRenderData({
          ...response.data,
          items: (response.data?.products || []).map((item: any) => ({
            ...item,
            card_id: itemTypeProfile.cardId,
          })),
          loaded: true,
        });

        setLoading(false);

        (onCompleteCallback || (() => {}))();
      },
      reject: (error: any) => {
        showToast({
          ...ToastProfiles.error,
          title: parseError(error).message,
          id: 'dashboard-fetch-error',
        });
        (onCompleteCallback || (() => {}))();
      },
    });
  };
  useEffect(() => {
    fetchRenderData({});
  }, []);

  const onRefresh = (setRefreshing: Function) => {
    setRefreshing(true);
    fetchRenderData({
      onCompleteCallback: () => setRefreshing(false),
      isRefreshing: true,
    });
  };

  return (
    <ScreenBase>
      <VStack h="100%" bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}>
        <Header
          screenTitle={
            renderData.title || itemTypeProfile.screenTitle || 'Products'
          }
          screenTitleLoadingPlaceholder={
            itemTypeProfile.screenTitle || 'Products'
          }
          loading={loading}
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        {loading ? (
          <LoadingScreen />
        ) : (
          <GridView
            style={styles.contentBase}
            contentContainerStyle={styles.contentContainerStyle}
            onRefresh={onRefresh}
            list={(renderData.items || []).map((item: any) => item)}
            searchFilter={(keyword: string, item: any) =>
              new RegExp(`^${keyword}`, 'i').test(item.name)
            }
            cardPropParser={itemTypeProfile.cardPropParser}
            controlProps={{
              onPress: (item: any) =>
                navigation.navigate(
                  itemTypeProfile.itemNavigateTo,
                  itemTypeProfile.navigateParams(item),
                ),
            }}
          />
        )}
      </VStack>
    </ScreenBase>
  );
};

export default DynamicGridScreen;
