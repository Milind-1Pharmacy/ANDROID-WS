export interface chipProps {
  initialData: any;
  handleSubmit: (data: any) => void;
}

export interface PersonalDetailsFormInterface {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  gender: string;
  profilePic: string;
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
}
