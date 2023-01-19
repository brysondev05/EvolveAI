import { StyleSheet, View } from 'react-native'
import { useTheme, Layout, Text } from '@ui-kitten/components'
import { LinearGradient } from 'expo-linear-gradient'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'

export default function GradientHeader({
  title = '',
  subheading = '',
  filled = false,
  style = {},
  paddedTop = false,
  HeaderComponent = () => null,
  HeaderComponentObject = null,
}) {
  const theme = useTheme()
  const gradientColors = [
    theme['background-basic-color-1'],
    theme['background-basic-color-3'],
  ]
  const headingFontSize = useScaledFontSize(25)
  return (
    <Layout
      style={[
        filled ? styles.filledHeader : styles.notFilled,
        paddedTop ? { paddingTop: 120 } : null,
      ]}>
      <LinearGradient
        colors={gradientColors}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: filled ? 0.25 : 1,
          zIndex: -1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,

          elevation: 1,
        }}
      />
      <View style={{ zIndex: 10, elevation: 2 }}>
        <Text category='h1' style={{ fontSize: headingFontSize }}>
          {title}
        </Text>
        {subheading !== '' && (
          <Text category='s1' style={{ marginTop: 5 }}>
            {subheading}
          </Text>
        )}
        <HeaderComponent />
        {HeaderComponentObject}
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  filledHeader: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'transparent',
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,

    // elevation: 4,
    ...StyleSheet.absoluteFillObject,
  },
  notFilled: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 15,
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,

    // elevation: 4,
  },
})
