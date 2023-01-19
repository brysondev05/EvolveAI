import { View, Dimensions, Touchable, TouchableOpacity, Image, StyleSheet, SectionList, LogBox, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import NuutritionTabHeader from '~/components/NuutritionTabHeader'
import ActivityRings from "react-native-activity-rings";
import { Layout, Text } from '@ui-kitten/components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NutritionIcons } from '~/assets/icons';
import DateSwiper from '~/components/DateSwipeComponent';
import GoalPopup from '~/components/NutritionTab/GoalPopup';
import SlideModal from '~/components/modal/SlideModal';
import AddWeightComponent from './AddWeight/AddWeightComponent';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { DraxProvider, DraxList } from 'react-native-drax';
import { NutritionTabReferences } from '~/navigators/NutritionTabStack'


const ScreenWidth = Dimensions.get("screen").width
// const ScreenHeight = Dimensions.get("screen").height

const CurrentStates = {
  Zero: 0,
  Fasting: 1,
  Active: 2
}

const filledActivityData = [{
  value: 0.8,
  color: "#04E2E7",
  backgroundColor: "#24293C"
}, {
  value: 0.6,
  color: "#FF47CC",
  backgroundColor: "#24293C"
}, {
  value: 0.7,
  color: "#7E38F4",
  backgroundColor: "#24293C"
}, {
  value: 0.8,
  color: "#4678FF",
  backgroundColor: "#24293C"
}]
const zeroOrFastingActivityData = [{
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C"
}, {
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C"
}, {
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C"
}, {
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C"
}]

const filledFoodBottomData = [
  {
    foodName: 'Pizza zzzzzz',
    quantity: 2,
    measurement: 'slices',
    icon: require('~/assets/icons/pizza.png'),
    calories: '569 kcal',
    heightWidth: 22,
  },
  {
    foodName: 'Coke',
    quantity: 1,
    measurement: 'can',
    icon: require('~/assets/icons/can.png'),
    calories: '150 kcal',
    heightWidth: 20,
  },
  {
    foodName: 'Sprite',
    quantity: 1,
    measurement: 'can',
    icon: require('~/assets/icons/can.png'),
    calories: '150 kcal',
    heightWidth: 20,
  },
]
  ;

const zeroOrFastingFoodBottomData = [
  {
    title: "12 pm",
    data: [
      {
        foodName: 'Pizza zzzzzz',
        quantity: 2,
        measurement: 'slices',
        icon: require('~/assets/icons/pizza.png'),
        calories: '569 kcal',
        heightWidth: 22,
      },
      {
        foodName: 'Coke',
        quantity: 1,
        measurement: 'can',
        icon: require('~/assets/icons/can.png'),
        calories: '150 kcal',
        heightWidth: 20,
      },
      {
        foodName: 'Sprite',
        quantity: 1,
        measurement: 'can',
        icon: require('~/assets/icons/can.png'),
        calories: '150 kcal',
        heightWidth: 20,
      },
    ]
  },
  {
    title: "1 pm",
    data: [
      {
        foodName: 'spanish Pizza',
        quantity: 2,
        measurement: 'slices',
        icon: require('~/assets/icons/pizza.png'),
        calories: '569 kcal',
        heightWidth: 22,
      },
    ],
  },
];

const activityConfig = {
  width: ScreenWidth / 1.5,
  height: ScreenWidth / 1.5,
  radius: 72,
  ringSize: 10,
}
const miniActivityConfig = {
  width: 18,
  height: 18,
  radius: 6,
  ringSize: 4,
}

const fatActivityData = [{
  value: 0.8,
  color: "#4678FF",
  backgroundColor: "#24293C",
  title: '150 g'
},]
const proteinActivityData = [{
  value: 0.65,
  color: "#B183FF",
  backgroundColor: "#24293C",
  title: '150 g'
},]
const carbsActivityData = [{
  value: 0.55,
  color: "#FF47CC",
  backgroundColor: "#24293C",
  title: '150 g'
},]
const TotalActivityData = [{
  value: 0.75,
  color: "#04E2E7",
  backgroundColor: "#24293C",
  title: '150 cal'
},]

const fatEmptyActivityData = [{
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C",
  title: '0 g'
},]
const proteinEmptyActivityData = [{
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C",
  title: '0 g'
},]
const carbsEmptyActivityData = [{
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C",
  title: '0 g'
},]
const TotalEmptyActivityData = [{
  value: 1,
  color: "#24293C",
  backgroundColor: "#24293C",
  title: '0 cal'
},]

const TotalData = (currentState: number) => {
  console.log({ currentState });
  return {
    PrimaryValue: ['0', 'Fasting', '600'][currentState],
    PrimaryText: ['Daily total', 'N/A', 'Daily total'][currentState],
    MainRingsData: [zeroOrFastingActivityData, zeroOrFastingActivityData, filledActivityData][currentState],
    FatRing: [fatEmptyActivityData, fatEmptyActivityData, fatActivityData][currentState],
    ProteinRing: [proteinEmptyActivityData, proteinEmptyActivityData, proteinActivityData][currentState],
    CarbsRing: [carbsEmptyActivityData, carbsEmptyActivityData, carbsActivityData][currentState],
    TotalRing: [TotalEmptyActivityData, TotalEmptyActivityData, TotalActivityData][currentState],
    BottomFoodData: [zeroOrFastingFoodBottomData, zeroOrFastingFoodBottomData, filledFoodBottomData][currentState],
  }
}

type Item = {
  foodName: string,
  quantity: number,
  measurement: string,
  icon: any,
  calories: string,
  heightWidth: number,
  height: number;
  width: number;
  backgroundColor: string;
};

const initialData: Item[] = filledFoodBottomData.map((d, index) => {
  const backgroundColor = '#060C21';
  return {
    foodName: d.foodName,
    quantity: d.quantity,
    measurement: d.measurement,
    icon: d.icon,
    calories: d.calories,
    heightWidth: d.heightWidth,
    key: `item-${index}`,
    label: String(index) + "",
    height: 100,
    width: 60 + Math.random() * 40,
    backgroundColor,
  };
});
const NutritionMain = ({ navigation }) => {
  const [isFasting, setIsFasting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showPopups, setShowPopups] = useState(false)
  const [popup, setPopup] = useState(0)
  const [resetted, setResetted] = useState(true)
  const [foodData, setFoodData] = useState(initialData);

  useEffect(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"])
  }, [])

  const currentData = TotalData(currentIndex)
  console.log({ currentData });


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <Layout style={{
        flex: 1,
        backgroundColor: '#060C21'
      }}>

        <GoalPopup
          heighted
          image={require('../../assets/images/nutrition/finished_goal.png')}
          visible={showPopups && currentIndex === (2) && popup === 0}
          onDismiss={() => {
            setShowPopups(false)
          }}
          onResetGoal={() => {
            setShowPopups(true)
            setPopup(1)
            setResetted(true)
          }}
          resetAvailable={false} />

        <GoalPopup
          heighted={false}
          image={require('../../assets/images/nutrition/active_goal.png')}
          visible={showPopups && currentIndex === (2) && popup === 1}
          onDismiss={() => {
            setShowPopups(false)
            setResetted(true)
            if (!resetted) {
              setCurrentIndex(CurrentStates.Fasting)
            }
          }}
          resetAvailable={!resetted}
          title='Fine tune your macros'
          subtitle={(!resetted) ? 'Recalibrate your goal based on recent activities to better meet your need.' :
            'Please log at least 6 days of eating/fasting and 1 bodyweight in a 7 day period before attempting to refine your macros.'}
          onResetGoal={() => {
            setResetted(false)
          }} />

        {/* <View> */}

        <NuutritionTabHeader navigation={navigation} shouldShowBack={false} />

        <DateSwiper onChangeDate={(newDate: Date, isToday: boolean) => {
          console.log();

          if (isToday) setCurrentIndex(CurrentStates.Zero)
          else setCurrentIndex(CurrentStates.Active)
        }} />
        <View style={styles.activityRingsView}>
          <ActivityRings data={currentData.MainRingsData} config={activityConfig} />
          <Text style={styles.dailyCount}>{currentData.PrimaryValue + '\n'}<Text style={styles.dailyText}>{currentData.PrimaryText}</Text></Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowPopups(true)
          }}
        >
          <Layout style={styles.fatProteinMainView}>
            <Layout style={styles.fatMiniView}>

              <ActivityRings data={currentData.FatRing} config={miniActivityConfig} />
              <Text style={styles.typeTextStyle}>{'Fat\n'}
                <Text style={styles.gramText}>{currentData.FatRing[0].title}</Text>
              </Text>
            </Layout>
            <Layout style={styles.fatMiniView}>

              <ActivityRings data={currentData.ProteinRing} config={miniActivityConfig} />
              <Text style={styles.typeTextStyle}>{'Protein\n'}
                <Text style={styles.gramText}>{currentData.ProteinRing[0].title}</Text>
              </Text>
            </Layout>
            <Layout style={styles.fatMiniView}>

              <ActivityRings data={currentData.CarbsRing} config={miniActivityConfig} />
              <Text style={styles.typeTextStyle}>{'Carbs\n'}
                <Text style={styles.gramText}>{currentData.CarbsRing[0].title}</Text>
              </Text>
            </Layout>
            <Layout style={styles.fatMiniView}>

              <ActivityRings data={currentData.TotalRing} config={miniActivityConfig} />
              <Text style={styles.typeTextStyle}>{'Total\n'}
                <Text style={styles.gramText}>{currentData.TotalRing[0].title}</Text>
              </Text>
            </Layout>
          </Layout>
        </TouchableOpacity>
        <Layout style={styles.fastAndWeightView}>
          {
            (currentIndex === CurrentStates.Zero) &&
            <TouchableOpacity style={{ ...styles.fastView, display: isFasting ? 'none' : 'flex' }}
              onPress={() => setCurrentIndex(CurrentStates.Fasting)}>
              <Image source={NutritionIcons.Fasting} style={styles.iconStyle} />
              <Text style={styles.fastWeightText}>Fasting</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity style={styles.fastView} onPress={() => {
            setShowModal(true)
            console.log("Add weight pressed", showModal);
          }}>
            <Image source={NutritionIcons.AddWeight} style={{
              width: 18,
              height: 18
            }} />
            <Text style={{
              color: '#04E2E7',
              marginHorizontal: 8
            }}>Add weight</Text>
          </TouchableOpacity>
        </Layout>

        <SlideModal
          isVisibleModal={showModal}
          setModalVisibility={(isShow) => setShowModal(isShow)}
        >
          <AddWeightComponent
            setModalVisibility={(isShow) => setShowModal(isShow)} 
            isVisible={showModal}
            onChangeSubmit={(dataPayload => {
              console.log({dataPayload});
              
            })}/>
        </SlideModal>
        <Layout style={styles.lowerView}>
          <Layout style={styles.foodView}>
            {/* <NestableScrollContainer> */}
            {/* 
          {zeroOrFastingFoodBottomData.map(item  => (
            <>
              <Text style={{ position: "relative", }}>{item.title}</Text>
              <DraggableFlatList
                data={data2}
                onDragEnd={({ data }) => setData2(data)}
                keyExtractor={item => `draggable-item-${item.key}`}
                renderItem={renderItem}
              />
            </>
          ))} */}
            {/* </NestableScrollContainer> */}

            <SectionList
              sections={zeroOrFastingFoodBottomData}
              contentContainerStyle={{ paddingBottom: '30%' }}
              renderItem={({ item }: any) => (
                <DraxProvider>
                  <DraxList
                    data={foodData}
                    renderItemContent={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.rowItem,
                          {
                            backgroundColor:
                              item.backgroundColor
                          },
                        ]}
                      >
                        <Layout style={styles.foodItemView}>
                          <Layout style={{ marginLeft: 11, width: '6%' }}>
                            <Image source={item.icon} style={{ height: item.heightWidth, width: item.heightWidth }} />
                          </Layout>
                          <Layout style={{ marginLeft: 4, width: '70%' }}>
                            <Text>{item.foodName}</Text>
                            <Text style={styles.caloriesText}>{item.quantity} {item.measurement}</Text>
                          </Layout>
                          <Layout style={styles.caloriesView}>
                            <Text style={styles.caloriesText}>{item.calories}</Text>
                          </Layout>
                        </Layout>
                      </TouchableOpacity>
                    )}
                    onItemReorder={({ fromIndex, toIndex }) => {
                      const newData = foodData.slice();
                      newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
                      setFoodData(newData);
                    }}    
                    keyExtractor={(item, index) => 'itt' + index}
                  />
                </DraxProvider>
              )}
              renderSectionHeader={({ section }) => (
                <Text style={styles.timeText} >{section.title}</Text>
              )}
              stickySectionHeadersEnabled
            />
          </Layout>
        </Layout>
      </Layout>
    </ScrollView>
  )
}
export default NutritionMain

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060C21'
  },
  activityRingsView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dailyCount: {
    alignSelf: 'center',
    position: 'absolute',
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  dailyText: { 
    alignSelf: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '300',
  },
  fatProteinMainView: {
    flexDirection: 'row',
    marginVertical: 24,
    marginLeft: 24,
  },
  fatMiniView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTextStyle: {
    color: 'white',
    fontSize: 18,
    marginLeft: 6
  },
  gramText: {
    fontSize: 14,
    color: 'grey'
  },
  fastAndWeightView: {
    marginVertical: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  fastView: {
    backgroundColor: '#20273E',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    paddingVertical: 10,
    borderRadius: 50,
    flexDirection: 'row',

  },
  iconStyle: {
    width: 18,
    height: 18
  },
  fastWeightText: {
    color: '#04E2E7',
    marginHorizontal: 8
  },
  lowerView: {
    height: 400,
    width: '100%',
    flexDirection: 'row'
  },
  timeLayout: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'column',
    borderTopWidth: 0.25,
    borderBottomWidth: 0.25,
    borderRightWidth: 0.2,
    borderColor: 'grey',
  },
  timeText: {
    marginVertical: 16,
    color: "#9C9FAE",
    position: "absolute",
    marginLeft: 10,
    zIndex: 20,
    backgroundColor: '#060C21',
    width: '12%'
  },
  foodItemView: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.25,
    borderColor: "grey",
    width: "85%",
    marginLeft: "15%",
    borderLeftWidth: 0.25,

  },
  foodView: {
    flex: 5,
    borderTopWidth: 0.25,
    borderBottomWidth: 0.25,
    borderColor: 'grey',
  },
  caloriesText: {
    color: "#9C9FAE",
    fontSize: 14,
    fontWeight: "400"
  },
  caloriesView: {
    width: "24%",
  },
  rowItem: {
    // height: 100,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
})