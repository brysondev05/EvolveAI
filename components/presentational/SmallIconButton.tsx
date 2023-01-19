import { Component } from 'react';
import { Pressable } from 'react-native';
import { styled } from '@ui-kitten/components';

@styled('SmallIconButton')
export class SmallIconButton extends Component {
  render() {
    const { eva, style, ...restProps } = this.props;

    return (
      <Pressable style={[eva.style, style]} {...restProps} />
    );
  }
}