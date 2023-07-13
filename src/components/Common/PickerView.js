import React, { Component } from 'react';
import { View, Image, StyleSheet, Picker } from 'react-native';
import { MyView } from "./MyView";

// create a component
const PickerView = ({
    displayLoader,
    selectedValuePress,
    onValueChangePressed
  
}
) => {
    return (
        <MyView hide={!displayLoader} style={styles.container}>
            <View>
                <Picker
                   selectedValue={selectedValuePress}
                   onValueChange={onValueChangePressed}
                    style={{ marginLeft: 50, height: 50, width: 100 }}
                >
                    <Picker.Item label="Java" value="Java" />
                    <Picker.Item label="JavaScript" value="JavaScript" />
                </Picker>

            </View>
        </MyView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.5,
        backgroundColor: 'gray',
    },

});

//make this component available to the app
export { PickerView };
