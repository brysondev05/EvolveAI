import { blockNiceName } from '../../helpers/blockHelpers'
import { round } from '~/helpers/Calculations'


const HYPERTROPHY_FIRST_LETTER = 'H'
const STRENGTH_FIRST_LETTER = 'S'
const PEAKING_FIRST_LETTER = 'P'

const SQUAT_HYPERTROPHY_MAX_MEV = 35
const SQUAT_HYPERTROPHY_MIN_MRV = 5
const SQUAT_STRENGTH_MAX_MEV = 30
const SQUAT_STRENGTH_MIN_MRV = 3
const SQUAT_PEAKING_MAX_MEV = 25
const SQUAT_PEAKING_MIN_MRV = 2

const BENCH_HYPERTROPHY_MAX_MEV = 40
const BENCH_HYPERTROPHY_MIN_MRV = 6
const BENCH_STRENGTH_MAX_MEV = 35
const BENCH_STRENGTH_MIN_MRV = 5
const BENCH_PEAKING_MAX_MEV = 30
const BENCH_PEAKING_MIN_MRV = 4


const DEADLIFT_HYPERTROPHY_MAX_MEV = 30
const DEADLIFT_HYPERTROPHY_MIN_MRV = 4
const DEADLIFT_STRENGTH_MAX_MEV = 25
const DEADLIFT_STRENGTH_MIN_MRV = 3
const DEADLIFT_PEAKING_MAX_MEV = 20
const DEADLIFT_PEAKING_MIN_MRV = 1

const MRVChanges = {
    1: 0.7,
    1.5: 0.8,
    2: 0.85,
    2.5: 0.95,
    3: 1,
    3.5: 1.05,
    4: 1.15,
    4.5: 1.2,
    5: 1.25
}

const tethers = {
    squat: {
        h: 16,
        s: 14,
        p: 10
    },
    bench: {
        h: 16,
        s: 14,
        p: 12
    },
    deadlift: {
        h: 16,
        s: 14,
        p: 10
    }
}

const getNewMRV = ({ thisBlockWeeks, blockVolumeData, blockType }) => {

    const periodizationNiceName = blockNiceName(blockType[0])

    const overallReadiness = {
        squat: 0,
        bench: 0,
        deadlift: 0
    }

    thisBlockWeeks.forEach(doc => {

        let { readiness } = doc.data()

        if (!readiness) {
            readiness = [3, 3, 3]
        }

        const [squatR, benchR, deadliftR] = readiness

        overallReadiness.squat += squatR
        overallReadiness.bench += benchR
        overallReadiness.deadlift += deadliftR
    })

    Object.entries(overallReadiness).forEach(([key, value]) => {
        overallReadiness[key] = round(value / thisBlockWeeks.size, 0.5)
    })


    const {
        squat: { [periodizationNiceName]: { MRV: squatMRV } },
        bench: { [periodizationNiceName]: { MRV: benchMRV } },
        deadlift: { [periodizationNiceName]: { MRV: deadliftMRV } },

    } = blockVolumeData

    return {
        squat: Math.ceil(squatMRV * MRVChanges[overallReadiness.squat]),
        bench: Math.ceil(benchMRV * MRVChanges[overallReadiness.bench]),
        deadlift: Math.ceil(deadliftMRV * MRVChanges[overallReadiness.deadlift])
    }
}

const findBlockMRV = ({maxMRV, initialMRV, minMRV}) => Math.min(maxMRV, Math.max(initialMRV, minMRV))


export const getMRVAdjustments = ({blockPeriodization, newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData}) => {

    try{
        if(blockPeriodization === HYPERTROPHY_FIRST_LETTER ){
            return getHypertrophyMRVAdjustments({newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData})
        }
        if(blockPeriodization === STRENGTH_FIRST_LETTER) {
            return getStrengthMRVAdjustments({newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData})
        }
        if(blockPeriodization === PEAKING_FIRST_LETTER) {
            return getPeakingMRVAdjustments({newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData})
        }
    } catch(e) {
        throw new Error('unable to get MRV adjustments')
    }

}
export const getPeakingMRVAdjustments = ({newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData}) => {
    const {
        squat: {
            hypertrophy: {
                 MRV: initialSquatHyperMRV},
            strength: { 
                MRV: initialSquatStrengthMRV}
        },
        bench: {
            hypertrophy: { 
                MRV: initialBenchHyperMRV},
            strength: { 
                MRV: initialBenchStrengthMRV}
        },
        deadlift: {
            hypertrophy: { 
                MRV: initialDeadliftHyperMRV},
            strength: {
                MRV: initialDeadliftStrengthMRV }
        }
    } = blockVolumeData

    const squatHyperMRVMin = newSquatMRV * 2
    const squatHyperMRVMax = newSquatMRV * 3.33
    const squatStrengthMRVMin = newSquatMRV * 1.25
    const squatStrengthMRVMax = newSquatMRV * 1.66

    const benchStrengthMRVMin = newBenchMRV * 2
    const benchStrengthMRVMax = newBenchMRV * 3.33
    const benchHyperMRVMin = newBenchMRV * 2
    const benchHyperMRVMax = newBenchMRV * 3.33

    const deadliftStrengthMRVMin = newDeadliftMRV * 1.25
    const deadliftStrengthMRVMax = newDeadliftMRV * 1.66
    const deadliftHyperMRVMin = newDeadliftMRV * 3.33
    const deadliftHyperMRVMax = newDeadliftMRV * 2

    return {
        squat: {
            hypertrophy: findBlockMRV({
                maxMRV: squatHyperMRVMax,
                initialMRV: initialSquatHyperMRV,
                minMRV: squatHyperMRVMin
            }),
            strength: findBlockMRV({
                maxMRV: squatStrengthMRVMax,
                initialMRV: initialSquatStrengthMRV,
                minMRV: squatStrengthMRVMin
            }),
            peaking: newSquatMRV
        },
        bench: {
            
            hypertrophy: findBlockMRV({
                maxMRV: benchHyperMRVMax,
                initialMRV: initialBenchHyperMRV,
                minMRV: benchHyperMRVMin
            }),
            strength: findBlockMRV({
                maxMRV: benchStrengthMRVMax,
                initialMRV: initialBenchStrengthMRV,
                minMRV: benchStrengthMRVMin
            }),
                peaking: newBenchMRV
        
        },
        deadlift: {
            hypertrophy: findBlockMRV({
                maxMRV: deadliftHyperMRVMax,
                initialMRV: initialDeadliftHyperMRV,
                minMRV: deadliftHyperMRVMin
            }),
            strength: findBlockMRV({
                maxMRV: deadliftStrengthMRVMax,
                initialMRV: initialDeadliftStrengthMRV,
                minMRV: deadliftStrengthMRVMin
            }),
            peaking: newDeadliftMRV
        }
    }
}


export const getStrengthMRVAdjustments = ({ newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData }) => {
    const {
        squat: {
            hypertrophy: {
                MRV: initialSquatHyperMRV },
            peaking: {
                MRV: initialSquatPeakingMRV }
        },
        bench: {
            hypertrophy: {
                MRV: initialBenchHyperMRV },
            peaking: {
                MRV: initialBenchPeakingMRV }
        },
        deadlift: {
            hypertrophy: {
                MRV: initialDeadliftHyperMRV },
            peaking: {
                MRV: initialDeadliftPeakingMRV }
        }
    } = blockVolumeData

    const squatHyperMRVMin = newSquatMRV * 1.25
    const squatHyperMRVMax = newSquatMRV * 1.66
    const squatPeakingMRVMin = newSquatMRV * 0.6
    const squatPeakingMRVMax = newSquatMRV * 0.8

    const benchHyperMRVMin = newBenchMRV * 1.33
    const benchHyperMRVMax = newBenchMRV * 1.66
    const benchPeakingMRVMin = newBenchMRV * 0.6
    const benchPeakingMRVMax = newBenchMRV * 0.8

    const deadliftHyperMRVMin = newDeadliftMRV * 1.25
    const deadliftHyperMRVMax = newDeadliftMRV * 1.66
    const deadliftPeakingMRVMin = newDeadliftMRV * 0.6
    const deadliftPeakingMRVMax = newDeadliftMRV * 0.8

    return {
        squat: {

            strength: newSquatMRV,
            hypertrophy: findBlockMRV({
                maxMRV: squatHyperMRVMax,
                initialMRV: initialSquatHyperMRV,
                minMRV: squatHyperMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: squatPeakingMRVMax,
                initialMRV: initialSquatPeakingMRV,
                minMRV: squatPeakingMRVMin
            }),
        },
        bench: {

            strength: newBenchMRV,
            hypertrophy: findBlockMRV({
                maxMRV: benchHyperMRVMax,
                initialMRV: initialBenchHyperMRV,
                minMRV: benchHyperMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: benchPeakingMRVMax,
                initialMRV: initialBenchPeakingMRV,
                minMRV: benchPeakingMRVMin
            }),

        },
        deadlift: {
            strength: newDeadliftMRV,
            hypertrophy: findBlockMRV({
                maxMRV: deadliftHyperMRVMax,
                initialMRV: initialDeadliftHyperMRV,
                minMRV: deadliftHyperMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: deadliftPeakingMRVMax,
                initialMRV: initialDeadliftPeakingMRV,
                minMRV: deadliftPeakingMRVMin
            }),
        }
    }
}

export const getHypertrophyMRVAdjustments = ({ newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData }) => {

    const {
        squat: {
    
            strength: { 
                MRV: initialSquatStrengthMRV},
            peaking: { 
                MRV: initialSquatPeakingMRV }
        },
        bench: {
         
            strength: { 
                MRV: initialBenchStrengthMRV},
            peaking: { 
                MRV: initialBenchPeakingMRV }
        },
        deadlift: {
           
            strength: {
                MRV: initialDeadliftStrengthMRV},
            peaking: { 
                MRV: initialDeadliftPeakingMRV}
        }
    } = blockVolumeData

    const squatStrengthMRVMin = newSquatMRV * 0.6
    const squatStrengthMRVMax = newSquatMRV * 0.8
    const squatPeakingMRVMin = newSquatMRV * 0.3
    const squatPeakingMRVMax = newSquatMRV * 0.5

    const benchStrengthMRVMin = newBenchMRV * 0.6
    const benchStrengthMRVMax = newBenchMRV * 0.8
    const benchPeakingMRVMin = newBenchMRV * 0.3
    const benchPeakingMRVMax = newBenchMRV * 0.5

    const deadliftStrengthMRVMin = newDeadliftMRV * 0.6
    const deadliftStrengthMRVMax = newDeadliftMRV * 0.8
    const deadliftPeakingMRVMin = newDeadliftMRV * 0.3
    const deadliftPeakingMRVMax = newDeadliftMRV * 0.5



    return {
        squat: {
            hypertrophy: newSquatMRV,
            strength: findBlockMRV({
                maxMRV: squatStrengthMRVMax,
                initialMRV: initialSquatStrengthMRV,
                minMRV: squatStrengthMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: squatPeakingMRVMax,
                initialMRV: initialSquatPeakingMRV,
                minMRV: squatPeakingMRVMin
            }),
        },
        bench: {

            hypertrophy: newBenchMRV,
            strength: findBlockMRV({
                maxMRV: benchStrengthMRVMax,
                initialMRV: initialBenchStrengthMRV,
                minMRV: benchStrengthMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: benchPeakingMRVMax,
                initialMRV: initialBenchPeakingMRV,
                minMRV: benchPeakingMRVMin
            }),

        },
        deadlift: {
            hypertrophy: newDeadliftMRV,
            strength: findBlockMRV({
                maxMRV: deadliftStrengthMRVMax,
                initialMRV: initialDeadliftStrengthMRV,
                minMRV: deadliftStrengthMRVMin
            }),
            peaking: findBlockMRV({
                maxMRV: deadliftPeakingMRVMax,
                initialMRV: initialDeadliftPeakingMRV,
                minMRV: deadliftPeakingMRVMin
            }),
        }
    }
}

const getNewMEV = ({ MEV, MRV }) => {
    if (MEV <= MRV) {
        return MEV
    }
    return MRV
}


export const getMEVAdjustments = ({ blockVolumeData, newMRVValues }) => {

    const {
        squat: {
            hypertrophy: {

                MEV: initialSquatHyperMEV },
            strength: {

                MEV: initialSquatStrengthMEV },
            peaking: {

                MEV: initialSquatPeakingMEV }
        },
        bench: {
            hypertrophy: {

                MEV: initialBenchHyperMEV },
            strength: {

                MEV: initialBenchStrengthMEV },
            peaking: {

                MEV: initialBenchPeakingMEV }
        },
        deadlift: {
            hypertrophy: {

                MEV: initialDeadliftHyperMEV },
            strength: {

                MEV: initialDeadliftStrengthMEV },
            peaking: {

                MEV: initialDeadliftPeakingMEV }
        }
    } = blockVolumeData
    const {
        squat: {
            hypertrophy: squatHyperMRV,
            strength: squatStrengthMRV,
            peaking: squatPeakingMRV
        },
        bench: {
            hypertrophy: benchHyperMRV,
            strength: benchStrengthMRV,
            peaking: benchPeakingMRV
        },
        deadlift: {
            hypertrophy: deadliftHyperMRV,
            strength: deadliftStrengthMRV,
            peaking: deadliftPeakingMRV
        }
    } = newMRVValues

    return {
        squat: {
            hypertrophy: getNewMEV({ MEV: initialSquatHyperMEV, MRV: squatHyperMRV }),
            strength: getNewMEV({ MEV: initialSquatStrengthMEV, MRV: squatStrengthMRV }),
            peaking: getNewMEV({ MEV: initialSquatPeakingMEV, MRV: squatPeakingMRV }),
        },
        bench: {
            hypertrophy: getNewMEV({ MEV: initialBenchHyperMEV, MRV: benchHyperMRV }),
            strength: getNewMEV({ MEV: initialBenchStrengthMEV, MRV: benchStrengthMRV }),
            peaking: getNewMEV({ MEV: initialBenchPeakingMEV, MRV: benchPeakingMRV }),
        },
        deadlift: {
            hypertrophy: getNewMEV({ MEV: initialDeadliftHyperMEV, MRV: deadliftHyperMRV }),
            strength: getNewMEV({ MEV: initialDeadliftStrengthMEV, MRV: deadliftStrengthMRV }),
            peaking: getNewMEV({ MEV: initialDeadliftPeakingMEV, MRV: deadliftPeakingMRV }),
        }
    }

}

const checkTethers = ({MEV, MRV, tether, maxMEV, minMRV}) => {

    let finalMEV = MEV
    let finalMRV = MRV

    if((MRV - MEV) > tether) {
    
            finalMRV = MEV + tether,
            finalMRV = Math.round(MEV + (MRV - MEV) * 0.2)
    }

    return {
        MEV: Math.min(Math.round(finalMEV), maxMEV),
        MRV: Math.max(Math.round(finalMRV), minMRV),
    }
}


export const getNewVolumeData = ({ thisBlockWeeks, blockVolumeData, blockType}) => {

    const {
        squat: newSquatMRV,
        bench: newBenchMRV,
        deadlift: newDeadliftMRV
    } = getNewMRV({ thisBlockWeeks, blockVolumeData, blockType })


    const newMRVValues = getMRVAdjustments({ newSquatMRV, newBenchMRV, newDeadliftMRV, blockVolumeData, blockPeriodization: blockType[0] })

    const {
        squat: {
            hypertrophy: squatHyperMRV,
            strength: squatStrengthMRV,
            peaking: squatPeakingMRV
        },
        bench: {
            hypertrophy: benchHyperMRV,
            strength: benchStrengthMRV,
            peaking: benchPeakingMRV
        },
        deadlift: {
            hypertrophy: deadliftHyperMRV,
            strength: deadliftStrengthMRV,
            peaking: deadliftPeakingMRV
        }
    } = newMRVValues

    const {
        squat: {
            hypertrophy: squatHyperMEV,
            strength: squatStrengthMEV,
            peaking: squatPeakingMEV
        },
        bench: {
            hypertrophy: benchHyperMEV,
            strength: benchStrengthMEV,
            peaking: benchPeakingMEV
        },
        deadlift: {
            hypertrophy: deadliftHyperMEV,
            strength: deadliftStrengthMEV,
            peaking: deadliftPeakingMEV
        }
    } = getMEVAdjustments({blockVolumeData, newMRVValues })


    return {
        squat: {
            hypertrophy: checkTethers({
                MEV:squatHyperMEV, 
                MRV: squatHyperMRV, 
                tether: tethers.squat.h, 
                maxMEV: SQUAT_HYPERTROPHY_MAX_MEV, 
                minMRV: SQUAT_HYPERTROPHY_MIN_MRV
            }),
            
            strength: checkTethers({
                MEV:squatStrengthMEV, 
                MRV: squatStrengthMRV, 
                tether: tethers.squat.s, 
                maxMEV: SQUAT_STRENGTH_MAX_MEV, 
                minMRV: SQUAT_STRENGTH_MIN_MRV
            }),

            peaking: checkTethers({
                MEV:squatPeakingMEV, 
                MRV: squatPeakingMRV, 
                tether: tethers.squat.p, 
                maxMEV: SQUAT_PEAKING_MAX_MEV, 
                minMRV: SQUAT_PEAKING_MIN_MRV
            })
        },
        bench: {
            hypertrophy: checkTethers({
                MEV:benchHyperMEV, 
                MRV: benchHyperMRV, 
                tether: tethers.bench.h, 
                maxMEV: BENCH_HYPERTROPHY_MAX_MEV, 
                minMRV: BENCH_HYPERTROPHY_MIN_MRV
            }),
            
            strength: checkTethers({
                MEV:benchStrengthMEV, 
                MRV: benchStrengthMRV, 
                tether: tethers.bench.s, 
                maxMEV: BENCH_STRENGTH_MAX_MEV, 
                minMRV: BENCH_STRENGTH_MIN_MRV
            }),

            peaking: checkTethers({
                MEV:benchPeakingMEV, 
                MRV: benchPeakingMRV, 
                tether: tethers.bench.p, 
                maxMEV: BENCH_PEAKING_MAX_MEV, 
                minMRV: BENCH_PEAKING_MIN_MRV
            })
        },
        deadlift: {
            hypertrophy: checkTethers({
                MEV:deadliftHyperMEV, 
                MRV: deadliftHyperMRV, 
                tether: tethers.deadlift.h, 
                maxMEV: DEADLIFT_HYPERTROPHY_MAX_MEV, 
                minMRV: DEADLIFT_HYPERTROPHY_MIN_MRV
            }),
            
            strength: checkTethers({
                MEV:deadliftStrengthMEV, 
                MRV: deadliftStrengthMRV, 
                tether: tethers.deadlift.s, 
                maxMEV: DEADLIFT_STRENGTH_MAX_MEV, 
                minMRV: DEADLIFT_STRENGTH_MIN_MRV
            }),

            peaking: checkTethers({
                MEV:deadliftPeakingMEV, 
                MRV: deadliftPeakingMRV, 
                tether: tethers.deadlift.p, 
                maxMEV: DEADLIFT_PEAKING_MAX_MEV, 
                minMRV: DEADLIFT_PEAKING_MIN_MRV
            })
        },
    }
}



