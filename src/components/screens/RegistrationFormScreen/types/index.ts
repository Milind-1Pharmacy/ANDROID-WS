export type Gender = 'male' | 'female' | '';
export type FamilyMemberType = 'male' | 'female' | 'children';
export type HealthIssue =
  | 'bloodPressure'
  | 'diabetes'
  | 'kidneyProblems'
  | 'neurologicalProblems'
  | 'cancer'
  | 'other';

export interface FormData {
  firstName: string;
  lastName: string;
  fullName: string;
  mobileNumber: string;
  bloodGroup: string;
  gender: Gender;
  dateOfBirth: Date;
  age: string;
  flatNumber: string;
  blockNumber: string;
  buildingNumber: string;
  address: string;
  email: string;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  familyMembers: Record<FamilyMemberType, string>;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  prescription: {
    uri: string;
    name: string;
    type: string;
  }[];
  healthIssues: Record<HealthIssue, boolean | string>;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: string;
  address?: string;
  profilePic?: string;
  familyMembers?: string;
}

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}
