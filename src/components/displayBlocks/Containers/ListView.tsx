import React, {useEffect, useState} from 'react';
import P1Styles from '@P1StyleSheet';
import {
  FlatList,
  Input,
  SearchIcon,
  SectionList,
  Text,
  View,
} from 'native-base';
import {Dimensions, Platform, RefreshControl, StyleSheet} from 'react-native';
import {getCardByIndex} from '../HouseOfCards/CardsIndex';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {InfoScreen} from '@commonComponents';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginHorizontal: 20,
    ...P1Styles.shadow,
  },
  summarySection: {
    marginTop: 2,
    marginLeft: 10,
  },
  titleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  listTitle: {
    marginVertical: 2,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitleContainer: {
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '400',
    marginHorizontal: 25,
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterIcon: {
    margin: 5,
  },
  actionSheetStyle: {
    alignItems: 'flex-start',
  },
  actionSheetTitle: {
    color: '#3C3C3C',
    fontWeight: '700',
    fontSize: 22,
    marginVertical: 10,
  },
  filterChip: {
    padding: 5,
    paddingVertical: 7.5,
  },
  unSelectedChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  selectedChip: {
    backgroundColor: '#2E6ACF',
    borderColor: '#FFFFFF',
    ...P1Styles.shadow,
  },
  listContentContainer: {
    paddingBottom: 150,
    // overflowY: 'overlay',
    borderRadius: isDesktop ? 20 : undefined,
  },
});

const ListView = (props: any) => {
  const [rawList, setRawList] = useState(props.list || []);
  const [summaryBlocks, setSummaryBlocks] = useState(props.summaryBlock || []);
  const [displayList, setDisplayList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [itemsCount, setItemsCount] = useState(
    props.list
      ? props.list.length
      : props.sections
        ? props.sections.reduce(
            (count: number, section: any) =>
              (count += section.cards ? section.cards.length : 0),
            0,
          )
        : 0,
  );

  const searchEnabled = props.searchEnabled == false ? false : true;

  const itemClickActions: {[key: string]: any} = {
    push: navigation.push,
    navigate: navigation.navigate,
  };

  useEffect(() => {
    setRawList(props.list);
  }, [props.list]);

  useEffect(() => {
    setSummaryBlocks(props.summaryBlocks);
  }, [props.summaryBlocks]);

  useEffect(() => {
    setDisplayList(rawList);
  }, [rawList]);

  useEffect(() => {
    setItemsCount(
      props.list
        ? props.list.length
        : props.sections
          ? props.sections.reduce(
              (count: number, section: any) =>
                (count += section.cards ? section.cards.length : 0),
              0,
            )
          : 0,
    );
  }, [props.list, props.sections]);

  useEffect(() => {
    if (searchKeyword.length >= 3) {
      setDisplayList(
        rawList.filter((item: any) =>
          (props.searchFilter || ((keyword: string, item: any) => true))(
            searchKeyword,
            item,
          ),
        ),
      );
    }
    if (searchKeyword.length === 0) {
      setDisplayList(rawList);
    }
  }, [searchKeyword]);

  return (
    <>
      {searchEnabled && (
        <View
          style={{
            ...styles.searchBox,
            ...(props.bottomTabsMounted ? {marginTop: 10} : {}),
          }}>
          <Input
            borderColor="transparent"
            size="xl"
            placeholder={props.searchPlaceholder || 'Search'}
            w="100%"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            InputLeftElement={<SearchIcon style={styles.searchIcon} />}
            _focus={{
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      )}
      <View
        style={props.style}
        {...(!searchEnabled && !summaryBlocks ? {paddingTop: 3} : {})}>
        {props.title && (
          <View
            style={{
              ...styles.titleBlock,
              ...(summaryBlocks ? {} : {marginTop: 10}),
            }}>
            {props.title && <Text style={styles.listTitle}>{props.title}</Text>}
          </View>
        )}
        {props.error ? (
          <InfoScreen
            title={
              props.emptyListTitle ||
              props.errorTitle ||
              'Something went wrong!'
            }
            message={props.emptyListMesssage || props.errorMessage || undefined}
          />
        ) : props.sections ? (
          <SectionList
            style={props.style}
            bounces={!!props.onRefresh}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => (props.onRefresh || (() => {}))(setRefreshing)}
              />
            }
            ListFooterComponent={() => <View height={50} bg="#FFFFFF" />}
            contentContainerStyle={{
              ...styles.listContentContainer,
              ...(props.contentContainerStyle || {}),
            }}
            sections={props.sections.map((section: any) => ({
              title: section.title,
              data: section.cards || displayList.filter(section.filter),
            }))}
            ListEmptyComponent={() => (
              <InfoScreen
                containerStyle={{width: '100%'}}
                title={'No items to display.'}
              />
            )}
            keyExtractor={(item: any, index: number) =>
              'card-' + index + '-' + JSON.stringify(item)
            }
            renderItem={({item}) => {
              const Component: React.FC<any> = getCardByIndex(item.card_id);

              return (
                <Component
                  key={item.card_id + '-' + JSON.stringify(item)}
                  onPress={() =>
                    (itemClickActions[item.action as string] || (() => {}))(
                      ...(item.actionParams || []),
                    )
                  }
                  id={item.id}
                  item={(props.cardPropParser || ((item: any) => item))(item)}
                />
              );
            }}
            renderSectionHeader={({section}: {section: {title: string}}) => (
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            style={props.style}
            refreshControl={
              <RefreshControl
                progressViewOffset={-50}
                refreshing={refreshing}
                onRefresh={() => (props.onRefresh || (() => {}))(setRefreshing)}
              />
            }
            ListEmptyComponent={() => (
              <InfoScreen
                containerStyle={{width: '100%'}}
                title={'No items to display.'}
              />
            )}
            ListFooterComponent={() => <View height={50} bg="#FFFFFF" />}
            contentContainerStyle={{
              ...styles.listContentContainer,
              ...(props.contentContainerStyle || {}),
            }}
            keyExtractor={(item: any, index: number) =>
              'card-' + index + '-' + JSON.stringify(item)
            }
            data={displayList}
            renderItem={({item}: {item: any}) => {
              const Component: React.FC<any> = getCardByIndex(item.card_id);

              return (
                <Component
                  key={item.card_id + '-' + JSON.stringify(item)}
                  onPress={() =>
                    (itemClickActions[item.action as string] || (() => {}))(
                      ...(item.actionParams || []),
                    )
                  }
                  id={item.id}
                  item={(props.cardPropParser || ((item: any) => item))(item)}
                />
              );
            }}
          />
        )}
      </View>
    </>
  );
};

export default ListView;
