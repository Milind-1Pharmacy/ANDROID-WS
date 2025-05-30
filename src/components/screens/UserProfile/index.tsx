// src/components/screens/UserProfile/index.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

// Components
import {Header} from '../../commonComponents';
import {FamilyInfo, MedicationCard, ProfileHeader} from './ProfileComponents';

// Types and mock data
import {RootStackParamList} from 'App';
import mockdata from './mockdata';
import {
  userFamilyInfoInterface,
  userHealthDetailsInterface,
  userPersonalInfoInterface,
  UserProfileInterface,
} from './types';

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
  const navigation = useNavigation();
  const userId = route.params?.userId || 'defaultUserId'; // Default userId if not provided

  // State management
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
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#c9eaff" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Profile header with user info */}
        {userPersonalInfo && (
          <ProfileHeader
            navigation={navigation}
            userPersonalInfo={userPersonalInfo}
          />
        )}

        {/* Health/medication information */}
        {userHealthDetails && (
          <MedicationCard
            healthIssues={userHealthDetails.healthIssues}
            currentMedications={userHealthDetails.currentMedications}
          />
        )}

        {/* Family information */}
        {userFamilyInfo && (
          <FamilyInfo
            familyMembers={userFamilyInfo.familyMembers}
            emergencyContacts={userFamilyInfo.emergencyContacts}
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
});

export default UserProfile;
