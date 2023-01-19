import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'
import NonActiveScreen from '~/screens/NutritionTab/NonActiveScreen'
import FoodScreen from '~/screens/NutritionTab/FoodScreen'
import AddManualFoodScreen from '~/screens/NutritionTab/AddManualFoodScreen'
import NutritionMain from '~/screens/NutritionTab/NutritionMain'
import BarcodeScanner from '~/screens/NutritionTab/BarcodeScanner'
import TestScreen from '~/screens/NutritionTab/TestScreen'
import VoiceInputAiAdd from '~/screens/NutritionTab/VoiceInputAiAdd'

const NutritionTab = createStackNavigator()

export const NutritionTabReferences = {
  NoActive: 'No Active',
  NutritionMain: 'NutritionMain',
  FoodScreen: 'Food you consumed',
  AddManualFoodScreen: 'Add manual Food Entry',
  BarcodeScanning: 'Barcode Scanning',
  TestScreen: 'Testing screen',
  VoiceInputAiAdd: 'Voice Input Ai to Add'
}

export const NutritionTabStack = ({ isSignout }) => {
  return (
    <NutritionTab.Navigator initialRouteName={NutritionTabReferences.NoActive}>
      <NutritionTab.Screen
        name={NutritionTabReferences.NoActive}
        component={NonActiveScreen}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <NutritionTab.Screen
        name={NutritionTabReferences.NutritionMain}
        component={NutritionMain}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <NutritionTab.Screen
        name={NutritionTabReferences.FoodScreen}
        component={FoodScreen}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <NutritionTab.Screen
        name={NutritionTabReferences.AddManualFoodScreen}
        component={AddManualFoodScreen}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <NutritionTab.Screen
        name={NutritionTabReferences.TestScreen}
        component={TestScreen}
        options={{
          title: '',
          headerShown: false,
        }}
      />

      <NutritionTab.Screen
        name={NutritionTabReferences.BarcodeScanning}
        component={BarcodeScanner}
        options={{
          title: '',
          headerShown: false,
        }}
      />

      <NutritionTab.Screen
        name={NutritionTabReferences.VoiceInputAiAdd}
        component={VoiceInputAiAdd}
        options={{
          title: '',
          headerShown: false,
        }}
      />

    </NutritionTab.Navigator>
  )
}

export default NutritionTabStack
