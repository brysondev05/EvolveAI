import { useRef, useState, useEffect, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { Layout, Button, Text, useTheme } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import Animated, {
  Value,
  block,
  cond,
  lessThan,
  sub,
  set,
  greaterThan,
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'

import useTimer from '~/hooks/useTimer'
import { useMMKVObject } from 'react-native-mmkv'
import { closeTimerSheet } from '~/reduxStore/reducers/timerUpdate'

const timers = [
  {
    timeInSeconds: 60,
    displayTime: '1:00',
  },
  {
    timeInSeconds: 90,
    displayTime: '1:30',
  },
  {
    timeInSeconds: 120,
    displayTime: '2:00',
  },
  {
    timeInSeconds: 180,
    displayTime: '3:00',
  },
  {
    timeInSeconds: 240,
    displayTime: '4:00',
  },
  {
    timeInSeconds: 300,
    displayTime: '5:00',
  },
]

const renderTab = () => (
  <View style={{ padding: 40, marginBottom: -40 }}>
    <View
      style={{
        width: 100,
        height: 6,
        borderRadius: 4,
        backgroundColor: '#CCC',
        marginBottom: 5,
        alignSelf: 'center',
      }}
    />
  </View>
)

// const renderHeader = name => (
//   <View
//     style={{
//       width: '100%',
//       // height: 80,
//       // paddingHorizontal,: 15,
//       paddingBottom: 15
//     }}
//   >
//     <View style={{
//       width: 100,
//       height: 6,
//       borderRadius: 4,
//       backgroundColor: '#777',
//       marginBottom: 15,
//       alignSelf: 'center'
//     }} />
//     <Text category="h4">{name}</Text>

//   </View>
// )

const AlertTypes = ['chadbot', 'buzzer', 'none']

type timerOptions = {
  id: string
  type: string
  volume: number
}

export const TimerSheet = ({ fall }) => {
  // const navigation = useNavigation()

  const timer = useTypedSelector((state) => state.timer)

  const sheetRef = useRef(null)
  const dispatch = useDispatch()
  const theme = useTheme()

  const { handleTimeStart, handleTimeStop } = useTimer()
  const trans = new Value(0)
  const untraversedPos = new Value(0)
  const prevTrans = new Value(0)

  // const [timerOptions, setTimerOptions, timerOptionsLoaded] = useAsyncStorage(
  //   '@timer',
  //   { type: 'chadbot', volume: 7 }
  // )

  const [timerOptions, setTimerOptions] = useMMKVObject<timerOptions>('timer')
  const [volume, setVolume] = useState(timerOptions?.volume || 7)

  useEffect(() => {
    if (timer?.action === 'open_timer_sheet') {
      sheetRef.current.snapTo(1)
    }
    if (timer?.action === 'close_timer_sheet') {
      sheetRef.current.snapTo(0)
    }
    if (timer?.action === 'workout_complete') {
      // setIsLoading(false)
      // setIsCompleted(true)
    }
    if (timer?.action === 'hide_sheet_loading') {
      // setIsLoading(false)
    }
  }, [timer?.action])

  const headerPos = block([
    cond(
      lessThan(untraversedPos, sub(trans, 100)),
      set(untraversedPos, sub(trans, 100))
    ),
    cond(greaterThan(untraversedPos, trans), set(untraversedPos, trans)),
    set(prevTrans, trans),
    untraversedPos,
  ])

  const renderHeader = (name) => (
    <Layout level='4' style={{ padding: 15 }}>
      <Text category='h4'>{name}</Text>
    </Layout>
  )
  // const renderHeaderContent = () => (
  //   <Layout level="3" style={{ paddingHorizontal: 20, paddingTop: 10 }}>
  //     <Animated.View
  //       style={{
  //         zIndex: 1,
  //         transform: [
  //           {
  //             translateY: headerPos,
  //           },
  //         ],
  //       }}
  //     >
  //       {renderHeader('Timer')}
  //     </Animated.View>
  //   </Layout>
  // )

  const updateSound = (index) => {
    setTimerOptions({ ...timerOptions, type: AlertTypes[index] })

    dispatch({ type: 'CHANGE_TIMER_TYPE', timerType: AlertTypes[index] })
  }

  const updateVolume = (index) => {
    setVolume(index)
  }

  useEffect(() => {
    if (volume !== timerOptions?.volume) {
      dispatch({ type: 'CHANGE_TIMER_VOLUME', volume })

      setTimerOptions({ ...timerOptions, volume })
    }
  }, [volume])

  const startSheetTimer = useCallback(
    async (length) => {
      await handleTimeStart(length)
      sheetRef.current.snapTo(0)
    },
    [sheetRef.current]
  )

  const TimerButton = ({ timeInSeconds, displayTime }) => (
    <Button
      key={timeInSeconds}
      style={{ width: '48%', marginBottom: 15 }}
      onPress={() => startSheetTimer(timeInSeconds)}>
      {displayTime}
    </Button>
  )

  // const renderInner = () => (
  //   <Layout level="3" style={{ paddingHorizontal: 20, height: "100%", flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
  //     {timers.map(TimerButton)}
  //     {timer.timerRunning && (
  //       <Button status="danger" style={{ width: '100%', marginBottom: 15 }} onPress={() => handleTimeStop()
  //       }>Stop Timer</Button>
  //     )}

  //   </Layout>
  // )
  const sheetHeight = timer.timerRunning ? 390 : 340

  const renderInner = () => (
    <Layout level='2' style={{ minHeight: sheetHeight }}>
      <Animated.View
        style={{
          zIndex: 1,
          transform: [
            {
              translateY: headerPos,
            },
          ],
        }}>
        {renderHeader('Timer')}
      </Animated.View>
      {/* 
        <Layout level="2" style={styles.formRow}>
                <Text category="label">Sound</Text>
                <ButtonSwitch
                    onSelect={updateSound}
                    selectedIndex={AlertTypes.indexOf(timerOptions.type)}
                >
                    {AlertTypes.map(inc => <Button key={inc} size="small">{inc}</Button>)}
                </ButtonSwitch>
            </Layout>

          
        <Layout level="2" style={styles.formRow}>
                <Text category="label">Volume</Text>
                <View style={{ paddingHorizontal: 15, flex: 1 }}>            
                <Slider
          
          minimumValue={1}
          maximumValue={10}
          minimumTrackTintColor={theme['color-primary-500']}
          maximumTrackTintColor={theme['background-basic-color-4']}
          step={1}
          onSlidingComplete={setVolume}
          value={volume}
        />

            </View>
            </Layout> */}
      <Layout level='2' style={styles.buttonContainer}>
        {timers.map(TimerButton)}
        {timer.timerRunning && (
          <Button
            status='danger'
            style={{ width: '100%', marginBottom: 15 }}
            onPress={() => handleTimeStop()}>
            Stop Timer
          </Button>
        )}
      </Layout>
    </Layout>
  )

  return (
    <BottomSheet
      snapPoints={[-60, sheetHeight]}
      contentPosition={trans}
      renderContent={renderInner}
      renderHeader={renderTab}
      ref={sheetRef}
      callbackNode={fall}
      enabledContentTapInteraction={false}
      enabledContentGestureInteraction={false}
      onCloseEnd={() => dispatch(closeTimerSheet())}
    />
  )
}

const styles = StyleSheet.create({
  formRow: {
    marginVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
    paddingBottom: 20,
  },
})
