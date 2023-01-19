import * as Haptics from 'expo-haptics'
import { BlurView } from 'expo-blur'
import { StyleSheet, Pressable } from 'react-native'
import { Icon } from '@ui-kitten/components'
export const ModalHeader = ({
  navigation,
  title,
  headerTransparent = false,
  blurHeader = false,
}) => {
  const handleBack = () => {
    Haptics.selectionAsync()
    navigation.goBack()
  }
  const mainHeader = {
    headerTitle: title,
    headerStyle: {},
    headerLeftContainerStyle: {
      display: 'none',
    },
    headerTitleStyle: {},
    headerBackgroundContainerStyle: {},
    headerBackTitleVisible: false,
    headerLeftLabelVisible: false,
    headerTransparent,

    headerRight: () => (
      <Pressable style={{ marginRight: 15, padding: 15 }} onPress={handleBack}>
        <Icon name='close-outline' width={25} height={25} fill='white' />
      </Pressable>
    ),
    headerLeft: () => null,
  }
  if (blurHeader) {
    mainHeader.headerBackground = () => (
      <BlurView tint='dark' intensity={80} style={StyleSheet.absoluteFill} />
    )
  }
  return mainHeader
}
