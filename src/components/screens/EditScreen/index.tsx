import React, {useState} from 'react';
import {View, ScrollView, Pressable, Text, StatusBar} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {EDIT_SECTIONS} from './constant';
import {SectionKey} from '@Constants';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {RootStackParamList} from 'App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const EditScreen = () => {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {section}: {section?: SectionKey} = route.params || {};

  const sectionKeys = Object.keys(EDIT_SECTIONS) as SectionKey[];
  const defaultSection = section || sectionKeys[0];

  const [selectedSection, setSelectedSection] =
    useState<SectionKey>(defaultSection);
  const SelectedComponent = EDIT_SECTIONS[selectedSection].component;

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Header */}
      <StatusBar backgroundColor="#c9eaff" barStyle="dark-content" />
      <View
        style={{
          padding: 16,
          backgroundColor: '#c9eaff',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
        <Pressable onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faAngleLeft} size={20} color="#000" />
        </Pressable>
        <Text style={{color: '#000', fontSize: 20, fontWeight: 'bold'}}>
          Edit Profile
        </Text>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 12,
          backgroundColor: '#c9eaff',
          width: '100%',
          paddingTop: 8,
        }}>
        {sectionKeys.map(key => (
          <Pressable
            key={key}
            onPress={() => setSelectedSection(key)}
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

      {/* Selected Section Content */}
      <View style={{flex: 1, padding: 16}}>
        <SelectedComponent />
      </View>
    </ScrollView>
  );
};

export default EditScreen;
