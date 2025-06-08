import {SectionKey} from '@Constants';
import {
  ContactInfoForm,
  EmergencyContactForm,
  PersonalDetailsForm,
  AddMediationForm,
  HealthParamForm,
} from './tabs';

export const EDIT_SECTIONS: Record<
  SectionKey,
  {
    label: string;
    component: React.ComponentType<any>;
  }
> = {
  personalDetails: {
    label: 'Personal Details',
    component: PersonalDetailsForm,
  },
  contactInfo: {
    label: 'Contact Info',
    component: ContactInfoForm,
  },
  emergencyContacts: {
    label: 'Emergency Contacts',
    component: EmergencyContactForm,
  },
  addMedication: {
    label: 'Add Medication',
    component: AddMediationForm,
  },
  healthParameters: {
    label: 'Health Parameters',
    component: HealthParamForm,
  },
};
