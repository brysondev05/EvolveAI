import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Icon, Text } from '@ui-kitten/components'
import { Pressable, Animated } from 'react-native'
import { toggleTimerSheet } from '~/reduxStore/reducers/timerUpdate'
const padToTwo = (number) => (number <= 9 ? `0${number}` : number)

export const TimerButton = ({ theme }) => {
  const timer = useTypedSelector((state) => state.timer)
  const time = timer.time
  const dispatch = useDispatch()
  const iconColor = () => {
    if (time < 30 && time > 10) {
      return theme['color-warning-500']
    }
    if (time <= 10 && time > 0) {
      return theme['color-danger-500']
    }
    if (time === 0) {
      return theme['color-primary-500']
    }
    return theme['color-success-500']
  }

  const viewRef = useRef(new Animated.Value(50)).current

  useEffect(() => {
    if (timer.timerRunning) {
      Animated.spring(viewRef, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.spring(viewRef, {
        toValue: 50,
        useNativeDriver: true,
      }).start()
    }
  }, [timer.timerRunning])
  return (
    <Animated.View style={{ transform: [{ translateX: viewRef }] }}>
      <Pressable
        onPress={() => dispatch(toggleTimerSheet())}
        style={{
          marginRight: 15,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Icon
          style={{
            width: 25,
            height: 25,
            marginRight: !timer.timerRunning ? 15 : 0,
          }}
          fill={iconColor()}
          name='clock-outline'
        />

        <Text
          style={{
            width: 40,
            marginLeft: 15,
            opacity: timer.timerRunning ? 1 : 0,
          }}>{`${Math.floor(time / 60)}:${padToTwo(time % 60)}`}</Text>
      </Pressable>
    </Animated.View>
  )
}
