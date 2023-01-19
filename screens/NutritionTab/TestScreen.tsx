import { View, Text,StyleSheet,TouchableOpacity } from 'react-native'
import React,{useState} from 'react'
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"
import DraggableFlatList, {
    ScaleDecorator,
  } from "react-native-draggable-flatlist";
  
const data=[
    {label:'pizza',
    backgroundColor:'#f7f6'},
    {label:'burger',
    backgroundColor:'#fff3'},
  ]
type Item = {
  key: string;
  label: string;
  height: number;
  width: number;
  backgroundColor: string;
};

const initialData: Item[] = data.map((d, index) => {
  const backgroundColor ="#fff";
  return {
    key: `item-${index}`,
    label: String(index) + "",
    height: 100,
    width: 60 + Math.random() * 40,
    backgroundColor,
  };
});
export default function TestScreen() {
 
      const [data2, setData2] = useState(initialData);
      const renderItem = ({ item, drag, isActive }) => {
        return (
          <ScaleDecorator>
            <TouchableOpacity
              onLongPress={drag}
              disabled={isActive}
              style={[
                styles.rowItem,
                { backgroundColor: isActive ? "red" : item.backgroundColor },
              ]}
            >
              <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
          </ScaleDecorator>
        );
      };
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center",marginTop:160}}>
      <DraggableFlatList
      data={data2}
      dragItemOverflow={true}
      onDragEnd={({ data }) => setData2(data)}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
    />
  
    {/* <NestableScrollContainer>
    <NestableDraggableFlatList
        data={data2}
        renderItem={renderItem}
        keyExtractor={(index)=>{
<Text>{index}</Text>
        }}
        onDragEnd={({ data }) => setData2(data)}
      />
      </NestableScrollContainer> */}
    </View>
  )
}
const styles = StyleSheet.create({
    rowItem: {
        height: 100,
        width: 100,
        alignItems: "center",
        justifyContent: "center",
      },
      text: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
      },
    
})