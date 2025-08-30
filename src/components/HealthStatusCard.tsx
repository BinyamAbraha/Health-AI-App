import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HealthStatusCardProps {
  title: string;
  lastUpdated: string;
  value: string;
  status: string;
  icon: string;
  statusIcon: string;
  onCameraPress?: () => void;
}

const HealthStatusCard: React.FC<HealthStatusCardProps> = ({
  title,
  lastUpdated,
  value,
  status,
  icon,
  statusIcon,
  onCameraPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.topRowContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.lastUpdated}>{lastUpdated}</Text>
            </View>
          </View>
          {onCameraPress && (
            <TouchableOpacity style={styles.addReadingButton} onPress={onCameraPress}>
              <Text style={styles.addReadingText}>Add new reading+</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.value}>{value}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{statusIcon}</Text>
          </View>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'column',
    flex: 1,
  },
  topRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addReadingButton: {
    backgroundColor: '#A2D2FF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 4,
    width: 120,
  },
  addReadingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  icon: {
    fontSize: 20,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
  },
  status: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 2,
  },
});

export default HealthStatusCard;