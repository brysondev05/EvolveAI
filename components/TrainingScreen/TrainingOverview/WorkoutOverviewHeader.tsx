import { memo, useCallback } from 'react'
import { Pressable, View, StyleSheet, Alert } from 'react-native'
import { Layout, Text, Button, Icon } from '@ui-kitten/components'
import * as Animatable from 'react-native-animatable'
import { LinearGradient } from 'expo-linear-gradient'
import { useDispatch } from 'react-redux'
import {
  resumeWorkout,
  skipTrainingDay,
} from '~/reduxStore/actions/programActions'

import { useActionSheet } from '@expo/react-native-action-sheet'
import { round } from '~/helpers/Calculations'
import SmallButtonGroup from '~/components/ProgramReview/SmallButtonGroup'
import { capitalizeFullString } from '~/helpers/Strings'
import useActiveWorkout from '~/hooks/programInfo/useActiveWorkout'
import { setActiveDay } from '~/reduxStore/reducers/userProgram'

const LOADING_ANIMATION_DURATION = 500
const LOADING_ANIMATION_STYLE = 'fadeIn'

const LOADING_ANIMATION_DELAY = 500

const nextIcon = (props) => <Icon {...props} name='arrow-forward-outline' />

const handleNavigateToReadiness = ({ activeWeek, activeDay, navigation }) =>
  navigation.navigate('Readiness', {
    week: activeWeek?.startingWeek,
    day: activeDay?.day,
    blockType: activeWeek?.blockType,
  })

const WarmupButtonGroup = memo<{
  navigation: any
  activeWeek: any
  activeDay: any
}>(({ navigation, activeWeek, activeDay }) => (
  <View>
    <Button
      onPress={() =>
        handleNavigateToReadiness({ activeWeek, activeDay, navigation })
      }
      appearance='outline'
      style={{ width: '45%' }}>
      Start
    </Button>
  </View>
))

const CompletedWorkoutButtonGroup = memo<{
  navigation: any
  dispatch: any
}>(({ navigation, dispatch }) => {
  const handleResumeWorkout = () => {
    Alert.alert(
      'Resume Workout?',
      'This will re-start the workout for you, your already completed sets will remain and you can pick up where you left off',
      [
        {
          text: 'Resume',
          onPress: () => dispatch(resumeWorkout()),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      }
    )
  }
  return (
    <View style={{ marginVertical: 20 }}>
      <Button
        size='large'
        status='secondary'
        onPress={() =>
          navigation.navigate('Preview Workout', {
            preview: true,
          })
        }
        style={{ flex: 1, marginBottom: 10 }}>
        Review Workout
      </Button>
      <Button
        onPress={handleResumeWorkout}
        style={buttonGroupStyles.flexButton}
        appearance='outline'
        status='basic'>
        Resume Workout
      </Button>
    </View>
  )
})

const SkippedWorkoutButtonGroup = memo<{ dispatch: any }>(({ dispatch }) => {
  return (
    <View style={buttonGroupStyles.unSkipWorkoutWrapper}>
      <Button
        onPress={() => dispatch(skipTrainingDay({ unskip: true }))}
        status='basic'
        appearance='outline'
        style={buttonGroupStyles.flexButton}>
        Un-Skip Workout
      </Button>
    </View>
  )
})
const PendingWorkoutButtonGroup = memo<{
  navigation: any
  activeDay: any
}>(({ navigation, activeDay }) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const dispatch = useDispatch()

  const handleSkipWorkout = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: ['Scheduling', 'Fatigue', 'Other', 'Cancel'],
        cancelButtonIndex: 3,
        message: 'Why are you skipping this workout?',
        title: 'Skipping Workout',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          return dispatch(skipTrainingDay({ reason: 'scheduling' }))
        }
        if (buttonIndex === 1) {
          return dispatch(skipTrainingDay({ reason: 'fatigue' }))
        }
        if (buttonIndex === 2) {
          return dispatch(skipTrainingDay({ reason: 'other' }))
        }
      }
    )
  }, [])
  const { checkActiveWorkouts } = useActiveWorkout()

  const handleStartWorkout = useCallback(async () => {
    try {
      //console.log('Active Day', activeDay.status)
      if (activeDay.status === 'active') {
        return navigation.navigate('MainTrainingScreen')
      }
      const handleActive = await checkActiveWorkouts()
      console.log('Handle Active', handleActive)
      if (handleActive.message === 'Preview') {
        return navigation.navigate('MainTrainingScreen', {
          isPreview: true,
        })
      }
      if (handleActive.message === 'Proceed') {
        return navigation.navigate('WarmUp')
      }
      if (handleActive.message === 'Go To Active') {
        dispatch(
          setActiveDay({
            activeDay: handleActive.day,
            activeWeek: handleActive.week,
          })
        )

        return navigation.navigate('MainTrainingScreen', {
          day: handleActive.day,
          week: handleActive.week,
        })
      }
    } catch (e) {
      //workout active
    }
  }, [activeDay?.status])
  return (
    <View style={buttonGroupStyles.buttonGroupWrapper}>
      <Button
        status='secondary'
        size='giant'
        onPress={handleStartWorkout}
        style={buttonGroupStyles.startTrainingButton}
        accessoryRight={nextIcon}>
        Start Training
      </Button>
      {activeDay?.status === 'skipped' ? (
        <Button
          onPress={() => dispatch(skipTrainingDay({ unskip: true }))}
          status='basic'
          appearance='outline'
          style={buttonGroupStyles.previewWorkoutButton}>
          Un-Skip Workout
        </Button>
      ) : (
        <Button
          onPress={() => handleSkipWorkout()}
          appearance='outline'
          status='basic'
          style={buttonGroupStyles.skipWorkoutButton}>
          Skip Workout
        </Button>
      )}

      <Button
        onPress={() =>
          navigation.navigate('Preview Workout', {
            preview: true,
            initial: false,
          })
        }
        appearance='outline'
        status='basic'
        style={buttonGroupStyles.previewWorkoutButton}>
        Preview Workout
      </Button>
    </View>
  )
})

export const WorkoutOverviewFooter = memo<{
  activeWeek: any
  activeDay: any
  navigation: any
  type: string
  itemCount: number
  dispatch: any
}>(
  ({
    activeWeek,
    activeDay,
    navigation,
    type = 'Overview',
    itemCount = 0,
    dispatch,
  }) => {
    const ButtonGroup = ({ type, status }) => {
      if (type === 'Overview') {
        switch (status) {
          case 'complete':
            return (
              <CompletedWorkoutButtonGroup
                navigation={navigation}
                dispatch={dispatch}
              />
            )
          case 'skipped':
            return <SkippedWorkoutButtonGroup dispatch={dispatch} />
          case 'pending':
            return (
              <PendingWorkoutButtonGroup
                navigation={navigation}
                activeDay={activeDay}
              />
            )
          case 'active':
            return (
              <PendingWorkoutButtonGroup
                navigation={navigation}
                activeDay={activeDay}
              />
            )
          default:
            return null
        }
      }
      if (type === 'Warmup') {
        return (
          <WarmupButtonGroup
            navigation={navigation}
            activeDay={activeDay}
            activeWeek={activeWeek}
          />
        )
      }
    }

    return (
      <Animatable.View
        animation={LOADING_ANIMATION_STYLE}
        duration={LOADING_ANIMATION_DURATION}
        delay={
          itemCount
            ? (itemCount + 1 * LOADING_ANIMATION_DELAY) / itemCount +
              1 +
              LOADING_ANIMATION_DELAY
            : LOADING_ANIMATION_DELAY
        }
        useNativeDriver
        style={buttonGroupStyles.buttonGroupContainer}>
        {ButtonGroup({ type, status: activeDay?.status })}
      </Animatable.View>
    )
  }
)

const buttonGroupStyles = StyleSheet.create({
  previewWorkoutButton: { width: '49%' },
  skipWorkoutButton: { width: '45%' },
  buttonGroupContainer: { paddingHorizontal: 15, marginTop: 5 },
  startTrainingButton: { width: '100%', marginBottom: 15 },
  buttonGroupWrapper: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 20,
  },
  flexButton: { flex: 1 },
  unSkipWorkoutWrapper: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 20,
  },
})

export const WorkoutOverviewHeader = ({
  activeWeek,
  activeDay,
  navigation,
  blockName,
  blockColor,
  gradientColors,
  type = 'Overview',
  blockType,
  itemCount,
  theme,
  dispatch,
  showExpanded,
  setShowExpanded,
  navigateToTraining,
  withMainOverview = true,
  sessionRPE,
  readinessScore,
  sessionLength,
  sessionStart,
  sessionMindset,
  sessionPositive,
  sessionNegative,
  day,
}) => {
  const isFirstDays = activeDay.week === 1 && [1, 2].includes(activeDay?.day)

  const smallButtonItems = sessionLength
    ? [
        {
          title: 'Completed',
          description: sessionStart,
        },
        {
          title: 'Session Length',
          description: sessionLength,
        },

        {
          title: 'Readiness',
          description: `${
            !isNaN(readinessScore) && !isFirstDays ? readinessScore : '-'
          }`,
        },
        {
          title: 'Session RPE',
          description: sessionRPE,
        },
      ]
    : [
        {
          title: 'Readiness',
          description: `${
            !isNaN(readinessScore) && !isFirstDays ? readinessScore : '-'
          }`,
        },
        {
          title: 'Session RPE',
          description: sessionRPE,
        },
      ]

  const largeButtons = [
    {
      title: 'Mindset',
      description: sessionMindset,
      fallback: 'What did you set out to achieve in this session?',
      isLarge: true,
    },
    {
      title: 'Achievements',
      description: sessionPositive,
      fallback: 'What did you achieve in this session?',
      isLarge: true,
    },
    {
      title: 'Improvements',
      description: sessionNegative,
      fallback: 'What could you have done better?',
      isLarge: true,
    },
  ]

  return (
    <Layout level='1' style={styles.container}>
      <Layout level='2' style={styles.headerOuterWrapper}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />

        <Animatable.View
          animation='fadeIn'
          duration={1000}
          style={styles.headerContainer}>
          <View style={styles.headerTextWrapper}>
            <Text style={{ color: blockColor, fontSize: 18 }} category='p1'>
              {blockName}
            </Text>
            <Text category='h3'>
              {blockType === 'FinalPhase'
                ? 'Final Phase'
                : `Week ${activeWeek?.startingWeek}`}
            </Text>
            <View style={styles.textWrapper}>
              <Text style={styles.dayText} category='h1'>
                {day ? `Day ${day}` : capitalizeFullString(activeDay?.dayName)}
              </Text>
              {activeDay?.status === 'complete' && (
                <Icon
                  style={styles.statusIcons}
                  fill='white'
                  name='checkmark-circle-outline'
                />
              )}

              {activeDay?.status === 'skipped' && (
                <Icon
                  style={styles.statusIcons}
                  fill='white'
                  name='close-circle-outline'
                />
              )}
            </View>
          </View>
          <View style={styles.overviewArrowsContainer}>
            <Pressable onPress={() => navigateToTraining('previous')}>
              <Icon
                name='arrow-ios-back'
                fill={theme['text-hint-color']}
                style={styles.overviewArrows}
              />
            </Pressable>
            <Pressable onPress={() => navigateToTraining('next')}>
              <Icon
                name='arrow-ios-forward'
                fill={theme['text-hint-color']}
                style={styles.overviewArrows}
              />
            </Pressable>
          </View>
        </Animatable.View>
      </Layout>
      {withMainOverview && (
        <>
          <WorkoutOverviewFooter
            activeWeek={activeWeek}
            activeDay={activeDay}
            navigation={navigation}
            type={type}
            itemCount={itemCount}
            dispatch={dispatch}
          />
          <View style={styles.overviewContainer}>
            <View style={styles.overviewWrapper}>
              <Pressable
                onPress={() =>
                  dispatch({
                    type: 'OPEN_INFO_SHEET',
                    infoType: 'trainingOverview',
                  })
                }
                style={styles.overviewButton}>
                <Text category='h3'>{type} </Text>
                <Icon
                  name='info-outline'
                  fill={theme['text-hint-color']}
                  style={styles.infoIcon}
                />
              </Pressable>
              {activeDay.status !== 'complete' && (
                <Pressable onPress={setShowExpanded}>
                  <Icon
                    name={`${showExpanded ? 'collapse' : 'expand'}-outline`}
                    fill={theme['text-hint-color']}
                    style={styles.expandIcon}
                  />
                </Pressable>
              )}
            </View>
            {activeDay?.status === 'complete' && (
              <View>
                <SmallButtonGroup items={smallButtonItems} />
                {largeButtons.map(({ title, description, fallback }) => (
                  <Layout
                    key={title}
                    level='4'
                    style={{
                      paddingVertical: 15,
                      paddingHorizontal: 15,
                      borderRadius: 10,
                      width: '100%',
                      marginBottom: 10,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.23,
                      shadowRadius: 1.62,

                      elevation: 4,
                    }}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('Notes Screen', {
                          notesType: title,
                          userNotes: description,
                        })
                      }>
                      <View style={{ flexDirection: 'row' }}>
                        <Text category='s1' style={{ marginBottom: 10 }}>
                          {title}
                        </Text>
                        <Icon
                          name='edit-outline'
                          fill={theme['text-basic-color']}
                          style={{ width: 18, height: 18, marginLeft: 5 }}
                        />
                      </View>
                      {description ? (
                        <Text category='h6' style={{ fontSize: 16 }}>
                          {description}
                        </Text>
                      ) : (
                        <Text
                          category='h6'
                          appearance='hint'
                          style={{ fontSize: 14 }}>
                          {fallback}
                        </Text>
                      )}
                    </Pressable>
                  </Layout>
                ))}
                <Text category='h4'>Performance</Text>
              </View>
            )}
          </View>
        </>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  expandIcon: { width: 25, height: 25 },
  infoIcon: { width: 20, height: 20, marginTop: 5 },
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  overviewWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewContainer: { paddingHorizontal: 15 },
  overviewArrows: { width: 30, height: 30, marginTop: 2, marginLeft: 30 },
  overviewArrowsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  statusIcons: { width: 50, height: 50 },
  dayText: { fontSize: 50, lineHeight: 50, marginRight: 5 },
  textWrapper: { flexDirection: 'row' },
  headerTextWrapper: { marginBottom: 5 },
  headerContainer: {
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerOuterWrapper: {
    paddingTop: 40,
    minHeight: 165,
  },
  container: { flex: 1 },
})
