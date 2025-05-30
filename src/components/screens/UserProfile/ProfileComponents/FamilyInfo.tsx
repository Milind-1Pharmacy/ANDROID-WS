import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUsers,
  faUser,
  faUserTie,
  faChild,
  faPhoneAlt,
  faUserMd,
  faHeart,
  faSquarePen,
} from '@fortawesome/free-solid-svg-icons';
import {userFamilyInfoInterface} from '../types';
import {TouchableOpacity} from 'react-native';

const FamilyInfo = ({
  familyMembers,
  emergencyContacts,
}: userFamilyInfoInterface) => {
  return (
    <View style={styles.container}>
      {/* Family Members Section */}
      {/* <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: '#f0f9ff',
            }}>
            <FontAwesomeIcon
              icon={faSquarePen}
              size={12}
              style={{color: '#2e6acf', marginRight: 6}}
            />
            <Text
              style={{
                color: '#2e6acf',
                fontSize: 13,
                fontWeight: '600',
              }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.familyGrid}>
          <View style={styles.familyMemberCard}>
            <FontAwesomeIcon
              icon={faUserTie}
              style={styles.memberIcon}
              color="#3b82f6"
            />
            <Text style={styles.memberCount}>{familyMembers.male || '0'}</Text>
            <Text style={styles.memberLabel}>Male</Text>
          </View>

          <View style={styles.familyMemberCard}>
            <FontAwesomeIcon
              icon={faUser}
              style={styles.memberIcon}
              color="#ec4899"
            />
            <Text style={styles.memberCount}>
              {familyMembers.female || '0'}
            </Text>
            <Text style={styles.memberLabel}>Female</Text>
          </View>

          <View style={styles.familyMemberCard}>
            <FontAwesomeIcon
              icon={faChild}
              style={styles.memberIcon}
              color="#f59e0b"
            />
            <Text style={styles.memberCount}>
              {familyMembers.children || '0'}
            </Text>
            <Text style={styles.memberLabel}>Children</Text>
          </View>
        </View>
      </View> */}

      {/* Emergency Contacts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: '#f0f9ff',
            }}>
            <FontAwesomeIcon
              icon={faSquarePen}
              size={12}
              style={{color: '#2e6acf', marginRight: 6}}
            />
            <Text
              style={{
                color: '#2e6acf',
                fontSize: 13,
                fontWeight: '600',
              }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <FontAwesomeIcon
                icon={
                  contact.relationship.toLowerCase().includes('doctor')
                    ? faUserMd
                    : faHeart
                }
                style={styles.contactIcon}
              />
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelationship}>
                {contact.relationship}
              </Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 12,
  },
  section: {
    // marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sectionIcon: {
    color: '#6b7280',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  familyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  familyMemberCard: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberIcon: {
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  memberLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  contactIconContainer: {
    backgroundColor: '#e0f2fe',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactIcon: {
    color: '#0369a1',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default FamilyInfo;
