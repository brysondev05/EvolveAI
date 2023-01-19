import {
  useTheme,
  Text,
  Layout,
  Button,
  Spinner,
  Divider,
  Toggle,
  Icon,
} from '@ui-kitten/components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import { EffortRating } from '~/components/TrainingScreen/PerformanceSheet/EffortRating'
import { usePerformanceInfo } from '~/hooks/performanceSheet/usePerformanceInfo'
import { convertDecimal } from '~/helpers/Calculations'
import NumberInput from '~/components/presentational/NumberInput'
import { Pressable, View } from 'react-native'
import Modifiers from '~/components/TrainingScreen/PerformanceSheet/Modifiers'
import MaxCalculation from '~/components/TrainingScreen/MaxCalculation'
import MaxCalculation10 from '~/components/TrainingScreen/MaxCalculation10'
import Update10RM from '~/components/TrainingScreen/PerformanceSheet/Update10RM'
import { clearPerformance } from '~/reduxStore/actions/programActions'
import { useFirestore } from 'react-redux-firebase'
import { useProgramInfo } from '~/hooks/programInfo/useProgramInfo'
import useExercises from '~/hooks/programInfo/useExercises'

const LoadingIndicator = (props) => (
  <View
    style={[
      props.style,
      {
        justifyContent: 'center',
        alignItems: 'center',
      },
    ]}>
    <Spinner size='small' />
  </View>
)

export const PerformanceScreen = ({ navigation, route }) => {
  const {
    expectedPerformance: { units },
    exerciseType,
    exerciseStyle,
    isAccessory,
    lift,
    is10RMTest,
    weightIncrement,
    isLastSet,
    isBodyweight,
    action,
    exerciseIndex,
    setIndex,
    restTime,
  } = route.params || {}

  const dispatch = useDispatch()
  const theme = useTheme()
  const { userID } = useProgramInfo()

  const dayInfo = useTypedSelector(({ firestore: { data } }) => data.dayInfo)

  const { exercises } = useExercises()

  const exercise = exercises?.[lift?.exercise?.exerciseShortcode]
  const firestore = useFirestore()

  const program = useTypedSelector(
    ({ firestore: { data } }) =>
      data?.userProgram?.programDetails?.userProgramData?.program
  )

  const [autoTimerEnabled, setAutoTimerEnable] = useState(false)

  const [isUpdating, setIsUpdating] = useState({
    clear: false,
    done: false,
  })

  const scrollRef = useRef(null)

  const {
    max,
    max10,
    setMax10,
    max10Update,
    setMax10Update,
    maxUpdate,
    isMaxTest,
    setMax,
    setMaxUpdate,
    performance,
    setPerformance,
    handleWeightRepsRPEChange,
    usingBodyweight,
    setUsingBodyweight,
    usesBands,
    setUsesBands,
    bandsButtons,
    movementType,
    handlePerformanceChange,
  } = usePerformanceInfo({
    setIsUpdating,
    autoTimerEnabled,
    performanceInfo: route.params,
  })

  useEffect(() => {
    if ((exercise?.autoTimerEnabled || restTime) && movementType !== 'CE') {
      setAutoTimerEnable(true)
    } else {
      setAutoTimerEnable(false)
    }
  }, [exercise, restTime, movementType])

  const handleAutoTimerSwitch = useCallback(
    (status) => {
      if (status) {
        firestore
          .collection(`users/${userID}/exercises`)
          .doc(exercise?.exerciseShortcode)
          .update({ autoTimerEnabled: true })
        setAutoTimerEnable(true)
        if (!exercise?.autoTimer) {
          return navigation.navigate('Auto Timer', { exercise })
        }
      } else {
        firestore
          .collection(`users/${userID}/exercises`)
          .doc(exercise?.exerciseShortcode)
          .update({ autoTimerEnabled: false })
        setAutoTimerEnable(false)
      }
    },
    [exercise]
  )

  const handleTimerConfigPress = useCallback(() => {
    if (restTime) {
      return Alert.alert(
        'Rest Time Pre-Set',
        'This current program has pre-set times, you auto-timer choices will be ignored',
        [
          {
            text: 'Show Timer Settings Anyway',
            onPress: () => navigation.navigate('Auto Timer', { exercise }),
            style: 'destructive',
          },
          {
            text: 'Go Back',
            style: 'cancel',
          },
        ],
        {
          cancelable: true,
        }
      )
    }
    return navigation.navigate('Auto Timer', { exercise })
  }, [restTime, exercise])

  const handleClearPerformance = useCallback(async () => {
    setIsUpdating({ clear: true, done: false })

    await dispatch(
      clearPerformance({
        exerciseIndex,
        setIndex,
        isAccessory,
        lift,
      })
    )
    setTimeout(() => {
      navigation.goBack()
    }, 100)
  }, [exerciseIndex, setIndex, isAccessory, lift])

  const handlePostPerformance = () => {
    setIsUpdating({ clear: false, done: true })
    handlePerformanceChange()
  }

  return (
    <Layout style={{ flexGrow: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <Layout level='2' style={{ flex: 1 }}>
          {/* <ModalHeader title='Performance' /> */}

          <View
            style={{
              paddingHorizontal: 20,
              flexGrow: 1,
              justifyContent: 'space-evenly',
            }}>
            <View style={{ marginTop: 10 }}>
              <NumberInput
                value={performance.weight}
                units={units}
                onChangeText={(nextText: string) =>
                  setPerformance({
                    ...performance,
                    weight: convertDecimal(nextText),
                  })
                }
                handleChange={(change: 'increase' | 'decrease') =>
                  handleWeightRepsRPEChange({
                    type: 'weight',
                    change,
                    min: 0,
                    max: 1000,
                  })
                }
                canEdit={true}
                placeholder='weight'
                label={`Weight`}
                level='2'
                // subLabel={`${isPerSide ? "\nPer Side" : ''}`}
                disabled={usingBodyweight}
              />

              {(isAccessory || isBodyweight) && (
                <Modifiers
                  usingBodyweight={usingBodyweight}
                  setUsingBodyweight={setUsingBodyweight}
                  usesBands={usesBands}
                  setUsesBands={setUsesBands}
                  bandsButtons={bandsButtons}
                />
              )}
            </View>
            <Divider style={styles.divider} />

            {movementType !== 'CE' && (
              <>
                <View>
                  <NumberInput
                    level='2'
                    value={performance.reps}
                    onChangeText={(nextText: string) =>
                      setPerformance({
                        ...performance,
                        reps: String(Math.floor(Number(nextText))),
                      })
                    }
                    handleChange={(change: 'increase' | 'decrease') =>
                      handleWeightRepsRPEChange({
                        type: exerciseStyle === 'TUT' ? 'seconds' : 'reps',
                        change,
                        min: 1,
                        max: 100,
                      })
                    }
                    canEdit={true}
                    placeholder={exerciseStyle === 'TUT' ? 'Seconds' : 'Reps'}
                    label={exerciseStyle === 'TUT' ? 'Seconds' : 'Reps'}
                  />
                </View>
              </>
            )}
            <Divider style={styles.divider} />

            <EffortRating
              exerciseType={exerciseType}
              setPerformance={setPerformance}
              handleWeightRepsRPEChange={handleWeightRepsRPEChange}
              movementType={movementType}
              isAccessory={isAccessory}
              performance={performance}
            />
            {isMaxTest && (
              <MaxCalculation
                weight={performance.weight}
                reps={performance.reps}
                rpe={performance.rpe}
                max={max}
                setMax={(newMax) => setMax(newMax)}
                units={units}
                maxUpdate={maxUpdate}
                setMaxUpdate={(newMax) => setMaxUpdate(newMax)}
              />
            )}

            {is10RMTest && setIndex === 2 && (
              <MaxCalculation10
                usingBodyweight={usingBodyweight}
                weight={performance.weight}
                reps={performance.reps}
                rpe={performance.rpe}
                max={max10}
                setMax={(newMax) => setMax10(newMax)}
                units={units}
                maxUpdate={maxUpdate}
                weightIncrement={weightIncrement}
                usesBands={usesBands}
              />
            )}
            {program === 'powerbuilding' &&
              isAccessory &&
              isLastSet &&
              !is10RMTest && (
                <Update10RM
                  dayInfo={dayInfo}
                  performance={performance}
                  lift={lift}
                  performanceSheet={route.params}
                  max10Update={max10Update}
                  setMax10Update={setMax10Update}
                />
              )}

            <View>
              {movementType !== 'CE' && (
                <>
                  <Divider style={styles.divider} />

                  <View
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                      paddingVertical: 10,
                      paddingHorizontal: 5,
                    }}>
                    <Pressable
                      onPress={handleTimerConfigPress}
                      style={styles.timerSettingsButton}>
                      <Text
                        status={autoTimerEnabled ? 'primary' : null}
                        appearance={autoTimerEnabled ? 'default' : 'hint'}
                        category='label'>
                        Auto Timer {restTime && `${'\n'}${restTime} seconds`}
                      </Text>
                      <Icon
                        name='settings-2-outline'
                        fill={
                          autoTimerEnabled
                            ? theme['color-primary-400']
                            : theme['text-hint-color']
                        }
                        style={styles.timerSettingsIcon}
                      />
                    </Pressable>
                    <Toggle
                      status='control'
                      checked={autoTimerEnabled}
                      // status='primary'
                      onChange={handleAutoTimerSwitch}
                    />
                  </View>
                  <Divider style={styles.divider} />
                </>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 15,
                  justifyContent: 'space-between',
                }}>
                <Button
                  disabled={isUpdating.clear || isUpdating.done}
                  accessoryLeft={isUpdating.clear && LoadingIndicator}
                  appearance='outline'
                  style={{ flex: 1, marginRight: 7.5 }}
                  status='basic'
                  onPress={handleClearPerformance}>
                  CLEAR
                </Button>
                <Button
                  disabled={isUpdating.clear || isUpdating.done}
                  status='success'
                  style={{ flex: 1, marginLeft: 7.5 }}
                  onPress={handlePostPerformance}
                  accessoryLeft={isUpdating.done && LoadingIndicator}>
                  DONE
                </Button>
              </View>
            </View>
          </View>
        </Layout>
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: 10,
  },
  timerSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSettingsIcon: {
    width: 18,
    height: 18,
  },
})
