import { memo } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Icon, Text, useTheme } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'
import useTimer from '~/hooks/useTimer'
const padToTwo = (number) => (number <= 9 ? `0${number}` : number)

const StartTimerButton = memo<{ time: any; theme: any }>(({ time, theme }) => {
  const { time: activeTime, timerRunning } = useTypedSelector(
    (state) => state.timer
  )

  const iconColor = () => {
    if (activeTime < 30 && activeTime > 10) {
      return theme['color-warning-500']
    }
    if (activeTime <= 10 && activeTime > 0) {
      return theme['color-danger-500']
    }
    if (activeTime === 0) {
      return theme['color-primary-500']
    }
    return theme['color-success-500']
  }

  const { handleTimeStart, handleTimeStop } = useTimer()

  const handleTimeToggle = () =>
    timerRunning ? handleTimeStop() : handleTimeStart(time)
  return (
    <View style={styles.buttonContainer}>
      <Pressable onPress={handleTimeToggle} style={styles.startTimerButton}>
        <View
          style={[
            styles.button,
            {
              backgroundColor: theme['background-basic-color-1'],
              flexDirection: 'row',
            },
          ]}>
          <Icon
            style={styles.timerIcon}
            fill={iconColor()}
            name='clock-outline'
          />
          {timerRunning ? (
            <Text style={styles.timerText}>
              {`${Math.floor(activeTime / 60)}:${padToTwo(activeTime % 60)}`}{' '}
            </Text>
          ) : (
            <Text style={styles.startTimerText}>Start Timer</Text>
          )}
        </View>
      </Pressable>
    </View>
  )
})

export default StartTimerButton

const styles = StyleSheet.create({
  startTimerText: { paddingLeft: 5 },
  timerText: { width: 40, marginLeft: 15 },
  startTimerButton: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  timerIcon: { width: 25, height: 25 },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 50,
  },
})
