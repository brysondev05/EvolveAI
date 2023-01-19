import { Text } from '@ui-kitten/components'
import { Pressable, StyleSheet, View } from 'react-native'
import { useBlockColors } from '~/hooks/programInfo/useBlockColors'
import LargeButtonGroup from './ProgramReview/LargeButtonGroup'

const getFreq = (frequency) => {
  if (frequency % 1 === 0) {
    return frequency
  }
  return `${Math.floor(frequency)}-${Math.ceil(frequency)}`
}
const MovementOverview = ({
  type,
  movementDetails = {},
  volumeData,
  navigation,
  isBlockReview = false,
  isAccessory = false,
  seeMore = true,
}) => {
  const colors = useBlockColors()

  const frequencyDataItems = [
    {
      title: 'Hypertrophy',
      description: `${volumeData.hypertrophy.freq}x`,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: `${volumeData.strength.freq}x`,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: `${volumeData.peaking.freq}x`,

      descriptionColor: colors.peakingOn,
    },
  ]
  const periodizationDataItems = [
    {
      title: 'Hypertrophy',
      description: volumeData.hypertrophy.periodization,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: volumeData.strength.periodization,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: volumeData.peaking.periodization,

      descriptionColor: colors.peakingOn,
    },
  ]
  const volumeDataItems = [
    {
      title: 'Hypertrophy',
      description: `${volumeData.hypertrophy.MEV} / ${volumeData.hypertrophy.MRV}`,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: `${volumeData.strength.MEV} / ${volumeData.strength.MRV}`,
      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: `${volumeData.peaking.MEV} / ${volumeData.peaking.MRV}`,
      descriptionColor: colors.peakingOn,
    },
  ]

  return (
    <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 5,
        }}>
        <Text category='h4'>{type}</Text>
        {!isBlockReview && !isAccessory && seeMore && (
          <Pressable
            onPress={() =>
              navigation.navigate('Movement Overview', {
                type,
                movementDetails,
                volumeData,
              })
            }>
            <Text status='primary' category='s1'>
              See More
            </Text>
          </Pressable>
        )}
      </View>

      {/* <SmallButtonGroup items={smallButtonGroupItems} /> */}
      <LargeButtonGroup title='MEV / MRV' items={volumeDataItems} />
      {!isAccessory && (
        <LargeButtonGroup title='Frequency' items={frequencyDataItems} />
      )}
      {!isAccessory && (
        <LargeButtonGroup
          title='Periodization'
          items={periodizationDataItems}
        />
      )}
    </View>
  )
}

export default MovementOverview
