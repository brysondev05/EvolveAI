import { createContext } from 'react';
import {creationFlow} from '~/navigators/SignUpFlowScreens'

export const FlowContext = createContext(creationFlow.signUpScreens)