import {FormData} from '../types';

const convertDobToEpoch = (dob: Date | string): number => {
  const date = typeof dob === 'string' ? new Date(dob) : dob;
  return date.getTime(); // returns epoch in milliseconds
};
export const prepareRegistrationPayload = (
  formData: FormData,
  profilePicUrl: string | null,
) => {
  return {
    profileInformation: {
      profileImage: profilePicUrl,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      dateOfBirth: convertDobToEpoch(
        formData.dateOfBirth.toISOString().split('T')[0],
      ),
      age: formData.age,
      email: formData.email,
    },
    addressDetails: {
      flatNumber: formData.flatNumber,
      blockNumber: formData.blockNumber,
      buildingNumber: formData.buildingNumber,
      address: formData.address,
      location: {
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
      },
    },
    familyMembers: {
      male: formData.familyMembers.male,
      female: formData.familyMembers.female,
      children: formData.familyMembers.children,
    },
    emergencyContacts: formData.emergencyContacts.map(contact => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
    })),
    prescription: formData.prescription.map(file => ({
      uri: file.uri,
      name: file.name,
      type: file.type,
    })),
    healthIssues: {
      bloodPressure: formData.healthIssues.bloodPressure,
      diabetes: formData.healthIssues.diabetes,
      kidneyProblems: formData.healthIssues.kidneyProblems,
      neurologicalProblems: formData.healthIssues.neurologicalProblems,
      cancer: formData.healthIssues.cancer,
      other: formData.healthIssues.other,
    },
  };
};
