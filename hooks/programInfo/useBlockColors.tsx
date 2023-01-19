import { useContext } from 'react'
import { useTheme } from '@ui-kitten/components'
import { ThemeContext } from '~/context/theme-context'

export const useBlockColors = () => {
  const theme = useTheme()

  return {
    bridgeOn: theme['color-skyBlue'],
    hypertrophyON: theme['color-navBlue'],
    strengthOn: theme['color-purple'],
    peakingOn: theme['color-pink'],
    inactiveBar: theme['block-color-inactive'],
  }
}
