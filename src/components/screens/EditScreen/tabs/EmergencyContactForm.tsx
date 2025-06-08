import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

type Contact = {
  name: string;
  relationship: string;
  phone: string;
};

interface EmergencyContactFormProps {
  initialData?: Contact[];
  onSubmit: (updatedData: Partial<Contact[]>) => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  initialData = [],
  onSubmit,
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialData || []);

  console.log('contacts', contacts);
  console.log('initialData', initialData);

  const updateContact = (
    index: number,
    field: keyof Contact,
    value: string,
  ) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const addContact = () => {
    setContacts([...contacts, {name: '', relationship: '', phone: ''}]);
  };

  const removeContact = (index: number) => {
    const updated = [...contacts];
    updated.splice(index, 1);
    setContacts(updated);
  };

  const changedContacts = useMemo(() => {
    // Ensure contacts is an array before calling filter
    if (!Array.isArray(contacts)) {
      return [];
    }

    return contacts.filter((contact, idx) => {
      const initial = initialData?.[idx] || {};
      return (
        contact.name !== initial.name ||
        contact.relationship !== initial.relationship ||
        contact.phone !== initial.phone
      );
    });
  }, [contacts, initialData]);

  const handleSubmit = () => {
    onSubmit(changedContacts.length > 0 ? contacts : []);
  };

  // Add error boundary
  if (!Array.isArray(contacts)) {
    console.error('Contacts data is invalid:', contacts);
    return (
      <Text style={styles.errorText}>
        Error loading contacts. Please try again.
      </Text>
    );
  }

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {contacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact {index + 1}</Text>
              {contacts.length > 1 && (
                <TouchableOpacity onPress={() => removeContact(index)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact name"
                placeholderTextColor="#aaa"
                value={contact.name}
                onChangeText={text => updateContact(index, 'name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Spouse, Parent"
                placeholderTextColor="#aaa"
                value={contact.relationship}
                onChangeText={text =>
                  updateContact(index, 'relationship', text)
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact phone"
                placeholderTextColor="#aaa"
                value={contact.phone}
                onChangeText={text => updateContact(index, 'phone', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addCard} onPress={addContact}>
          <View style={styles.addContent}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add More{'\n'}Contact</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={changedContacts.length === 0}>
          <Text style={styles.submitButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    borderBottomColor: '#e1e5e9',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  contactCard: {
    width: 280,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    borderColor: '#e1e5e9',
    borderWidth: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  removeBtn: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  addCard: {
    width: 140,
    // height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f0f8ff',
    borderStyle: 'dashed',
  },
  addContent: {
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  addText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#007AFF',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default EmergencyContactForm;
