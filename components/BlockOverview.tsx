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
const BlockOverview = ({
  type,
  movementDetails = {},
  thisBlockVolumeData,
  nextBlockVolumeData,
  navigation,
  isAccessory = false,
}) => {
  const colors = useBlockColors()

  const frequencyDataItems = !isAccessory && [
    {
      title: 'Hypertrophy',
      thisBlock: `${thisBlockVolumeData?.hypertrophy.freq}x`,
      nextBlock: `${nextBlockVolumeData?.hypertrophy.freq}x`,

      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      thisBlock: `${thisBlockVolumeData?.strength.freq}x`,
      nextBlock: `${nextBlockVolumeData?.strength.freq}x`,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      thisBlock: `${thisBlockVolumeData?.peaking.freq}x`,
      nextBlock: `${nextBlockVolumeData?.peaking.freq}x`,

      descriptionColor: colors.peakingOn,
    },
  ]
  const periodizationDataItems = !isAccessory && [
    {
      title: 'Hypertrophy',
      thisBlock: thisBlockVolumeData.hypertrophy.periodization,
      nextBlock: nextBlockVolumeData.hypertrophy.periodization,

      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      thisBlock: thisBlockVolumeData.strength.periodization,
      nextBlock: nextBlockVolumeData.strength.periodization,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      thisBlock: thisBlockVolumeData.peaking.periodization,
      nextBlock: nextBlockVolumeData.peaking.periodization,

      descriptionColor: colors.peakingOn,
    },
  ]
  const volumeDataItems = [
    {
      title: 'Hypertrophy',
      thisBlock: `${thisBlockVolumeData.hypertrophy.MEV} / ${thisBlockVolumeData.hypertrophy.MRV}`,
      nextBlock: `${nextBlockVolumeData.hypertrophy.MEV} / ${nextBlockVolumeData.hypertrophy.MRV}`,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      thisBlock: `${thisBlockVolumeData.strength.MEV} / ${thisBlockVolumeData.strength.MRV}`,
      nextBlock: `${nextBlockVolumeData.strength.MEV} / ${nextBlockVolumeData.strength.MRV}`,
      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      thisBlock: `${thisBlockVolumeData.peaking.MEV} / ${thisBlockVolumeData.peaking.MRV}`,
      nextBlock: `${nextBlockVolumeData.peaking.MEV} / ${nextBlockVolumeData.peaking.MRV}`,
      descriptionColor: colors.peakingOn,
    },
  ]

  return (
    <View style={{ paddingHorizontal: 15, marginTop: 30 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 5,
        }}>
        <Text category='h4'>{type}</Text>
      </View>

      {/* <SmallButtonGroup items={smallButtonGroupItems} /> */}
      <LargeButtonGroup title='MEV / MRV' items={volumeDataItems} />
      {!isAccessory && (
        <>
          <LargeButtonGroup title='Frequency' items={frequencyDataItems} />
          <LargeButtonGroup
            title='Periodization'
            items={periodizationDataItems}
          />
        </>
      )}
    </View>
  )
}

export default BlockOverview
