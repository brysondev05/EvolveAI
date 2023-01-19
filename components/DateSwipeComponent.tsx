import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import ThemeColor from '~/constants/color'
import { Icon, Button } from '@ui-kitten/components'

export default function DateSwiper({ onChangeDate }) {
    const [month, setMonth] = useState<number>(0)
    const [dayString, setDayString] = useState<string>('')
    const [dateState, setDateState] = useState<number>()
    const [isToday, setIsToday] = useState<boolean>(true)
    const [year, setYear] = useState<number>()

    useEffect(() => {
        if (dateState != undefined) {
            getDayMonth()
        }
    }, [dateState])

    useEffect(() => {
        getCurrentMonth()
    }, [])

    const getCurrentMonth = () => {
        const dateObj = new Date()
        const currentDate = dateObj.getDate()
        const currentMonth = dateObj.getMonth()
        const currentYear = dateObj.getFullYear()
        setDateState(currentDate)
        setYear(currentYear)
        setMonth(currentMonth)
        console.log('current', year, month, dateState)
    }

    const checkIsToday = (someDate: Date) => {
        const today = new Date()
        if (someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear()) {
            setIsToday(true)
        }
        else setIsToday(false)
    }

    const getDayMonth = () => {
        const getDateObj = new Date(year, month, dateState)
        let day = getDateObj.getDay()
        checkIsToday(getDateObj)

        if (day == 1)
            setDayString('Monday')
        else if (day == 2)
            setDayString('Tuesday')
        else if (day == 3)
            setDayString('Wednesday')
        else if (day == 4)
            setDayString('Thursday')
        else if (day == 5)
            setDayString('Friday')
        else if (day == 6)
            setDayString('Saturday')
        else if (day == 0)
            setDayString('Sunday')

        if (month == 0) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(0)
            }
            else if (dateState > 31) {
                setMonth(1)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(11)
                setDateState(31)
                setYear(year - 1)
            }
        }

        else if (month == 1) {
            let maxFebDate
            if (year % 4 == 0) { maxFebDate = 29 }
            else { maxFebDate = 28 }
            if (dateState < maxFebDate && dateState > 0) {
                // setMonth(1)
            }
            else if (dateState > maxFebDate) {
                setMonth(2)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(0)
                setDateState(31)
            }
        }

        else if (month == 2) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(2)
            }
            else if (dateState > 31) {
                setMonth(3)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(1)
                let maxFebDate
                if (year % 4 == 0) { maxFebDate = 29 }
                else { maxFebDate = 28 }
                setDateState(maxFebDate)
            }
        }

        else if (month == 3) {
            if (dateState < 31 && dateState > 0) {
                // setMonth(3)
            }
            else if (dateState > 30) {
                setMonth(4)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(2)
                setDateState(31)
            }
        }

        else if (month == 4) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(4)
            }
            else if (dateState > 31) {
                setMonth(5)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(3)
                setDateState(30)
            }
        }

        else if (month == 5) {
            if (dateState < 31 && dateState > 0) {
                // setMonth(5)
            }
            else if (dateState > 30) {
                setMonth(6)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(4)
                setDateState(31)
            }
        }

        else if (month == 6) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(6)
            }
            else if (dateState > 31) {
                setMonth(7)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(5)
                setDateState(30)
            }
        }

        else if (month == 7) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(7)
            }
            else if (dateState > 31) {
                setMonth(8)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(6)
                setDateState(31)
            }
        }
        else if (month == 8) {
            if (dateState < 31 && dateState > 0) {
                // setMonth(8)
            }
            else if (dateState > 30) {
                setMonth(9)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(7)
                setDateState(31)
            }
        }

        else if (month == 9) {
            if (dateState < 32 && dateState > 0) {
                // setMonth(9)
            }
            else if (dateState > 31) {
                setMonth(10)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(8)
                setDateState(30)
            }
        }
        else if (month == 10) {
            if (dateState < 31 && dateState > 0) {
                //  setMonth(10) 
            }
            else if (dateState > 30) {
                setMonth(11)
                setDateState(1)
            }
            else if (dateState == 0) {
                setMonth(9)
                setDateState(31)
            }
        }
        else if (month == 11) {
            console.log('call', dateState)
            if (dateState < 32 && dateState > 0) {
                // setMonth(11)
            }
            else if (dateState > 31) {
                setMonth(0)
                setDateState(1)
                setYear(year + 1)
            }
            else if (dateState == 0) {
                setMonth(10)
                setDateState(30)
            }
        }
    }

    const getMonthString = (value: number) => {
        switch (value) {
            case 0:
                return "January"
            case 1:
                return "February"
            case 2:
                return "March"
            case 3:
                return "April"
            case 4:
                return "May"
            case 5:
                return "June"
            case 6:
                return "July"
            case 7:
                return "August"
            case 8:
                return "September"
            case 9:
                return "October"
            case 10:
                return "November"
            case 11:
                return "December"
        }
    }

    const decreaseDate = () => {
        let newDate = dateState - 1
        setDateState(newDate)
        onChangeDate(newDate, checkIsToday(new Date(year, month, dateState)))
    }
    const increaseDate = () => {
        let newDate = dateState + 1
        setDateState(newDate)
        onChangeDate(newDate, checkIsToday(new Date(year, month, dateState)))
    }

    return (
        <View style={{ backgroundColor: ThemeColor.primary, margin:10, alignContent: "center", justifyContent: "center" }}>
            <View style={{ flexDirection: "row", justifyContent: "center", alignContent: "center" }}>
                <TouchableOpacity onPress={decreaseDate}>
                    <Icon
                        name='chevron-left-outline'
                        fill={ThemeColor.skyBlue}
                        style={styles.rightIcon}
                    />
                </TouchableOpacity>
                <View style={{ justifyContent: "center", width: 220 }}>
                    {isToday ?
                        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18, }}>Today</Text> :
                        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18, }}>{dayString}, {getMonthString(month)} {dateState}</Text>
                    }
                </View>
                <TouchableOpacity onPress={increaseDate}>
                    <Icon
                        name='chevron-right-outline'
                        fill={ThemeColor.skyBlue}
                        style={styles.rightIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    rightIcon: { width: 32, height: 32, marginTop: 2 },
})
