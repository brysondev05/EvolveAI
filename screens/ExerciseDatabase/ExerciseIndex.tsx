import {
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import {
  View,
  Pressable,
  Keyboard,
  Platform,
  useWindowDimensions,
} from 'react-native'
import { Layout, Icon, useTheme, Text } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import { exerciseData as exercises } from '~/assets/data/exerciseData'
import { ThemeContext } from '~/context/theme-context'
import * as Haptics from 'expo-haptics'
import AlphaSideNav from './ExerciseIndex/AlphaSideNav'
import ExerciseIndexHeader from './ExerciseIndex/ExerciseIndexHeader'
import MovementHeader from './ExerciseIndex/MovementHeader'
import MovementList from './ExerciseIndex/MovementList'
import AlphaList from './ExerciseIndex/AlphaList'
import SearchList from './ExerciseIndex/SearchList'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurHeader } from '~/components/Navigation/BlurHeader'

const exerciseNiceNames = {
  AB: 'Abs',
  BI: 'Biceps',
  CF: 'Calves',
  CE: 'Carrying',
  CH: 'Chest',
  HM: 'Hamstrings',
  JP: 'Jumping',
  LT: 'Lats',
  PC: 'Posterior Chain',
  QD: 'Quads',
  SH: 'Shoulders',
  TR: 'Triceps',
  UL: 'Unilateral',
  MO: 'Mobility',
  SQ: 'Squat',
  BN: 'Bench',
  DL: 'Deadlift',
}

const exercisesCategories = exercises.reduce((acc, item) => {
  if (!acc.includes(item.primaryCategory)) {
    acc.push(item.primaryCategory)
  }
  return acc
}, [])

const filter = (item, query) =>
  item && item.exerciseName.toLowerCase().includes(query.toLowerCase())

const sectionedCategories = (items) =>
  items &&
  exercisesCategories.map((item) => {
    const itemExercises = items
      .filter((exercise) => exercise.primaryCategory === item)
      .sort(({ exerciseName: exA }, { exerciseName: exB }) => exA > exB)
    return {
      title: exerciseNiceNames[item],
      shortCode: item,
      data: itemExercises,
    }
  })

const findFirst = (name) => name.match(/[a-zA-Z]/) || 'a'.match(/[a-zA-Z]/)

const searchStr = (string) => {
  const startAt = findFirst(string).index

  return {
    first: findFirst(string).pop().toUpperCase(),
    string: string.substring(startAt),
  }
}

const alphaList = (items) =>
  items &&
  items.reduce(
    (acc, item, index, arr) => {
      const first = findFirst(item.exerciseName).pop().toUpperCase()

      if (!acc.categories.includes(exerciseNiceNames[item.primaryCategory])) {
        acc.categories.push(exerciseNiceNames[item.primaryCategory])
        acc.categoryIndex.push(acc.categoryIndex?.length + index)
        acc.categoryData.push({
          exerciseName: exerciseNiceNames[item.primaryCategory],
          header: true,
        })
      }
      if (!acc.alphaBetter.includes(first)) {
        acc.alphaBetter.push(first)
        acc.headerIndex.push(acc.headerIndex?.length + index)
        acc.alphaData.push({
          exerciseName: first,
          header: true,
        })
      }
      acc.alphaData.push(item)
      acc.categoryData.push(item)

      return acc
    },
    {
      alphaData: [],
      headerIndex: [],
      alphaBetter: [],
      categoryData: [],
      categories: [],
      categoryIndex: [],
      userExercises: [],
    }
  )

const sortAlpha = (exercises) =>
  exercises &&
  Object.values(exercises)
    .filter((item) => item)
    .sort(({ exerciseName: exerciseA }, { exerciseName: exerciseB }) =>
      searchStr(exerciseA).string.toUpperCase() <
      searchStr(exerciseB).string.toUpperCase()
        ? -1
        : 1
    )

const sortCategory = (exercises) =>
  sortAlpha(exercises)
    .filter((item) => item)
    .sort(({ primaryCategory: exerciseA }, { primaryCategory: exerciseB }) =>
      exerciseA < exerciseB ? -1 : 1
    )

export default function ExerciseIndex({ navigation, route }) {
  const window = useWindowDimensions()

  const userID = useTypedSelector((state) => state.firebase.auth.uid)

  const { isExerciseSwap } =
    route.name === 'Exercise Database'
      ? false
      : useTypedSelector((state) => state.exerciseSwap)

  const theme = useTheme()
  const themeContext = useContext(ThemeContext)
  const gradientColors =
    themeContext.theme === 'light'
      ? [theme['background-basic-color-1'], theme['background-basic-color-4']]
      : [theme['background-basic-color-1'], theme['background-basic-color-3']]
  const exercisePath = `users/${userID}/exercises`

  useFirestoreConnect([
    {
      collection: exercisePath,
      where: ['isUserExercise', '==', true],
      storeAs: 'userExercises',
    },
  ])

  const alphaSortExercises = useMemo(
    () =>
      exercises &&
      Object.values(exercises)
        .filter((item) => item)
        .sort(({ exerciseName: exerciseA }, { exerciseName: exerciseB }) =>
          searchStr(exerciseA).string < searchStr(exerciseB).string ? -1 : 1
        ),
    [exercises]
  )

  const categorySortExercises = useMemo(
    () =>
      alphaSortExercises &&
      Object.values(alphaSortExercises)
        .filter((item) => item)
        .sort(
          ({ primaryCategory: exerciseA }, { primaryCategory: exerciseB }) =>
            exerciseA < exerciseB ? -1 : 1
        ),
    [alphaSortExercises]
  )

  const userExercises = useTypedSelector(
    ({ firestore: { data } }) => data.userExercises
  )

  const [queriedData, setQueriedData] = useState([])

  const listRef = useRef(null)

  const [finalData, setFinalData] = useState(alphaList(categorySortExercises))
  const [alphaData, setAlphaData] = useState(alphaList(alphaSortExercises))

  const [userExerciseData, setUserExerciseData] = useState({
    alphaData: [],
  })
  const [categorySelected, setCategorySelected] = useState(0)
  const [activeDatabaseType, setActiveDatabaseType] = useState('alpha')

  const [alphaContainer, setAlphaContainer] = useState(null)
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null)

  const insets = useSafeAreaInsets()

  const catRef = useRef(null)
  const searchRef = useRef(null)
  const viewContainer = useRef(null)

  useEffect(() => {
    if (isLoaded(userExercises) && !isEmpty(userExercises)) {
      const allExercises = [...Object.values(userExercises), ...exercises]
      const alphaSort = sortAlpha(allExercises)
      const catSort = sortCategory(allExercises)

      const newUserExerciseData = alphaList(sortAlpha(userExercises))
      if (newUserExerciseData !== userExerciseData) {
        setUserExerciseData(newUserExerciseData)
      }
      const newFinalData = alphaList(catSort)

      if (newFinalData !== finalData) {
        setFinalData(newFinalData)
      }
      const newAlphaData = alphaList(alphaSort)
      if (newAlphaData !== alphaData) {
        setAlphaData(newAlphaData)
      }
    } else {
      const alphaSort = sortAlpha(exercises)
      const catSort = sortCategory(exercises)

      setUserExerciseData(null)

      const newFinalData = alphaList(catSort)
      const newAlphaData = alphaList(alphaSort)
      if (newFinalData !== finalData) {
        setFinalData(newFinalData)
      }
      if (newAlphaData !== alphaData) {
        setAlphaData(newAlphaData)
      }
    }
  }, [exercises, userExercises])

  const [value, setValue] = useState(null)

  const [autoCompleteActive, setAutoCompleteActive] = useState(false)

  const onChangeText = useCallback((query) => {
    setValue(query)
    if (!autoCompleteActive && query !== '') {
      setAutoCompleteActive(true)
    }
    if (autoCompleteActive && query === '') {
      setQueriedData([])
      return setAutoCompleteActive(false)
    }

    setQueriedData(alphaData?.alphaData?.filter((item) => filter(item, query)))
  }, [])

  const clearInput = () => {
    setValue('')
    setAutoCompleteActive(false)
    setQueriedData([])
    Keyboard.dismiss()
  }
  const renderCloseIcon = (props) => (
    <Pressable onPress={clearInput}>
      <Icon {...props} name='close' />
    </Pressable>
  )

  useEffect(() => {
    if (categorySelected) {
      catRef.current?.scrollToIndex({
        animated: true,
        index: categorySelected,
        viewOffset: window.width / 2 - 60,
      })
    }
  }, [categorySelected])

  useEffect(() => {
    if (autoCompleteActive) {
      searchRef.current?.focus()
    } else {
      Keyboard.dismiss()
    }
  }, [autoCompleteActive])
  const toggleSearch = useCallback(
    (isActive) => {
      setAutoCompleteActive((prev) => !prev)
    },
    [autoCompleteActive, setAutoCompleteActive]
  )

  const handleDatabaseTypeChange = (newType) => {
    if (
      (activeDatabaseType === 'user' && isEmpty(userExercises)) ||
      (isEmpty(userExercises) && newType === 'user')
    ) {
      return setActiveDatabaseType(newType)
    }
    setActiveDatabaseType(newType)

    listRef.current?.scrollToIndex({
      animated: true,
      index: 0,
    })
  }
  const handleGoBack = () => handleDatabaseTypeChange('user')
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Exercise Database',
      headerTransparent: false,
      headerBackground: () => <BlurHeader />,
      headerRight: () => (
        <View
          style={[
            {
              //   // paddingTop: isExerciseSwap ? 50 : 0,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              alignContent: 'flex-end',
              width: '100%',
            },
          ]}>
          <Pressable
            style={{ padding: 5, marginRight: 15 }}
            onPress={() =>
              navigation.navigate('Create Exercise', {
                exercise: null,
                handleGoBack,
              })
            }>
            <Icon style={{ width: 25, height: 25 }} fill='white' name='plus' />
          </Pressable>

          <Pressable
            style={{}}
            onPress={() => toggleSearch(autoCompleteActive)}>
            <Icon
              style={{ padding: 5, width: 25, height: 25 }}
              fill='white'
              name='search'
            />
          </Pressable>
          <Pressable
            style={{ marginRight: 15, padding: 15 }}
            onPress={() => navigation.goBack()}>
            <Icon name='close-outline' width={25} height={25} fill='white' />
          </Pressable>
        </View>
      ),
    })
  }, [])

  const handleViewableChange = useCallback(
    (viewableItems) => {
      if (
        viewableItems &&
        viewableItems.length > 4 &&
        activeDatabaseType === 'movement'
      ) {
        if (viewableItems[3]?.item?.header) {
          const newIndex = finalData.categories.indexOf(
            viewableItems[0]?.item?.exerciseName
          )
          return newIndex > -1 ? setCategorySelected(newIndex) : null
        }
        if (
          viewableItems[3]?.item.primaryCategory !==
          finalData.categories[categorySelected]
        ) {
          const newIndex = finalData.categories.indexOf(
            exerciseNiceNames[viewableItems[5]?.item?.primaryCategory]
          )
          return newIndex > -1 ? setCategorySelected(newIndex) : null
        }
      }
    },
    [finalData, categorySelected, setCategorySelected, activeDatabaseType]
  )
  const headerHeight = insets.top
  const offSet = (window.height / window.width) * 10 + 80
  const itemHeight = 65

  const scrollToSection = useCallback(
    (e) => {
      const ev = e.nativeEvent.touches[0] || e.nativeEvent
      const targetY = ev.pageY
      const { y, width, height } = alphaContainer

      if (!y || targetY < y) {
        return
      }

      let index = Math.floor(
        ((targetY - y - headerHeight - offSet) / height) *
          alphaData.alphaBetter?.length
      )

      index = Math.min(index, alphaData.alphaBetter?.length - 1)

      if (
        typeof index !== 'undefined' &&
        index >= 0 &&
        lastSelectedIndex !== index
      ) {
        setLastSelectedIndex(index)
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync()
        }
        listRef.current.scrollToIndex({
          animated: false,
          index: alphaData.headerIndex[index],
          // viewOffset: -65
        })
      }
    },
    [lastSelectedIndex, listRef, finalData, alphaData, alphaContainer]
  )

  return (
    <Layout
      level='1'
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}>
      <ExerciseIndexHeader
        gradientColors={gradientColors}
        toggleSearch={toggleSearch}
        autoCompleteActive={autoCompleteActive}
        theme={theme}
        navigation={navigation}
        searchRef={searchRef}
        value={value}
        setAutoCompleteActive={setAutoCompleteActive}
        onChangeText={onChangeText}
        handleDatabaseTypeChange={handleDatabaseTypeChange}
        activeDatabaseType={activeDatabaseType}
        renderCloseIcon={renderCloseIcon}
        isExerciseSwap={isExerciseSwap}
      />

      {!autoCompleteActive && activeDatabaseType === 'movement' && (
        <MovementHeader
          data={finalData}
          catRef={catRef}
          theme={theme}
          categorySelected={categorySelected}
          setCategorySelected={setCategorySelected}
          listRef={listRef}
          window={window}
        />
      )}

      {!autoCompleteActive && activeDatabaseType === 'alpha' && (
        <AlphaSideNav
          viewContainer={viewContainer}
          setAlphaContainer={setAlphaContainer}
          scrollToSection={scrollToSection}
          data={alphaData.alphaBetter}
          headerHeight={headerHeight}
        />
      )}

      <View>
        {autoCompleteActive ? (
          <SearchList
            navigation={navigation}
            data={queriedData}
            theme={theme}
            isExerciseSwap={isExerciseSwap}
            itemHeight={itemHeight}
          />
        ) : activeDatabaseType === 'movement' ? (
          <MovementList
            activeDatabaseType={activeDatabaseType}
            data={finalData.categoryData}
            listRef={listRef}
            isMovement={true}
            navigation={navigation}
            theme={theme}
            isExerciseSwap={isExerciseSwap}
            handleViewableChange={handleViewableChange}
            itemHeight={itemHeight}
            extraData={userExercises}
          />
        ) : activeDatabaseType === 'alpha' ? (
          <AlphaList
            activeDatabaseType={activeDatabaseType}
            data={alphaData.alphaData}
            listRef={listRef}
            navigation={navigation}
            theme={theme}
            isExerciseSwap={isExerciseSwap}
            handleViewableChange={handleViewableChange}
            isMovement={false}
            itemHeight={itemHeight}
          />
        ) : userExerciseData?.alphaData?.length > 0 ? (
          <AlphaList
            activeDatabaseType={activeDatabaseType}
            data={userExerciseData?.alphaData}
            listRef={listRef}
            navigation={navigation}
            theme={theme}
            isExerciseSwap={isExerciseSwap}
            handleViewableChange={handleViewableChange}
            isMovement={false}
            extraData={userExercises}
            itemHeight={itemHeight}
          />
        ) : (
          <View
            style={{
              padding: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>You have not yet created any custom exercises.</Text>
            <Pressable
              onPress={() =>
                navigation.navigate('Create Exercise', {
                  handleGoBack: () => handleDatabaseTypeChange('user'),
                })
              }>
              <Text status='primary'> Create one now</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Layout>
  )
}
