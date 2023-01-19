import { createStackNavigator } from '@react-navigation/stack';
import { Layout, Text } from '@ui-kitten/components';
import TrainingDaysMod from './EndOfWeekMods/TrainingDaysMod';
import WeaknessMod from './EndOfWeekMods/powerlifting/WeaknessMod';
import TechniqueMod from './EndOfWeekMods/powerlifting/TechniqueMod';
import AccessoriesMod from './EndOfWeekMods/powerlifting/AccessoriesMod';
import PowerbuildingFocusMod from './EndOfWeekMods/powerbuilding/PowerbuildingFocusMod';

const ModifierStack = createStackNavigator();

const MultiModificationsScreen = ({navigation, route}) => {


    return (
        <Layout style={{ flex: 1 }}>

            <ModifierStack.Navigator>
        
            <ModifierStack.Screen 
                    name="Accessories Modifications"
                    component={AccessoriesMod}
                    options={{ headerShown: false }}
                />
                     <ModifierStack.Screen 
                    name="Technique Modifications"
                    component={TechniqueMod}
                    options={{ headerShown: false }}
                />
            <ModifierStack.Screen 
                    name="Training Days Modifications"
                    component={TrainingDaysMod}
                    options={{ headerShown: false }}

                />
       
                        <ModifierStack.Screen 
                    name="Weakness Modifications"
                    component={WeaknessMod}
                    options={{ headerShown: false }}
                />
                    
                <ModifierStack.Screen
                    name="Powerbuilding Modifications"
                    component={PowerbuildingFocusMod}
                    options={{ headerShown: false }}
                    />
            </ModifierStack.Navigator>
            </Layout>
    )
}

export default MultiModificationsScreen
