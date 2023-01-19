import 'react-native-reanimated'
import './before'; // <--- first import
import 'react-native-gesture-handler';
import 'expo-asset';
import { registerRootComponent } from 'expo';
import '@react-native-firebase/app';
import App from './App';

// if(!__DEV__) {
//     console.log = () => {};
// }

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
