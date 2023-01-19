import { View, Dimensions, Touchable, TouchableOpacity, Image, FlatList, StatusBar, StyleSheet, SectionList, Modal, SafeAreaView, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { Layout, Text, Input, Select,SelectItem,IndexPath,SelectGroup,Icon } from '@ui-kitten/components';
import NuutritionTabHeader from '~/components/NuutritionTabHeader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormControl, {
    SuffixInput,
} from '~/components/presentational/FormComponents'
import { useDimensions } from '~/hooks/utilities/useDimensions';
import ThemeColor from '~/constants/color';

    const energyUnits = [
        'kcal',
        'joule',
        'watt'
    ]

function AddManualFoodScreen({ navigation }) {
    const dimensions = useDimensions()
    const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
    const [inputFocused, setInputFocused] = useState<number>()

    const renderIcon = (props: any) => (
                <Icon {...props} style={{height: 20,width: 20}} fill="#fff" name={'chevron-down-outline'}/>
      )
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView>
                <Layout style={[styles.row,styles.headerContainer]}>
                    <View style={{width: dimensions.screen.width*0.25}}/>
                    <View style={styles.row}>
                    <Image source={require('../../assets/icons/pencil.png')} style={styles.pencilIconStyle} />
                    <Text style={styles.headerText}>Manual Entry</Text>
                    </View>
                    <TouchableOpacity style={styles.crossContainer} onPress={()=>{navigation.goBack()}}>
                        <Image source={require('../../assets/icons/x.png')} style={styles.crossImage} />
                    </TouchableOpacity>
                </Layout>
                <Layout style={styles.formContainer}>
                    <Layout style={styles.textAndInputContainer}>
                        <Text style={styles.textInputHeading}>Name</Text>
                        <Input
                            style={{...styles.textInputStyle, borderColor: inputFocused == 0 ? ThemeColor.skyBlue: ThemeColor.primary}}
                            placeholder='Enter food name or description'
                            size='large'
                            onFocus={()=> setInputFocused(0)}
                            onBlur={()=> setInputFocused(-1)}
                        />
                    </Layout>
                    <Layout style={styles.textAndInputContainer}>
                        <Text style={styles.textInputHeading}>Energy</Text>
                        
                         <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            <Input
                                style={{...styles.textInputStyle,flex: .70,marginRight: 5,borderColor: inputFocused == 1 ? ThemeColor.skyBlue: ThemeColor.primary}}
                                placeholder=''
                                size='large'
                                onFocus={()=> setInputFocused(1)}
                                onBlur={()=> setInputFocused(-1)}
                            />
                            
                            <Select 
                                style={{flex:.30, backgroundColor: '#060C21',borderRadius: 10 ,overflow:'hidden', marginTop: 10,borderColor:'red' }}
                                placeholder='Default'
                                selectedIndex={selectedIndex}
                                value={energyUnits[selectedIndex.row]}
                                onSelect={index => setSelectedIndex(index)}
                                accessoryRight={renderIcon}
                                size="large"
                                onFocus={()=> setInputFocused(6)}
                                // onBlur={()=> setInputFocused(-1)}
                                >
                                <SelectItem title='kcal'/>
                                <SelectItem title='joule'/>
                                <SelectItem title='watt'/>
                            </Select>
                                
                                {/* onSelect={index => handleReadinessChange('squat', index)}> */}
                                {/* {['readinessRatings'].map((item)=>(
                                    <Text>{item}</Text>
                                ))}
                            </Select>  */}
                         </View>
                    </Layout>
                   
                    <Layout style={styles.textAndInputContainer}>
                        <Text style={styles.textInputHeading}>Protein</Text>
                        <SuffixInput
                            status={'basic'}
                            size='large'
                            keyboardType='decimal-pad'
                            suffix={'g'}
                            textAlign='left'
                            style={{ ...styles.textInputStyle, backgroundColor: '#060C21',borderColor: inputFocused ==  2 ? ThemeColor.skyBlue: ThemeColor.primary }}
                            onFocus={()=> setInputFocused(2)}
                            onBlur={()=> setInputFocused(-1)}
                        />
                    </Layout>
                    <Layout style={styles.textAndInputContainer}>
                        <Text style={styles.textInputHeading}>Fat</Text>
                        <SuffixInput
                            status={'basic'}
                            size='large'
                            keyboardType='decimal-pad'
                            suffix={'g'}
                            textAlign='left'
                            style={{ ...styles.textInputStyle, backgroundColor: '#060C21',borderColor: inputFocused == 3 ? ThemeColor.skyBlue: ThemeColor.primary }}
                            onFocus={()=> setInputFocused(3)}
                            onBlur={()=> setInputFocused(-1)}
                        />
                    </Layout>
                    <Layout style={styles.textAndInputContainer}>
                        <Text style={styles.textInputHeading}>Carbs</Text>
                        <SuffixInput
                            status={'basic'}
                            size='large'
                            keyboardType='decimal-pad'
                            suffix={'g'}
                            textAlign='left'
                            style={{ ...styles.textInputStyle, backgroundColor: '#060C21',borderColor: inputFocused == 4 ? ThemeColor.skyBlue: ThemeColor.primary }}
                            onFocus={()=> setInputFocused(4)}
                            onBlur={()=> setInputFocused(-1)}
                        />
                    </Layout>
                </Layout>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
export default AddManualFoodScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#20273E'
    },
    row:{
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerContainer: {
        backgroundColor: '#20273E',
        margin: 15,
        justifyContent: "space-between",
    },
    pencilIconStyle: {
        height: 24,
        width: 24,
    },
    headerText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10
    },
    crossContainer: {
        justifyContent: "flex-end",
        backgroundColor: '#20273E',
    },
    crossImage: {
        height: 24,
        width: 24,
        marginLeft: 90
    },
    formContainer: {
        margin: 25,
        backgroundColor: '#20273E'
    },
    textInputHeading: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 5,
        color: "#9C9FAE"
    },
    textInputStyle: {
        borderRadius: 10,
        marginTop: 10
    },
    textAndInputContainer: {
        marginVertical: 15,
        backgroundColor: '#20273E'
    },

})