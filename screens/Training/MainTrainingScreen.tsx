import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import { useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { FlatList } from 'react-native'
import {
  Layout,
  useTheme,
  Modal,
  Card,
  Text,
  Button,
} from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import ExerciseCard from '~/components/TrainingScreen/ExerciseCard/ExerciseCard'

import { updateReadiness } from '~/reduxStore/actions/readinessActions'

import { isLoaded, isEmpty } from 'react-redux-firebase'
import MainWorkoutHeader, {
  MainWorkoutFooter,
} from '~/components/TrainingScreen/MainWorkoutHeader'
import { useFocusEffect } from '@react-navigation/native'
import useDayProgramming from '~/hooks/programInfo/useDayProgramming'
import produce from 'immer'
import { LoadingSplash } from '~/components/LoadingSplash'
import useSheetBackHandler from '~/hooks/utilities/useSheetBackHandler'

import ComboSetCard from '~/components/TrainingScreen/ExerciseCard/ComboSetCard'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useIsMounted } from '~/hooks/utilities/useIsMounted'
import { customLog } from '~/helpers/CustomLog'
import { useDayNumber } from '~/hooks/workout/overview/useDayNumber'
import { useHeaderHeight } from '@react-navigation/elements'
import useNotifications from '~/hooks/useNotification'

export default function MainTraining({ navigation, route }) {
  const isPreview = route?.params?.preview || false

  useLayoutEffect(() => {
    if (isPreview) {
      navigation.setOptions({
        presentation: 'modal',
        headerText: 'Preview',
      })
    }
  }, [isPreview])

  const dispatch = useDispatch()
  const theme = useTheme()

  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered.dayInfo?.[0]
  )
  const { week: selectedWeek, id } = activeDay || { week: 1, id: '1_1' }
  const day = useDayNumber()
  const activeWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks &&
      data.dayInfo &&
      data.programWeeks?.[`week${selectedWeek}`]
  )
  const programIndex = useTypedSelector(
    ({ firestore: { data } }) =>
      data?.userProgram?.programDetails?.userProgramData?.programIndex
  )

  const { allLiftingData } = useDayProgramming()

  const [visible, showReadinessModal] = useState(false)

  const readinessScores = activeDay?.readiness || [2, 2, 2, 2]
  const [adjustmentValues, setAdjustmentValues] = useState({
    squat: {},
    bench: {},
    deadlift: {},
    upperPull: {},
  })

  const calcHeaderHeight = useHeaderHeight()
  const headerHeight = isPreview ? calcHeaderHeight : 0

  const { showActionSheetWithOptions } = useActionSheet()

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      activateKeepAwake()
      return () => {
        deactivateKeepAwake()
      }
    }, [])
  )
  const setReadinessScores = useCallback(
    (newScores) => {
      dispatch(updateReadiness(newScores))
    },
    [activeDay]
  )

  const handleReadinessChange = (type, change) => {
    showActionSheetWithOptions(
      {
        title: `${type} Readiness`,
        message:
          'Based on your readiness questionnaire, previous performance and fatigue levels, app has determined your readiness for you. However, if you do not agree with your rating, you can override it here',
        options: [
          '1 - Low Readiness',
          '2 - Below Average',
          '3 - Average',
          '4 - Above Average',
          '5 - High Readiness',
          'Cancel',
        ],
        cancelButtonIndex: 5,
      },
      (buttonIndex) => {
        if (buttonIndex !== 5) {
          customLog({ readinessScores, buttonIndex, type })

          const newReadiness = produce(readinessScores, (newDraft) => {
            switch (type) {
              case 'Squat':
                newDraft[0] = buttonIndex

                break
              case 'Bench':
                newDraft[1] = buttonIndex

                break
              case 'Deadlift':
                newDraft[2] = buttonIndex

                break

              case 'Upper Pull':
                newDraft[3] = buttonIndex

                break
            }
          })
          return setReadinessScores(newReadiness)
        }
      }
    )
  }
  const findReadiness = useCallback(
    (movement) => {
      const [squat, bench, deadlift, upperPull] = readinessScores
      if (movement === 'SQ') {
        return squat
      }
      if (movement == 'BN') {
        return bench
      }
      if (movement === 'DL') {
        return deadlift
      }
      if (movement === 'UP') {
        return upperPull
      }
    },
    [readinessScores]
  )

  useSheetBackHandler()

  const { cancelNotification } = useNotifications()

  let exerciseList = <LoadingSplash />
  if (isLoaded(activeDay) && !isEmpty(activeDay)) {
    exerciseList = (
      <FlatList
        ListHeaderComponent={
          !isPreview &&
          MainWorkoutHeader({
            activeWeek,
            activeDay,
            handleReadinessChange,
            readinessScores,
            showReadinessModal,
            theme,
            isPreview,
            programIndex,
          })
        }
        removeClippedSubviews
        maxToRenderPerBatch={4}
        // initialNumToRender={2}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          (!isPreview || __DEV__) && (
            <MainWorkoutFooter
              navigation={navigation}
              isPreview={isPreview}
              dispatch={dispatch}
              status={activeDay.status}
              adjustmentValues={adjustmentValues}
              readinessScores={readinessScores}
              cancelNotification={() => cancelNotification('startWorkout')}
            />
          )
        }
        data={allLiftingData}
        extraData={[
          activeWeek,
          activeDay,
          readinessScores,
          programIndex,
          isPreview,
        ]}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: theme['background-basic-color-1'],
        }}
        renderItem={({ item, index }) => {
          if (!Array.isArray(item)) {
            return (
              <ExerciseCard
                index={index}
                blockType={activeDay?.blockType}
                navigation={navigation}
                currentWeek={activeDay.week}
                currentDay={day}
                liftLength={allLiftingData?.length}
                readiness={findReadiness(item.exercise?.movement)}
                isPreview={isPreview}
                updateAdjustmentValue={({ movement, value }) => {
                  const updated = produce(adjustmentValues, (draft) => {
                    if (typeof draft[movement] === 'undefined') {
                      draft[movement] = {
                        [index]: value,
                      }
                    } else {
                      draft[movement][index] = value
                    }
                  })
                  setAdjustmentValues(updated)
                }}
                cycleID={activeWeek?.cycleID}
                lift={item}
                programIndex={programIndex}
                key={`${item.exercise?.category}_${activeDay.week}_${activeDay.week}`}
              />
            )
          }
          if (Array.isArray(item)) {
            return (
              <ComboSetCard
                index={index}
                blockType={activeDay?.blockType}
                navigation={navigation}
                currentWeek={activeDay.week}
                currentDay={day}
                liftLength={allLiftingData?.length}
                isPreview={isPreview}
                dayStatus={activeDay?.status}
                cycleID={activeWeek?.cycleID}
                lifts={item}
                programIndex={programIndex}
                key={`${index}`}
              />
            )
          }
          if (Array.isArray(item)) {
            const first = item[0]
            return (
              <ExerciseCard
                index={index}
                blockType={activeDay?.blockType}
                navigation={navigation}
                currentWeek={activeDay.week}
                currentDay={day}
                liftLength={allLiftingData?.length}
                readiness={findReadiness(first.exercise?.movement)}
                isPreview={isPreview}
                programIndex={programIndex}
                updateAdjustmentValue={({ movement, value }) => {
                  const updated = produce(adjustmentValues, (draft) => {
                    if (typeof draft[movement] === 'undefined') {
                      draft[movement] = {
                        [index]: value,
                      }
                    } else {
                      draft[movement][index] = value
                    }
                  })
                  setAdjustmentValues(updated)
                }}
                cycleID={activeWeek?.cycleID}
                lift={first}
                key={`${first.exercise?.category}_${activeDay.week}_${activeDay.week}_${index}`}
              />
            )
          }
        }}
        keyExtractor={(item, index) =>
          `${item?.exercise?.category}_${activeDay.week}_${day}_${index}`
        }
      />
    )
  }

  return (
    <Layout style={{ flexGrow: 1, paddingTop: headerHeight }}>
      {exerciseList}
      <Modal
        visible={visible}
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        onBackdropPress={() => showReadinessModal(false)}>
        <Card style={{ padding: 10 }} disabled={true}>
          <Text category='h5'>Daily Movement Ratings</Text>
          <Text category='p2'>
            If you've used our previous AI programming, you'll be familiar with
            our readiness ratings. These are similar, but pre-decided by our AI
            algorithms.{' '}
          </Text>
          <Text category='p2'>
            You shouldn't need to change these, especially once you've started
            your workout but if you don't agree with the numbers, feel free to
            change them to your liking.
          </Text>
          <Button
            style={{ marginTop: 20 }}
            onPress={() => showReadinessModal(false)}>
            OK
          </Button>
        </Card>
      </Modal>
    </Layout>
  )
}
