import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { 
  getMedications, 
  updateMedicationStatus, 
  isMedicationTakenToday,
  deleteMedication,
  Medication 
} from '../services/medicationService';

interface MedicationScreenProps {
  navigation?: any;
}

interface MedicationWithStatus extends Medication {
  isTakenToday: boolean;
}

const MedicationCard: React.FC<{
  medication: MedicationWithStatus;
  onTakePress: (medicationId: string, isTaken: boolean) => void;
  onDeletePress: (medicationId: string, medicationName: string) => void;
}> = ({ medication, onTakePress, onDeletePress }) => {
  const handleTakePress = () => {
    onTakePress(medication.id, !medication.isTakenToday);
  };

  const handleDeletePress = () => {
    onDeletePress(medication.id, medication.name);
  };

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationInfo}>
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeletePress}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.medicationDosage}>{medication.dosage}</Text>
        <Text style={styles.medicationTime}>{medication.timeOfDay}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.takeButton,
          medication.isTakenToday && styles.takeButtonTaken
        ]}
        onPress={handleTakePress}
      >
        <Text style={[
          styles.takeButtonText,
          medication.isTakenToday && styles.takeButtonTextTaken
        ]}>
          {medication.isTakenToday ? '✓ Taken' : 'Take'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const MedicationScreen: React.FC<MedicationScreenProps> = ({ navigation }) => {
  const [medications, setMedications] = useState<MedicationWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMedications = useCallback(async () => {
    try {
      const medicationList = await getMedications();
      
      // Get taken status for each medication
      const medicationsWithStatus = await Promise.all(
        medicationList.map(async (med) => {
          const isTakenToday = await isMedicationTakenToday(med.id);
          return {
            ...med,
            isTakenToday,
          };
        })
      );

      setMedications(medicationsWithStatus);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadMedications();
  }, [loadMedications]);

  const handleTakePress = async (medicationId: string, isTaken: boolean) => {
    try {
      const result = await updateMedicationStatus(medicationId, isTaken);
      
      if (result.success) {
        // Update the local state
        setMedications(prevMeds => 
          prevMeds.map(med => 
            med.id === medicationId 
              ? { ...med, isTakenToday: isTaken }
              : med
          )
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating medication status:', error);
      Alert.alert('Error', 'Failed to update medication status');
    }
  };

  const handleDeletePress = (medicationId: string, medicationName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medicationName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMedication(medicationId);
              if (result.success) {
                // Remove from local state
                setMedications(prevMeds => 
                  prevMeds.filter(med => med.id !== medicationId)
                );
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        },
      ]
    );
  };

  const handleAddMedication = () => {
    navigation.navigate('AddMedicationScreen');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Refresh when coming back from AddMedicationScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMedications();
    });

    return unsubscribe;
  }, [navigation, loadMedications]);

  const takenCount = medications.filter(med => med.isTakenToday).length;
  const totalCount = medications.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Medications</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Progress</Text>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {takenCount} of {totalCount} medications taken
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: totalCount > 0 ? `${(takenCount / totalCount) * 100}%` : '0%' }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Medications</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.medicationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#A2D2FF"
              />
            }
          >
            {medications.length === 0 && !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💊</Text>
                <Text style={styles.emptyStateTitle}>No medications yet</Text>
                <Text style={styles.emptyStateText}>
                  Add your first medication to start tracking your adherence
                </Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddMedication}>
                  <Text style={styles.emptyStateButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            ) : (
              medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onTakePress={handleTakePress}
                  onDeletePress={handleDeletePress}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  progressInfo: {
    gap: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#666666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A2D2FF',
    borderRadius: 4,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#A2D2FF',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  medicationsList: {
    flex: 1,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#C53030',
    fontWeight: 'bold',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  medicationTime: {
    fontSize: 14,
    color: '#666666',
  },
  takeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#A2D2FF',
    borderRadius: 8,
    marginLeft: 16,
  },
  takeButtonTaken: {
    backgroundColor: '#E8F5E8',
  },
  takeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  takeButtonTextTaken: {
    color: '#2D7D2D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#A2D2FF',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default MedicationScreen;