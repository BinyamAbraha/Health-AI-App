import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen 
          name="SettingsScreen" 
          component={SettingsScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;