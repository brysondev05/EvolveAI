import { useState, useEffect } from 'react'
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import {
  isEmpty,
  isLoaded,
  useFirestore,
  useFirestoreConnect,
} from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Divider, Layout, Text } from '@ui-kitten/components'
import { useActionSheet } from '@expo/react-native-action-sheet'
import GradientHeader from '~/components/presentational/GradientHeader'
import { capitalizeFullString } from '~/helpers/Strings'
import firestore from '@react-native-firebase/firestore'
import { useBlockType } from '~/hooks/programInfo/useBlockType'
import useBlockTypeInfo from '~/hooks/programInfo/useBlockTypeInfo'
import { dateToDate } from '~/helpers/Dates'

const aiEstimateDisplay = (item) => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text category='label' status='primary'>
        Estimated Max
      </Text>
      <Text category='label'>
        {dateToDate(item.date)?.toLocaleDateString()}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text category='h1'>{item.amount}</Text>
      <Text category='h6' appearance='hint'>
        {item.units}
      </Text>
    </View>
  </View>
)
const newMax = (item, type = 'New') => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text category='label' appearance='hint'>
        {type} Max
      </Text>
      <Text category='label'>
        {dateToDate(item.date)?.toLocaleDateString()}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text category='h1'>{item.amount}</Text>
      <Text category='h6' appearance='hint'>
        {item.units}
      </Text>
    </View>
  </View>
)
const SetType = ({ item }) => {
  const { blockColor, blockName } = useBlockType({ blockType: item?.blockType })
  return (
    <View style={{ minHeight: 55, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text category='label' style={{ color: blockColor }}>
          {blockName}{' '}
          {item.type !== 'bridge' && `${capitalizeFullString(item.type)} `}Set
        </Text>

        <Text category='label'>
          {dateToDate(item.date)?.toLocaleDateString()}
        </Text>
      </View>

      {['accessory', 'bridge', 'preparatory'].includes(item.type) && (
        <Text>Average Set</Text>
      )}
      {['technique', 'straight'].includes(item.type) && <Text>Best Set</Text>}
      <Text category={item.ERM && item.type === 'top' ? 'h6' : 'h6'}>
        {`${item.amount}${item.units} x ${item.reps} ${
          item.repType || 'reps'
        } @ ${item.intensity} ${item.intensityType.toUpperCase()}`}{' '}
      </Text>
      {item.ERM &&
        item.ERM[1] > 0 &&
        item.type === 'top' &&
        item.intensity >= 9 && (
          <>
            <Text category='label' appearance='hint' style={{ marginTop: 10 }}>
              Estimated Max
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text category='h1'>
                {item.ERM.map(
                  (max, index) => `${max}${index === 0 ? ' - ' : ''}`
                )}
              </Text>
              <Text category='h6' appearance='hint'>
                {item.units}
              </Text>
            </View>
          </>
        )}
    </View>
  )
}
const ExerciseHistory = ({ navigation, route }) => {
  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)

  // const history = useTypedSelector(({firestore: {data}}) => data.exerciseHistory)
  const { movementDoc } = route.params || { movementDoc: '' }

  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  // const firestore = useFirestore()
  // useFirestoreConnect([{
  //     collection: `users/${userID}/exercises/${movementDoc}/history`,
  //     storeAs: 'exerciseHistory',
  //     orderBy: ['date', 'desc'],
  //     preserveOnDelete: false
  // }
  // ])
  const { showActionSheetWithOptions } = useActionSheet()

  const [items, setItems] = useState(null)

  useEffect(() => {
    const subscriber = firestore()
      .collection(`users/${userID}/exercises/${movementDoc}/history`)
      .orderBy('date', 'desc')
      .onSnapshot((snap) => {
        // see next step
        const history = []
        snap.forEach((doc) => {
          if (doc.data()) {
            history.push({ id: doc.id, ...doc.data() })
          }
        })
        setHistory(history)
        setLoading(false)
      })

    return () => subscriber()
  }, [])

  useEffect(() => {
    if (isLoaded(history) && !isEmpty(history)) {
      const listings = Object.entries(history)
        .filter(([key, data]) => data)
        .map(([key, data]) => {
          return { id: key, ...data }
        })
      setItems(listings)
    }
  }, [history])

  const handleTouch = (item) => {
    showActionSheetWithOptions(
      {
        options: ['Cancel', 'Delete Entry'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          firestore()
            .doc(`users/${userID}/exercises/${movementDoc}/history/${item}`)
            .delete()
        }
      }
    )
  }

  const historyDisplay = (item) => {
    if (item.type === 'userEntered') {
      return newMax(item, 'User Entered')
    }
    if (item.type === 'meet') {
      return newMax(item, 'Competition')
    }
    if (item.type === 'AIEstimate') {
      return aiEstimateDisplay(item)
    }
    if (
      [
        'top',
        'straight',
        'average',
        'accessory',
        'technique',
        'bridge',
        'preparatory',
      ].includes(item.type)
    ) {
      return <SetType item={item} />
    }
    return newMax(item)
  }
  if (loading) {
    return <ActivityIndicator />
  }
  if (history.length < 1) {
    return (
      <Layout style={{ flex: 1, paddingTop: 50 }}>
        <View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            padding: 15,
          }}>
          <Text category='h6'>No History Found</Text>
          <Text>
            Complete a workout with performance from this exercise to log sets
          </Text>
        </View>
      </Layout>
    )
  }
  return (
    <Layout style={{ flex: 1 }}>
      <FlatList
        data={history}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleTouch(item.id)}>
            <Layout level='2' style={{ padding: 15 }}>
              {historyDisplay(item)}

              <Text>{item.userNotes}</Text>
            </Layout>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <Divider />}
        keyExtractor={(item) => item?.id}
        extraData={movementDoc}
      />
    </Layout>
  )
}

export default ExerciseHistory

const styles = StyleSheet.create({})
