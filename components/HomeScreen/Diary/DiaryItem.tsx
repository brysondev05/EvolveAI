import { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native'
import { Text, Icon, Divider, useTheme } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import * as Animatable from 'react-native-animatable'

const renderDay = ({ isMeetDay, index, day, isFinalPhase, dayName }) => {
  if (['pending', 'complete', 'skipped'].includes(day) && !isFinalPhase) {
    return `Day ${index + 1}`
  }
  if (['active'].includes(day) && !isFinalPhase) {
    return `Day ${index + 1} - Active`
  }
  if (day === 'disabled') {
    return `Day ${index + 1} - Skipped`
  }
  if (day === 'RAS') {
    return `${dayName} - RAS`
  }
  if (isFinalPhase) {
    return `${dayName}`
  }
  if (day === 'off') {
    return `${dayName} - Off`
  }

  if (isMeetDay || day === 'comp') {
    return `${dayName} - Meet Day`
  }
}

const renderIcon = (status, color) => {
  if (status === 'complete') {
    return (
      <Icon
        style={{ width: 20, height: 20, marginRight: 15 }}
        name='checkmark-circle-outline'
        fill={color}
      />
    )
  }
  if (status === 'skipped' || status === 'disabled') {
    return (
      <Icon
        style={{ width: 20, height: 20, marginRight: 15 }}
        name='close-circle-outline'
        fill={color}
      />
    )
  }
  if (status === 'active') {
    return (
      <Animatable.View
        useNativeDriver={true}
        animation='rotate'
        easing='linear'
        delay={0}
        duration={3000}
        iterationCount='infinite'
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 13,
        }}>
        <Icon
          style={{ width: 22, height: 22 }}
          name='loader-outline'
          fill={color}
        />
      </Animatable.View>
    )
  }
  return null
}

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const statusColor = (
  status: any,
  theme: Record<string, string>,
  activeWeekStatus: string
) => {
  if (activeWeekStatus === 'holding') {
    return theme['text-hint-color']
  }
  switch (status) {
    case 'complete':
      return theme['text-hint-color']
    case 'skipped':
      return theme['text-disabled-color']
    case 'pending':
      return theme['text-basic-color']
    case 'off':
      return theme['text-disabled-color']
    case 'disabled':
      return theme['text-disabled-color']
    case 'active':
      return theme['color-primary-500']
    // case 'RAS' :
    //     return theme['text-disabled-color']

    default:
      return theme['text-basic-color']
  }
}

const DateDisplay = memo<{
  isMeetDay: boolean
  status: string
  dayIndex: number
  index: number
  date: any
}>(({ isMeetDay, status, dayIndex, index, date }) => {
  if (isMeetDay || status === 'comp' || (dayIndex === 0 && index > 1)) {
    return (
      <>
        <Divider style={{ marginBottom: 20 }} />
        <Text category='s1' status='primary'>
          {date}
        </Text>
      </>
    )
  }
  return null
})

const DiaryItemContent = ({
  handleNavigate,
  status,
  index,
  isMeetDay = false,
  disabled = false,
  isFinalPhase = false,
  date,
  activeWeekStatus = 'pending',
}) => {
  const theme = useTheme()
  const dayIndex = index % 7
  const dayName = days[dayIndex]
  const dispatch = useDispatch()
  

  const handlePress = useCallback( async () => {
    if (status === 'RAS') {
      return dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'RAS' })
    }
    if (activeWeekStatus === 'holding') {
      return dispatch({
        type: 'SHOW_NOTIFICATION',
        title: 'Week not ready',
        description: 'Please continue with your current training.',
      })
    }
    if (disabled) {
      return null
    }
    return handleNavigate(index)
  }, [status, activeWeekStatus, disabled, handleNavigate])

  return (
    <View style={styles.viewContainer}>
      <Pressable
        disabled={disabled}
        style={styles.buttonStyle}
        onPress={handlePress}>
        <DateDisplay
          date={date}
          isMeetDay={isMeetDay}
          status={status}
          dayIndex={dayIndex}
          index={index}
        />
        <View style={styles.iconWrapper}>
          <View style={styles.dayWrapper}>
            {renderIcon(status, statusColor(status, theme, activeWeekStatus))}

            <Text
              category='h5'
              style={{ color: statusColor(status, theme, activeWeekStatus) }}>
              {renderDay({
                isMeetDay,
                index,
                day: status,
                isFinalPhase,
                dayName,
              })}
            </Text>
          </View>
          {!disabled && activeWeekStatus !== 'holding' && (
            <View>
              <Icon
                style={{ width: 20, height: 20 }}
                fill='white'
                name='arrow-ios-forward'
              />
            </View>
          )}

          <Divider />
        </View>
      </Pressable>
    </View>
  )
}

const DiaryItem = memo(DiaryItemContent)

export default DiaryItem

const styles = StyleSheet.create({
  viewContainer: { flex: 1, width: '100%' },
  buttonStyle: { minHeight: 40, paddingHorizontal: 15, paddingVertical: 15 },
  iconWrapper: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayWrapper: { flexDirection: 'row', flex: 1, alignItems: 'center' },
})
