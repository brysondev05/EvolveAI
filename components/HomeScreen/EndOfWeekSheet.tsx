import { useState, useRef, useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import {
  Layout,
  Button,
  Text,
  useTheme,
  Toggle,
  RadioGroup,
  Radio,
  CheckBox,
} from '@ui-kitten/components'
import Slider from '@react-native-community/slider'
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
import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'

const renderHeader = (name) => (
  <View
    style={{
      width: '100%',
      height: 100,
      padding: 15,
    }}>
    <Text category='h4'>{name}</Text>
  </View>
)

export const EndOfWeekSheet = ({
  navigation,
  week,
  blockType,
  blockVolume,
  cycleID,
}) => {
  const endOfWeekSheet = useTypedSelector((state) => state.endOfWeekSheet)

  const [squatReport, setSquatReport] = useState(3)
  const [benchReport, setBenchReport] = useState(3)
  const [deadliftReport, setDeadliftReport] = useState(3)

  const [ableToComplete, setAbleToComplete] = useState(true)
  const [unableReason, setUnableReason] = useState(null)

  const [modifyProgram, setModifyProgram] = useState(false)
  const [programModifiers, setProgramModifier] = useState({
    trainingDays: false,
    weaknesses: false,
    technique: false,
  })

  const sheetRef = useRef(null)
  const theme = useTheme()
  const dispatch = useDispatch()
  const trans = new Value(0)
  const untraversedPos = new Value(0)
  const prevTrans = new Value(0)
  useEffect(() => {
    if (endOfWeekSheet?.action === 'open_end_of_week_sheet') {
      sheetRef.current.snapTo(1)
    }
    if (endOfWeekSheet?.action === 'close_finish_workout_sheet') {
      sheetRef.current.snapTo(0)
    }
    if (
      endOfWeekSheet?.action === 'end_of_week_complete' ||
      endOfWeekSheet?.action === 'end_of_block_complete'
    ) {
      sheetRef.current.snapTo(0)
      // navigation.navigate('HomeScreen')
    }
  }, [endOfWeekSheet])

  const headerPos = block([
    cond(
      lessThan(untraversedPos, sub(trans, 100)),
      set(untraversedPos, sub(trans, 100))
    ),
    cond(greaterThan(untraversedPos, trans), set(untraversedPos, trans)),
    set(prevTrans, trans),
    untraversedPos,
  ])

  const endOfWeekSheets = {
    1: '1 - I found the workouts very tough',
    2: '2 - The workouts could have been easier',
    3: '3 - The workouts felt just right',
    4: '4 - The workouts could have been tougher',
    5: '5 - The workouts were too easy',
  }

  const onActiveCheckedChange = (isChecked) => {
    setAbleToComplete(isChecked)
  }

  const renderInner = () => (
    <Layout level='3' style={{ padding: 15, height: '100%' }}>
      <Animated.View
        style={{
          zIndex: 1,
          transform: [
            {
              translateY: headerPos,
            },
          ],
        }}>
        {renderHeader('End of Week Check-in')}
      </Animated.View>
      <ScrollView>
        <Text category='label'>Squat</Text>
        <Slider
          style={{ width: '100%', height: 80 }}
          minimumValue={1}
          maximumValue={5}
          minimumTrackTintColor={theme['color-primary-500']}
          maximumTrackTintColor={theme['background-basic-color-4']}
          step={1}
          onValueChange={(nextValue) => setSquatReport(nextValue)}
          value={squatReport}
        />
        <Text
          category='label'
          appearance='hint'
          style={{ textAlign: 'center' }}>
          {endOfWeekSheets[squatReport]}
        </Text>

        <Text category='label'>Bench</Text>
        <Slider
          style={{ width: '100%', height: 80 }}
          minimumValue={1}
          maximumValue={5}
          minimumTrackTintColor={theme['color-primary-500']}
          maximumTrackTintColor={theme['background-basic-color-4']}
          step={1}
          onValueChange={(nextValue) => setBenchReport(nextValue)}
          value={benchReport}
        />
        <Text
          category='label'
          appearance='hint'
          style={{ textAlign: 'center' }}>
          {endOfWeekSheets[benchReport]}
        </Text>
        <Text category='label'>Deadlift</Text>
        <Slider
          style={{ width: '100%', height: 80 }}
          minimumValue={1}
          maximumValue={5}
          minimumTrackTintColor={theme['color-primary-500']}
          maximumTrackTintColor={theme['background-basic-color-4']}
          step={1}
          onValueChange={(nextValue) => setDeadliftReport(nextValue)}
          value={deadliftReport}
        />
        <Text
          category='label'
          appearance='hint'
          style={{ textAlign: 'center' }}>
          {endOfWeekSheets[deadliftReport]}
        </Text>

        <Toggle
          status='control'
          checked={ableToComplete}
          onChange={onActiveCheckedChange}>
          Week complete?
        </Toggle>
        {!ableToComplete && (
          <View>
            <Text category='label'>
              Why were you unable to complete this week?
            </Text>
            <RadioGroup
              selectedIndex={unableReason}
              onChange={(index: number) => setUnableReason(index)}>
              <Radio>The workout was too difficult</Radio>
              <Radio>I ran out of time/life events</Radio>
              <Radio>Injured</Radio>
              <Radio>Other</Radio>
            </RadioGroup>
          </View>
        )}
        <Button
          appearance='outline'
          status='success'
          onPress={() =>
            dispatch(
              endOfWeekCheckin({
                week,
                blockType,
                blockVolume,
                squatReport,
                benchReport,
                deadliftReport,
                cycleID,
              })
            )
          }>
          DONE
        </Button>
        <Toggle
          status='control'
          checked={ableToComplete}
          onChange={onActiveCheckedChange}>
          Modify Program?
        </Toggle>
        {modifyProgram && (
          <View>
            <CheckBox
              checked={programModifiers.technique}
              onChange={(nextChecked) =>
                setProgramModifier({
                  ...programModifiers,
                  technique: nextChecked,
                })
              }>
              Technique
            </CheckBox>
            <CheckBox
              checked={programModifiers.weaknesses}
              onChange={(nextChecked) =>
                setProgramModifier({
                  ...programModifiers,
                  weaknesses: nextChecked,
                })
              }>
              Technique
            </CheckBox>
            <CheckBox
              checked={programModifiers.trainingDays}
              onChange={(nextChecked) =>
                setProgramModifier({
                  ...programModifiers,
                  trainingDays: nextChecked,
                })
              }>
              Training Days
            </CheckBox>
          </View>
        )}
      </ScrollView>
    </Layout>
  )

  return (
    <BottomSheet
      snapPoints={[-80, 650]}
      contentPosition={trans}
      renderContent={renderInner}
      ref={sheetRef}
      borderRadius={20}
      onCloseEnd={() => dispatch({ type: 'CLOSE_ENDOFWEEK_SHEET' })}
    />
  )
}
