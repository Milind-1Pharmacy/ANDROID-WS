import React, {memo, useEffect, useState, useMemo} from 'react';
import P1Styles from '@P1StyleSheet';
import {FlatList, Input, SearchIcon, Text, View} from 'native-base';
import {Dimensions, RefreshControl, StyleSheet} from 'react-native';
import {getCardByIndex} from '../HouseOfCards/CardsIndex';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {InfoScreen} from '@commonComponents';
import {FlatGrid, SectionGrid} from 'react-native-super-grid';

const {width: screenWidth, height} = Dimensions.get('window');
const blockWidth = screenWidth;

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginHorizontal: 20,
    ...P1Styles.shadow,
    marginBottom: 12,
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
  },
});

const MemoizedListItem = memo(
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
    const Component = getCardByIndex(item.card_id);
    if (!Component) {
      console.error(`No component found for card_id: ${item.card_id}`);
      return null;
    }

    return React.cloneElement(<Component />, {
      onPress,
      id,
      item,
      controlProps,
    });
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
      JSON.stringify(prevProps.controlProps) ===
        JSON.stringify(nextProps.controlProps)
    );
  },
);
const GridView = (props: any) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Memoized derived values
  const searchEnabled = props.searchEnabled !== false;
  const itemClickActions = useMemo(
    () => ({
      push: navigation.push,
      navigate: navigation.navigate,
    }),
    [navigation.push, navigation.navigate],
  );

  // Process data only when props change
  const {displayList, itemsCount, sections} = useMemo(() => {
    const rawList = props.list || [];
    const sectionsData = props.sections || [];

    let filteredList = rawList;
    if (searchKeyword.length >= 3) {
      filteredList = rawList.filter((item: any) =>
        (props.searchFilter || ((keyword: string, item: any) => true))(
          searchKeyword,
          item,
        ),
      );
    }

    const count = props.list
      ? filteredList.length
      : sectionsData.reduce(
          (count: number, section: any) =>
            count + (section.cards ? section.cards.length : 0),
          0,
        );

    return {
      displayList: filteredList,
      itemsCount: count,
      sections: sectionsData.map((section: any) => ({
        ...section,
        data: section.cards || filteredList.filter(section.filter),
      })),
    };
  }, [props.list, props.sections, props.searchFilter, searchKeyword]);

  const renderItem = ({item}: {item: any}) => {

    return (
      <MemoizedListItem
        item={(props.cardPropParser || ((item: any) => item))(item)}
        onPress={() =>
          (item.action in itemClickActions
            ? itemClickActions[item.action as keyof typeof itemClickActions]
            : () => {})(...(item.actionParams || []))
        }
        id={item.id}
        controlProps={props.controlProps}
      />
    );
  };

  const renderSectionHeader = ({section}: any) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderEmptyComponent = () => (
    <InfoScreen
      containerStyle={{width: '100%', height: height}}
      title={props.emptyListTitle || 'No items to display.'}
    />
  );

  const renderFooterComponent = () => <View height={200} bg="#ffffff" />;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => (props.onRefresh || (() => {}))(setRefreshing)}
    />
  );

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
        style={[props.style, {flex: 1}]}
        {...(!searchEnabled && !props.summaryBlocks ? {paddingTop: 3} : {})}>
        {props.title && (
          <View
            style={{
              ...styles.titleBlock,
              ...(props.summaryBlocks ? {} : {marginTop: 10}),
            }}>
            <Text style={styles.listTitle}>{props.title}</Text>
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
            itemDimension={blockWidth / 2}
            style={props.style}
            bounces={!!props.onRefresh}
            refreshControl={refreshControl}
            ListFooterComponent={renderFooterComponent}
            contentContainerStyle={{
              ...styles.listContentContainer,
              ...(props.contentContainerStyle || {}),
            }}
            sections={sections}
            ListEmptyComponent={renderEmptyComponent} // Prevent initial empty state flicker
            keyExtractor={(item: any, index: number) =>
              `card-${index}-${JSON.stringify(item)}`
            }
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
          />
        ) : (
          <FlatGrid
            itemDimension={blockWidth}
            spacing={0}
            style={props.style}
            maxItemsPerRow={1}
            refreshControl={refreshControl}
            ListEmptyComponent={renderEmptyComponent} // Prevent initial empty state flicker
            ListFooterComponent={renderFooterComponent}
            contentContainerStyle={{
              ...styles.listContentContainer,
              ...(props.contentContainerStyle || {}),
            }}
            keyExtractor={(item: any, index: number) =>
              `card-${index}-${JSON.stringify(item)}`
            }
            data={displayList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={Math.min(itemsCount, 10)} // Render fewer initial items
            windowSize={10} // Optimize scroll performance
            updateCellsBatchingPeriod={50} // Batch updates
            renderItem={renderItem}
          />
        )}
      </View>
    </>
  );
};

export default memo(GridView, (prevProps, nextProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.list === nextProps.list &&
    prevProps.sections === nextProps.sections &&
    prevProps.error === nextProps.error &&
    prevProps.title === nextProps.title &&
    prevProps.searchEnabled === nextProps.searchEnabled
  );
});
