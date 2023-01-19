import { Pressable, View } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'

const alphaBet = {
  0: {
    letter: 'A',
    color: 'color-primary-500',
  },
  1: {
    letter: 'B',
    color: 'color-primary-300',
  },
  2: {
    letter: 'C',
    color: 'color-primary-100',
  },
  4: {
    letter: 'D',
    color: 'color-primary-200',
  },
  5: {
    letter: 'E',
    color: 'color-primary-600',
  },
}

const ComboSetNotes = ({
  lift,
  index,
  length,
  theme,
  dispatch,
  navigation,
}) => {
  if (length === 1) {
    return (
      <View style={{ paddingVertical: 15, paddingLeft: 15 }}>
        <Pressable
          onPress={() =>
            navigation.navigate('Notes Screen', {
              exercise: { isAccessory: true, ...lift },
              notesType: 'workout',
            })
          }>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text category='h6' appearance='hint'>
              Notes
            </Text>

            <Icon
              style={{ width: 18, height: 18 }}
              fill={theme['text-hint-color']}
              name='edit-outline'
            />
          </View>

          <Text category='p2'>{lift?.userNotes}</Text>
        </Pressable>
      </View>
    )
  }
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 15,
        }}>
        <Pressable
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme['background-basic-color-1'],
            width: 45,
            height: 45,
            borderRadius: 45,
          }}
          onPress={() =>
            navigation.navigate('Notes Screen', {
              exercise: { isAccessory: true, ...lift },
              notesType: 'workout',
            })
          }>
          <Text
            category='s1'
            style={{ color: theme[`${alphaBet[index]?.color}`] }}>
            {alphaBet[index]?.letter}
          </Text>
        </Pressable>

        <Pressable
          style={{ paddingLeft: 10 }}
          onPress={() =>
            navigation.navigate('Notes Screen', {
              exercise: { isAccessory: true, ...lift },
              notesType: 'workout',
            })
          }>
          <View style={{ flexDirection: 'row' }}>
            <Text category='s1' appearance='hint'>
              Notes
            </Text>

            <Icon
              style={{ width: 18, height: 18, marginLeft: 2 }}
              fill={theme['text-hint-color']}
              name='edit-outline'
            />
          </View>
          {lift?.userNotes?.length > 0 && (
            <Text category='p2'>{lift?.userNotes}</Text>
          )}
        </Pressable>
      </View>
    </>
  )
}

export default ComboSetNotes
