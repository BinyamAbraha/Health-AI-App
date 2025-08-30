import { MMKV } from 'react-native-mmkv';
import { CloudStorage } from 'react-native-cloud-storage';
import { getCurrentUser } from '../utils/auth';
import { getMedications } from './medicationService';
import CryptoJS from 'crypto-js';

// Initialize MMKV for reading all user data
const authStorage = new MMKV({
  id: 'user-storage',
  encryptionKey: 'health-ai-secure-key-2024',
});

const medicationStorage = new MMKV({
  id: 'medication-storage',
  encryptionKey: 'health-ai-medication-key-2024',
});

// Backup configuration
const BACKUP_FILENAME = 'HealthAI_Backup.json';
const ENCRYPTION_KEY = 'healthai-backup-encryption-key-2024';

export interface BackupData {
  version: string;
  timestamp: string;
  userId: string;
  userData: {
    medications: any[];
    medicationStatuses: { [key: string]: any };
    userProfile: any;
    healthReadings: any[];
  };
}

export interface BackupResult {
  success: boolean;
  message: string;
  backupSize?: number;
}

/**
 * Gather all user data from MMKV storage
 */
const gatherUserData = async (): Promise<BackupData['userData']> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get medications
    const medications = await getMedications();

    // Get medication status data
    const medicationStatuses: { [key: string]: any } = {};
    const allMedicationKeys = medicationStorage.getAllKeys();
    allMedicationKeys.forEach(key => {
      if (key.includes(`medication_status_${currentUser.email}`)) {
        const statusData = medicationStorage.getString(key);
        if (statusData) {
          medicationStatuses[key] = JSON.parse(statusData);
        }
      }
    });

    // Get user profile data
    const userSessionData = authStorage.getString('user_session');
    const userProfile = userSessionData ? JSON.parse(userSessionData) : null;

    // Get health readings (placeholder for future implementation)
    const healthReadings: any[] = [];

    return {
      medications,
      medicationStatuses,
      userProfile,
      healthReadings,
    };
  } catch (error) {
    console.error('Error gathering user data:', error);
    throw error;
  }
};

/**
 * Encrypt data before saving to cloud
 */
const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt backup data');
  }
};

/**
 * Decrypt data after reading from cloud
 */
const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt backup data');
  }
};

/**
 * Backup user data to cloud storage
 */
export const backupDataToCloud = async (): Promise<BackupResult> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    console.log('Starting backup process...');

    // Gather all user data
    const userData = await gatherUserData();

    // Create backup object
    const backupData: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId: currentUser.email,
      userData,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(backupData);
    console.log('Backup data size:', jsonString.length, 'characters');

    // Encrypt the data
    const encryptedData = encryptData(jsonString);
    console.log('Encrypted data size:', encryptedData.length, 'characters');

    // Save to cloud storage
    try {
      await CloudStorage.writeFile(BACKUP_FILENAME, encryptedData);
      console.log('Backup saved to cloud successfully');

      return {
        success: true,
        message: 'Data backed up successfully',
        backupSize: Math.round(encryptedData.length / 1024), // Size in KB
      };
    } catch (cloudError) {
      console.error('Cloud storage error:', cloudError);
      throw new Error('Failed to save backup to cloud storage');
    }

  } catch (error) {
    console.error('Backup error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during backup',
    };
  }
};

/**
 * Restore user data from cloud storage
 */
export const restoreDataFromCloud = async (): Promise<BackupResult> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    console.log('Starting restore process...');

    // Read from cloud storage
    let encryptedData: string;
    try {
      encryptedData = await CloudStorage.readFile(BACKUP_FILENAME);
      console.log('Backup data retrieved from cloud');
    } catch (cloudError) {
      console.error('Cloud storage read error:', cloudError);
      throw new Error('No backup found in cloud storage or failed to read backup');
    }

    // Decrypt the data
    const decryptedData = decryptData(encryptedData);
    console.log('Backup data decrypted successfully');

    // Parse JSON
    let backupData: BackupData;
    try {
      backupData = JSON.parse(decryptedData);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Backup data is corrupted');
    }

    // Validate backup data
    if (!backupData.userData || !backupData.userId) {
      throw new Error('Invalid backup data format');
    }

    // Verify user ownership (optional security check)
    if (backupData.userId !== currentUser.email) {
      console.warn('Backup belongs to different user');
      // Still allow restore - user might have changed email
    }

    console.log('Restoring data from backup created on:', backupData.timestamp);

    // Restore medications
    if (backupData.userData.medications) {
      const medicationsKey = `user_medications_${currentUser.email}`;
      medicationStorage.set(medicationsKey, JSON.stringify(backupData.userData.medications));
      console.log('Medications restored:', backupData.userData.medications.length);
    }

    // Restore medication statuses
    if (backupData.userData.medicationStatuses) {
      Object.entries(backupData.userData.medicationStatuses).forEach(([key, value]) => {
        medicationStorage.set(key, JSON.stringify(value));
      });
      console.log('Medication statuses restored');
    }

    // Note: We don't restore user profile to avoid overwriting current session

    console.log('Restore completed successfully');

    return {
      success: true,
      message: `Data restored successfully from backup created on ${new Date(backupData.timestamp).toLocaleDateString()}`,
    };

  } catch (error) {
    console.error('Restore error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during restore',
    };
  }
};

/**
 * Check if cloud backup exists
 */
export const checkBackupExists = async (): Promise<boolean> => {
  try {
    await CloudStorage.readFile(BACKUP_FILENAME);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get backup information without downloading full backup
 */
export const getBackupInfo = async (): Promise<{
  exists: boolean;
  lastModified?: string;
  size?: number;
}> => {
  try {
    // This would need to be implemented based on the cloud storage provider's capabilities
    // For now, we'll just check if the file exists
    const exists = await checkBackupExists();
    return { exists };
  } catch (error) {
    console.error('Error checking backup info:', error);
    return { exists: false };
  }
};