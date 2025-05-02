import {useContext} from 'react';
import {ScreenBase} from '@Containers';
import {CloudSearch, Header} from '@commonComponents';
import {Dimensions, Platform, TouchableOpacity} from 'react-native';
import {HStack, Text, VStack, View} from 'native-base';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {getURL} from '@APIRepository';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {FormStateContext} from '@contextProviders';
import {useContextSelector} from 'use-context-selector';
import React from 'react';

const { width: screenWidth, height } = Dimensions.get('window');

const isDesktop = (Platform.OS === 'web' && (screenWidth > height));

const SearchAddress = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SearchAddress'>) => {
  const updateLocation = useContextSelector(
    FormStateContext,
    state => state.updateLocation,
  );

    return (
        <>
            <ScreenBase>
                <VStack h="100%" w="100%" bgColor={isDesktop ? "#EFEFEF" : "#2E6ACF"} alignItems="center">
                    <Header screenTitle="Search Address" textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'} />
                    <View flex={1} w="100%">
                        <CloudSearch
                            disableGoBack
                            navigation={navigation}
                            placeholder="Search for an area or a building"
                            searchURLGenerator={(searchKeyword: string) => getURL({
                                key: 'SEARCH_LOCATION',
                                queryParams: {
                                    search: searchKeyword
                                }
                            })}
                            itemsParser={(responseData: any) => responseData?.results || []}
                            renderItem={(item: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        width: '100%',
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottomColor: '#E0E0E0',
                                        borderBottomWidth: 1
                                    }}
                                    onPress={() => {
                                        const [lat, lng] = item.location.split(',');
                                        updateLocation({
                                            address: item.address,
                                            lat: +(lat),
                                            lng: +(lng),
                                        
                                        })
                                        navigation.goBack();
                                    }}
                                >
                                    <HStack space={2} flex={1}>
                                        <FontAwesomeIcon icon="location-dot" size={20} color="#2E6ACF" />
                                        <VStack space={1} flex={1}>
                                            <Text color="#3F3E60" fontSize={14} numberOfLines={1} bold>{item.title}</Text>
                                            <Text color="#3F3E60" fontSize={12} numberOfLines={2}>{item.address}</Text>
                                        </VStack>
                                    </HStack>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </VStack>
            </ScreenBase>
        </>
    );
}

export default SearchAddress;