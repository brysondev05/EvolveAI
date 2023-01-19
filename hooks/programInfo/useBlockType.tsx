import { useState, useEffect } from 'react';
import { useBlockColors } from './useBlockColors'

export const useBlockType = ({ blockType }) => {
  const colors = useBlockColors()
  const [blockName, setBlockName] = useState('')
  const [blockColor, setBlockColor] = useState(colors.inactiveBar)

  let name = ''
  let color = colors.inactiveBar
  useEffect(() => {
    if (blockType) {
      const blockPeriodization = blockType[0]

      if (blockPeriodization === 'B') {
        name = `Bridge`
        color = colors.bridgeOn
      }
      if (blockPeriodization === 'R') {
        name = `Preparatory`
        color = blockType[1] === 'H' ? colors.hypertrophyON : colors.strengthOn
      }
      if (blockPeriodization === 'H') {
        name = `Hypertrophy`
        color = colors.hypertrophyON
      }
      if (blockPeriodization === 'S') {
        name = `Strength`
        color = colors.strengthOn
      }
      if (
        blockPeriodization === 'P' ||
        blockPeriodization === 'F' ||
        blockType === 'FinalPhase'
      ) {
        name = `Peaking`
        color = colors.peakingOn
      }
    }

    setBlockName(name)
    setBlockColor(color)
  }, [blockType])
  return {
    blockName,
    blockColor,
  }
}
