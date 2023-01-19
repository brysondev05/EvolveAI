import classifications from '../data/lifterClassifications.json'

export interface classification {
    gender: string,
    style: string,
    weight: number,
    type: string,
    classes: Array<number>
}

export type TClassification = {[index:string]: Array<classification>}

export const blockNiceName = (block: string) => {
    if (block === 'H') {
        return 'hypertrophy'
    }
    if (block === 'P') {
        return 'peaking'
    }
    if (block === 'S') {
        return 'strength'
    }
    throw new Error(`block ${block} no found`)
}

/**
 * Find lifter class, taken from lifterClassifications.json 
 * If return value is dataValue it will return MEV/MRV, if Class it will return the class as an integer:
 * 1 = Class IV
 * 2 = Class III
 * 3 = Class II
 * 5 = Class I
 * 6 = Master
 * 7 = Elite
 * 8 = Int.Elite
 * @param gender 
 * @param bodyWeight 
 * @param style 
 * @param type 
 * @param weight
 * @param returnType 
 */
export function findLifterClass({gender = 0, bodyweight = 52, style = "Raw", type = "Total", weight = 100, returnType = "dataValue"}) {

    const genderString = gender === 0 ? 'Male' : 'Female'
    
    const base = {
        "weight": 1000000,
        "classes": [],
        "gender": 'Male',
        "type": "Deadlift",
        "style": "Raw"
    }


    const genderClass = (classifications)[genderString];


    const classes = Object.values(genderClass).filter((item) => item.weight >= bodyweight && item.style === style && item.type === type)
    
    
    const lifterClass = classes.reduce((prev, curr) => prev.weight <= curr.weight ? prev : curr, base);


    const availableClasses = lifterClass.classes.filter(item => item <= weight).length - 1;

    const finalClass = availableClasses < 0 ? 0 : availableClasses;

  
    // if(returnType === 'class') {
    //     return finalClass;
    // } 
    // return dataValues.classes[finalClass];

return finalClass
}