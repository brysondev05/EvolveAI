import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native'
import { Icon, useTheme } from '@ui-kitten/components'

const DrawIconOpenerContent = ({ navigation }) => {
  const theme = useTheme()
  const toggleDrawer = () => navigation.toggleDrawer()
  return (
    <Pressable onPress={toggleDrawer} style={styles.button}>
      <Icon
        style={styles.icon}
        fill={theme['text-primary-color']}
        name='more-horizontal-outline'
      />
    </Pressable>
  )
}

export const DrawIconOpener = memo(DrawIconOpenerContent)
const styles = StyleSheet.create({
  button: {
    marginRight: 15,
    // backgroundColor: theme['background-basic-color-2'],
    borderRadius: 20,
    padding: 2.5,
  },
  icon: { width: 30, height: 30 },
})
