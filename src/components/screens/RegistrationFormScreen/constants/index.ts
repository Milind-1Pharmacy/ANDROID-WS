import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileZipper,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import {FormData, Gender, HealthIssue} from '../types';

export const GENDER_OPTIONS = [
  {label: 'Male', value: 'male' as Gender},
  {label: 'Female', value: 'female' as Gender},
];

export const PHOTO_OPTIONS = [
  {label: 'Take Photo', value: 'take', icon: '📷'},
  {label: 'Upload Photo', value: 'upload', icon: '📁'},
];

export const HEALTH_ISSUES = [
  {id: 'bloodPressure' as HealthIssue, label: 'Blood Pressure'},
  {id: 'diabetes' as HealthIssue, label: 'Diabetes'},
  {id: 'kidneyProblems' as HealthIssue, label: 'Kidney problems'},
  {id: 'neurologicalProblems' as HealthIssue, label: 'Neurological problems'},
  {id: 'cancer' as HealthIssue, label: 'Cancer'},
];

export const FILE_ICONS: Record<string, any> = {
  pdf: faFilePdf,
  msword: faFileWord,
  wordprocessingml: faFileWord,
  spreadsheetml: faFileExcel,
  excel: faFileExcel,
  zip: faFileZipper,
  compressed: faFileZipper,
  text: faFileLines,
};

export const INITIAL_FORM_DATA: FormData = {
  firstName: '',
  lastName: '',
  fullName: '',
  mobileNumber: '',
  gender: '',
  bloodGroup: '',
  dateOfBirth: new Date('2000-01-01'),
  age: '',
  flatNumber: '',
  blockNumber: '',
  buildingNumber: '',
  address: '',
  email: '',
  location: {
    latitude: null,
    longitude: null,
  },
  familyMembers: {
    male: '0',
    female: '0',
    children: '0',
  },
  emergencyContacts: [
    {
      name: '',
      relationship: '',
      phone: '',
    },
  ],
  prescription: [],
  healthIssues: {
    bloodPressure: false,
    diabetes: false,
    kidneyProblems: false,
    neurologicalProblems: false,
    cancer: false,
    other: '',
  },
};

export const BLOOD_GROUP_OPTIONS = [
  {label: 'A+', value: 'A+'},
  {label: 'A-', value: 'A-'},
  {label: 'B+', value: 'B+'},
  {label: 'B-', value: 'B-'},
  {label: 'AB+', value: 'AB+'},
  {label: 'AB-', value: 'AB-'},
  {label: 'O+', value: 'O+'},
  {label: 'O-', value: 'O-'},
];
