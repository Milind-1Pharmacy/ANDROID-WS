import React from 'react';

import {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  FlatList,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
  View,
} from 'native-base';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {useIsFocused} from '@react-navigation/native';
import {APIContext, FormStateContext, ToastContext} from '@contextProviders';
import {ToastProfiles} from '@ToastProfiles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {parseError} from '@helpers';
import {useContextSelector} from 'use-context-selector';

const {width: screenWidth, height} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 5,
    marginVertical: 15,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: 40,
    height: 40,
    ...P1Styles.shadow,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    width: 'auto',
    ...P1Styles.shadow,
    borderWidth: 0,
  },
  contentBase: {
    flex: 1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#ffffff',
    marginLeft: isDesktop ? 10 : 0,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
    width: '100%',
  },
  contentContainerStyle: {
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFFF',
    paddingBottom: 100,
  },
});

const CloudSearch = (props: any) => {
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(
    props.initialSearchItem || '',
  );

  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [searchState, setSearchState] = useState({
    items: [],
    searching: false,
  });

  const inputRef = useRef<TextInput>(null);
  const suggestionsBoxAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const {APIGet} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);

  const setPartialSearchState = useCallback(
    (args: any) => setSearchState(prev => ({...prev, ...args})),
    [],
  );
  const debounce = (debounceHandler: Function, delay: number) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      debounceHandler();
    }, delay);
    setTypingTimeout(timeout);
  };
  const clearSearch = () => {
    setSearchState({
      searching: false,
      items: [],
    });

    setSearchKeyword('');
  };

  const performSearch = useCallback(
    (searchItem: string) => {
      APIGet({
        url: props.searchURLGenerator(searchItem),
        resolve: (response: any) => {
          if (!response.data) {
            throw response;
          }
          setSearchState({
            items: props.itemsParser(response.data),
            searching: false,
          });
        },
        reject: (error: any) => {
          showToast({
            ...ToastProfiles.error,
            title: parseError(error).message,
            id: 'search-error',
          });
        },
      });
    },
    [APIGet, props.searchURLGenerator, props.itemsParser, showToast],
  );
  const onSearchKeywordChange = (text: string) => {
    if (text.length >= 3) {
      setPartialSearchState({searching: true});
      debounce(() => performSearch(text), 300);
    }

    if (text.length === 0) {
      clearSearch();
      return;
    }

    setSearchKeyword(text);
  };

  useEffect(() => {
    Animated.timing(suggestionsBoxAnim, {
      toValue: isFocused
        ? screenWidth -
          (isDesktop ? screenWidth * 0.1 : 0) -
          (isDesktop ? screenWidth / 4 : props.disableGoBack ? 20 : 70)
        : 0,
      duration: 10,
      useNativeDriver: false,
    }).start();

    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (props.initialSearchItem) {
      setSearchKeyword(props.initialSearchItem);
      performSearch(props.initialSearchItem);
    }
  }, [props.initialSearchItem]);

  const renderItem = useCallback(
    ({item, index}: {item: any; index: any}) => props.renderItem(item, index),
    [props.renderItem],
  );

  return (
    <VStack
      h="100%"
      bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
      alignItems="flex-start">
      <HStack style={styles.header}>
        {!props.disableGoBack && (
          <IconButton
            style={styles.backButton}
            onPress={() => props.navigation.goBack()}
            icon={<FontAwesomeIcon icon="arrow-left" color="#808080" />}
          />
        )}
        <View
          style={{
            ...styles.searchBox,
            width: isDesktop
              ? screenWidth * 0.6
              : props.disableGoBack
              ? screenWidth - 40
              : screenWidth - 90,
          }}>
          <Input
            ref={inputRef}
            placeholder={props.placeholder || 'Search'}
            value={searchKeyword}
            onChangeText={onSearchKeywordChange}
            style={{
              height: 40,
              borderWidth: 0,
              fontSize: 16,
              borderRadius: 4,
            }}
            InputLeftElement={
              searchState.searching ? (
                <Spinner style={{marginLeft: 10}} />
              ) : (
                <FontAwesomeIcon
                  color="#808080"
                  icon="magnifying-glass"
                  style={{marginLeft: 10}}
                />
              )
            }
            InputRightElement={
              isDesktop ? (
                <IconButton
                  icon={
                    <FontAwesomeIcon color="#808080" size={20} icon={'xmark'} />
                  }
                  onPress={clearSearch}
                />
              ) : undefined
            }
            _focus={{
              // borderColor: 'transparent',
              backgroundColor: 'transparent',
              borderWidth: 0,
            }}
            _web={{
              borderWidth: 0,
            }}
          />
        </View>
      </HStack>
      <View style={styles.contentBase}>
        <FlatList
          data={searchState.items}
          keyExtractor={item => item?.id}
          renderItem={renderItem}
          initialNumToRender={searchState.items.length}
          windowSize={5}
          maxToRenderPerBatch={15}
          contentContainerStyle={styles.contentContainerStyle}
          ListEmptyComponent={
            <Text textAlign={'center'} style={{marginTop: 10}}>
              Search to get results
            </Text>
          }
        />
      </View>
    </VStack>
  );
};

export default CloudSearch;
