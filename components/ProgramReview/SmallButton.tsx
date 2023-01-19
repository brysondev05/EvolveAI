import { Layout, Text } from '@ui-kitten/components'
import { StyleSheet } from 'react-native'

const SmallButton = ({
  title,
  description,
  isLarge = false,
  shortMarginBottom = false,
}) => {
  return (
    <Layout
      key={title}
      level='4'
      style={[
        styles.smallButton,
        {
          marginBottom: shortMarginBottom ? 5 : 10,
          width: isLarge ? '100%' : '49%',
        },
      ]}>
      <Text category='s1' style={{ marginBottom: 10 }}>
        {title}
      </Text>
      <Text category='h6'>{description}</Text>
    </Layout>
  )
}

export default SmallButton

const styles = StyleSheet.create({
  smallButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '49%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 1.62,

    elevation: 4,
  },
})
