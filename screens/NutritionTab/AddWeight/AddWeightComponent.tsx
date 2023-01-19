import React, { useEffect, useState } from 'react'
import { Layout, Text, Input, Icon } from '@ui-kitten/components';
import { StyleSheet, View, Image, Button, TouchableOpacity, TouchableWithoutFeedback, } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useDimensions } from '~/hooks/utilities/useDimensions';
import FormControl, {
    SuffixInput,
} from '~/components/presentational/FormComponents'
import { useTypedSelector } from '~/reduxStore/reducers';

type DataPayloadType = {
    date?: String,
    time?: String,
    weight?: Number,
    bodyFatPercentage?: Number,
    weightUnit?: String
}

export default function AddWeightComponent({
    isVisible,
    setModalVisibility,
    onChangeSubmit = (p: DataPayloadType) => { }
}) {
    const currentTime = new Date(Date.now())
    const userBioData = useTypedSelector((state) => state.signUp.userBioData)
    const [inputFocused, setInputFocused] = useState<number>()
    const [selectedMode, setSelectedMode] = useState<string>('date')
    const [showPicker, setShowPicker] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>(moment(new Date()).format("MMM DD, YYYY"))
    const [selectedTime, setSelectedTime] = useState<string>(moment(new Date()).format("hh:mm A"))
    const [dataPayload, setDataPayload] = useState<DataPayloadType>({
        date: selectedDate,
        time: selectedTime,
        weight: 0,
        bodyFatPercentage: 0.0,
        weightUnit: userBioData?.units === 'standard' ? 'lb' : 'kg'
    })

    const setPayloadState = (payload: DataPayloadType) => {
        setDataPayload(prev => ({
            ...prev,
            ...payload
        }))
    }

    useEffect(() => {
        onChangeSubmit(dataPayload)
    }, [
        selectedDate,
        selectedTime,
        dataPayload.bodyFatPercentage,
        dataPayload.weight,
        dataPayload.weightUnit
        // isVisible
    ])

    const dimensions = useDimensions()

    const handleTimeConfirm = (time) => {
        setSelectedTime(moment(time).format("hh:mm A"))
        setPayloadState({
            time: moment(time).format("hh:mm A"),
        })
        hidePicker();
    };

    const handleDateConfirm = (date) => { 
        setSelectedDate(moment(date).format("MMM DD, YYYY"))
        setPayloadState({
            date: moment(date).format("MMM DD, YYYY")
        })
        hidePicker();
    };

    const handlePicker = (value: string) => {
        setShowPicker(value)
    }

    const hidePicker = () => {
        setShowPicker('');
    };

    return (
        <Layout style={{ ...styles.contentWrapper, height: dimensions.screen.height * 0.6, width: dimensions.screen.width }}>
            <Layout style={[styles.headerBottomContainer, styles.row]}>
                <View style={{ width: dimensions.screen.width * 0.2 }} />
                <View style={styles.row}>
                    <Image source={require('../../../assets/icons/weight-scale1.png')} style={styles.weightIcon} />
                    <Text style={styles.weightText}>Enter Weight</Text>
                </View>
                <TouchableOpacity style={styles.cancelButtonWrapper} onPress={() => setModalVisibility(false)}>
                    <Image source={require('../../../assets/icons/x.png')} style={styles.cancelIcon} />
                </TouchableOpacity>
            </Layout>
            <Layout style={styles.dateTimeWrapper}>

                <TouchableWithoutFeedback
                    onPress={() => {
                        handlePicker('date')
                    }}>
                    <Layout style={styles.dateTimeContainer}>
                        <Text>{selectedDate}</Text>
                        <Icon
                            name={showPicker != 'date' ? 'chevron-down' : 'chevron-up'}
                            fill={'#04E2E7'}
                            style={styles.chevronIcon}
                        />
                    </Layout>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                    isVisible={showPicker == 'date' && true}
                    mode={'date'}
                    onConfirm={(value) => selectedMode == 'date' ? handleDateConfirm(value) : handleTimeConfirm(value)}
                    onCancel={hidePicker}
                    display={'inline'}
                    is24Hour={false}
                    isDarkModeEnabled={true}
                    buttonTextColorIOS='#04E2E7'
                    themeVariant='dark'
                />
                <TouchableWithoutFeedback
                    onPress={() => {
                        handlePicker('time')
                    }}>
                    <Layout style={{ ...styles.dateTimeContainer, marginLeft: 10 }}>
                        <Text>{selectedTime}</Text>
                        <Icon
                            name={showPicker != 'time' ? 'chevron-down' : 'chevron-up'}
                            fill={'#04E2E7'}
                            style={styles.chevronIcon}
                        />
                    </Layout>
                </TouchableWithoutFeedback>
                <DateTimePickerModal
                    isVisible={showPicker == 'time' && true}
                    mode={'time'}
                    is24Hour={false}
                    onConfirm={handleTimeConfirm}
                    onCancel={hidePicker}
                    buttonTextColorIOS='#04E2E7'
                    isDarkModeEnabled
                    themeVariant='dark'
                />
            </Layout >
            <Text style={styles.textInputHeading}>Weight</Text>
            <SuffixInput
                status={'basic'}
                size='medium'
                keyboardType='decimal-pad'
                suffix={dataPayload?.weightUnit}
                textAlign='left'
                style={{ ...styles.textInputStyle, borderWidth: 0.5, borderColor: inputFocused == 0 ? '#04E2E7' : '#060C21' }}
                onFocus={() => setInputFocused(0)}
                onBlur={() => setInputFocused(-1)}
                onChangeText={(t: string) => {
                    setPayloadState({ weight: parseFloat(t) })
                }}
            />
            <Text style={styles.textInputHeading}>Body Fat</Text>
            <SuffixInput
                status={'basic'}
                size='medium'
                keyboardType='decimal-pad'
                suffix={'%'}
                textAlign='left'
                style={{ ...styles.textInputStyle, borderWidth: 0.5, borderColor: inputFocused == 1 ? '#04E2E7' : '#060C21' }}
                onFocus={() => setInputFocused(1)}
                onBlur={() => setInputFocused(-1)}
                onChangeText={(t: string) => {
                    setPayloadState({ bodyFatPercentage: parseFloat(t) })
                }}
            />
        </Layout>
    )
}

const styles = StyleSheet.create({
    contentWrapper: {
        backgroundColor: '#20273E',
        alignContent: 'center',
        padding: 20
    },
    headerBottomContainer: {
        backgroundColor: '#20273E',
        marginTop: 13,
        justifyContent: "space-between",
        // alignSelf:'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    weightIcon: {
        height: 22,
        width: 22,
    },
    weightText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10
    },
    cancelButtonWrapper: {
        justifyContent: "flex-end",
        backgroundColor: '#20273E',
    },
    cancelIcon: {
        height: 24,
        width: 24,
        marginLeft: 90
    },
    dateTimeWrapper: {
        backgroundColor: "#20273E",
        alignItems: "center",
        marginTop: 25,
        flexDirection: "row",
        justifyContent: "center"
    },
    dateTimeContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        // width: 100,
        backgroundColor: '#060C21',
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    chevronIcon: {
        width: 20,
        height: 20,
    },
    dateTimeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500"
    },
    textInputContainer: {
        marginVertical: 15,
        backgroundColor: "#20273E",
    },
    textInputStyle: {
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: '#060C21',
        // borderWidth:2
    },
    textInputHeading: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 5,
        color: "#9C9FAE",
        marginTop: 25
    },
})