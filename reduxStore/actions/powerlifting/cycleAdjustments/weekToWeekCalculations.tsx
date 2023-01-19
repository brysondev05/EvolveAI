import { blockNiceName } from "../helpers/blockHelpers"

const hypertrophyAdj = {
    4: {
        0: [0, 0, 0, 1, 1],
        1: [0, 0, 1, 1, 1],
        2: [0, 0, 1, 2, 2],
        3: [0, 1, 2, 3, 3],
        4: [0, 1, 3, 4, 4]
    },
    5: {
        0: [0, 0, 0, 1, 1],
        1: [0, 0, 1, 1, 1],
        2: [0, 0, 1, 1, 2],
        3: [0, 1, 2, 2, 2],
        4: [0, 1, 2, 3, 3]
    }
}
const strengthAdj = {
    4: {
        0: [1, 1, 0, 0, 0],
        1: [1, 1, 1, 0, 0],
        2: [2, 2, 1, 0, 0],
        3: [3, 3, 2, 1, 0],
        4: [4, 4, 3, 1, 0]
    },
    5: {
        0: [1, 1, 0, 0, 0],
        1: [1, 1, 1, 0, 0],
        2: [2, 1, 1, 0, 0],
        3: [2, 2, 2, 1, 0],
        4: [3, 3, 2, 1, 0]
    }
}

const HYPERTROPHY_FIRST_LETTER = 'H'

export const findNextMEV = ({ blockPeriodization, MEV, adjustment }) => {
    let nextMEV = MEV
    if (blockPeriodization === HYPERTROPHY_FIRST_LETTER) {
        nextMEV += adjustment
    }
    return nextMEV < 1 ? 1 : nextMEV
}

export const findNextMRV = ({ blockPeriodization, MRV, adjustment }) => {

    let nextMRV = MRV
    if (blockPeriodization !== HYPERTROPHY_FIRST_LETTER) {
        nextMRV -= adjustment
    }
    return nextMRV < 1 ? 1 : nextMRV
}

export const findEventRange = (MEV:number, MRV:number): number => {

    const initialRange = MRV - MEV;
    // console.log(initialRange);

    if(initialRange >= 8) {
        return 4;
    } else if(initialRange >= 6){
        return 3;
    } else if(initialRange >= 4){
        return 2;
    } else if(initialRange >= 2){
        return 1;
    } else if(initialRange == 1) {
        return 1 
    } else {
        return 0;
    }
}


export const getEvents = ({ squatMEV, squatMRV, benchMEV, benchMRV, deadliftMEV, deadliftMRV }) => {

    return {
        squat: findEventRange(squatMEV, squatMRV),
        bench: findEventRange(benchMEV, benchMRV),
        deadlift: findEventRange(deadliftMEV, deadliftMRV)
    }
}

export const getAdjustments = ({ blockPeriodization, blockLengthAdj, squatEvent, benchEvent, deadliftEvent, finalSquat, finalBench, finalDeadlift }) => {
    const readinessAdj = blockPeriodization === 'H' ? hypertrophyAdj : strengthAdj
    return {
        squat: readinessAdj[blockLengthAdj][squatEvent][finalSquat],
        bench: readinessAdj[blockLengthAdj][benchEvent][finalBench],
        deadlift: readinessAdj[blockLengthAdj][deadliftEvent][finalDeadlift]
    }
}


export const getNextWeekVolume = ({ blockVolume, blockType, finalSquat, finalBench, finalDeadlift, blockVolumeData }) => {

    const [squatVolume, benchVolume, deadliftVolume] = blockVolume
    const blockPeriodization = blockType[0]

  

    const blockName = blockNiceName(blockPeriodization)

    const blockLengthAdj = Number(blockType[1]) <= 4 ? 4 : 5

    const {
        squat: {
            [blockName]: {
                MEV: squatMEV,
                MRV: squatMRV,
            }
        },
        bench: {
            [blockName]: {
                MEV: benchMEV,
                MRV: benchMRV,
            }
        },
        deadlift: {
            [blockName]: {
                MEV: deadliftMEV,
                MRV: deadliftMRV,
            }
        }
    } = blockVolumeData


    const { squat: squatEvent, bench: benchEvent, deadlift: deadliftEvent } = getEvents({ squatMEV, squatMRV, benchMEV, benchMRV, deadliftMEV, deadliftMRV })



    const { squat: squatAdj, bench: benchAdj, deadlift: deadliftAdj } = getAdjustments({ blockPeriodization, blockLengthAdj, squatEvent, benchEvent, deadliftEvent, finalSquat: finalSquat - 1, finalBench: finalBench - 1, finalDeadlift: finalDeadlift - 1 })

    return [
        {
            type: 'squat',
            MEV: findNextMEV({ blockPeriodization, MEV: squatVolume.MEV, adjustment: squatAdj }),
            MRV: findNextMRV({ blockPeriodization, MRV: squatVolume.MRV, adjustment: squatAdj })
        },
        {
            type: 'bench',
            MEV: findNextMEV({ blockPeriodization, MEV: benchVolume.MEV, adjustment: benchAdj }),
            MRV: findNextMRV({ blockPeriodization, MRV: benchVolume.MRV, adjustment: benchAdj })
        },
        {
            type: 'deadlift',
            MEV: findNextMEV({ blockPeriodization, MEV: deadliftVolume.MEV, adjustment: deadliftAdj }),
            MRV: findNextMRV({ blockPeriodization, MRV: deadliftVolume.MRV, adjustment: deadliftAdj })
        }

    ]
}