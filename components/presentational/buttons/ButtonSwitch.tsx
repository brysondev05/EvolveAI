import * as React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { ButtonElement } from '@ui-kitten/components';

interface ButtonSwitchProps extends ViewProps {
  fullWidth?: boolean;
  children: ButtonElement[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export type ButtonSwitchElement = React.ReactElement<ButtonSwitchProps>;

const STATUS_DEFAULT: string = 'outline';
const STATUS_SELECTED: string = 'filled';

export class ButtonSwitch extends React.Component<ButtonSwitchProps> {

  private get childCount(): number {
    return React.Children.count(this.props.children);
  }

  private getBorderStyleForPosition = (index: number): ViewStyle => {
    switch (index) {
      case 0: return styles.firstButton;
      case this.childCount - 1: return styles.lastButton;
      default: return styles.middleButton;
    }
  };

  private renderComponentChildren = (children: ButtonElement[]): ButtonElement[] => {
    return React.Children.map(children, (element: ButtonElement, index: number): ButtonElement => {
    const borderStyle: ViewStyle = this.getBorderStyleForPosition(index);

      return React.cloneElement(element, {
        style: [element.props.style, borderStyle, this.props.fullWidth && styles.buttonFullWidth],
        appearance: index === this.props.selectedIndex ? STATUS_SELECTED : STATUS_DEFAULT,
        status: element.props.status,
        onPress: () => this.props.onSelect(index),
      });
    });
  };

  public render(): React.ReactElement<ViewProps> {
    const { style, children, ...viewProps } = this.props;
    return (
      <View
        {...viewProps}
        style={[styles.container, style]}>
        {this.renderComponentChildren(children)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstButton: {
    borderTopEndRadius: 0,
    borderBottomEndRadius: 0,
  },
  middleButton: {
    borderRadius: 0,
  },
  lastButton: {
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
  },
  buttonFullWidth: {
    flex: 1,
  },
});