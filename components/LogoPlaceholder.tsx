import { Text, useTheme, TextProps } from '@ui-kitten/components'
import { Image } from 'react-native'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'

export const LogoPlaceholder: React.FC<
  TextProps & { scaledFontSize?: number }
> = ({ category = 'h1', style, scaledFontSize = 18, ...props }) => {
  const theme = useTheme()
  const fontSize = useScaledFontSize(scaledFontSize)

  const baseStyles = { fontSize }
  const evolveStyles = Object.assign({}, baseStyles, style)
  const AIStyles = Object.assign(
    {},
    baseStyles,
    { color: theme['color-secondary-500'] },
    style
  )

  return (
    // <Text category={category} style={evolveStyles} {...props}>
    //   Evolve
    //   <Text category={category} style={AIStyles} {...props}>
    //     AI
    //   </Text>
    // </Text>

    <Image
      style={{ width: scaledFontSize * 5, height: scaledFontSize * 2.4 }}
      resizeMode={'contain'}
      source={require('../assets/images/logo.png')}
    />
  )
}
