import { memo, useMemo } from 'react'

import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Pressable, View } from 'react-native'
import { Text, Icon, useTheme } from '@ui-kitten/components'
import { VictoryChart, VictoryArea, VictoryAxis } from 'victory-native'
import { useDispatch } from 'react-redux'
import { round } from '~/helpers/Calculations'
import { dateToDate } from '~/helpers/Dates'
import { useDimensions } from '~/hooks/utilities/useDimensions'
import { useBlockColors } from '~/hooks/programInfo/useBlockColors'

const ReadinessHeaderContent = ({ dispatch, hintColor }) => {
  const theme = useTheme()

  return (
    <Pressable
      onPress={() => dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'readiness' })}
      style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1000 }}>
      <Text category='h6'>Readiness</Text>
      <Icon
        style={{ width: 16, height: 16, marginLeft: 3, marginTop: 3 }}
        fill={theme['text-hint-color']}
        name='info-outline'
      />
    </Pressable>
  )
}

const ReadinessHeader = memo(ReadinessHeaderContent)
const HoldingContent = ({ dispatch, hintColor }) => (
  <View style={{ paddingLeft: 15, marginBottom: 20, minHeight: 150 }}>
    <ReadinessHeader dispatch={dispatch} hintColor={hintColor} />

    <View style={{ justifyContent: 'center', flex: 1 }}>
      <Text
        category='p1'
        style={{ textAlign: 'center', paddingHorizontal: 30, opacity: 0.8 }}
        appearance='hint'>
        Readiness still calculating, complete 3 workouts to get your first
        score.
      </Text>
    </View>
  </View>
)

const Holding = memo(HoldingContent)

const ReadinessGraphContent = ({ scores, hintColor, windowHeight }) => {
  const colors = useBlockColors()

  return (
    <View>
      <VictoryChart
        height={windowHeight * 0.2}
        padding={{ top: 20, bottom: 30, left: 3, right: 3 }}
        domainPadding={{ x: 0, y: 10 }}
        scale={{ x: 'time' }}>
        <GradientTwo />

        <VictoryArea
          style={{
            data: {
              fill: 'url(#gradientTwo)',
              stroke: colors.peakingOn,
              strokeWidth: 3,
            },
          }}
          data={scores}
          x='date'
          y='score'
          scale={{ x: 'time' }}
          domainPadding={{ x: 0 }}
          animate={{
            duration: 2000,
            onLoad: { duration: 1000 },
          }}
          interpolation='monotoneX'
        />
        <VictoryAxis
          tickCount={4}
          style={{
            axis: { stroke: hintColor },
            axisLabel: { fontSize: 16, padding: 30 },

            ticks: { stroke: hintColor, size: 5 },
            tickLabels: {
              fontSize: 12,
              padding: 5,
              fill: hintColor,
            },
          }}
        />
      </VictoryChart>
    </View>
  )
}

const ReadinessGraph = memo(ReadinessGraphContent)

const GradientTwo = memo(() => {
  const colors = useBlockColors()

  return (
    <Defs key={'gradient'}>
      <LinearGradient
        gradientUnits='userSpaceOnUse'
        id={'gradientTwo'}
        x1={'0'}
        y={'0'}
        x2={'0'}
        y2={'100%'}>
        <Stop offset={'0%'} stopColor={colors.peakingOn} stopOpacity={0.9} />
        <Stop offset={'20%'} stopColor={colors.peakingOn} stopOpacity={0.5} />

        <Stop offset={'80%'} stopColor={colors.peakingOn} stopOpacity={0} />
      </LinearGradient>
    </Defs>
  )
})

const getScores = (programWeeks) => {
  if (!isLoaded(programWeeks) || isEmpty(programWeeks)) {
    return []
  }
  const scores = Object.values(programWeeks)
    .reduce((acc, item, accIndex) => {
      const programIndex = item?.programIndex || 0

      item?.readinessScores?.forEach((entry, index, arr) => {
        const entryDate = dateToDate(entry?.date)?.toLocaleDateString('en-US')
        if (!entryDate) {
          return
        }

        const previousDate =
          index > 0 && acc[acc?.length - 1]?.date?.toLocaleDateString('en-US')

        if (index === 0 || (previousDate && entryDate !== previousDate)) {
          // const {squat, bench, deadlift, upperPull, date} = entry
          // const score = programIndex !== 1 ? squat + bench + deadlift + 11.5 : round(((squat + bench + deadlift + upperPull) / 4) * 3 + 11.5, 0.01)
          const { date, ...rest } = entry

          const scores = Object.values(rest).filter(
            (scoreNum: number) => !isNaN(scoreNum)
          )

          const score =
            (scores.reduce((acc: number, score: number) => acc + score, 0) /
              scores.length) *
              3 +
            11.5

          acc.push({
            score: score,
            date: dateToDate(entry.date) || new Date(),
          })
        }
      })

      return acc
    }, [])
    .sort((a, b) => a.date - b.date)

  return scores
}
export default function OverviewGraph() {
  const theme = useTheme()

  const dispatch = useDispatch()

  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )

  const scores = useMemo(() => getScores(programWeeks), [programWeeks])

  const { window } = useDimensions()

  const hintColor = theme['color-basic-600']

  const currentReadiness = useMemo(
    () => scores && scores[scores?.length - 1]?.score.toFixed(2),
    [scores]
  )
  // const currentReadiness = null
  if (!isLoaded(programWeeks) || isEmpty(programWeeks) || scores?.length < 3) {
    return <Holding dispatch={dispatch} hintColor={hintColor} />
  }

  return (
    <View>
      <View style={{ paddingLeft: 15, marginBottom: 20 }}>
        <ReadinessHeader dispatch={dispatch} hintColor={hintColor} />

        <Text
          category='h1'
          style={{ fontSize: 100, position: 'absolute', top: 5, left: 10 }}>
          {currentReadiness}
        </Text>
      </View>

      <ReadinessGraph
        scores={scores}
        hintColor={hintColor}
        windowHeight={window.height}
      />
    </View>
  )
}
