import { StyleSheet, Text, View } from 'react-native'
import SmallButton from './SmallButton'

const SmallButtonGroup = ({ items, shortMarginBottom = false }) => {
  return (
    <View style={styles.smallButtonGroupWrapper}>
      {items.map((item) => SmallButton({ ...item, shortMarginBottom }))}
    </View>
  )
}

export default SmallButtonGroup

const styles = StyleSheet.create({
  smallButtonGroupWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
})
