import { Layout, Text, Icon } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import { useBlockColors } from '~/hooks/programInfo/useBlockColors'
import LargeButtonItem from './LargeButtonItem'

const LargeButtonGroup = ({ title, items }) => {
  const colors = useBlockColors()
  return (
    <Layout level='4' style={styles.largeButton}>
      <Text category='s1' style={styles.buttonText}>
        {title}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'flex-end',
        }}>
        {items.map(LargeButtonItem)}
      </View>
    </Layout>
  )
}

export default LargeButtonGroup

const styles = StyleSheet.create({
  buttonText: { marginBottom: 10 },
  largeButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 1.62,

    elevation: 4,
    marginBottom: 10,
  },
})
