import { useMemo, useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Layout, Icon, Text, StyleService, useStyleSheet } from '@ui-kitten/components'
import DairyHeader from './DairyHeader'
import WeekTitle from '../WeekTitle'
import DiaryItem from './DiaryItem'
import moment from 'moment-timezone'
import EndOfWeekButton from './EndOfWeekButton'
import { useDispatch } from 'react-redux'

const DiaryItems = ({
  day,
  index,
  activeWeek,
  timezone,
  navigation,
  navigateToTraining,
}) => {
  const date = useMemo(
    () =>
      moment
        .tz(activeWeek.expectedDate, 'MM/DD/YY', timezone)
        .add(index, 'days')
        .format('LL'),
    [activeWeek.expectedDate]
  )

  const handleMeetDayNavigate = useCallback(
    () => navigation.navigate('Meet Day'),
    []
  )

  if (['disabled', 'off'].includes(day)) {
    return (
      <DiaryItem
        disabled
        handleNavigate={navigateToTraining}
        activeWeekStatus={activeWeek.status}
        key={index}
        index={index}
        status={day}
        date={date}
      />
    )
  }

  if (activeWeek?.blockType === 'FinalPhase' && day === 'comp') {
    return (
      <DiaryItem
        key={index}
        activeWeekStatus={activeWeek.status}
        index={index}
        status={day}
        handleNavigate={handleMeetDayNavigate}
        isMeetDay={true}
        date={date}
      />
    )
  }
  if (activeWeek?.blockType === 'FinalPhase') {
    return (
      <DiaryItem
        key={index}
        index={index}
        status={day}
        activeWeekStatus={activeWeek.status}
        handleNavigate={navigateToTraining}
        isFinalPhase
        date={date}
      />
    )
  }
  return (
    <DiaryItem
      key={index}
      activeWeekStatus={activeWeek.status}
      index={index}
      status={day}
      handleNavigate={navigateToTraining}
      date={date}
    />
  )
}

export const Diary = ({
  navigation,
  programIsLoaded,
  activeWeek,
  theme,
  meetDate,
  formattedMeetDate,
  blockColor,
  blockName,
  handleWeekChange,
  colors,
  timezone,
  navigateToTraining,
  pendingDays,
  handleEndOfWeek,
  blockStatus,
}) => {
  const dispatch = useDispatch()
  const [graphType, setGraphType] = useState('all')
  const styles = useStyleSheet(themedStyles)

  const navigateToBlockReview = useCallback(
    () =>
      navigation.navigate('BlockReview', {
        currentBlock: activeWeek?.cycleID,
        isNewBlockScreen: false,
      }),
    [activeWeek?.cycleID]
  )

  return (
    <Layout
      level='2'
      style={[
        styles.diaryWrapper,
        { paddingBottom: 50, marginTop: 15, paddingTop: 15 },
      ]}>
      <DairyHeader
        dispatch={dispatch}
        daysOut={meetDate}
        meetDate={formattedMeetDate}
        programIsLoaded={programIsLoaded}
        activeWeek={activeWeek}
        theme={theme}
        navigation={navigation}
        graphType={graphType}
        setGraphType={setGraphType}
      />

      {typeof activeWeek !== 'undefined' && activeWeek?.blockType && (
        <>
          <WeekTitle
            activeWeek={activeWeek}
            blockColor={blockColor}
            blockName={blockName}
            handleWeekChange={handleWeekChange}
            colors={colors}
          />
          {blockStatus === 'complete' && (
            <Pressable
              onPress={navigateToBlockReview}
              style={styles.blockReviewButton}>
              <Text category='s1' appearance='hint'>
                Review Block{' '}
              </Text>
              <Icon
                name='chevron-right-outline'
                fill={theme['text-hint-color']}
                style={styles.rightIcon}
              />
            </Pressable>
          )}

          {typeof activeWeek.trainingDayStatus !== 'undefined' &&
            activeWeek?.trainingDayStatus &&
            activeWeek?.trainingDayStatus.map((day, index) => (
              <DiaryItems
                key={index}
                day={day}
                index={index}
                activeWeek={activeWeek}
                timezone={timezone}
                navigation={navigation}
                navigateToTraining={navigateToTraining}
              />
            ))}
        </>
      )}

      <EndOfWeekButton
        activeWeek={activeWeek}
        navigation={navigation}
        pendingDays={pendingDays}
        handleEndOfWeek={handleEndOfWeek}
      />
    </Layout>
  )
}

// const Diary = React.memo(DiaryContent)
export default Diary

const themedStyles = StyleService.create({
  container: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  menu: {
    flex: 1,
    margin: 8,
  },
  diaryWrapper: {
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.38,
    shadowRadius: 20.0,
    zIndex: 5000,
    position: 'relative',
    elevation: 15,
    flexGrow: 1,
  },
  diaryPullTab: {
    width: 100,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'color-basic-500',
    marginBottom: 15,
    alignSelf: 'center',
    marginTop: 10,
  },
  rightIcon: { width: 22, height: 22, marginTop: 2 },
  blockReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
})
