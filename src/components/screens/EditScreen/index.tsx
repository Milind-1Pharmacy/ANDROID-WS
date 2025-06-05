import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {EDIT_SECTIONS} from './constant'; // Contains mapping: section => { label, component }
import {SectionKey} from '@Constants';
import {RootStackParamList} from 'App';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';

const EditScreen = () => {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  /**
   * Route Parameters Handling
   *
   * Supports three initialization methods:
   * 1. Direct navigation with pre-selected section
   * 2. User ID for API operations
   * 3. Initial form data for edit scenarios
   *
   * Fallback behavior:
   * - Defaults to first section if none specified
   * - Gracefully handles missing params
   */
  const {
    section,
    userId,
    initialData,
  }: {section?: SectionKey; userId?: string; initialData?: any} =
    route.params || {};

  // Debug logs — helpful during dev/testing
  if (__DEV__) {
    console.log('[EditScreen] Initialization data:', {
      section,
      userId,
      initialData: initialData ? 'Provided' : 'Not provided',
    });
  }

  // Section state management
  const sectionKeys = Object.keys(EDIT_SECTIONS) as SectionKey[];
  const defaultSection = section || sectionKeys[0];
  const [selectedSection, setSelectedSection] =
    useState<SectionKey>(defaultSection);

  const SelectedComponent = EDIT_SECTIONS[selectedSection].component;

  /**
   * Optimized Form Submission Handler
   *
   * Implements delta detection to only submit changed fields.
   * This reduces network payload and prevents unnecessary updates.
   *
   * @param formData - Complete form values from the section component
   *
   * Process:
   * 1. Compares each field against initialData
   * 2. Accumulates only changed fields
   * 3. Skips API call if no changes detected
   * 4. Structures PATCH request for BE efficiency
   */
  const handleSubmit = (formData: any) => {
    const changes = Object.keys(formData).reduce(
      (acc: Record<string, any>, key) => {
        if (formData[key] !== initialData[key]) {
          acc[key] = formData[key];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    if (Object.keys(changes).length > 0) {
      if (__DEV__) {
        console.log('[EditScreen] Submitting changes:', {
          section: selectedSection,
          changes,
        });
      }

      /**
       * API Integration Point
       *
       * Expected BE API Spec:
       * Method: PATCH
       * Endpoint: /users/{userId}/{section}
       * Body: Partial update object (only changed fields)
       *
       * Example:
       * PATCH /users/123/personalDetails
       * Body: { firstName: 'Updated Name' }
       */
      // api.patch(`/users/${userId}/${selectedSection}`, changes)
      //   .then(handleSuccess)
      //   .catch(handleError);
    } else {
      if (__DEV__) {
        console.log('[EditScreen] No changes detected - skipping submission');
      }
    }
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar backgroundColor="#c9eaff" barStyle="dark-content" />
      <View
        style={{
          padding: 16,
          backgroundColor: '#c9eaff',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityLabel="Go back">
          <FontAwesomeIcon icon={faAngleLeft} size={20} color="#000" />
        </Pressable>
        <Text style={{color: '#000', fontSize: 20, fontWeight: 'bold'}}>
          Edit Profile
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          width: '100%',
          backgroundColor: '#c9eaff',
        }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 12,
          backgroundColor: '#c9eaff',
          paddingTop: 8,
          alignItems: 'flex-start',
          width: 'auto',
          minWidth: '100%',
        }}>
        {sectionKeys.map(key => (
          <Pressable
            key={key}
            onPress={() => setSelectedSection(key)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${EDIT_SECTIONS[key].label}`}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: selectedSection === key ? '#2e6acf' : '#f3f4f6',
              marginRight: 8,
              borderWidth: selectedSection === key ? 0 : 1,
              borderColor: '#d1d5db',
            }}>
            <Text
              style={{
                color: selectedSection === key ? '#FFF' : '#111827',
                fontWeight: '500',
                fontSize: 12,
              }}>
              {EDIT_SECTIONS[key].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{flex: 1, padding: 16}}>
        <SelectedComponent
          initialData={initialData}
          onSubmit={handleSubmit}
          /**
           * Additional props that could be passed to all forms:
           * - loadingState: For API operation feedback
           * - validationSchema: For form validation
           * - onCancel: Unified cancellation handler
           */
        />
      </View>
    </ScrollView>
  );
};

export default EditScreen;
