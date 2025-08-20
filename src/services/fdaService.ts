import { FDA_API_KEY } from '@env';
import { getMockUserMedications } from '../utils/firebaseConfig';

// FDA Drug Interaction Service
// This service will handle API calls to the openFDA drug/label.json endpoint

interface InteractionResult {
  drugName: string;
  interaction: 'none' | 'minor' | 'serious';
  details: string;
}

interface FDAResponse {
  results?: Array<{
    drug_interactions?: string[];
    warnings?: string[];
    contraindications?: string[];
  }>;
}

// Clean and format interaction text for display
const cleanInteractionText = (text: string, newDrug: string, savedDrug: string): string => {
  // Remove excessive technical jargon and format for user understanding
  let cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\b(see|refer to|consult)\b[^.]*\./gi, '')
    .trim();
  
  // Limit length and ensure it mentions both drugs
  if (cleanText.length > 200) {
    cleanText = cleanText.substring(0, 200) + '...';
  }
  
  // Ensure both drug names are mentioned for context
  if (!cleanText.toLowerCase().includes(newDrug.toLowerCase()) && 
      !cleanText.toLowerCase().includes(savedDrug.toLowerCase())) {
    cleanText = `${newDrug} and ${savedDrug}: ${cleanText}`;
  }
  
  return cleanText;
};

// Analyze interaction severity based on keywords
const analyzeInteractionSeverity = (text: string): 'none' | 'minor' | 'serious' => {
  const lowerText = text.toLowerCase();
  
  // Check for serious interaction keywords
  const seriousKeywords = [
    'contraindicated', 'avoid', 'should not', 'do not use', 'serious', 'severe',
    'life-threatening', 'fatal', 'death', 'emergency', 'immediate', 'dangerous'
  ];
  
  // Check for minor interaction keywords  
  const minorKeywords = [
    'caution', 'monitor', 'may', 'possible', 'potential', 'consider', 
    'adjust', 'mild', 'minor', 'watch'
  ];
  
  if (seriousKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'serious';
  } else if (minorKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'minor';
  }
  
  return 'none';
};

// Main function to check drug interactions
export const checkInteractions = async (newDrugName: string): Promise<InteractionResult[]> => {
  if (!newDrugName.trim()) {
    throw new Error('Drug name is required');
  }

  // Get list of saved medications
  const savedDrugs = getMockUserMedications();
  const results: InteractionResult[] = [];

  console.log('FDA API Key available:', !!FDA_API_KEY);
  console.log(`Checking interactions for ${newDrugName} against:`, savedDrugs);

  // Process each saved drug
  for (const savedDrug of savedDrugs) {
    try {
      // Construct FDA API URL to search for the saved drug's interactions
      const encodedDrugName = encodeURIComponent(savedDrug);
      const apiUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodedDrugName}"+OR+openfda.generic_name:"${encodedDrugName}"&limit=5`;
      
      console.log(`Fetching data for ${savedDrug}:`, apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`FDA API request failed for ${savedDrug}:`, response.status);
        results.push({
          drugName: savedDrug,
          interaction: 'none',
          details: `Unable to retrieve interaction data for ${savedDrug}. Please consult your healthcare provider.`
        });
        continue;
      }

      const data: FDAResponse = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log(`No FDA data found for ${savedDrug}`);
        results.push({
          drugName: savedDrug,
          interaction: 'none',
          details: `No interaction data found between ${newDrugName} and ${savedDrug} in FDA database.`
        });
        continue;
      }

      // Search through the drug label data for interactions
      let interactionFound = false;
      let interactionText = '';
      let severity: 'none' | 'minor' | 'serious' = 'none';

      for (const result of data.results) {
        // Check drug_interactions field
        if (result.drug_interactions) {
          for (const interaction of result.drug_interactions) {
            if (interaction.toLowerCase().includes(newDrugName.toLowerCase())) {
              interactionText = interaction;
              severity = analyzeInteractionSeverity(interaction);
              interactionFound = true;
              break;
            }
          }
        }

        // Also check warnings and contraindications if no direct interaction found
        if (!interactionFound) {
          const fieldsToCheck = [
            ...(result.warnings || []),
            ...(result.contraindications || [])
          ];

          for (const warning of fieldsToCheck) {
            if (warning.toLowerCase().includes(newDrugName.toLowerCase())) {
              interactionText = warning;
              severity = analyzeInteractionSeverity(warning);
              interactionFound = true;
              break;
            }
          }
        }

        if (interactionFound) break;
      }

      if (interactionFound && interactionText) {
        const cleanedText = cleanInteractionText(interactionText, newDrugName, savedDrug);
        results.push({
          drugName: savedDrug,
          interaction: severity,
          details: cleanedText
        });
      } else {
        results.push({
          drugName: savedDrug,
          interaction: 'none',
          details: `No known interactions found between ${newDrugName} and ${savedDrug} in FDA database.`
        });
      }

    } catch (error) {
      console.error(`Error checking interaction for ${savedDrug}:`, error);
      results.push({
        drugName: savedDrug,
        interaction: 'none',
        details: `Error retrieving interaction data for ${savedDrug}. Please consult your healthcare provider.`
      });
    }
  }

  console.log('Final interaction results:', results);
  return results;
};

// Legacy service object for backward compatibility
export const fdaService = {
  checkDrugInteraction: async (drug1: string, drug2: string) => {
    console.log(`Checking interaction between ${drug1} and ${drug2}`);
    console.log('FDA API Key available:', !!FDA_API_KEY);
  },
};