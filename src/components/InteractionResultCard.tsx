import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface InteractionResultCardProps {
  medicationName: string;
  interactionType: 'none' | 'minor' | 'serious';
  detailText?: string;
}

const InteractionResultCard: React.FC<InteractionResultCardProps> = ({
  medicationName,
  interactionType,
  detailText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCardConfig = () => {
    switch (interactionType) {
      case 'none':
        return {
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
          statusText: 'No Interaction Found',
          statusColor: '#2E7D32',
          icon: '✅',
          iconColor: '#4CAF50',
        };
      case 'minor':
        return {
          backgroundColor: '#FFF8E1',
          borderColor: '#FFC107',
          statusText: 'Minor Interaction Found',
          statusColor: '#F57C00',
          icon: '🟡',
          iconColor: '#FFC107',
        };
      case 'serious':
        return {
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336',
          statusText: 'Serious Interaction Found',
          statusColor: '#C62828',
          icon: '⚠️',
          iconColor: '#F44336',
        };
    }
  };

  const config = getCardConfig();

  const toggleExpanded = () => {
    if (detailText) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.cardContainer,
          { 
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={toggleExpanded}
          activeOpacity={detailText ? 0.7 : 1}
        >
          <View style={styles.cardHeader}>
            <View style={styles.leftSection}>
              <Text style={styles.pillIcon}>💊</Text>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medicationName}</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>{config.icon}</Text>
                  <Text style={[styles.statusText, { color: config.statusColor }]}>
                    {config.statusText}
                  </Text>
                </View>
              </View>
            </View>
            {detailText && (
              <View style={styles.rightSection}>
                <Text style={styles.tapToLearn}>Tap to Learn More</Text>
                <Text style={styles.expandIcon}>{isExpanded ? '⌄' : '⌄'}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {isExpanded && detailText && (
          <View style={styles.detailSection}>
            <View style={styles.detailContent}>
              <Text style={styles.detailIcon}>ℹ️</Text>
              <Text style={styles.detailText}>{detailText}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  tapToLearn: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#666666',
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailContent: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
});

export default InteractionResultCard;