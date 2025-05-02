import {useRef, useState} from 'react';
import {HStack, ScrollView, Text, View} from 'native-base';
import {Animated, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden', // Prevent overflow outside card
  },

  titleBlock: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E6ACF',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#707070',
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  descBlock: {
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '70%',
  },
  detailsBlockWithoutBadge: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: '100%',
  },
  badgeBlock: {
    width: '30%',
    alignItems: 'flex-end',
  },
  detailItem: {
    width: '100%',
    fontSize: 14,
    lineHeight: 20,
    color: '#707070',
    overflow: 'hidden',
  },
  subHighlight: {
    color: '#997755',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  collapsibleList: {
    marginTop: 15,
  },
  nestedListItem: {
    backgroundColor: '#EFEFEF',
    padding: 20,
    borderRadius: 8,
    // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  badgeHighlight: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#2E6ACF',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    // cursor: 'pointer',
  },
  nestedListItemHeadBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nestedListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#303030',
  },
  nestedListSubtitle: {
    fontSize: 14,
    color: '#707070',
  },
  nestedListDetailItem: {
    fontSize: 14,
    color: '#707070',
  },
  nestedListItemDetailsBlock: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  endBuffer: {},
});

const DescItemCard = (props: any) => {
  const [collapsed, setCollapsed] = useState(true);
  const [contentHeight, setContentHeight] = useState(
    windowWidth >= 414 ? 400 : windowWidth >= 375 ? 250 : 180,
  );
  const maxHeight = windowWidth >= 414 ? 500 : windowWidth >= 375 ? 350 : 250;

  const openCLoseAnim = useRef(new Animated.Value(0)).current;

  const {item} = props;

  const collapse = (event: any) => {
    event.stopPropagation();
    setCollapsed(true);
    Animated.timing(openCLoseAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const expand = (event: any) => {
    event.stopPropagation();
    setCollapsed(false);
    Animated.timing(openCLoseAnim, {
      toValue: contentHeight,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.cardBase}>
      <View style={styles.titleBlock}>
        <HStack
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          paddingX={2}>
          <HStack alignItems="center" space={2}>
            {item.icon === 'location-dot' && (
              <FontAwesomeIcon icon={faLocationDot} color="#2E6ACF" size={18} />
            )}
            <Text style={styles.title}>{item.title}</Text>
          </HStack>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </HStack>
      </View>
      <HStack style={styles.descBlock}>
        <View style={styles.detailsBlock}>
          {item.details?.map((detailItem: any, index: number) => (
            <Text
              key={`detail-${index}`} // Unique key for each detail
              style={styles.detailItem}
              numberOfLines={item.details.length > 1 ? 2 : undefined}>
              {detailItem}
            </Text>
          ))}
        </View>
        {(item.badge || item.subHighlights) && (
          <View style={styles.badgeBlock}>
            {item.subHighlights &&
              item.subHighlights.map((subHighlight: any, index: number) => (
                <Text key={`subHighlight-${index}`} style={styles.subHighlight}>
                  {subHighlight}
                </Text>
              ))}
            {item.badge && !props.hideBadge && (
              <View flex={1} justifyContent="flex-end">
                {item.nestedList ? (
                  <TouchableOpacity
                    style={styles.badgeHighlight}
                    onPress={collapsed ? expand : collapse}>
                    {item.badge}
                  </TouchableOpacity>
                ) : (
                  item.badge
                )}
              </View>
            )}
          </View>
        )}
      </HStack>
      {item.nestedList && (
        <Animated.View
          style={{height: openCLoseAnim, ...styles.collapsibleList}}>
          <ScrollView
            bounces={false}
            onContentSizeChange={(width, height) =>
              setContentHeight(height > maxHeight ? maxHeight : height)
            }
            style={{maxHeight: contentHeight}}>
            {item.nestedList.map((listItem: any, index: number) => (
              <View
                key={`nestedListItem-${index}`} // Unique key for each nested list item
                id={listItem.id}
                style={styles.nestedListItem}>
                <View style={styles.nestedListItemHeadBlock}>
                  <Text style={styles.nestedListTitle}>{listItem.title}</Text>
                  {listItem.subtitle && (
                    <Text style={styles.nestedListSubtitle}>
                      {listItem.subtitle}
                    </Text>
                  )}
                </View>
                {listItem.details?.length > 0 && (
                  <View style={styles.nestedListItemDetailsBlock}>
                    {listItem.details.map(
                      (detailItem: any, detailIndex: number) => (
                        <Text
                          key={`nestedDetail-${detailIndex}`} // Unique key for each detail in nested list
                          style={styles.nestedListDetailItem}>
                          {detailItem || ''}
                        </Text>
                      ),
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default DescItemCard;
