import { useState, useEffect } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useWindowDimensions, View } from 'react-native'
import { isLoaded, isEmpty } from 'react-redux-firebase'

import { cycleGraphData } from '~/assets/data/cycleGraphData'
import { useTheme } from '@ui-kitten/components'
import moment from 'moment-timezone'
import CycleChart from './CycleStructureChart/CycleChart'
import { dateToDate } from '~/helpers/Dates'
import { blockColors } from '~/theme'

const getColor = (i, week) => {
  if (week[0] === 'H' || (week[0] === 'R' && week[1] === 'H')) {
    return blockColors['block-color-hypertrophy']
  }
  if (week[0] === 'S' || (week[0] === 'R' && week[1] === 'S')) {
    return blockColors['block-color-strength']
  }
  if (week[0] === 'P') {
    return blockColors['block-color-peaking']
  }
  if (week[0] === 'B') {
    return blockColors['block-color-bridge']
  }
  return blockColors['block-color-inactive']
}

export default function CycleStructureChart({
  activeWeek = 1,
  showFull = false,
  isProgramReview = false,
  graphType = 'all',
}) {
  const { width } = useWindowDimensions()
  const graphWidth = width + (isProgramReview ? -30 : 0)

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )
  const programBlocks = useTypedSelector(
    ({ firestore: { data } }) => data.programBlocks
  )

  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )

  const {
    volumeData: programVolumeData,
    cycleStructure: programCycle,
    programDetails: { userProgramData },
  } = userProgram || {
    volumeData: null,
    cycleStructure: null,
    programDetails: { userProgramData: null },
  }

  const [graph, setGraph] = useState([])
  const [intGraph, setIntGraph] = useState([])
  const [legend, setLegend] = useState([])
  const theme = useTheme()

  useEffect(() => {
    let i = 0
    if (
      isLoaded(programBlocks) &&
      !isEmpty(programBlocks) &&
      isLoaded(userProgram) &&
      !isEmpty(userProgram) &&
      programBlocks &&
      userProgram
    ) {
      const actualPeakWeeks = Math.ceil(
        +moment
          .tz(dateToDate(programCycle?.meetDate), userProgramData.timezone)
          .diff(
            moment.tz(
              dateToDate(programCycle?.peak.peakStart),
              userProgramData.timezone
            ),
            'weeks',
            true
          )
          .toFixed(2)
      )

      const fullStructure =
        userProgram?.cycleStructure &&
        Object.values(userProgram?.cycleStructure?.cycleStructure).sort(
          (a, b) => a.startingWeek - b.startingWeek
        )

      const newGraphData =
        fullStructure?.length > 0 &&
        fullStructure.reduce(
          (acc, item, index, arr) => {
            let cycleFullName = 'hypertrophy'
            let capitalName = 'Hypertrophy'
            let color = theme['block-color-hypertrophy']

            const { type, length, cycle } = item
            let firstBlock = cycle[0]
            let hasBridge = false
            if (type === 'B') {
              firstBlock = fullStructure[index + 1]?.cycle[0]
            }
            if (type === 'R' && fullStructure[index + 1]?.type === 'B') {
              firstBlock = fullStructure[index + 2]?.cycle[0]
              hasBridge = true
            } else if (type === 'R') {
              firstBlock = fullStructure[index + 1]?.cycle[0]
            }
            if (!firstBlock) {
              return acc
            }

            const blockVersion = firstBlock[firstBlock?.length - 1]

            switch (type) {
              case 'S':
                cycleFullName = 'strength'
                capitalName = 'Strength'
                color = theme['block-color-strength']
                break
              case 'P':
                cycleFullName = 'peaking'
                capitalName = 'Peaking'
                color = blockColors['block-color-peaking']
                break
              case 'B':
                cycleFullName = 'hypertrophy'
                capitalName = 'Bridge'
                color = theme['block-color-bridge']
                break
              case 'R':
                if (firstBlock[1] === 'S') {
                  cycleFullName = 'strength'
                  capitalName = 'Strength'
                  color = theme['block-color-strength']
                } else {
                  cycleFullName = 'hypertrophy'
                  capitalName = 'Hypertrophy'
                  color = theme['block-color-hypertrophy']
                }
                break
            }

            const blockExists =
              acc['legend']?.find((item) => item.type === type) ||
              item.type === 'R'
            if (!blockExists || blockExists?.length <= 0) {
              acc['legend'].push({
                type,
                name: capitalName,
                symbol: { fill: color, type: 'square' },
                labels: {
                  fill: theme['text-hint-color'],
                  fontSize: 12,
                },
              })
            }

            const cycleName = `${firstBlock[0]}${firstBlock[1]}_${blockVersion}_`

            const blockStatus = programBlocks[`Block${index}`]?.status

            const blockVolume =
              blockStatus === 'pending' || type === 'R'
                ? programVolumeData
                : programBlocks[`Block${index}`]?.volumeData

            const cycles = {
              squat: `${cycleName}${blockVolume?.squat[cycleFullName].periodization}`,
              bench: `${cycleName}${blockVolume?.bench[cycleFullName].periodization}`,
              deadlift: `${cycleName}${blockVolume?.deadlift[cycleFullName].periodization}`,
            }

            const squatFreq = blockVolume?.squat[cycleFullName].totalFreq
            const squatData = cycleGraphData?.[cycles?.squat]?.find((data) =>
              data.SQFrequency.includes(squatFreq)
            )
            const benchData = cycleGraphData?.[cycles?.bench]?.find((data) =>
              data.SQFrequency.includes(squatFreq)
            )
            const deadliftData = cycleGraphData?.[cycles?.deadlift]?.find(
              (data) => data.SQFrequency.includes(squatFreq)
            )

            cycle.forEach((week) => {
              const weekNumber =
                week[2] === 'T'
                  ? Math.max(Number(week[3]) - 2, 0)
                  : ['R', 'B'].includes(type)
                  ? 0
                  : Number(week[2]) - 1
              const squatVolume = squatData?.exactVolume[weekNumber] || 0
              const benchVolume = benchData?.exactVolume[weekNumber] || 0
              const deadliftVolume = deadliftData?.exactVolume[weekNumber] || 0

              const squatIntensity = squatData?.SQInt[weekNumber] || 0
              const benchIntensity = benchData?.BNInt[weekNumber] || 0

              const deadliftIntensity = deadliftData?.DLInt[weekNumber] || 0

              // const volume = +(squatVolume + benchVolume + deadliftVolume).toFixed(2)

              const getIntensity = () => {
                if (graphType === 'squat') {
                  return +squatIntensity.toFixed(2)
                }
                if (graphType === 'bench') {
                  return +benchIntensity.toFixed(2)
                }
                if (graphType === 'deadlift') {
                  return +deadliftIntensity.toFixed(2)
                }
                return +(
                  squatIntensity +
                  benchIntensity +
                  deadliftIntensity
                ).toFixed(2)
              }
              const getVolumeIntensity = () => {
                if (graphType === 'squat') {
                  return {
                    intensity: +squatIntensity.toFixed(2),
                    volume: +squatVolume.toFixed(2),
                  }
                }
                if (graphType === 'bench') {
                  return {
                    intensity: +benchIntensity.toFixed(2),
                    volume: +squatVolume.toFixed(2),
                  }
                }
                if (graphType === 'deadlift') {
                  return {
                    intensity: +deadliftIntensity.toFixed(2),
                    volume: +squatVolume.toFixed(2),
                  }
                }

                return {
                  intensity: +(
                    squatIntensity +
                    benchIntensity +
                    deadliftIntensity
                  ).toFixed(2),
                  volume: +squatVolume.toFixed(2),
                }
              }

              const { intensity, volume } = getVolumeIntensity()

              const yValues = () => {
                if (week[2] === 'T' && week[3] === '2') {
                  return {
                    volume: week[1] === 'H' ? volume * 0.85 : volume * 0.5,
                    intensity:
                      week[1] === 'H' ? intensity * 0.75 : intensity * 0.95,
                  }
                }
                if (week[2] === 'T' && week[3] === '1') {
                  return {
                    volume: week[1] === 'H' ? volume * 0.8 : volume * 0.4,
                    intensity:
                      week[1] === 'H' ? intensity * 0.7 : intensity * 0.9,
                  }
                }
                if (week[0] === 'R') {
                  const prepVolume =
                    week[1] === 'H' ? volume * 0.65 : volume * 0.3
                  const prepIntensity =
                    week[1] === 'H' ? intensity * 0.85 : intensity * 0.85
                  return {
                    volume: hasBridge ? prepVolume * 0.75 : prepVolume,
                    intensity: hasBridge ? prepIntensity * 0.75 : prepIntensity,
                  }
                }
                if (week[0] === 'B') {
                  const bridgeVolume =
                    cycleGraphData['B8_1_Bridge'][0].exactVolume[
                      Number(week[2]) - 1
                    ]
                  const bridgeIntensity =
                    cycleGraphData['B8_1_Bridge'][0].SQInt[Number(week[2]) - 1]

                  return {
                    volume: volume * bridgeVolume,
                    intensity: !['squat', 'bench', 'deadlift'].includes(
                      graphType
                    )
                      ? bridgeIntensity * 2.8
                      : bridgeIntensity * 0.94,
                  }
                }
                return {
                  volume,
                  intensity,
                }
              }
              const intensityData = {
                y: yValues().intensity,
                x: i,
              }
              const volumeData = {
                y: yValues().volume,
                volume,
                week,
                weekNumber,
                x: i,
                svg: {
                  fill: 'transparent',
                  fillActive: getColor(i, week),
                  stroke: getColor(i, week),
                },
              }

              if (
                week[0] === 'P' &&
                week[1] === week[2] &&
                Number(week[1]) <= actualPeakWeeks
              ) {
                if (Number(week[1]) < actualPeakWeeks) {
                  for (let k = 0; k < actualPeakWeeks - Number(week[1]); k++) {
                    const fauxWeekVolume = { ...volumeData, x: i + k + 1 }

                    acc['volumeData'].push(fauxWeekVolume)
                  }
                  acc['volumeData'].push(volumeData)
                  acc['intensityData'].push(intensityData)
                } else {
                  acc['volumeData'].push(volumeData)
                  acc['intensityData'].push(intensityData)
                }
              } else if (
                week[0] === 'P' &&
                Number(week[1]) > actualPeakWeeks &&
                Number(week[1]) - 1 === Number(week[2])
              ) {
                acc['volumeData'].push(volumeData)
                acc['intensityData'].push(intensityData)
              } else if (
                week[0] === 'P' &&
                Number(week[1]) > actualPeakWeeks &&
                week[1] === week[2]
              ) {
                return acc
              } else {
                acc['volumeData'].push(volumeData)
                acc['intensityData'].push(intensityData)
              }

              i++
            })
            return acc
          },
          { volumeData: [], intensityData: [], legend: [] }
        )

      if (newGraphData.volumeData && newGraphData.volumeData?.length > 0) {
        setGraph(newGraphData.volumeData)
        setIntGraph(newGraphData.intensityData)
        setLegend(newGraphData.legend)
      }
    }
  }, [programCycle, programBlocks, programWeeks, graphType])

  return (
    <View style={{ position: 'relative' }}>
      {graph?.length > 0 && (
        <CycleChart
          graphWidth={graphWidth}
          graph={graph}
          intGraph={intGraph}
          theme={theme}
          legend={legend}
          programWeeks={programWeeks}
          showFull={showFull}
          activeWeek={activeWeek}
          graphType={graphType}
        />
      )}
    </View>
  )
}
