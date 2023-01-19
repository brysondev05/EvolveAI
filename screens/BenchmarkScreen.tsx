import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Text, Layout, Button, useTheme } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'

import { capitalizeFullString } from '~/helpers/Strings'
import { updateBenchmark } from '~/reduxStore/actions/programActions'
import GradientHeader from '~/components/presentational/GradientHeader'
import { ScrollView } from 'react-native-gesture-handler'

const benchmark1Options = ['1@7', '1@8', '3@8', '3@9', '5@8', '5@9', 'NONE']
const benchmark2Options = ['AMRAP', '3@8', '3@9', '5@8', '5@9', 'NONE']

const emptyBenchmark = 'NONE'

const benchmark1Default = { strength: '1@8', hypertrophy: '5@8' }
const benchmark2Default = emptyBenchmark

// key is benchmark1
const validBenchmark2Options: Record<string, string[]> = {
  '1@7': ['AMRAP', '3@8', '3@9', '5@8', '5@9', 'NONE'],
  '1@8': ['AMRAP', '3@8', '3@9', '5@8', '5@9', 'NONE'],
  '3@8': ['AMRAP', '5@8', '5@9', 'NONE'],
  '3@9': ['AMRAP', '5@8', '5@9', 'NONE'],
  '5@8': ['AMRAP', '5@9', 'NONE'],
  '5@9': ['AMRAP', 'NONE'],
  NONE: ['NONE'],
}

const validateBenchmarkBlock = (
  block: string
): block is 'strength' | 'hypertrophy' => {
  if (block === 'strength' || block === 'hypertrophy') {
    return true
  }

  return false
}

export default function BenchmarkScreen({ navigation, route }) {
  const { exerciseID, exerciseName, block, previousBenchmark } = route.params

  const theme = useTheme()

  if (!validateBenchmarkBlock(block)) {
    throw new Error('Unknown workout block')
  }

  const [benchmark1, setBenchmark1] = useState(
    previousBenchmark.first ?? emptyBenchmark
  )
  const [benchmark2, setBenchmark2] = useState(
    previousBenchmark.second ?? emptyBenchmark
  )

  const handleChangeBenchmark1 = (value: string) => {
    setBenchmark1(value)

    if (!validBenchmark2Options[value].includes(benchmark2)) {
      setBenchmark2(benchmark2Default)
    }
  }

  const handleReset = () => {
    setBenchmark1(benchmark1Default[block])
    setBenchmark2(benchmark2Default)
  }

  const dispatch = useDispatch()
  const update = async () => {
    try {
      await dispatch(
        updateBenchmark({
          exerciseID,
          block,
          firstBenchmark: benchmark1 !== emptyBenchmark ? benchmark1 : null,
          secondBenchmark: benchmark2 !== emptyBenchmark ? benchmark2 : null,
        })
      )
      navigation.goBack()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Layout style={{ flex: 1 }}> 
      <ScrollView 
        bounces={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}>
      <GradientHeader
        title={`Update ${exerciseName} ${capitalizeFullString(
          block
        )} Benchmarks`}
      />
      <Layout level='2'>
        <View
          style={{
            padding: 16,
          }}>
          <View
            style={{
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text appearance='hint' category='label'>
              Benchmark 1
            </Text>
            <View style={{ paddingLeft: 16 }}>
              <Text
                category='c1'
                style={{ color: theme['color-primary-500'] }}
                onPress={() => handleReset()}>
                Reset to Default
              </Text>
            </View>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            {benchmark1Options.map((option) => (
              <View style={{ marginRight: 16, marginBottom: 22 }} key={option}>
                <Button
                  size='small'
                  style={{ width: 72 }}
                  appearance={benchmark1 === option ? 'filled' : 'outline'}
                  onPress={() => handleChangeBenchmark1(option)}>
                  {option}
                </Button>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 18, marginBottom: 16 }}>
            <Text appearance='hint' category='label'>
              Benchmark 2
            </Text>
          </View>

          {benchmark2 !== benchmark2Default ? (
            <View style={{ marginBottom: 24 }}>
              <Text category='c1'>
                WARNING! Setting a second benchmark may potentially cause a
                daily stress index above the recommended threshold.
              </Text>
            </View>
          ) : null}

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            {benchmark2Options.map((option) => (
              <View style={{ marginRight: 16, marginBottom: 22 }} key={option}>
                <Button
                  size='small'
                  style={{
                    width: 72,
                    paddingHorizontal: option === 'AMRAP' ? 0 : undefined, // to fit
                  }}
                  appearance={benchmark2 === option ? 'filled' : 'outline'}
                  onPress={() => setBenchmark2(option)}
                  disabled={
                    !validBenchmark2Options[benchmark1].includes(option)
                  }>
                  {option}
                </Button>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 22 }}>
          <Button onPress={() => update()}>
            {`Update ${capitalizeFullString(block)} Benchmarks`}
          </Button>
        </View>
      </Layout>
      </ScrollView>
    </Layout>
  )
}
