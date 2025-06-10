// src/components/screens/UserProfile/index.tsx
import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

// Components
import {FamilyInfo, MedicationCard, ProfileHeader} from './ProfileComponents';

// Types and mock data
import {RootStackParamList} from 'App';
import mockdata from './mockdata';
import {
  completeUserData,
  userFamilyInfoInterface,
  userHealthDetailsInterface,
  userPersonalInfoInterface,
  UserProfileInterface,
} from './types';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowLeftLong, faSquarePen} from '@fortawesome/free-solid-svg-icons';
import {SectionKey} from '@Constants';
import {AuthContext} from '@contextProviders';

type UserProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfile'
> & {
  route: {
    params?: {
      userId: string;
    };
  };
};

/**
 * UserProfile component displays a user's profile information including:
 * - Personal details
 * - Health information
 * - Family members
 * - Emergency contacts
 */
const UserProfile: React.FC<UserProfileProps> = ({route}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = route.params?.userId || 'defaultUserId'; // Default userId if not provided
  const {storeId} = useContext(AuthContext);
  // State management
  const [userData, setUserData] = useState<completeUserData | null>(null);
  const [userPersonalInfo, setUserPersonalInfo] =
    useState<userPersonalInfoInterface | null>(null);
  const [userFamilyInfo, setUserFamilyInfo] =
    useState<userFamilyInfoInterface | null>(null);
  const [userHealthDetails, setUserHealthDetails] =
    useState<userHealthDetailsInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in a real app, this would be an API call
  const mockUserData: UserProfileInterface = mockdata;

  /**
   * Fetches user profile data from API (currently using mock data)
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUserData(mockUserData.user);
      // Set user data from mock
      setUserPersonalInfo({
        fullName: mockUserData.user.fullName,
        firstName: mockUserData.user.firstName,
        lastName: mockUserData.user.lastName,
        profilePic: mockUserData.user.profilePic,
        email: mockUserData.user.email,
        mobileNumber: mockUserData.user.mobileNumber,
        gender: mockUserData.user.gender,
        dateOfBirth: mockUserData.user.dateOfBirth,
        age: mockUserData.user.age,
        healthParameters: mockUserData.user.healthParameters,
        address: mockUserData.user.address,
        subscription: mockUserData.user.subscription,
        prescription: mockUserData.user.prescription,
        healthRecords: mockUserData.user.healthRecords,
      });

      setUserFamilyInfo({
        familyMembers: mockUserData.user.familyMembers,
        emergencyContacts: mockUserData.user.emergencyContacts,
      });

      setUserHealthDetails({
        healthIssues: mockUserData.user.healthIssues,
        currentMedications: mockUserData.user.currentMedications,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pull-to-refresh functionality
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  // Fetch data on component mount and when userId changes
  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{color: 'grey'}}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  console.log('++++++', userData, 'userData');

  const handleEditPress = (section: SectionKey) => {
    navigation.navigate('EditScreen', {
      section, // e.g., 'personalDetails'
      initialData: userData, // Pass COMPLETE data
      userId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#c9eaff" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {!userPersonalInfo && (
          <View
            style={{
              backgroundColor: '#c9eaff',
              padding: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Pressable onPress={() => navigation.goBack()}>
              <FontAwesomeIcon
                icon={faArrowLeftLong}
                size={16}
                style={{color: '#000000', marginLeft: 8}}
              />
            </Pressable>
          </View>
        )}
        {/* Profile header with user info */}

        {userPersonalInfo && (
          <ProfileHeader
            navigation={navigation}
            userPersonalInfo={userPersonalInfo}
            userId={userId}
            handleEditPress={handleEditPress}
          />
        )}

        {/* Health/medication information */}
        {userHealthDetails && (
          <MedicationCard
            healthIssues={userHealthDetails.healthIssues}
            currentMedications={userHealthDetails.currentMedications}
            navigation={navigation}
            userId={userId}
            storeId={storeId ?? undefined}
            handleEditPress={handleEditPress}
          />
        )}

        {/* Family information */}
        {userFamilyInfo && (
          <FamilyInfo
            familyMembers={userFamilyInfo.familyMembers}
            emergencyContacts={userFamilyInfo.emergencyContacts}
            navigation={navigation}
            userId={userId}
            handleEditPress={handleEditPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    color: '#3b82f6',
    marginRight: 4,
  },
  editText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
});

export default UserProfile;
