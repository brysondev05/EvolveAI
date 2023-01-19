import { Layout, useTheme, Text } from '@ui-kitten/components'
import { FlatList, ScrollView, View } from 'react-native'
import useDayProgramming from '~/hooks/programInfo/useDayProgramming'
import { WorkoutOverviewHeader } from '~/components/TrainingScreen/TrainingOverview/WorkoutOverviewHeader'
import { useTypedSelector } from '~/reduxStore/reducers'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import { useBlockType } from '~/hooks/programInfo/useBlockType'
import ExerciseOverviewItem from '~/components/TrainingScreen/TrainingOverview/ExerciseOverviewItem'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HoldingHeader from '~/components/TrainingScreen/TrainingOverview/HoldingHeader'
import HoldingItem from '~/components/TrainingScreen/TrainingOverview/HoldingItem'
import { useDispatch } from 'react-redux'
import useSheetBackHandler from '~/hooks/utilities/useSheetBackHandler'
import PopUp from '~/components/PopUp'
import { useDayNavigation } from '~/hooks/workout/overview/useDayNavigation'
import { useExpandedNotice } from '~/hooks/workout/overview/useExpandedNotice'
import { useOverviewReadiness } from '~/hooks/workout/overview/useOverviewReadiness'
import { useDayNumber } from '~/hooks/workout/overview/useDayNumber'
import useReviews from '~/hooks/useReviews'
import { useEffect } from 'react'

const RAS = [
  'RAS aka Recovery Adaptive Strategies are passive and active means to help decay fatigue and improve your recovery.',
  'The most important aspects of recovery are training within your volume landmarks, proper sleep and eating enough, but these other RAS can be utilized during Deloads, Tapers or unique circumstances of particularly low readiness, to help you boost your recovery.',
  'Some of our favorite RAS are Ice Baths and Contrast Baths/Showers.',
]

const Skipped = [
  'This workout has been skipped due to the training day being in the past.',
  'We have created a few easy preparatory training days to get you ready to start your full training program next week',
]
const holdingList = ['one', 'two', 'three', 'four', 'five']

const RASInfo = () => (
  <>
    <Text category='h1'>Recovery Adaptive Strategies</Text>
    {RAS.map((copy, index) => (
      <Text key={index}>{copy}</Text>
    ))}
  </>
)

const SkippedInfo = () => (
  <>
    <Text category='h1'>Workout Skipped</Text>
    {Skipped.map((copy, index) => (
      <Text key={index}>{copy}</Text>
    ))}
  </>
)
export default function TrainingOverview({ navigation, route }) {
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )
  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered?.dayInfo?.[0]
  )
  const activeWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks &&
      data.dayInfo &&
      data.programWeeks?.[`week${activeDay?.week}`]
  )

  const exercises = useTypedSelector(
    ({ firestore: { data } }) => data.exercises
  )

  const day = useDayNumber()
  const theme = useTheme()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()

  const { navigateToTraining } = useDayNavigation({ activeWeek })

  const gradientColors = [
    theme['background-basic-color-1'],
    theme['background-basic-color-3'],
  ]

  const {
    showExpanded,
    showExpandedNotice,
    handlePopupPress,
    handleShowExpanded,
    setShowExpandedNotice,
  } = useExpandedNotice()

  useSheetBackHandler()
  useReviews({
    shouldShow: route?.params?.shouldShow,
    currentWeek: activeDay?.week,
  })

  const {
    sessionRPE,
    readinessScore,
    sessionLength,
    sessionStart,
    sessionMindset,
    sessionPositive,
    sessionNegative,
  } = useOverviewReadiness()

  const { allLiftingData } = useDayProgramming()

  const blockType = activeWeek?.blockType || ''

  const { blockName, blockColor } = useBlockType({ blockType })

  useEffect(() => {
    if (isLoaded(activeDay) && isEmpty(activeDay)) {
      console.log('activeday loaded and empty')
    }
  }, [activeDay])
  if (
    isLoaded(activeDay) &&
    !isEmpty(activeDay) &&
    !isEmpty(programWeeks) &&
    isLoaded(programWeeks)
  ) {
    if (
      activeDay?.isRAS ||
      activeDay?.status === 'off' ||
      activeDay?.status === 'disabled'
    ) {
      return (
        <ScrollView>
          <Layout style={{ flex: 1, paddingTop: insets.top }}>
            <WorkoutOverviewHeader
              activeWeek={activeWeek}
              activeDay={activeDay}
              navigation={navigation}
              blockName={blockName}
              blockColor={blockColor}
              gradientColors={gradientColors}
              blockType={blockType}
              itemCount={allLiftingData?.length}
              theme={theme}
              dispatch={dispatch}
              showExpanded={showExpanded}
              setShowExpanded={handleShowExpanded}
              navigateToTraining={navigateToTraining}
              withMainOverview={false}
              sessionRPE={sessionRPE}
              readinessScore={readinessScore}
              day={day}
              sessionLength={sessionLength}
              sessionStart={sessionStart}
              sessionMindset={sessionMindset}
              sessionNegative={sessionNegative}
              sessionPositive={sessionPositive}
            />
            <View style={{ padding: 15 }}>
              {activeDay?.status === 'disabled' && <SkippedInfo />}
              {activeDay?.isRAS && <RASInfo />}
              {activeDay?.status === 'off' && (
                <>
                  <Text category='h1'>Off</Text>
                  <Text>
                    This is a planned rest day for your perfect peak. Avoid
                    doing any activities outside of your normal daily routine,
                    eat high quality foods and get plenty of sleep.
                  </Text>
                </>
              )}
            </View>
          </Layout>
        </ScrollView>
      )
    }
    return (
      <Layout style={{ flex: 1, paddingTop: insets.top }}>
        <FlatList
          ListHeaderComponent={WorkoutOverviewHeader({
            activeWeek,
            activeDay,
            navigation,
            blockName,
            blockColor,
            gradientColors,
            blockType,
            itemCount: allLiftingData?.length,
            theme,
            dispatch,
            showExpanded,
            setShowExpanded: handleShowExpanded,
            navigateToTraining,
            readinessScore,
            sessionRPE,
            day,
            sessionLength,
            sessionStart,
            sessionNegative,
            sessionMindset,
            sessionPositive,
          })}
          extraData={[
            activeWeek,
            activeDay,
            showExpanded,
            exercises,
            sessionRPE,
            readinessScore,
            sessionLength,
            sessionStart,
            sessionMindset,
            sessionPositive,
            sessionNegative,
          ]}
          showsVerticalScrollIndicator={false}
          data={allLiftingData}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: theme['background-basic-color-1'],
            paddingBottom: 30,
          }}
          removeClippedSubviews
          maxToRenderPerBatch={5}
          renderItem={({ item, index }) => {
            if (!Array.isArray(item)) {
              return (
                <ExerciseOverviewItem
                  key={index}
                  index={index}
                  item={item}
                  showExpanded={showExpanded}
                  workoutStatus={activeDay?.status}
                  navigation={navigation}
                  blockType={activeWeek?.blockType}
                  currentWeek={activeDay?.week}
                  currentDay={day}
                  cycleID={activeWeek?.cycleID}
                  liftLength={allLiftingData?.length}
                />
              )
            }
            if (Array.isArray(item) && item.length > 1) {
              return (
                <Layout level='4' style={{ padding: 5, margin: 5 }}>
                  <Text category='h6'>Combo Set</Text>
                  {item.map((superSets, sIndex) => (
                    <ExerciseOverviewItem
                      key={`${index}_${sIndex}`}
                      index={index}
                      item={{ ...superSets, isSuperSet: true }}
                      showExpanded={showExpanded}
                      workoutStatus={activeDay?.status}
                      navigation={navigation}
                      blockType={activeWeek?.blockType}
                      currentWeek={activeDay?.week}
                      currentDay={day}
                      cycleID={activeWeek?.cycleID}
                      liftLength={allLiftingData?.length}
                    />
                  ))}
                </Layout>
              )
            }
            if (Array.isArray(item)) {
              const first = item[0]
              return (
                <ExerciseOverviewItem
                  key={index}
                  index={index}
                  item={first}
                  showExpanded={showExpanded}
                  workoutStatus={activeDay?.status}
                  navigation={navigation}
                  blockType={activeWeek?.blockType}
                  currentWeek={activeDay?.week}
                  currentDay={day}
                  cycleID={activeWeek?.cycleID}
                  liftLength={allLiftingData?.length}
                />
              )
            }
          }}
          keyExtractor={(item, index) =>
            `${item.exercise?.category}_${activeDay?.week}_${day}_${index}`
          }
        />
        <PopUp
          title='Overview Details'
          description='This is an overview of your training for this day. The estimated values will change based on your readiness levels. When you are ready to start your full workout press the Start Training button above.'
          showModal={setShowExpandedNotice}
          visible={showExpandedNotice}
          onPress={handlePopupPress}
        />
      </Layout>
    )
  } else {
    if (isEmpty(activeDay) && isLoaded(activeDay)) {
      return (
        <Layout
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <Text category='h1'>Workout not ready.</Text>
          <Text>
            Your next workout is not yet ready. Make sure you have completed the
            most recent week from the dashboard and pressed the 'complete week'
            button.
          </Text>
          <Text>
            If you believe this is a mistake or have any questions please report
            a bug from the dashboard menu.
          </Text>
        </Layout>
      )
    }
    return (
      <Layout style={{ flex: 1, paddingTop: insets.top }}>
        <FlatList
          ListHeaderComponent={HoldingHeader({ gradientColors })}
          showsVerticalScrollIndicator={false}
          data={holdingList}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: theme['background-basic-color-1'],
          }}
          renderItem={({ item, index }) => <HoldingItem index={index} />}
          keyExtractor={(item) => item}
        />
      </Layout>
    )
  }
}

TrainingOverview.whyDidYouRender = true
