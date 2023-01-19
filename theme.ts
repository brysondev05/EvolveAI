import { ColorSpace } from 'react-native-reanimated'
import ThemeColor from './constants/color'

const secondaryColor = {
  'color-secondary-100': '#CAFCEA',
  'color-secondary-200': '#95FADE',
  'color-secondary-300': '#60F0D4',
  'color-secondary-400': '#38E1CF',
  'color-secondary-500': ThemeColor.skyBlue,
  'color-secondary-600': '#00A3B0',
  'color-secondary-700': '#007B93',
  'color-secondary-800': '#005976',
  'color-secondary-900': '#004162',
  'color-secondary-transparent-100': 'rgba(4, 226, 231, 0.08)',
  'color-secondary-transparent-200': 'rgba(4, 226, 231, 0.16)',
  'color-secondary-transparent-300': 'rgba(4, 226, 231, 0.24)',
  'color-secondary-transparent-400': 'rgba(4, 226, 231, 0.32)',
  'color-secondary-transparent-500': 'rgba(4, 226, 231, 0.4)',
  'color-secondary-transparent-600': 'rgba(4, 226, 231, 0.48)',
  'background-basic-color-1': ThemeColor.primary,
  'background-basic-color-2': ThemeColor.primary,
  'background-basic-color-3': ThemeColor.secondary,
  'background-basic-color-4': ThemeColor.primary,
  'background-basic-color-5': ThemeColor.primary,
  'background-basic-color-toggle-thumb': ThemeColor.white,
}

const evaDarkTheme = {
  ...secondaryColor,
  'color-basic-100': '#F5F5F6',
  'color-basic-200': '#E4E4E9',
  'color-basic-300': '#D4D4DE',
  'color-basic-400': '#A9AAB7',
  'color-basic-500': '#7E8092',
  'color-basic-600': '#555665',
  'color-basic-700': '#494A55',
  'color-basic-800': ThemeColor.primary, // different from styleguide
  'color-basic-900': ThemeColor.primary, // different from styleguide
  'color-basic-1000': ThemeColor.secondary, // different from styleguide
  'color-basic-1100': ThemeColor.secondary, // different from styleguide
  'color-basic-transparent-100': 'rgba(85, 86, 101, 0.08)',
  'color-basic-transparent-200': 'rgba(85, 86, 101, 0.16)',
  'color-basic-transparent-300': 'rgba(85, 86, 101, 0.24)',
  'color-basic-transparent-400': 'rgba(85, 86, 101, 0.32)',
  'color-basic-transparent-500': 'rgba(85, 86, 101, 0.4)',
  'color-basic-transparent-600': 'rgba(85, 86, 101, 0.48)',
  'color-primary-100': '#FBF5FF',
  'color-primary-200': '#F9D4FF',
  'color-primary-300': '#EDA9FE',
  'color-primary-400': '#DC7DFB',
  'color-primary-500': ThemeColor.appBluePurple,
  'color-primary-600': '#A92AF3',
  'color-primary-700': '#821ED0',
  'color-primary-800': '#6114AE',
  'color-primary-900': '#450D8C',
  'color-primary-transparent-100': 'rgba(199, 94, 248, 0.08)',
  'color-primary-transparent-200': 'rgba(199, 94, 248, 0.16)',
  'color-primary-transparent-300': 'rgba(199, 94, 248, 0.24)',
  'color-primary-transparent-400': 'rgba(199, 94, 248, 0.32)',
  'color-primary-transparent-500': 'rgba(199, 94, 248, 0.4)',
  'color-primary-transparent-600': 'rgba(199, 94, 248, 0.48)',
  'color-success-100': ThemeColor.appPurple,
  'color-success-200': ThemeColor.appPurple,
  'color-success-300': ThemeColor.appPurple,
  'color-success-400': ThemeColor.appPurple,
  'color-success-500': ThemeColor.appPurple,
  'color-success-600': ThemeColor.appPurple,
  'color-success-700': ThemeColor.appPurple,
  'color-success-800': ThemeColor.appPurple,
  'color-success-900': ThemeColor.appPurple,
  'color-success-transparent-100': 'rgba(155, 16, 244, 0.08)',
  'color-success-transparent-200': 'rgba(155, 16, 244, 0.16)',
  'color-success-transparent-300': 'rgba(155, 16, 244, 0.24)',
  'color-success-transparent-400': 'rgba(155, 16, 244, 0.32)',
  'color-success-transparent-500': 'rgba(155, 16, 244, 0.4)',
  'color-success-transparent-600': 'rgba(155, 16, 244, 0.48)',
  'color-info-100': ThemeColor.skyBlue,
  'color-info-200': ThemeColor.skyBlue,
  'color-info-300': ThemeColor.skyBlue,
  'color-info-400': ThemeColor.skyBlue,
  'color-info-500': ThemeColor.skyBlue,
  'color-info-600': ThemeColor.skyBlue,
  'color-info-700': ThemeColor.skyBlue,
  'color-info-800': ThemeColor.skyBlue,
  'color-info-900': ThemeColor.skyBlue,
  'color-info-transparent-100': 'rgba(4, 226, 231, 0.08)',
  'color-info-transparent-200': 'rgba(4, 226, 231, 0.16)',
  'color-info-transparent-300': 'rgba(4, 226, 231, 0.24)',
  'color-info-transparent-400': 'rgba(4, 226, 231, 0.32)',
  'color-info-transparent-500': 'rgba(4, 226, 231, 0.4)',
  'color-info-transparent-600': 'rgba(4, 226, 231, 0.48)',
  'color-warning-100': '#FF47CC',
  'color-warning-200': '#FF47CC',
  'color-warning-300': '#FF47CC',
  'color-warning-400': '#FF47CC',
  'color-warning-500': '#FF47CC',
  'color-warning-600': '#FF47CC',
  'color-warning-700': '#FF47CC',
  'color-warning-800': '#FF47CC',
  'color-warning-900': '#FF47CC',
  'color-warning-transparent-100': 'rgba(155, 16, 244, 0.08)',
  'color-warning-transparent-200': 'rgba(155, 16, 244, 0.16)',
  'color-warning-transparent-300': 'rgba(155, 16, 244, 0.24)',
  'color-warning-transparent-400': 'rgba(155, 16, 244, 0.32)',
  'color-warning-transparent-500': 'rgba(155, 16, 244, 0.4)',
  'color-warning-transparent-600': 'rgba(155, 16, 244, 0.48)',
  'color-danger-100': '#FFE3D8',
  'color-danger-200': '#FFC1B2',
  'color-danger-300': '#FF978A',
  'color-danger-400': '#FF706C',
  'color-danger-500': '#FF3D49',
  'color-danger-600': '#DB2D48',
  'color-danger-700': '#B61E44',
  'color-danger-800': '#94123E',
  'color-danger-900': '#7B0B3B',
  'color-danger-transparent-100': 'rgba(255, 61, 73, 0.08)',
  'color-danger-transparent-200': 'rgba(255, 61, 73, 0.16)',
  'color-danger-transparent-300': 'rgba(255, 61, 73, 0.24)',
  'color-danger-transparent-400': 'rgba(255, 61, 73, 0.32)',
  'color-danger-transparent-500': 'rgba(255, 61, 73, 0.4)',
  'color-danger-transparent-600': 'rgba(255, 61, 73, 0.48)',
  'color-pink': ThemeColor.appPink,
  'color-purple': ThemeColor.appBluePurple,
  'color-blue': ThemeColor.appBlue,
  'color-navBlue': ThemeColor.navBlue,
  'color-skyBlue': ThemeColor.skyBlue,
}

const secondaryColorVariables = {
  'color-secondary-default': evaDarkTheme['color-secondary-500'],
  'color-secondary-focus': evaDarkTheme['color-secondary-600'],
  'color-secondary-hover': evaDarkTheme['color-secondary-400'],
  'color-secondary-active': evaDarkTheme['color-secondary-600'],
  'color-secondary-disabled': evaDarkTheme['color-basic-transparent-300'],
  'color-control-transparent-default': ThemeColor.appBluePurple,
  'color-secondary-transparent-default':
    evaDarkTheme['color-secondary-transparent-100'],
  'color-secondary-transparent-focus':
    evaDarkTheme['color-secondary-transparent-300'],
  'color-secondary-transparent-hover':
    evaDarkTheme['color-secondary-transparent-200'],
  'color-secondary-transparent-active':
    evaDarkTheme['color-secondary-transparent-300'],
  'color-secondary-transparent-disabled':
    evaDarkTheme['color-basic-transparent-200'],
  'color-secondary-focus-border': evaDarkTheme['color-secondary-700'],
  'color-secondary-transparent-default-border':
    evaDarkTheme['color-secondary-500'],
  'color-secondary-transparent-focus-border':
    evaDarkTheme['color-secondary-500'],
  'color-secondary-transparent-hover-border':
    evaDarkTheme['color-secondary-500'],
  'color-secondary-transparent-active-border':
    evaDarkTheme['color-secondary-500'],
  'color-secondary-transparent-disabled-border':
    evaDarkTheme['color-basic-transparent-300'],
  'text-secondary-disabled-color': evaDarkTheme['color-secondary-400'],
  'border-secondary-color-1': evaDarkTheme['color-secondary-500'],
  'border-secondary-color-2': evaDarkTheme['color-secondary-600'],
  'border-secondary-color-3': evaDarkTheme['color-secondary-700'],
  'border-secondary-color-4': evaDarkTheme['color-secondary-800'],
  'border-secondary-color-5': evaDarkTheme['color-secondary-900'],

  'btn-color-secondary-transparent-default-border': ThemeColor.skyBlue,
  'btn-color-secondary-transparent-focus-border': ThemeColor.skyBlue,
  'btn-color-secondary-transparent-hover-border': ThemeColor.skyBlue,
  'btn-color-secondary-transparent-active-border': ThemeColor.skyBlue,
  'btn-color-secondary-transparent-disabled-border':
    evaDarkTheme['color-basic-transparent-300'],
}

const secondaryColorNestedVariables = {
  'color-secondary-default-border':
    secondaryColorVariables['color-secondary-default'],
  'text-secondary-focus-color':
    secondaryColorVariables['color-secondary-focus'],
  'text-secondary-hover-color':
    secondaryColorVariables['color-secondary-hover'],
  'text-secondary-color': secondaryColorVariables['color-secondary-default'],
  'color-secondary-hover-border':
    secondaryColorVariables['color-secondary-hover'],
  'color-secondary-active-border':
    secondaryColorVariables['color-secondary-active'],
  'text-secondary-active-color':
    secondaryColorVariables['color-secondary-active'],
  'color-secondary-disabled-border':
    secondaryColorVariables['color-secondary-disabled'],
}

const evaThemeVariableOverrides = {
  'text-hint-color': evaDarkTheme['color-basic-400'],
}

export const blockColors = {
  'block-color-bridge': evaDarkTheme['color-skyBlue'],
  'block-color-hypertrophy': evaDarkTheme['color-navBlue'],
  'block-color-strength': evaDarkTheme['color-purple'],
  'block-color-peaking': evaDarkTheme['color-pink'],
  'block-color-inactive': evaDarkTheme['color-basic-disabled'],
}

export const appTheme = {
  ...evaDarkTheme,
  ...secondaryColorVariables,
  ...secondaryColorNestedVariables,
  ...evaThemeVariableOverrides,
  ...blockColors,
}
