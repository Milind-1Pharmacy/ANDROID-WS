import { SectionKey } from '@Constants';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';

export type UserProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfile'
> & {
  route: {
    params?: {
      userId: string;
    };
  };
};

export interface UserProfileInterface {
  user: {
    id: string;
    profilePic: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    gender: string;
    dateOfBirth: string;
    age: string;
    registrationDate: string;
    lastUpdated: string;
    subscription: {
      plan: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    flatNumber: string;
    blockNumber: string;
    buildingNumber: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };

    familyMembers: {
      male: string;
      female: string;
      children: string;
    };

    healthIssues: {
      bloodPressure: boolean;
      diabetes: boolean;
      kidneyProblems: boolean;
      neurologicalProblems: boolean;
      cancer: boolean;
      other: string;
    };

    currentMedications: Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      stripColor: string;
      therapyTag: string;
      isManual: boolean;
      mrp: string;
      skuId?: string;
      imageUrl?: string;
      photo?: any;
    }>;

    healthParameters: {
      height: string;
      weight: string;
      bloodPressure: string;
      bloodSugar: string;
      spo2: string;
      bpPhoto?: any;
      glucometerPhoto?: any;
      pulseOximeterPhoto?: any;
    };

    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;

    preferences: {
      language: string;
      notifications: {
        medicationReminders: boolean;
        healthTips: boolean;
        appointmentReminders: boolean;
      };
      units: {
        weight: string;
        height: string;
        temperature: string;
      };
    };

    calculatedValues: {
      bmi: number;
      totalFamilyMembers: number;
      activeMedicationsCount: number;
      profileCompleteness: number;
      lastHealthUpdateDaysAgo: number;
    };
    prescription: Array<any>;
    healthRecords: Array<any>;
  };
}

export interface userPersonalInfoInterface {
  fullName: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  email: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  address: string;
  healthParameters: {
    height: string;
    weight: string;
    bloodPressure: string;
    bloodSugar: string;
    spo2: string;
  };
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  prescription: Array<any>;
  healthRecords: Array<any>;
  navigation?: any;
  userId?: string;
}

export interface userFamilyInfoInterface {
  familyMembers: {
    male: string;
    female: string;
    children: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  navigation?: any;
  userId?: string;
  handleEditPress?: (section: SectionKey) => void;
}

export interface userHealthDetailsInterface {
  healthIssues: {
    bloodPressure: boolean;
    diabetes: boolean;
    kidneyProblems: boolean;
    neurologicalProblems: boolean;
    cancer: boolean;
    other: string;
  };
  currentMedications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    stripColor: string;
    therapyTag: string;
    isManual: boolean;
    mrp?: string;
    skuId?: string;
    imageUrl?: string;
  }>;
  navigation?: any;
  userId?: string;
  storeId?: string;
  handleEditPress?: (section: SectionKey) => void;
}

export interface completeUserData {}
