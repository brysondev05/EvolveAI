import { View, Dimensions, Touchable, TouchableOpacity, Image, FlatList, StyleSheet, SectionList, Modal } from 'react-native'
import React, { useState } from 'react'
import { Layout, Text } from '@ui-kitten/components';
import NuutritionTabHeader from '~/components/NuutritionTabHeader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NutritionTabReferences } from '~/navigators/NutritionTabStack'
import ActivityRings from "react-native-activity-rings";

function FoodScreen({ navigation, search }) {
    const [emptyResult, setEmptyResult] = useState(false)
    const [isSearchOn, setIsSearchOn] = useState(false)
    const [searchList, setSearchList] = useState([])
    
    const foodlist = [
        {
            name: 'Pizza',
            fat: 150,
            protein: 150,
            carbs: 180,
        },
        {
            name: 'Taco',
            fat: 150,
            protein: 150,
            carbs: 150,
        },
    ]
    const miniActivityConfig = {
        width: 18,
        height: 18,
        radius: 6,
        ringSize: 4,
    }
    return (
        <Layout style={styles.container}>
            <KeyboardAwareScrollView>
                <NuutritionTabHeader navigation={navigation} shouldShowBack={true} overrideOnSearch={(t: string)=> {
                    if (t!=='') {
                        const searchResults = foodlist.filter(foodItem => foodItem.name.includes(t))
                        setEmptyResult(searchResults.length === 0)
                        setSearchList(searchResults)
                        setIsSearchOn(true)
                    } else {
                        setEmptyResult(false)
                        setIsSearchOn(false)
                    }
                }}/>
                <Layout style={{ margin: 20 }}>
                    {!emptyResult && <Text style={{ ...styles.simpleText, textAlign: "left" }}>Recent</Text>}
                    <FlatList
                        data={emptyResult ? [] : ((isSearchOn && searchList.length > 0) ? searchList : foodlist)}
                        renderItem={({ item, index, }) => (
                            <Layout style={{ marginTop: 10, borderBottomColor: 'grey', borderBottomWidth: 0.25, marginBottom: 24, }}>
                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "left", }}>{item.name}</Text>
                                <Layout style={styles.fatProteinMainView}>
                                    <Layout style={{ ...styles.fatMiniView, marginLeft: -10 }}>
                                        <ActivityRings data={[{
                                            value: (item.fat / 200),
                                            color: "#4678FF",
                                            backgroundColor: "#24293C"
                                        },]} config={miniActivityConfig} />
                                        <Text style={styles.gramText}>{item.fat} F</Text>
                                    </Layout>
                                    <Layout style={styles.fatMiniView}>
                                        <ActivityRings data={[{
                                            value: item.protein / 200,
                                            color: "#B183FF",
                                            backgroundColor: "#24293C"
                                        },]} config={miniActivityConfig} />
                                        <Text style={styles.gramText}>{item.protein} P</Text>
                                    </Layout>
                                    <Layout style={styles.fatMiniView}>
                                        <ActivityRings data={[{
                                            value: item.carbs / 200,
                                            color: "#FF47CC",
                                            backgroundColor: "#24293C"
                                        },]} config={miniActivityConfig} />
                                        <Text style={styles.gramText}>{item.carbs} C</Text>
                                    </Layout>
                                    <Layout style={styles.fatMiniView}>
                                        <ActivityRings data={[{
                                            value: (item.fat + item.protein + item.carbs) / 600,
                                            color: "#04E2E7",
                                            backgroundColor: "#24293C"
                                        },]} config={miniActivityConfig} />
                                        <Text style={styles.gramText}>{(item.fat + item.protein + item.carbs) / 3} T</Text>
                                    </Layout>
                                </Layout>
                            </Layout>
                        )}
                    />
                    {(foodlist && !isSearchOn) && <Text style={{ ...styles.simpleText, marginTop: 5 }}>Another option to add?</Text>}
                    {emptyResult &&
                        <>
                            <Text style={styles.simpleText}>No Results.</Text>
                            <Text style={styles.simpleText}>Can't find what you are looking for?</Text>
                        </>
                    }
                    {(isSearchOn && searchList.length > 0) && <Text style={styles.simpleText}>Not an exact match?</Text>}
                    <TouchableOpacity style={{ marginTop: 5 }} onPress={() => { navigation.navigate(NutritionTabReferences.AddManualFoodScreen) }}>
                        <Text style={styles.addEntryText}>Add manual entry</Text>
                    </TouchableOpacity>
                </Layout>
            </KeyboardAwareScrollView>
        </Layout>
    );
}
export default FoodScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060C21'
    },
    fatProteinMainView: {
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 10,
        paddingBottom: 15,
        width: '80%',
    },
    fatMiniView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    typeTextStyle: {
        color: 'white',
        fontSize: 18,
        marginLeft: 6
    },
    gramText: {
        fontSize: 16,
        color: 'grey',
        marginLeft: 5,
        fontWeight: "400"
    },
    simpleText: {
        textAlign: "center",
        color: '#9C9FAE',
        marginTop: 5
    },
    addEntryText: {
        textAlign: "center",
        color: '#04E2E7'
    }

})