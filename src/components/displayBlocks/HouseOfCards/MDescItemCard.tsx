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

const windowWidth = Dimensions.get('window').width;
const {isPad} = Platform as PlatformIOSStatic;

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 14,
    marginVertical: 8,
    ...P1Styles.shadow,
    overflow: 'hidden',
  },
  titleBlock: {
    backgroundColor: '#2E6ACF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...P1Styles.shadowLarge,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D0E1FF',
    textAlign: 'right',
  },
  descBlock: {
    padding: 10,
    justifyContent: 'space-between',
  },
  detailsBlock: {
    // flexDirection: 'column',
    marginTop: 8,
    flexDirection: 'column',
    width: '100%',
  },
  badgeBlock: {
    marginTop: 10,
  },
  detailItem: {
    fontSize: 12,
    lineHeight: 18,
    color: '#707070',
    maxWidth: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  subHighlight: {
    color: '#997755',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 5,
  },
  collapsibleList: {
    marginTop: 8,
  },
  nestedListItem: {
    borderTopColor: '#E5E5E8',
    borderTopWidth: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginBottom: 8,
  },
  nestedListItemHeadBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nestedListItemDetailsBlock: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginTop: 6,
  },
  nestedListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#303030',
  },
  nestedListSubtitle: {
    fontSize: 12,
    color: '#707070',
  },
  nestedListDetailItem: {
    fontSize: 12,
    color: '#707070',
  },
  endBuffer: {
    height: 10,
  },
  badgeHighlight: {
    backgroundColor: '#2E6ACF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    position: 'relative',
    right: 108,
  },
});

const MDescItemCard = (props: any) => {
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
            {item.icon && (
              <FontAwesomeIcon icon={item.icon} color="#FFFFFF" size={18} />
            )}
            <Text style={styles.title}>{item.title}</Text>
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

export default MDescItemCard;
