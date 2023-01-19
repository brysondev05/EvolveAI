import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import * as Icon from '@expo/vector-icons';
import { Layout, Text, useTheme } from '@ui-kitten/components';

const ToolCard = (props) => {
  const theme = useTheme()
  return (
    <Layout style={styles.container}>
      <TouchableOpacity
        onPress={() => props.navigation.navigate(props.tool.screen)}>
        <View style={styles.cover}>
          <View style={styles.cardDescription}>
            <Text category='h3'>{props.title}</Text>
            <Text category='s1'>{props.description}</Text>
          </View>
          <View style={styles.cardIcon}>
            <Icon.AntDesign
              name='right'
              size={25}
              color={theme['color-primary-500']}
              style={{ marginLeft: 20, marginTop: 10 }}
            />
          </View>

          {/* </LinearGradient> */}
        </View>
      </TouchableOpacity>
    </Layout>
  )
};

export default ToolCard;

const styles = StyleSheet.create({
  container: {
    height: 130,
    width: '100%',
    borderRadius: 14,
    marginBottom: 20,
  },
  cover: {
    width: '100%',
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 20,
  },
  cardDescription: {
    paddingLeft: 40,
    paddingRight: 20,
  },
  cardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
});
