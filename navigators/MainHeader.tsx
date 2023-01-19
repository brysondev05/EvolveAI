import { useRef, useState } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { TransitionPresets } from '@react-navigation/native-stack'
import { BlurView } from 'expo-blur'
import { DrawIconOpener } from '~/components/Navigation/DrawerIcon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SkipReadinessButton } from '~/components/Navigation/Buttons/SkipReadinessButton'

export const readinessHeaderOptions = ({ theme, navigation, route }) => {
  return {
    title: '',
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],
      borderWidth: 0,
      // shadowRadius: 0,
      height: 100,

      //   shadowOffset: {
      //     height: 0,
      // },
    },
    headerTintColor: theme['text-hint-color'],
    headerTitleStyle: {
      fontSize: 30,
      left: 0,
      textAlign: 'left',
      fontWeight: 'bold',
    },
    ...TransitionPresets.DefaultTransition,
    // headerStyleInterpolator: HeaderStyleInterpolators.forFade,
    headerRight: () => (
      <SkipReadinessButton
        route={route}
        navigation={navigation}
        theme={theme}
      />
    ),
  }
}

export const frostedHeader = ({ theme, navigation, route }) => {
  const { opacity } = route.params || { opacity: 0 }
  const fadeAnim = useRef(new Animated.Value(0)).current
  // const blurAnim = React.useRef(new Animated.Value(0)).current;

  const [blurAnim, setBlurAnim] = useState(new Animated.Value(0))
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start()
    Animated.timing(blurAnim, {
      toValue: 100,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
    Animated.timing(blurAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }

  if (opacity === 1) {
    fadeIn()
  }
  if (opacity === 0) {
    fadeOut()
  }

  const AnimatedBlur = Animated.createAnimatedComponent(BlurView)

  return {
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],

      height: 100,
      shadowOffset: {
        height: 0,
      },
    },

    headerTitle: () => (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text category='s1'>{route.name}</Text>
      </Animated.View>
    ),
    headerBackground: () => (
      <AnimatedBlur
        tint='dark'
        intensity={blurAnim}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme['background-basic-color-1'] },
        ]}
      />
    ),

    headerShown: true,
    // headerTintColor: !headerTransparent ? theme['text-hint-color'] : theme['text-basic-color'],

    headerBackTitle: 'Back',
    headerTransparent: true,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    ...TransitionPresets.ModalPresentationIOS,

    headerRight: () => <DrawIconOpener navigation={navigation} />,
  }
}
export const mainHeaderOptions = ({
  theme,
  navigation,
  withHeader = true,
  withBlurHeader = false,
  transition = 'default',
  headerTransparent = false,
}) => {
  const transitions = ['default', 'basic'].includes(transition)
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.ModalPresentationIOS

  return {
    title: '',
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],
      height: transition === 'default' ? 100 : 50,
    },
    headerTitleStyle: {
      fontSize: 30,
      left: 0,
      // textAlign: 'left',
      // fontWeight: 'bold',
    },
    headerBackground: () =>
      transition === 'default' ||
      (withBlurHeader && (
        <BlurView tint='dark' intensity={95} style={StyleSheet.absoluteFill} />
      )),
    // headerLeft: () => (
    //   <Icon
    //     name='arrow-ios-back-outline'
    //     size={30}
    //     color='#ffffff'
    //     fill='white'
    //     style={{ paddingLeft: 20, width: 30, height: 30 }}
    //     onPress={() => {
    //       navigation.goBack()
    //     }}
    //   />
    // ),
    headerShown: withHeader,
    headerTintColor: !headerTransparent
      ? theme['text-hint-color']
      : theme['text-basic-color'],
    headerBackTitle: 'Back',
    headerTransparent,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    ...transitions,
  }
}

export const exerciseHeaderOptions = ({
  theme,
  noModal = false,
  title = '',
}) => {
  const transitions = noModal
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.ModalPresentationIOS

  return {
    title,
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],
    },
    headerTitleStyle: {
      fontSize: 18,
      color: 'white',
      left: 0,
    },
    headerBackground: () => (
      <BlurView tint='dark' intensity={50} style={StyleSheet.absoluteFill} />
    ),
    // headerLeft: () => (
    //   <Icon
    //     name='arrow-ios-back-outline'
    //     size={30}
    //     color='#ffffff'
    //     fill='white'
    //     style={{ paddingLeft: 20, width: 30, height: 30 }}
    //     onPress={() => {
    //       navigation.goBack()
    //     }}
    //   />
    // ),
    // // safeAreaInsets: { top: withPadding ? safe.top : 0 },
    headerShown: true,
    headerTintColor: theme['text-basic-color'],
    headerBackTitle: 'Back',
    // headerTransparent: true,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    ...transitions,
  }
}

export default mainHeaderOptions
