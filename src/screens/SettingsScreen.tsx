import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { signOut } from '../utils/auth';
import { backupDataToCloud, restoreDataFromCloud } from '../services/backupService';

interface SettingsScreenProps {
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        console.log('User signed out successfully');
        navigation.navigate('LoginScreen');
      } else {
        console.log('Sign out error:', result.message);
        // Still navigate to login screen even if there's an error
        navigation.navigate('LoginScreen');
      }
    } catch (error) {
      console.log('Sign out error:', (error as Error).message);
      // Still navigate to login screen even if there's an error
      navigation.navigate('LoginScreen');
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      console.log('Starting backup...');
      
      const result = await backupDataToCloud();
      
      if (result.success) {
        const sizeText = result.backupSize ? ` (${result.backupSize}KB)` : '';
        Alert.alert(
          'Backup Successful',
          `${result.message}${sizeText}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Backup Failed',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during backup. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Data',
      'This will replace your current data with the backup from cloud. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsRestoring(true);
            try {
              console.log('Starting restore...');
              
              const result = await restoreDataFromCloud();
              
              if (result.success) {
                Alert.alert(
                  'Restore Successful',
                  result.message,
                  [{ 
                    text: 'OK', 
                    onPress: () => {
                      // Navigate back to force refresh of medication screens
                      navigation.navigate('HomeScreen');
                    }
                  }]
                );
              } else {
                Alert.alert(
                  'Restore Failed',
                  result.message,
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Restore error:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred during restore. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsRestoring(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Backup & Restore Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup & Restore</Text>
            <Text style={styles.sectionDescription}>
              Keep your health data safe by backing it up to the cloud
            </Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.backupButton, isBackingUp && styles.buttonDisabled]} 
                onPress={handleBackup}
                disabled={isBackingUp || isRestoring}
              >
                <Text style={styles.backupButtonText}>
                  {isBackingUp ? 'Backing Up...' : '☁️ Backup Data to Cloud'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.restoreButton, isRestoring && styles.buttonDisabled]} 
                onPress={handleRestore}
                disabled={isBackingUp || isRestoring}
              >
                <Text style={styles.restoreButtonText}>
                  {isRestoring ? 'Restoring...' : '📥 Restore Data from Cloud'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
              disabled={isBackingUp || isRestoring}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
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
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  backupButton: {
    backgroundColor: '#A2D2FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A2D2FF',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  restoreButtonText: {
    color: '#A2D2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;