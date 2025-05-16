import React, {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
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
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {useIsFocused} from '@react-navigation/native';
import {APIContext, FormStateContext, ToastContext} from '@contextProviders';
import {ToastProfiles} from '@ToastProfiles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {parseError} from '@helpers';

const {width: screenWidth} = Dimensions.get('window');

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
    ...P1Styles.shadowTopLarge,
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
      toValue: isFocused ? screenWidth - (props.disableGoBack ? 20 : 70) : 0,
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
    <VStack h="100%" bgColor="#2E6ACF" alignItems="flex-start">
      <HStack style={styles.header}>
        {!props.disableGoBack && (
          <IconButton
            style={styles.backButton}
            onPress={() => props.navigation.goBack()}
            icon={
              <FontAwesomeIcon icon="arrow-left" color="#808080" size={20} />
            }
          />
        )}
        <View
          style={{
            ...styles.searchBox,
            width: props.disableGoBack ? screenWidth - 40 : screenWidth - 90,
          }}>
          <Input
            ref={inputRef}
            placeholder={props.placeholder || 'Search'}
            autoFocus
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
                  size={16}
                  style={{marginLeft: 10}}
                />
              )
            }
            _focus={{
              backgroundColor: 'transparent',
              borderWidth: 0,
            }}
          />
        </View>
      </HStack>
      <View style={styles.contentBase}>
        <FlatList
          data={searchState?.items || []}
          keyExtractor={(item, index) => item?.id || index.toString()}
          renderItem={renderItem}
          initialNumToRender={searchState?.items?.length || 0}
          windowSize={5}
          maxToRenderPerBatch={15}
          contentContainerStyle={styles.contentContainerStyle}
          ListEmptyComponent={
            <Text textAlign={'center'} style={{marginTop: 10}}>
              {searchState.searching ? 'Searching...' : 'Search to get results'}
            </Text>
          }
        />
      </View>
    </VStack>
  );
};

export default CloudSearch;
