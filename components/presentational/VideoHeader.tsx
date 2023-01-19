import { useContext } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import { useTheme, Layout, Text, Icon } from '@ui-kitten/components'
import { ThemeContext } from '~/context/theme-context'
import { LinearGradient } from 'expo-linear-gradient'
import { hexToRgbA } from '~/helpers/Strings'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'

export default function VideoHeader({
  title = '',
  subheading = '',
  filled = false,
  connectionType,
  playVideo,
  setPlayVideo,
}) {
  const fontSize = useScaledFontSize(21)

  const theme = useTheme()
  const themeContext = useContext(ThemeContext)
  const gradientColors =
    themeContext.theme === 'light'
      ? [theme['background-basic-color-1'], theme['background-basic-color-4']]
      : [theme['background-basic-color-1'], theme['background-basic-color-3']]

  const background1 = hexToRgbA(theme['background-basic-color-1'], 1)
  const background2 = hexToRgbA(theme['background-basic-color-1'], 0.2)
  const background3 = hexToRgbA(theme['background-basic-color-1'], 0)

  return (
    <Layout style={filled ? styles.filledHeader : styles.notFilled}>
      <LinearGradient
        colors={[background3, background2, background1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        start={[0, 0.5]}
        end={[0, 1]}
      />
      <View style={styles.titleContainer}>
        <Text category='h1' style={{ fontSize, flex: 1 }}>
          {title}
        </Text>
        {connectionType === 'cellular' && (
          <Pressable onPress={() => setPlayVideo(!playVideo)}>
            <Icon
              style={{ width: 35, height: 35, paddingHorizontal: 40 }}
              fill={theme['text-basic-color']}
              name='play-circle-outline'
            />
          </Pressable>
        )}
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledHeader: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'transparent',
    ...StyleSheet.absoluteFillObject,
  },
  notFilled: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 15,
  },
})
