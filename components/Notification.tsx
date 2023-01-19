import { memo } from 'react'
import { Platform, SafeAreaView, View } from 'react-native'
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components'

const NotificationContent = ({ title, description }) => {
  const styles = useStyleSheet(notificationStyles)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text category='s1' style={{ width: '100%' }}>
            {title}
          </Text>
          <Text category='p1'>{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default memo(NotificationContent)

const notificationStyles = StyleService.create({
  safeArea: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 1.62,

    elevation: 40,
  },
  container: {
    padding: 15,
    marginTop: Platform.OS === 'ios' ? 15 : 60,
    marginHorizontal: 15,
    borderRadius: 4,
    backgroundColor: 'color-primary-900',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 15,
    flexWrap: 'wrap',
    flex: 1,
    flexDirection: 'row',
  },
})
