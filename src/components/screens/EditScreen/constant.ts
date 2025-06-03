import {SectionKey} from '@Constants';
import {
  ContactInfoForm,
  EmergencyContactForm,
  PersonalDetailsForm,
} from './tabs';

export const EDIT_SECTIONS: Record<
  SectionKey,
  {
    label: string;
    component: React.ComponentType;
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
};
