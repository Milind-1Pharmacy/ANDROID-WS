import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPrescriptionBottleAlt,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faRupeeSign,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  TABLET_CAPSULE_IMAGE_FALLBACK,
  RUPEE_SYMBOL,
  SectionKey,
} from '@Constants';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  imageUrl?: string;
  isManual: boolean;
  therapyTag?: string;
  mrp?: number;
}

interface MedicationListProps {
  medication?: Medication;
  onPress?: any;
  isAddCard?: boolean;
  isEmptyState?: boolean;
}

const MedicationListCard: React.FC<MedicationListProps> = ({
  medication,
  onPress,
  isAddCard = false,
  isEmptyState = false,
}) => {
  if (isAddCard) {
    console.log('isAddCard');

    return (
      <TouchableOpacity
        style={[styles.addCard]}
        activeOpacity={0.8}
        onPress={onPress}>
        <View style={styles.addCardContent}>
          <View style={styles.addIconContainer}>
            <FontAwesomeIcon icon={faPlus} size={32} color="#6366F1" />
          </View>
          <Text style={styles.addCardTitle}>Add Medication</Text>
          <Text style={styles.addCardSubtitle}>
            Tap to add a new medication to your list
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (isEmptyState) {
    return (
      <View style={[styles.emptyCard]}>
        <Text style={styles.emptyCardTitle}>No medications added yet</Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={onPress}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ffffff44',
              marginBottom: 12,
            }}>
            <FontAwesomeIcon icon={faPlus} size={20} color="#FFFFFF" />
          </View>

          <Text style={styles.addButtonText}>Add your medication</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatFrequency = (frequency: string): string => {
    const freq = parseInt(frequency);
    if (freq === 1) return 'Once daily';
    if (freq === 2) return 'Twice daily';
    if (freq === 3) return 'Thrice daily';
    return `${freq} times daily`;
  };

  const getStatusColor = (isManual: boolean) => {
    return isManual
      ? {bg: '#FFF4E6', border: '#FFB800', icon: '#FF8C00', text: '#B8620A'}
      : {bg: '#E8F5E8', border: '#4CAF50', icon: '#2E7D32', text: '#1B5E20'};
  };

  const statusColors = getStatusColor(medication?.isManual ?? false);

  return (
    <TouchableOpacity
      style={[styles.card, {borderColor: statusColors.border}]}
      activeOpacity={0.8}
      onPress={onPress}>
      {/* Card Header with Image and Title */}
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: medication?.imageUrl ?? TABLET_CAPSULE_IMAGE_FALLBACK,
            }}
            style={styles.medicationImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.medicationTitle} numberOfLines={2}>
            {medication?.name}
          </Text>
          <View
            style={[styles.statusBadge, {backgroundColor: statusColors.bg}]}>
            <FontAwesomeIcon
              icon={
                medication?.isManual ? faExclamationTriangle : faCheckCircle
              }
              size={8}
              color={statusColors.icon}
            />
            <Text style={[styles.statusText, {color: statusColors.text}]}>
              {medication?.isManual ? 'Manual' : 'Verified'}
            </Text>
          </View>
          {/* Therapy Tag */}
          {medication?.therapyTag && (
            <View style={styles.therapyTagContainer}>
              <Text style={styles.therapyTag}>{medication.therapyTag}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Medication Details */}
      <View style={styles.medicationInfo}>
        {/* Dosage */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesomeIcon
              icon={faPrescriptionBottleAlt}
              size={12}
              style={{marginTop: 1}}
              color="#6B7280"
            />
          </View>
          <Text style={styles.infoLabel}>Dosage</Text>
        </View>
        <Text style={styles.infoValue}>{medication?.dosage}</Text>

        {/* Frequency */}
        <View style={[styles.infoRow, {marginTop: 8}]}>
          <View style={styles.infoIcon}>
            <FontAwesomeIcon
              icon={faClock}
              size={12}
              style={{marginTop: 1}}
              color="#6B7280"
            />
          </View>
          <Text style={styles.infoLabel}>Frequency</Text>
        </View>
        <Text style={styles.infoValue}>
          {medication?.frequency ? formatFrequency(medication.frequency) : ''}
        </Text>
      </View>

      {/* Price Section */}
      {medication?.mrp && (
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>MRP: </Text>
            <Text style={styles.priceValue}>
              {RUPEE_SYMBOL}
              {medication.mrp}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 12,
  },
  addCard: {
    borderColor: '#FFFFFF',
    // borderStyle: 'dashed',
    // borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    width: 160,
    borderRadius: 16,
    elevation: -2,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
    // borderStyle: 'dashed',
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  addCardSubtitle: {
    fontSize: 12,
    color: '#efefef',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  addButton: {
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 16,
    padding: 16,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emptyCard: {
    borderColor: '#E5E7EB',
    borderWidth: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 170,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  imageContainer: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 60,
  },
  medicationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 16,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  therapyTagContainer: {
    marginVertical: 6,
  },
  therapyTag: {
    fontSize: 8,
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 1,
  },
  medicationInfo: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  infoIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  infoLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 22,
    marginBottom: 2,
  },
  priceContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 'auto',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  addImagePlaceholder: {
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C4C7D0',
    borderStyle: 'dashed',
  },
  emptyImagePlaceholder: {
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCardTitle: {
    color: '#6B7280',
  },
  addStatusBadge: {
    backgroundColor: '#EEF2FF',
  },
  emptyStatusBadge: {
    backgroundColor: '#F3F4F6',
  },
  addStatusText: {
    color: '#6366F1',
  },
  emptyStatusText: {
    color: '#9CA3AF',
  },
  emptyTherapyTag: {
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    color: '#C4C7D0',
  },
  emptyPlaceholderText: {
    color: '#E5E7EB',
  },
  placeholderBar: {
    height: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    marginLeft: 22,
    marginBottom: 2,
    width: '80%',
  },
  emptyPlaceholderBar: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginLeft: 22,
    marginBottom: 2,
    width: '75%',
  },
  addPriceContainer: {
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emptyActionContainer: {
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addPriceText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 0,
  },
  emptyActionText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    marginTop: 0,
  },
});

export default MedicationListCard;
