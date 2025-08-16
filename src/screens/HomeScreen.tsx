import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import HealthStatusCard from '../components/HealthStatusCard';
import ToolButton from '../components/ToolButton';

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleTapToTalk = () => {
    console.log('Tap to Talk pressed');
  };

  const handleToolPress = (toolName: string) => {
    console.log(`${toolName} pressed`);
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('SettingsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.greetingSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>👤</Text>
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.greeting}>Good morning!</Text>
                <Text style={styles.subGreeting}>How can I help you today?</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={handleNavigateToSettings}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Tap to Talk Section */}
          <TouchableOpacity style={styles.tapToTalkContainer} onPress={handleTapToTalk}>
            <View style={styles.microphoneButton}>
              <Text style={styles.microphoneIcon}>🎤</Text>
            </View>
            <Text style={styles.tapToTalkText}>Tap to Talk</Text>
          </TouchableOpacity>

          {/* Health Status Card */}
          <HealthStatusCard
            title="Blood Pressure"
            lastUpdated="Last updated today"
            value="120/80"
            status="Normal range"
            icon="💙"
            statusIcon="✅"
          />

          {/* Tools Section */}
          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Tools</Text>
            <View style={styles.toolsGrid}>
              <View style={styles.toolRow}>
                <View style={styles.toolItem}>
                  <ToolButton
                    icon="💊"
                    label="Medications"
                    onPress={() => handleToolPress('Medications')}
                  />
                </View>
                <View style={styles.toolItem}>
                  <ToolButton
                    icon="📋"
                    label="Reports"
                    onPress={() => handleToolPress('Reports')}
                    isSelected={true}
                  />
                </View>
              </View>
              <View style={styles.toolRow}>
                <View style={styles.toolItem}>
                  <ToolButton
                    icon="📝"
                    label="Prep for Appointment"
                    onPress={() => handleToolPress('Prep for Appointment')}
                  />
                </View>
                <View style={styles.toolItem}>
                  <ToolButton
                    icon="⚠️"
                    label="Drug Checker"
                    onPress={() => handleToolPress('Drug Checker')}
                  />
                </View>
              </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A2D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666666',
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  tapToTalkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#A2D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  microphoneIcon: {
    fontSize: 48,
  },
  tapToTalkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  toolsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  toolsGrid: {
    gap: 12,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  toolItem: {
    flex: 1,
  },
});

export default HomeScreen;