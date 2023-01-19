import { convertToKG, averages, round } from "~/helpers/Calculations"

interface IAttempt {
    weight: number, 
    units: 'lb' | 'kg'
}
interface IAttempts  {
    first: {
        attempt: IAttempt,
        status: string
    },
    second: {
        attempt: IAttempt,
        status: string,
    },
    third: {
        attempt: IAttempt,
        status: string
    }
}
export const findAttempts = ({records, max = {units: 'kg', amount: ''}}):IAttempts => {

    const {units: maxUnits, amount: maxAmount} = max


    let thirdAttempt = maxUnits === 'kg' ? Number(maxAmount) : convertToKG(maxAmount)

    if(records && !records.empty) {
        const rpe10 = []
        const singles = []
        records.forEach((doc) => {
            const record = doc.data()
            if (record.type == 'peakSingle') {
                if (record.units === 'kg') {
                    singles.push(record.amount)
                } else {
                    singles.push(convertToKG(record.amount))
                }
            } else if (record.reps <= 3) {
                    if (record.units === 'kg') {
                        rpe10.push(record.amount)
                    } else {
                        rpe10.push(convertToKG(record.amount))
                    }
                }
        })

        //If there's no recent single/double/triple RPE10 tests then get the most recent RPE10, if there has been no RPE10 then use their entered max. 
        if (rpe10?.length === 0) {
            const lastRPE10 = records.forEach(doc => {
                if(doc.data().type === 'rpe10'){
                    return doc
                }}
                )?.sort((a, b) => a.date.toDate() - b.date.toDate())[0]
            if (lastRPE10) {
                const record = lastRPE10.data()
                if (record.units === 'kg') {
                    rpe10.push(record.amount)
                } else {
                    rpe10.push(convertToKG(record.amount))
                }
            } else {
                rpe10.push(thirdAttempt)
            }
        }
        const rpe10Avg = averages(rpe10)
        const singlesAvg = averages(singles)
        
        thirdAttempt = averages([rpe10Avg, singlesAvg])
        
    }
    return  {
        third: {
            attempt: {
                weight: round(thirdAttempt, 2.5),
                units: 'kg'
            },
            status: 'pending',
        },
        second: {
            attempt: {
                weight: round(thirdAttempt * 0.96, 2.5),
                units: 'kg'
            },
            status: 'pending'
        },
        first: {
            attempt: {
                weight: round(thirdAttempt * 0.92, 2.5),
                units: 'kg'
            },
            status: 'pending'
        }
    }
}
