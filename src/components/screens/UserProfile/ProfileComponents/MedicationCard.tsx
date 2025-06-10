import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faShieldAlt, faPlus} from '@fortawesome/free-solid-svg-icons';
import {MedicationListCard} from '@HouseOfCards';
import {userHealthDetailsInterface} from '../types';
import {SectionKey, TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';

// Constants
const COLORS = {
  primary: '#1F2937',
  success: '#16A34A',
  successLight: '#DCFCE7',
  successDark: '#166534',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  healthIndicator: [
    {bg: '#FEF3F2', border: '#FEE4E2', dot: '#F04438', text: '#912018'},
    {bg: '#FFF6ED', border: '#FEECDC', dot: '#F79009', text: '#B54708'},
    {bg: '#F0F9FF', border: '#E0F2FE', dot: '#0EA5E9', text: '#0C4A6E'},
    {bg: '#F7FDF7', border: '#DCFCE7', dot: '#22C55E', text: '#14532D'},
    {bg: '#FAF5FF', border: '#F3E8FF', dot: '#A855F7', text: '#581C87'},
    {bg: '#FFF1F3', border: '#FCE7F3', dot: '#EC4899', text: '#831843'},
  ],
};

// Helper functions
const formatHealthIssueName = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const getActiveHealthIssues = (healthIssues: any): string[] => {
  const activeIssues = Object.entries(healthIssues)
    .filter(([key, value]) => key !== 'other' && value === true)
    .map(([key]) => formatHealthIssueName(key));

  if (healthIssues.other?.trim()) {
    activeIssues.push(healthIssues.other);
  }

  return activeIssues;
};

// Sub-components
const SectionHeader = ({
  title,
  subtitle,
  counter,
}: {
  title: string;
  subtitle?: string;
  counter?: number;
}) => (
  <View style={styles.sectionHeaderContainer}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {counter !== undefined && (
      <View style={styles.counterBadge}>
        <Text style={styles.counterText}>
          {counter} {counter === 1 ? 'item' : 'items'}
        </Text>
      </View>
    )}
  </View>
);

const HealthConditionCard = ({
  condition,
  index,
}: {
  condition: string;
  index: number;
}) => {
  const style = COLORS.healthIndicator[index % COLORS.healthIndicator.length];

  return (
    <TouchableOpacity
      style={[
        styles.healthCard,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
        },
      ]}
      activeOpacity={0.7}>
      <View style={styles.healthCardHeader}>
        <View style={[styles.healthIndicator, {backgroundColor: style.dot}]} />
      </View>
      <Text
        style={[styles.healthCardText, {color: style.text}]}
        numberOfLines={2}>
        {condition}
      </Text>
    </TouchableOpacity>
  );
};

const EmptyHealthState = ({onAddPress}: {onAddPress: () => void}) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIcon}>
      <FontAwesomeIcon icon={faShieldAlt} size={32} color="#10B981" />
    </View>
    <Text style={styles.emptyStateTitle}>Excellent Health!</Text>
    <Text style={styles.emptyStateDescription}>
      No active health conditions detected. Keep up the great work with your
      wellness journey.
    </Text>
    <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
      <FontAwesomeIcon icon={faPlus} size={14} color={COLORS.textSecondary} />
      <Text style={styles.addButtonText}>Add Health Condition</Text>
    </TouchableOpacity>
  </View>
);

// Main Component
const MedicationCard: React.FC<userHealthDetailsInterface> = ({
  healthIssues,
  currentMedications,
  handleEditPress,
}) => {
  const activeHealthIssues = getActiveHealthIssues(healthIssues);

  const handleAddMedication = (section: SectionKey) => {
    console.log('Add medication pressed');
    handleEditPress?.(section);
  };


  return (
    <View style={styles.container}>
      {/* Medications Section */}
      <View style={styles.section}>
        <SectionHeader
          title="My Medications"
          counter={currentMedications.length}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}>
          {currentMedications.length > 0 ? (
            <>
              {currentMedications.map(medication => (
                <MedicationListCard
                  key={medication.id}
                  medication={{
                    ...medication,
                    mrp: medication.mrp
                      ? parseFloat(medication.mrp)
                      : undefined,
                    imageUrl:
                      medication.imageUrl ?? TABLET_CAPSULE_IMAGE_FALLBACK,
                  }}
                  onPress={() => () =>
                    console.log('Card pressed', medication.id)}
                />
              ))}
              <MedicationListCard
                isAddCard
                onPress={() => handleAddMedication('addMedication')}
              />
            </>
          ) : (
            <MedicationListCard
              isEmptyState
              onPress={() => handleAddMedication('addMedication')}
            />
          )}
        </ScrollView>
      </View>

      {/* Health Conditions Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Health Overview"
          subtitle={`${activeHealthIssues.length} active condition${
            activeHealthIssues.length !== 1 ? 's' : ''
          }`}
        />

        {activeHealthIssues.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {activeHealthIssues.map((issue, index) => (
              <HealthConditionCard
                key={index}
                condition={issue}
                index={index}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyHealthState
            onAddPress={() => handleAddMedication('addMedication')}
          />
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 12,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  horizontalScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  healthCard: {
    minWidth: 120,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  healthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  healthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  healthCardText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});

export default MedicationCard;
