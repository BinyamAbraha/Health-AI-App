import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import CustomButton from '../components/CustomButton';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login pressed');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in pressed');
  };

  const handleAppleSignIn = () => {
    console.log('Apple sign in pressed');
  };

  const handleCreateAccount = () => {
    console.log('Create account pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Icon and Title */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Text style={styles.iconText}>💙</Text>
            </View>
          </View>
          <Text style={styles.title}>HealthAI</Text>
          <Text style={styles.subtitle}>Your Caring Health Companion</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <CustomButton
            title="Log In"
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <Text style={styles.orText}>Or continue with</Text>
          
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Text style={styles.socialButtonText}>G</Text>
            <Text style={styles.socialButtonLabel}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
            <Text style={styles.socialButtonText}>🍎</Text>
            <Text style={styles.socialButtonLabel}>Sign in with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Create Account */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#A2D2FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 52,
  },
  loginButton: {
    marginTop: 12,
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#A2D2FF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  socialSection: {
    marginBottom: 32,
  },
  orText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 52,
  },
  socialButtonText: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  socialButtonLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  createAccountText: {
    fontSize: 14,
    color: '#A2D2FF',
    fontWeight: '600',
  },
});

export default LoginScreen;