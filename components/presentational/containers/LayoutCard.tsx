import { Layout, Text, useTheme } from '@ui-kitten/components'
import { useMemo } from 'react'
import { StyleSheet } from 'react-native'

const LayoutCard = ({
  children,
  level = '2',
  status = 'basic',
  style = {},
  pressedIn = false,
}) => {
  const theme = useTheme()

  const borderColor = useMemo(() => {
    switch (status) {
      case 'basic':
        return 'transparent'
      case 'primary':
        return theme['color-success-500']
      case 'danger':
        return theme['color-danger-500']
      default:
        return 'transparent'
    }
  }, [status])

  const shadow = useMemo(() => {
    switch (pressedIn) {
      case false:
        return {
          shadowColor: '#030303',
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
        }
      case true:
        return {
          shadowColor: theme['color-success-500'],
          shadowOffset: {
            width: 1,
            height: 2,
          },
          shadowOpacity: 0.63,
          shadowRadius: 5.62,
        }

      default:
        return {
          shadowColor: '#030303',
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
        }
    }
  }, [pressedIn])
  return (
    <Layout
      level={level}
      style={[styles.cardContainer, { borderColor, ...shadow, ...style }]}>
      {children}
    </Layout>
  )
}

export default LayoutCard

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    marginHorizontal: 0,
    marginTop: 15,
    // marginBottom: 25,
    borderRadius: 14,
    borderWidth: 2,

    // flex: 1,
  },
})
