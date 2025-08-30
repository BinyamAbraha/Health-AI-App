import { MMKV } from 'react-native-mmkv';
import { getCurrentUser } from '../utils/auth';

// Initialize MMKV storage for medication data
const storage = new MMKV({
  id: 'medication-storage',
  encryptionKey: 'health-ai-medication-key-2024',
});

// Storage keys
const MEDICATIONS_KEY = 'user_medications';
const MEDICATION_STATUS_KEY = 'medication_status';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  createdAt: string;
  userId: string;
}

export interface MedicationStatus {
  medicationId: string;
  date: string; // YYYY-MM-DD format
  isTaken: boolean;
  takenAt?: string; // ISO timestamp when marked as taken
}

export interface SaveMedicationResult {
  success: boolean;
  message: string;
  medication?: Medication;
}

export interface MedicationStatusResult {
  success: boolean;
  message: string;
}

/**
 * Generate a unique ID for medications
 */
const generateMedicationId = (): string => {
  return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get the current user's medication storage key
 */
const getUserMedicationsKey = (): string | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return null;
  }
  return `${MEDICATIONS_KEY}_${currentUser.email}`;
};

/**
 * Get the current user's medication status storage key
 */
const getUserMedicationStatusKey = (): string | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return null;
  }
  return `${MEDICATION_STATUS_KEY}_${currentUser.email}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Save a new medication to the user's list
 */
export const saveMedication = async (medicationData: {
  name: string;
  dosage: string;
  timeOfDay: string;
}): Promise<SaveMedicationResult> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    // Validate input
    if (!medicationData.name.trim()) {
      return { success: false, message: 'Medication name is required' };
    }

    if (!medicationData.dosage.trim()) {
      return { success: false, message: 'Dosage is required' };
    }

    if (!medicationData.timeOfDay.trim()) {
      return { success: false, message: 'Time of day is required' };
    }

    const userMedicationsKey = getUserMedicationsKey();
    if (!userMedicationsKey) {
      return { success: false, message: 'Unable to get user storage key' };
    }

    // Create new medication object
    const newMedication: Medication = {
      id: generateMedicationId(),
      name: medicationData.name.trim(),
      dosage: medicationData.dosage.trim(),
      timeOfDay: medicationData.timeOfDay.trim(),
      createdAt: new Date().toISOString(),
      userId: currentUser.email,
    };

    // Get existing medications
    const existingMedicationsJson = storage.getString(userMedicationsKey);
    const existingMedications: Medication[] = existingMedicationsJson 
      ? JSON.parse(existingMedicationsJson) 
      : [];

    // Check for duplicate medication names
    const duplicateMedication = existingMedications.find(
      med => med.name.toLowerCase() === newMedication.name.toLowerCase()
    );

    if (duplicateMedication) {
      return { success: false, message: 'This medication is already in your list' };
    }

    // Add new medication to the list
    const updatedMedications = [...existingMedications, newMedication];

    // Save to storage
    storage.set(userMedicationsKey, JSON.stringify(updatedMedications));

    return {
      success: true,
      message: 'Medication added successfully',
      medication: newMedication,
    };
  } catch (error) {
    console.error('Save medication error:', error);
    return {
      success: false,
      message: 'An error occurred while saving the medication',
    };
  }
};

/**
 * Retrieve all medications for the current user
 */
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('No authenticated user found');
      return [];
    }

    const userMedicationsKey = getUserMedicationsKey();
    if (!userMedicationsKey) {
      console.log('Unable to get user storage key');
      return [];
    }

    const medicationsJson = storage.getString(userMedicationsKey);
    if (!medicationsJson) {
      return [];
    }

    const medications: Medication[] = JSON.parse(medicationsJson);
    
    // Sort medications by creation date (newest first)
    return medications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Get medications error:', error);
    return [];
  }
};

/**
 * Update a medication's "taken" status for today
 */
export const updateMedicationStatus = async (
  medicationId: string,
  isTaken: boolean
): Promise<MedicationStatusResult> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    const userStatusKey = getUserMedicationStatusKey();
    if (!userStatusKey) {
      return { success: false, message: 'Unable to get user storage key' };
    }

    const today = getTodayString();
    const statusKey = `${userStatusKey}_${today}`;

    // Get existing status data for today
    const existingStatusJson = storage.getString(statusKey);
    const existingStatuses: MedicationStatus[] = existingStatusJson 
      ? JSON.parse(existingStatusJson) 
      : [];

    // Find existing status for this medication today
    const existingStatusIndex = existingStatuses.findIndex(
      status => status.medicationId === medicationId
    );

    const newStatus: MedicationStatus = {
      medicationId,
      date: today,
      isTaken,
      takenAt: isTaken ? new Date().toISOString() : undefined,
    };

    let updatedStatuses: MedicationStatus[];
    if (existingStatusIndex >= 0) {
      // Update existing status
      updatedStatuses = [...existingStatuses];
      updatedStatuses[existingStatusIndex] = newStatus;
    } else {
      // Add new status
      updatedStatuses = [...existingStatuses, newStatus];
    }

    // Save to storage
    storage.set(statusKey, JSON.stringify(updatedStatuses));

    return {
      success: true,
      message: `Medication marked as ${isTaken ? 'taken' : 'not taken'}`,
    };
  } catch (error) {
    console.error('Update medication status error:', error);
    return {
      success: false,
      message: 'An error occurred while updating medication status',
    };
  }
};

/**
 * Get medication status for today
 */
export const getTodaysMedicationStatuses = async (): Promise<MedicationStatus[]> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const userStatusKey = getUserMedicationStatusKey();
    if (!userStatusKey) {
      return [];
    }

    const today = getTodayString();
    const statusKey = `${userStatusKey}_${today}`;

    const statusJson = storage.getString(statusKey);
    if (!statusJson) {
      return [];
    }

    return JSON.parse(statusJson);
  } catch (error) {
    console.error('Get medication statuses error:', error);
    return [];
  }
};

/**
 * Check if a specific medication was taken today
 */
export const isMedicationTakenToday = async (medicationId: string): Promise<boolean> => {
  try {
    const todaysStatuses = await getTodaysMedicationStatuses();
    const medicationStatus = todaysStatuses.find(
      status => status.medicationId === medicationId
    );
    return medicationStatus ? medicationStatus.isTaken : false;
  } catch (error) {
    console.error('Check medication taken status error:', error);
    return false;
  }
};

/**
 * Delete a medication from the user's list
 */
export const deleteMedication = async (medicationId: string): Promise<MedicationStatusResult> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    const userMedicationsKey = getUserMedicationsKey();
    if (!userMedicationsKey) {
      return { success: false, message: 'Unable to get user storage key' };
    }

    // Get existing medications
    const existingMedicationsJson = storage.getString(userMedicationsKey);
    if (!existingMedicationsJson) {
      return { success: false, message: 'No medications found' };
    }

    const existingMedications: Medication[] = JSON.parse(existingMedicationsJson);
    
    // Filter out the medication to delete
    const updatedMedications = existingMedications.filter(
      med => med.id !== medicationId
    );

    if (updatedMedications.length === existingMedications.length) {
      return { success: false, message: 'Medication not found' };
    }

    // Save updated list
    storage.set(userMedicationsKey, JSON.stringify(updatedMedications));

    return {
      success: true,
      message: 'Medication deleted successfully',
    };
  } catch (error) {
    console.error('Delete medication error:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the medication',
    };
  }
};

/**
 * Clear all medication data for the current user (for testing purposes)
 */
export const clearAllMedicationData = (): void => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('No authenticated user found');
      return;
    }

    const userMedicationsKey = getUserMedicationsKey();
    const userStatusKey = getUserMedicationStatusKey();

    if (userMedicationsKey) {
      storage.delete(userMedicationsKey);
    }

    // Clear all status data for this user
    const allKeys = storage.getAllKeys();
    allKeys.forEach(key => {
      if (userStatusKey && key.startsWith(userStatusKey)) {
        storage.delete(key);
      }
    });

    console.log('All medication data cleared for current user');
  } catch (error) {
    console.error('Error clearing medication data:', error);
  }
};