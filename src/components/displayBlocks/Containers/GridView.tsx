import React, {memo, useCallback, useEffect, useState} from 'react';
import P1Styles from '@P1StyleSheet';
import {FlatList, Input, SearchIcon, Text, View} from 'native-base';
import {Dimensions, Platform, RefreshControl, StyleSheet} from 'react-native';
import {getCardByIndex} from '../HouseOfCards/CardsIndex';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {InfoScreen} from '@commonComponents';
import {FlatGrid, SectionGrid} from 'react-native-super-grid';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;
const getNumColumns = (width: number) => {
  if (width > 1600) return 5;
  if (width >= 1440) return 4;
  return 3;
};
const numColumns = getNumColumns(screenWidth);
const blockWidth = isDesktop
  ? (screenWidth - numColumns * 10 + 20) / numColumns // Adjust for spacing
  : screenWidth;

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginHorizontal: 20,
    ...P1Styles.shadow,
    marginBottom: !isDesktop ? 12 : undefined,
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
    paddingBottom: 0,
    borderRadius: isDesktop ? 20 : undefined,
  },
  desktopContainer: {
    paddingHorizontal: 20,
  },
});

const GridView = (props: any) => {
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
  }, []);

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

  const ListItem = React.memo(
    ({
      item,
      onPress,
      id,
      controlProps,
    }: {
      item: any;
      onPress: any;
      id: string;
      controlProps: any;
    }) => {
      const Component: React.FC<any> = getCardByIndex(item.card_id);
      return (
        <Component
          key={
            item.card_id + '-' + JSON.stringify(item) + Date.now().toString()
          }
          onPress={onPress}
          id={id}
          item={item}
          controlProps={controlProps}
        />
      );
    },
  );
  // const handleItemPress = useCallback((item: any) => {
  //   (itemClickActions[item.action as string] || (() => {}))(
  //     ...(item.actionParams || []),
  //   );
  // }, []);
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
        style={[props.style, isDesktop && styles.desktopContainer, {flex: 1}]}
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
          <SectionGrid
            itemDimension={isDesktop ? 300 : blockWidth / 2}
            style={props.style}
            bounces={!!props.onRefresh}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => (props.onRefresh || (() => {}))(setRefreshing)}
              />
            }
            ListFooterComponent={() => <View height={250} bg="#FFFFFF" />}
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
                  controlProps={props.controlProps}
                />
              );
            }}
            renderSectionHeader={({section}: any) => (
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
          />
        ) : (
          <FlatGrid
            itemDimension={blockWidth}
            spacing={0}
            style={props.style}
            maxItemsPerRow={!isDesktop ? 1 : numColumns}
            refreshControl={
              <RefreshControl
                progressViewOffset={-50}
                refreshing={refreshing}
                onRefresh={() => (props.onRefresh || (() => {}))(setRefreshing)}
              />
            }
            ListEmptyComponent={() => (
              <InfoScreen
                containerStyle={{width: '100%', height: height}}
                title={'No items to display.'}
              />
            )}
            ListFooterComponent={() => <View height={200} bg="#ffffff" />}
            contentContainerStyle={{
              ...styles.listContentContainer,
              ...(props.contentContainerStyle || {}),
            }}
            keyExtractor={(item: any, index: number) =>
              'card-' + index + '-' + JSON.stringify(item)
            }
            data={displayList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={itemsCount}
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
                  controlProps={props.controlProps}
                />
              );
            }}
          />
        )}
      </View>
    </>
  );
};

export default memo(GridView);
