import { Pressable, View, StyleSheet } from 'react-native'
import { Button, Icon, Input, Layout, Text } from '@ui-kitten/components'
import { LinearGradient } from 'expo-linear-gradient'

const ExerciseIndexHeader = ({
  gradientColors,
  toggleSearch,
  autoCompleteActive,
  theme,
  navigation,
  searchRef,
  value,
  setAutoCompleteActive,
  onChangeText,
  handleDatabaseTypeChange,
  activeDatabaseType,
  renderCloseIcon,
  isExerciseSwap,
}) => {
  return (
    <Layout style={styles.headerWrapper}>
      {autoCompleteActive ? (
        <Input
          ref={searchRef}
          placeholder='Search...'
          value={value}
          clearButtonMode='always'
          returnKeyType='done'
          onFocus={() => setAutoCompleteActive(true)}
          // onBlur={() => setAutoCompleteActive(false)}
          style={{
            backgroundColor: theme['background-basic-color-1'],
            borderRadius: 14,
            borderColor: 'transparent',
            width: '100%',
            marginTop: 5,
          }}
          accessoryRight={renderCloseIcon}
          onChangeText={onChangeText}
        />
      ) : (
        <View
          style={{
            marginTop: 15,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Button
            size='small'
            style={{ borderRadius: 0 }}
            onPress={() => handleDatabaseTypeChange('alpha')}
            appearance={activeDatabaseType === 'alpha' ? 'filled' : 'outline'}>
            Alphabetical
          </Button>
          <Button
            size='small'
            style={{ borderRadius: 0 }}
            onPress={() => handleDatabaseTypeChange('movement')}
            appearance={
              activeDatabaseType === 'movement' ? 'filled' : 'outline'
            }>
            Movements
          </Button>
          <Button
            size='small'
            style={{ borderRadius: 0 }}
            onPress={() => handleDatabaseTypeChange('user')}
            appearance={activeDatabaseType === 'user' ? 'filled' : 'outline'}>
            My Exercises
          </Button>
        </View>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingHorizontal: 15,
    paddingBottom: 20,
    shadowColor: '#000',
    zIndex: 50,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  gradientBG: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    marginTop: 5,
  },
})
export default ExerciseIndexHeader
