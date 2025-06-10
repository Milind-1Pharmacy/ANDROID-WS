export interface chipProps {
  initialData: any;
  handleSubmit: (data: any) => void;
}

export interface ContactInfoFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  navigation?: any;
  onLocationSelect?: (location: any) => void;
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

export interface ProductSearchResult {
  id: string;
  name: string;
  mrp: string;
  therapy?: string;
  imageUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'as_needed';
  stripColor: string;
  therapyTag: string;
  isManual: boolean;
  skuId?: string;
  mrp: string;
  imageUrl: string;
  photo?: PhotoType;
}

export interface UpdateMedication {
  id: string;
  field: keyof Medication;
  value: any;
}

export interface PhotoType {
  uri: string;
  fileName: string;
  type: string;
  fileSize: number;
}


 export interface AddMedicationFormProps {
  initialData?: Medication[];
  onSubmit: (updatedMedications: Medication[]) => Promise<void>;
  onCancel?: () => void;
  navigation?: any;
}

export interface ManualMedicationState {
  name: string;
  mrp: string;
  composition: string;
}
