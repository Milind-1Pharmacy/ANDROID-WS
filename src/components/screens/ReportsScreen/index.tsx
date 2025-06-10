import {
  faArrowLeftLong,
  faBookJournalWhills,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import React from 'react';
import {Pressable, Text, View, StyleSheet} from 'react-native';

const ReportsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const Header = ({
    navigation,
  }: {
    navigation: NativeStackNavigationProp<RootStackParamList>;
  }) => {
    return (
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <FontAwesomeIcon
            icon={faArrowLeftLong}
            style={styles.backIcon}
            size={18}
          />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Report Book</Text>
          <FontAwesomeIcon
            icon={faBookJournalWhills}
            size={24}
            style={styles.bookIcon}
          />
        </View>

        {/* Empty view for balance */}
        <View style={styles.rightSpace} />
      </View>
    );
  };

  const UploadReport = () => {

  };
  
  return (
    <View>
      <Header navigation={navigation} />

      <Text>Reports</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#c9eaff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16, // Extra padding for status bar
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  backIcon: {
    color: '#2E6ACF',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E6ACF',
    textAlign: 'center',
  },
  bookIcon: {
    color: '#2E6ACF',
  },
  rightSpace: {
    width: 40, // Same width as back button for balance
  },
});
export default ReportsScreen;
