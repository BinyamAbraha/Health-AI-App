import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import InteractionResultCard from '../components/InteractionResultCard';
import { getMockUserMedications } from '../utils/firebaseConfig';
import { checkInteractions } from '../services/fdaService';

interface DrugCheckerScreenProps {
  navigation?: any;
}

interface ApiResult {
  drugName: string;
  interaction: 'none' | 'minor' | 'serious';
  details: string;
}

const DrugCheckerScreen: React.FC<DrugCheckerScreenProps> = ({ navigation }) => {
  const [newMedication, setNewMedication] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [checkedMedication, setCheckedMedication] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCheckInteractions = async () => {
    if (!newMedication.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting API call for:', newMedication.trim());
      const results = await checkInteractions(newMedication.trim());
      
      setApiResults(results);
      setCheckedMedication(newMedication.trim());
      setShowResults(true);
      
      console.log('API call completed successfully:', results);
    } catch (err) {
      console.error('API call failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to check drug interactions';
      setError(errorMessage);
      Alert.alert(
        'Error', 
        `${errorMessage}. Please try again or consult your healthcare provider.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setNewMedication('');
    setShowResults(false);
    setCheckedMedication('');
    setApiResults([]);
    setError(null);
  };


  if (showResults) {
    const savedMedicationsCount = apiResults.length;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Interaction Results</Text>
            <Text style={styles.subtitle}>For {checkedMedication}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.content}>
            {/* Important Disclaimer */}
            <View style={styles.disclaimerBox}>
              <View style={styles.disclaimerHeader}>
                <Text style={styles.disclaimerIcon}>⚠️</Text>
                <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This is an educational tool, not medical advice. Always consult your doctor or pharmacist before starting or stopping any medication.
              </Text>
            </View>

            {/* Results Summary */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Checked {checkedMedication} against {savedMedicationsCount} saved medications
              </Text>
              <Text style={styles.resultsSubtitle}>
                Tap any card below to learn more about interactions
              </Text>
            </View>

            {/* Results Cards */}
            <View style={styles.resultsContainer}>
              {apiResults.map((result, index) => (
                <InteractionResultCard
                  key={index}
                  medicationName={result.drugName}
                  interactionType={result.interaction}
                  detailText={result.details}
                />
              ))}
            </View>

            {/* Check Another Button */}
            <TouchableOpacity style={styles.checkAnotherButton} onPress={handleCheckAnother}>
              <Text style={styles.checkAnotherText}>Check Another Medication</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Drug Interaction Checker</Text>
          <Text style={styles.subtitle}>Safety first</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          {/* Warning Icon */}
          <View style={styles.warningSection}>
            <View style={styles.warningTriangle}>
              <Text style={styles.warningIcon}>!</Text>
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Enter one new medication to check it against your saved prescriptions.
          </Text>

          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputIcon}>💊</Text>
              <Text style={styles.inputLabel}>New Medication</Text>
            </View>
            <Text style={styles.inputFieldLabel}>New Medication Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Ibuprofen, Aspirin, Warfarin"
              placeholderTextColor="#999999"
              value={newMedication}
              onChangeText={setNewMedication}
              autoCapitalize="words"
            />
          </View>

          {/* Important Notice */}
          <View style={styles.noticeBox}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeIcon}>ℹ️</Text>
              <Text style={styles.noticeTitle}>Important Notice</Text>
            </View>
            <Text style={styles.noticeText}>
              This tool checks against your saved medications only. Always consult your doctor or pharmacist for complete drug interaction information.
            </Text>
          </View>

          {/* Check Button */}
          <TouchableOpacity 
            style={[styles.checkButton, loading && styles.checkButtonDisabled]} 
            onPress={handleCheckInteractions}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#000000" style={styles.loadingSpinner} />
                <Text style={styles.checkButtonText}>Checking Interactions...</Text>
              </>
            ) : (
              <>
                <Text style={styles.checkButtonIcon}>🔍</Text>
                <Text style={styles.checkButtonText}>Check for Interactions</Text>
              </>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    padding: 20,
  },
  warningSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  warningTriangle: {
    width: 60,
    height: 52,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
    borderRadius: 6,
  },
  warningIcon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  instructions: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  inputFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noticeBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  noticeText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  checkButton: {
    backgroundColor: '#64B5F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  checkButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  disclaimerBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  checkAnotherButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 20,
  },
  checkAnotherText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
});

export default DrugCheckerScreen;