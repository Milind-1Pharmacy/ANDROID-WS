import React from 'react';
import {Image, Text, View, ScrollView, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeftLong,
  faSquarePen,
  faPhone,
  faEnvelope,
  faHeartbeat,
  faDroplet,
  faLungs,
  faLocationDot,
  faCrown,
  faFileContract,
} from '@fortawesome/free-solid-svg-icons';

// Types
type HealthStatus = {
  status: string;
  color: string;
  bgColor: string;
};

type UserPersonalInfo = {
  firstName: string;
  gender?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
  profilePic?: string;
  subscription?: {
    plan: string;
  };
  healthParameters?: {
    bloodGroup?: string;
    height?: string | number;
    weight?: string | number;
    bloodPressure?: string;
    bloodSugar?: string;
    spo2?: string;
  };
};

type ProfileComponentProps = {
  navigation: any;
  userPersonalInfo: UserPersonalInfo;
};

// Constants
const COLORS = {
  primary: '#3b82f6',
  primaryLight: '#f0f9ff',
  textDark: '#1f2937',
  textMedium: '#6b7280',
  textLight: '#ffffff',
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  background: '#c9eaff',
  cardBackground: '#ffffff',
};

const HEALTH_PARAMETERS = {
  BLOOD_PRESSURE: 'bloodPressure',
  BLOOD_SUGAR: 'bloodSugar',
  SPO2: 'spo2',
};

// Helper functions
const formatDate = (dateString?: string): string => {
  if (!dateString) return '--';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getHealthStatus = (param: string, value?: string): HealthStatus => {
  if (!value)
    return {status: '--', color: COLORS.textMedium, bgColor: '#f3f4f6'};

  switch (param) {
    case HEALTH_PARAMETERS.BLOOD_PRESSURE:
      const [systolic] = value.split('/').map(Number);
      if (systolic < 120)
        return {
          status: 'Normal',
          color: COLORS.success,
          bgColor: COLORS.successBg,
        };
      if (systolic < 140)
        return {
          status: 'Elevated',
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
        };
      return {status: 'High', color: COLORS.danger, bgColor: COLORS.dangerBg};

    case HEALTH_PARAMETERS.BLOOD_SUGAR:
      const sugar = Number(value);
      if (sugar < 100)
        return {
          status: 'Normal',
          color: COLORS.success,
          bgColor: COLORS.successBg,
        };
      if (sugar < 140)
        return {
          status: 'Pre-diabetes',
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
        };
      return {status: 'High', color: COLORS.danger, bgColor: COLORS.dangerBg};

    case HEALTH_PARAMETERS.SPO2:
      const spo2 = Number(value);
      if (spo2 >= 95)
        return {
          status: 'Normal',
          color: COLORS.success,
          bgColor: COLORS.successBg,
        };
      if (spo2 >= 90)
        return {
          status: 'Low',
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
        };
      return {
        status: 'Critical',
        color: COLORS.danger,
        bgColor: COLORS.dangerBg,
      };

    default:
      return {status: '--', color: COLORS.textMedium, bgColor: '#f3f4f6'};
  }
};

// Sub-components

const ProfileInfo = ({
  userPersonalInfo,
}: {
  userPersonalInfo: UserPersonalInfo;
}) => (
  <View style={styles.profileInfoContainer}>
    <View style={styles.profileImageContainer}>
      <Image
        source={{uri: userPersonalInfo?.profilePic}}
        style={styles.profileImage}
        resizeMode="cover"
      />
    </View>

    <Text style={styles.profileName}>{userPersonalInfo?.firstName}</Text>

    {userPersonalInfo.subscription && (
      <View style={styles.subscriptionBadge}>
        <FontAwesomeIcon
          icon={faCrown}
          size={12}
          style={styles.subscriptionIcon}
        />
        <Text style={styles.subscriptionText}>
          {userPersonalInfo.subscription.plan.toUpperCase()} MEMBER
        </Text>
      </View>
    )}
  </View>
);

const StatsRow = ({userPersonalInfo}: {userPersonalInfo: UserPersonalInfo}) => (
  <View style={styles.statsContainer}>
    <StatItem label="Gender" value={userPersonalInfo?.gender} />
    <StatItem
      label="Blood Group"
      value={userPersonalInfo?.healthParameters?.bloodGroup}
    />
    <StatItem
      label="Date of Birth"
      value={formatDate(userPersonalInfo?.dateOfBirth)}
    />
    <StatItem
      label="Height (cm)"
      value={
        userPersonalInfo?.healthParameters?.height
          ? `${userPersonalInfo.healthParameters.height} cm`
          : undefined
      }
    />
    <StatItem
      label="Weight (kg)"
      value={
        userPersonalInfo?.healthParameters?.weight
          ? `${userPersonalInfo.healthParameters.weight} kg`
          : undefined
      }
    />
  </View>
);

const StatItem = ({label, value}: {label: string; value?: string}) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value || '--'}</Text>
  </View>
);

const ContactCard = ({
  userPersonalInfo,
  onEditPress,
}: {
  userPersonalInfo: UserPersonalInfo;
  onEditPress: () => void;
}) => (
  <View style={styles.contactCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>Contact Details</Text>
      <TouchableOpacity onPress={onEditPress} style={styles.cardEditButton}>
        <FontAwesomeIcon
          icon={faSquarePen}
          size={12}
          style={styles.cardEditIcon}
        />
        <Text style={styles.cardEditText}>Edit</Text>
      </TouchableOpacity>
    </View>

    <ContactInfoItem
      icon={faPhone}
      label="Mobile No."
      value={userPersonalInfo?.mobileNumber}
    />
    <ContactInfoItem
      icon={faEnvelope}
      label="Email"
      value={userPersonalInfo?.email}
    />
    <ContactInfoItem
      icon={faLocationDot}
      label="Default Address"
      value={userPersonalInfo?.address}
    />
  </View>
);

const ContactInfoItem = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) => (
  <View style={styles.contactInfoItem}>
    <FontAwesomeIcon icon={icon} size={14} style={styles.contactInfoIcon} />
    <View style={styles.contactInfoTextContainer}>
      <Text style={styles.contactInfoLabel}>{label}</Text>
      <Text style={styles.contactInfoValue}>{value || '--'}</Text>
    </View>
  </View>
);

const HealthVitalsCard = ({
  userPersonalInfo,
  onReportsPress,
}: {
  userPersonalInfo: UserPersonalInfo;
  onReportsPress: () => void;
}) => (
  <View style={styles.healthVitalsCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>Health Vitals</Text>
      <TouchableOpacity onPress={onReportsPress} style={styles.cardEditButton}>
        <FontAwesomeIcon
          icon={faFileContract}
          size={12}
          style={styles.cardEditIcon}
        />
        <Text style={styles.cardEditText}>See Reports</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.healthVitalsContainer}>
      <HealthVitalItem
        icon={faHeartbeat}
        label="Blood Pressure"
        value={userPersonalInfo?.healthParameters?.bloodPressure}
        unit="mmHg"
        param={HEALTH_PARAMETERS.BLOOD_PRESSURE}
      />
      <HealthVitalItem
        icon={faDroplet}
        label="Blood Sugar"
        value={userPersonalInfo?.healthParameters?.bloodSugar}
        unit="mg/dL"
        param={HEALTH_PARAMETERS.BLOOD_SUGAR}
      />
      <HealthVitalItem
        icon={faLungs}
        label="Oxygen Level"
        value={userPersonalInfo?.healthParameters?.spo2}
        unit="%"
        param={HEALTH_PARAMETERS.SPO2}
      />
    </View>
  </View>
);

const HealthVitalItem = ({
  icon,
  label,
  value,
  unit,
  param,
}: {
  icon: any;
  label: string;
  value?: string;
  unit: string;
  param: string;
}) => {
  const status = getHealthStatus(param, value);

  return (
    <View style={styles.healthVitalItem}>
      <View
        style={[
          styles.healthVitalIconContainer,
          {backgroundColor: status.color},
        ]}>
        <FontAwesomeIcon icon={icon} size={20} style={styles.healthVitalIcon} />
      </View>

      <Text style={styles.healthVitalLabel}>{label}</Text>
      <Text style={styles.healthVitalValue}>{value || '--'}</Text>
      <Text style={styles.healthVitalUnit}>{unit}</Text>

      <View
        style={[
          styles.healthStatus,
          {
            backgroundColor: `${status.color}20`,
            borderColor: `${status.color}40`,
          },
        ]}>
        <Text style={[styles.healthStatusText, {color: status.color}]}>
          {status.status}
        </Text>
      </View>
    </View>
  );
};

// Main Component
const ProfileComponent = ({
  navigation,
  userPersonalInfo,
}: ProfileComponentProps) => {
  const handleEditPress = () => {
    // Handle edit action
  };

  const handleReportsPress = () => {
    // Handle reports action
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        {/* <Header navigation={navigation} onEditPress={handleEditPress} /> */}
        <ProfileInfo userPersonalInfo={userPersonalInfo} />
      </View>

      <StatsRow userPersonalInfo={userPersonalInfo} />

      <View style={styles.bottomSection}>
        <ContactCard
          userPersonalInfo={userPersonalInfo}
          onEditPress={handleEditPress}
        />
        <HealthVitalsCard
          userPersonalInfo={userPersonalInfo}
          onReportsPress={handleReportsPress}
        />
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    backgroundColor: COLORS.background,
    paddingTop: 12,
    paddingBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.textDark,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: COLORS.cardBackground,
  },
  editIcon: {
    color: COLORS.primary,
    marginRight: 4,
  },
  editText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfoContainer: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 8,
    borderColor: COLORS.cardBackground,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 55,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff9e6',
    borderWidth: 1,
    borderColor: '#ffecb3',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  subscriptionIcon: {
    color: '#d97706',
    marginRight: 6,
  },
  subscriptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 54,
    flexWrap: 'wrap',
    columnGap: 24,
    rowGap: 16,
    paddingHorizontal: 26,
  },
  statItem: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 80,
    maxWidth: 100,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMedium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    color: COLORS.textDark,
    textTransform: 'capitalize',
    fontWeight: '800',
  },
  bottomSection: {
    backgroundColor: '#f3f4f6',
  },
  contactCard: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    position: 'relative',
    top: -28,
  },
  healthVitalsCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    marginBottom: 14,
    marginTop: -16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
  },
  cardEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  cardEditIcon: {
    color: COLORS.primary,
    marginRight: 6,
  },
  cardEditText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactInfoIcon: {
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 3,
  },
  contactInfoTextContainer: {
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactInfoValue: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  healthVitalsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  healthVitalItem: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  healthVitalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  healthVitalIcon: {
    color: COLORS.textLight,
  },
  healthVitalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  healthVitalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  healthVitalUnit: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  healthStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  healthStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ProfileComponent;
