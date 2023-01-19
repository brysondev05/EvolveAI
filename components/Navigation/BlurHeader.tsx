import { useRef, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Text } from '@ui-kitten/components'
import { BlurView } from 'expo-blur'
import Animated, { Extrapolate } from 'react-native-reanimated'
import ThemeColor from '~/constants/color'

export const BlurHeader = ({ title = '', isBorder = false }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current

  const headMov = fadeAnim.interpolate({
    inputRange: [0, 250],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  })

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: 1,
          backgroundColor: ThemeColor.primary,
          borderBottomColor: ThemeColor.borderColor,
          borderBottomWidth: isBorder ? 1 : 0,
        },
      ]}>
      <BlurView
        tint='dark'
        intensity={0}
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            paddingTop: 40,
          },
        ]}>
        <Text>{title}</Text>
      </BlurView>
    </Animated.View>
  )
}
