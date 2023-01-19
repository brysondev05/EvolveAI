import { useState, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native'
import produce from 'immer'

const useDailyMovementAdj = () => {
 

    const [adjustmentValues, setAdjustmentValues] = useState({
        squat: [], bench: [], deadlift: []
    })



    const updateAdjustmentValue = useCallback(({movement, index, value}) => {
        const updatedAdjustment = produce(adjustmentValues, draft => {
            draft[movement][index] = value
        }) 
        setAdjustmentValues(updatedAdjustment)
    }, [setAdjustmentValues, adjustmentValues])


    useEffect(() => {
        
    }, [adjustmentValues, setAdjustmentValues, updateAdjustmentValue])

    return {
        adjustmentValues, 
        setAdjustmentValues,
        updateAdjustmentValue
    }
}

export default useDailyMovementAdj
