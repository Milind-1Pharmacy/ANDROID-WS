import React, {useRef, useState} from 'react';
import P1Styles from '@P1StyleSheet';
import {HStack, ScrollView, Text, View} from 'native-base';
import {
  Animated,
  Dimensions,
  Platform,
  PlatformIOSStatic,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

const windowWidth = Dimensions.get('window').width;
const {isPad} = Platform as PlatformIOSStatic;

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#2E6ACF',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleBlock: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EFF8',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2E6ACF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E6ACF',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7FA3D8',
    textAlign: 'right',
  },
  descBlock: {
    padding: 14,
    justifyContent: 'space-between',
  },
  detailsBlock: {
    marginTop: 4,
    flexDirection: 'column',
    width: '100%',
  },
  badgeBlock: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  detailItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#505A64',
    maxWidth: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginBottom: 2,
  },
  subHighlight: {
    color: '#5686CC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 5,
  },
  itemCount: {
    color: '#4F79B8',
    fontSize: 12,
    fontWeight: '500',
  },
  collapsibleList: {
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E8EFF8',
  },
  nestedListItem: {
    borderBottomColor: '#E8EFF8',
    borderBottomWidth: 1,
    backgroundColor: '#FBFCFE',
    padding: 14,
  },
  nestedListItemHeadBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nestedListItemDetailsBlock: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F8FC',
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8EFF8',
  },
  nestedListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3A',
  },
  nestedListSubtitle: {
    fontSize: 12,
    color: '#7B8794',
  },
  nestedListDetailItem: {
    fontSize: 12,
    color: '#505A64',
  },
  endBuffer: {
    height: 8,
  },
  badgeButton: {
    backgroundColor: '#F0F6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E6F9',
    position: 'relative',
    right: 108,
  },
  badgeText: {
    color: '#2E6ACF',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});

const MDescItemCard = (props: any) => {
  console.log(props);

  const [collapsed, setCollapsed] = useState(true);
  const [contentHeight, setContentHeight] = useState(
    windowWidth >= 414 ? 400 : windowWidth >= 375 ? 250 : 180,
  );
  const maxHeight = windowWidth >= 414 ? 500 : windowWidth >= 375 ? 350 : 250;

  const openCloseAnim = useRef(new Animated.Value(0)).current;

  const {item} = props;

  const collapse = (event: any) => {
    event.stopPropagation();
    setCollapsed(true);
    Animated.timing(openCloseAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const expand = (event: any) => {
    event.stopPropagation();
    setCollapsed(false);
    Animated.timing(openCloseAnim, {
      toValue: contentHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleCollapse = (event: any) => {
    collapsed ? expand(event) : collapse(event);
  };

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.cardBase}
      activeOpacity={0.9}>
      <View style={styles.titleBlock}>
        <View style={styles.titleBorder} />
        <HStack
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          paddingX={1}>
          <HStack alignItems="center" space={2}>
            {item.icon && (
              <View style={styles.iconWrapper}>
                <FontAwesomeIcon icon={item.icon} color="#2E6ACF" size={14} />
              </View>
            )}
            <View>
              <Text style={styles.title}>{item.title}</Text>
              {item.items && !item.subHighlights && (
                <Text style={styles.itemCount}>
                  {item.items} item{item.items !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </HStack>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </HStack>
      </View>
      <HStack style={styles.descBlock}>
        <View style={styles.detailsBlock}>
          {item.details?.map((detailItem: any, index: number) => (
            <Text key={`detail-${index}`} style={styles.detailItem}>
              {detailItem}
            </Text>
          ))}
        </View>
        {(item.badge || item.subHighlights) && (
          <View style={styles.badgeBlock}>
            {item.subHighlights &&
              item.subHighlights.map((subHighlight: any, index: number) => (
                <Text key={`subHighlight-${index}`} style={styles.subHighlight}>
                  {subHighlight}{' '}
                  {index === 0 && item.items ? `(${item.items})` : ''}
                </Text>
              ))}
            {item.badge && !props.hideBadge && (
              <View>
                {item.nestedList ? (
                  <TouchableOpacity
                    style={styles.badgeButton}
                    onPress={toggleCollapse}>
                    <Text style={styles.badgeText}>
                      {typeof item.badge === 'string'
                        ? item.badge
                        : 'View Details'}
                    </Text>
                    <FontAwesomeIcon
                      icon={collapsed ? faAngleDown : faAngleUp}
                      size={12}
                      color="#2E6ACF"
                    />
                  </TouchableOpacity>
                ) : typeof item.badge === 'string' ? (
                  <View style={styles.badgeButton}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
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
          style={{height: openCloseAnim, ...styles.collapsibleList}}>
          <ScrollView
            bounces={false}
            onContentSizeChange={(width, height) =>
              setContentHeight(height > maxHeight ? maxHeight : height)
            }
            style={{maxHeight: contentHeight}}>
            {item.nestedList.map((listItem: any, index: number) => (
              <View
                key={`nestedListItem-${index}`}
                id={listItem.id}
                style={[
                  styles.nestedListItem,
                  index === item.nestedList.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}>
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
                          key={`nestedDetail-${detailIndex}`}
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

export default MDescItemCard;
