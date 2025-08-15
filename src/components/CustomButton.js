import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, style, textStyle, variant = 'primary', disabled = false }) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    style
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#A2D2FF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A2D2FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#000000',
  },
  secondaryButtonText: {
    color: '#A2D2FF',
  },
});

export default CustomButton;