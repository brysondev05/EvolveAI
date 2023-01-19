import { View, StyleSheet } from 'react-native'
import {
  StyleService,
  Text,
  useStyleSheet,
  useTheme,
  Icon,
  Divider,
} from '@ui-kitten/components'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'

const MenuItem = ({
  navigation,
  linkTo,
  heading = '',
  subheading = '',
  action = null,
  hasProgram = true,
}) => {
  const theme = useTheme()
  const styles = useStyleSheet(themedStyles)
  const dispatch = useDispatch()
  return (
    <View>
      <TouchableHighlight
        style={styles.container}
        onPress={() => {
          if (!hasProgram) {
            return dispatch(
              showErrorNotification({
                title: 'Error',
                description:
                  'You do not currently have a program. Please create a new program first. If you believe this is a mistake please try restarting.',
              })
            )
          }
          if (action) {
            action(navigation)
          } else {
            navigation.navigate(linkTo)
          }
        }}>
        <View style={styles.contentWrapper}>
          <View>
            <Text category='h5'>{heading}</Text>
            {subheading !== '' && (
              <Text category='s1' appearance='hint'>
                {subheading}
              </Text>
            )}
          </View>
          <Icon
            style={styles.forwardIcon}
            fill={theme['text-hint-color']}
            name='arrow-forward-outline'
          />
        </View>
      </TouchableHighlight>
      <Divider style={styles.divider} />
    </View>
  )
}

export default MenuItem

const themedStyles = StyleService.create({
  forwardIcon: { width: 25, height: 25, marginLeft: 5 },
  container: {
    //   flex: 1,

    backgroundColor: 'background-basic-color-2',
  },
  contentWrapper: {
    backgroundColor: 'background-basic-color-2',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  divider: {
    // padding: 1,

    backgroundColor: 'text-hint-color',
  },
})
