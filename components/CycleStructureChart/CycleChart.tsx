import { memo } from 'react'
import { View, Text } from 'react-native'
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryLabel,
  VictoryAxis,
  VictoryLegend,
  VictoryContainer,
  VictoryBar,
} from 'victory-native'

const CycleChart = ({
  graphWidth,
  graph,
  intGraph,
  theme,
  legend,
  programWeeks,
  showFull,
  activeWeek,
  graphType,
}) => {
  return (
    <View style={{ paddingTop: 30, position: 'relative', flexGrow: 1 }}>
      <View style={{ position: 'absolute', top: 0, width: '100%' }}>
        <VictoryChart
          width={graph?.length > 12 ? graphWidth : graphWidth * 0.95}
          height={100}
          padding={{ left: 20, right: 20 }}
          domainPadding={{ y: 5 }}
          maxDomain={{
            y: ['squat', 'bench', 'deadlift'].includes(graphType) ? 10 : 30,
          }}
          minDomain={{
            y: ['squat', 'bench', 'deadlift'].includes(graphType) ? 6 : 18,
          }}>
          <VictoryLine
            data={intGraph}
            style={{
              data: {
                stroke: theme['text-hint-color'],
                strokeOpacity: 0.7,
                strokeWidth: 2,
                strokeDashoffset: 4,
                strokeDasharray: 1.5,
              },
            }}
            interpolation='monotoneX'
            animate={{
              duration: 1000,
              onLoad: { duration: 2000 },
            }}
          />
          <VictoryScatter
            data={[
              {
                x: intGraph[Math.round(intGraph?.length * 0.75) - 1].x,
                y: intGraph[Math.round(intGraph?.length * 0.75) - 1].y,
              },
            ]}
            labels={['Intensity']}
            size={3}
            animate={{
              duration: 1000,
              onLoad: { duration: 2000 },
            }}
            style={{
              data: {
                fill: theme['text-hint-color'],
                strokeWidth: 1,
              },
            }}
            labelComponent={
              <VictoryLabel
                verticalAnchor='start'
                dy={-15}
                dx={5}
                textAnchor='end'
                style={{
                  fill: theme['text-hint-color'],

                  fontSize: 10,
                }}
              />
            }
          />
          <VictoryAxis
            label=''
            style={{
              axis: { stroke: 'transparent' },
              axisLabel: { stroke: 'transparent' },
              // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: 'transparent' },
            }}
          />
        </VictoryChart>
      </View>
      <VictoryChart
        width={graph?.length > 12 ? graphWidth : graphWidth * 0.95}
        height={120}
        padding={{ top: 25, bottom: 30, left: 20, right: 20 }}>
        <VictoryLegend
          containerComponent={<VictoryContainer responsive={true} />}
          x={15}
          y={95}
          orientation='horizontal'
          gutter={20}
          data={legend}
        />
        <VictoryBar
          alignment='middle'
          cornerRadius={1}
          barRatio={0.8}
          //   padding={{ top: 5, bottom: 5, left: 30, right: 30 }}
          style={{
            data: {
              fill: ({ datum, index }) => {
                if (
                  (programWeeks && index <= activeWeek - 1) ||
                  (programWeeks &&
                    programWeeks?.[`week${activeWeek}`]?.blockType ===
                      'FinalPhase') ||
                  showFull
                ) {
                  return datum.svg?.fillActive
                }
                return datum.svg?.fill
              },
              stroke: ({ datum }) => datum.svg?.stroke,
              strokeOpacity: 0.8,
              strokeWidth: 1,
            },
          }}
          animate={{
            duration: 200,
            onLoad: { duration: 1000 },
          }}
          data={graph}
        />

        <VictoryAxis
          label=''
          style={{
            axis: { stroke: 'transparent' },
            axisLabel: { stroke: 'transparent' },
            // grid: {stroke: ({ tick }) => tick > 0.5 ? "red" : "grey"},
            ticks: { stroke: 'transparent' },
            tickLabels: { fill: 'transparent' },
          }}
        />
      </VictoryChart>
    </View>
  )
}

export default memo(CycleChart)
