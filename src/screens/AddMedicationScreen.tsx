import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { saveMedication } from '../services/medicationService';
import CustomButton from '../components/CustomButton';

interface AddMedicationScreenProps {
  navigation?: any;
}

const AddMedicationScreen: React.FC<AddMedicationScreenProps> = ({ navigation }) => {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timeOptions = [
    'Morning',
    'Afternoon', 
    'Evening',
    'Night',
    'With meals',
    'Before meals',
    'After meals',
    'As needed'
  ];

  const handleSaveMedication = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await saveMedication({
        name: medicationName,
        dosage: dosage,
        timeOfDay: timeOfDay,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Medication added successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Add medication error:', error);
      setErrorMessage('An error occurred while adding the medication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleTimeSelection = (selectedTime: string) => {
    setTimeOfDay(selectedTime);
  };

  const canSave = medicationName.trim() && dosage.trim() && timeOfDay.trim();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add New Medication</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Medication Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                placeholderTextColor="#999"
                value={medicationName}
                onChangeText={setMedicationName}
                autoCapitalize="words"
              />
            </View>

            {/* Dosage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10mg, 1 tablet, 5ml"
                placeholderTextColor="#999"
                value={dosage}
                onChangeText={setDosage}
                autoCapitalize="none"
              />
            </View>

            {/* Time of Day */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>When to Take *</Text>
              <View style={styles.timeOptionsContainer}>
                {timeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      timeOfDay === option && styles.timeOptionSelected,
                    ]}
                    onPress={() => handleTimeSelection(option)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        timeOfDay === option && styles.timeOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Custom time input */}
              <Text style={styles.orText}>Or enter custom time:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8:00 AM, Every 4 hours"
                placeholderTextColor="#999"
                value={timeOfDay && !timeOptions.includes(timeOfDay) ? timeOfDay : ''}
                onChangeText={setTimeOfDay}
                autoCapitalize="none"
              />
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <CustomButton
                title={isLoading ? "Saving..." : "Save Medication"}
                onPress={handleSaveMedication}
                style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                textStyle={{}}
                disabled={!canSave || isLoading}
              />
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
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
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeOptionSelected: {
    backgroundColor: '#A2D2FF',
    borderColor: '#A2D2FF',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  orText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#C53030',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});

export default AddMedicationScreen;