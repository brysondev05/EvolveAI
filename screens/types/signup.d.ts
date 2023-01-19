import {AuthStackParamList} from './navigation';
import { StackNavigationProp } from '@react-navigation/stack';

export interface IUserBioData {
    birthday: Date,
    gender: string,
    genderIndex: number,
    bodyweight: string,
    units: string,
    unitsIndex: number,
    height: string,
    dietType: number, 
    dietGoal: number,
    trainingHistory: number,
    historicRecovery: number,
    historicWorkload: number,
    sleep: number,
    lifeStress: number,
}

export interface IUserProgramData {
    program: string,
    programIndex: number,
    startDate: Date,
    meetDate: Date,
    daysPerWeek: number,
    trainingDays: number,
    meetIndex: number

}

export type SignUpScreenProp = StackNavigationProp<
    AuthStackParamList,
    'SignUp'
>;

export type BioDataProps = {
    navigation: SignUpScreenProp
    userBioData: IUserBioData,
    setUserBioData: any,
    swiper: any,
    setHeaderIndex: any,
    nextSlide: any,
    prevSlide: any,
    route: any
}

export type ProgramSelectionProps = {
    navigation: SignUpScreenProp,
    programData: IUserProgramData,  
    setProgramData: any,
    swiper: any, 
    nextSlide: any, 
    prevSlide: any,
    setHeaderIndex: any,
    route: any
}
type LiftData = {
    style: number,
    max: string,
    units: string,
    weakness: number,
}
export interface IUserLiftingData {
    squat: liftData,
    bench: liftData,
    deadlift: liftData
}

export type LiftingDataProps = {
    navigation: SignUpScreenProp,
    userLiftingData: IUserLiftingData,
    setUserLiftingData: any,
    swiper: any,
    nextSlide: any,
    prevSlide: any,
    units: string,
    route: any
}

