import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native'

import { TimerSheet } from '~/components/BottomSheet/TimerSheet'
import { InfoSheet } from '~/components/InfoSheet'
const AnimatedView = Animated.View

let fall = new Animated.Value(1)

const RenderShadow = () => {
  const animatedShadowOpacity = Animated.interpolateNode(fall, {
    inputRange: [0, 1],
    outputRange: [0.9, 0],
  })

  return (
    <AnimatedView
      pointerEvents='none'
      style={[
        styles.shadowContainer,
        {
          opacity: animatedShadowOpacity,
        },
      ]}
    />
  )
}
const styles = StyleSheet.create({
  select: {
    flex: 1,
    margin: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
  },
  // Shadow
  shadowContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
})

export const Sheets = () => {
  return (
    <>
      {/* <PerformanceSheet fall={fall} /> */}
      <TimerSheet fall={fall} />
      <InfoSheet fall={fall} />
      {/* <NotesSheet fall={fall} /> */}
      <RenderShadow />
    </>
  )
}
