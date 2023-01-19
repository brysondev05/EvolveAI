import { memo, useCallback } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Text, Icon, Button } from '@ui-kitten/components'
import CycleStructureChart from '~/components/CycleStructureChart'

const ProgramReviewContent = ({ theme, navigateToProgramReview }) => (
  <View style={styles.reviewProgramWrapper}>
    <Pressable
      onPress={navigateToProgramReview}
      style={styles.programReviewButton}>
      <Text category='c1' style={styles.reviewProgramCopy} appearance='hint'>
        Review programs{' '}
      </Text>
      <Icon
        name='chevron-right-outline'
        fill={theme['text-hint-color']}
        style={styles.rightIcon}
      />
    </Pressable>
  </View>
)

const ProgramReview = memo(ProgramReviewContent)

const MeetDayHeaderContent = ({
  openOverviewSheet,
  daysOut,
  theme,
  meetDate,
}) => (
  <View style={styles.daysOutWrapper}>
    <Pressable onPress={openOverviewSheet} style={styles.daysOutButton}>
      <Text category='h2'>{daysOut} Days Out</Text>
      <Icon
        name='info-outline'
        fill={theme['text-hint-color']}
        style={styles.infoIcon}
      />
    </Pressable>

    <Text category='s1' appearance='hint' style={styles.meetDate}>
      {meetDate}
    </Text>
  </View>
)

const MeetDayHeader = memo(MeetDayHeaderContent)
const DairyHeaderContent = ({
  meetDate,
  programIsLoaded,
  daysOut,
  activeWeek,
  theme,
  navigation,
  dispatch,
  setGraphType,
  graphType,
}) => {
  const openOverviewSheet = useCallback(
    () => dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'overview' }),
    []
  )
  const navigateToProgramReview = useCallback(
    () => navigation.navigate('ProgramReview'),
    []
  )
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerWrapper}>
        {typeof daysOut !== 'undefined' && (
          <MeetDayHeader
            daysOut={daysOut}
            meetDate={meetDate}
            theme={theme}
            openOverviewSheet={openOverviewSheet}
          />
        )}
        <View style={styles.graphButtonsWrapper}>
          <Button
            status={graphType === 'all' ? 'primary' : 'basic'}
            appearance='ghost'
            size='small'
            onPress={() => setGraphType('all')}>
            All
          </Button>

          <Button
            status={graphType === 'squat' ? 'primary' : 'basic'}
            appearance='ghost'
            size='small'
            onPress={() => setGraphType('squat')}>
            Squat
          </Button>
          <Button
            status={graphType === 'bench' ? 'primary' : 'basic'}
            appearance='ghost'
            size='small'
            onPress={() => setGraphType('bench')}>
            Bench
          </Button>
          <Button
            status={graphType === 'deadlift' ? 'primary' : 'basic'}
            appearance='ghost'
            size='small'
            onPress={() => setGraphType('deadlift')}>
            Deadlift
          </Button>
        </View>
        <View style={styles.cycleStructureWrapper}>
          {programIsLoaded && (
            <CycleStructureChart
              activeWeek={activeWeek && activeWeek?.startingWeek}
              graphType={graphType}
            />
          )}
        </View>
      </View>

      <ProgramReview
        navigateToProgramReview={navigateToProgramReview}
        theme={theme}
      />
    </View>
  )
}

export default memo(DairyHeaderContent)

const styles = StyleSheet.create({
  headerContainer: { flex: 1, paddingTop: 15, minHeight: 255 },
  headerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysOutWrapper: { justifyContent: 'center', alignItems: 'center' },
  daysOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 18,
  },
  infoIcon: { width: 25, height: 25, marginTop: 2, marginLeft: 5 },
  meetDate: { marginTop: 0, marginBottom: 0 },
  graphButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  cycleStructureWrapper: { width: '100%', minHeight: 150, marginTop: 5 },
  reviewProgramWrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 23,
    height: 38,
    width: 150,
  },
  programReviewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewProgramCopy: { textAlign: 'right' },
  rightIcon: { width: 22, height: 22, marginTop: 2 },
})
