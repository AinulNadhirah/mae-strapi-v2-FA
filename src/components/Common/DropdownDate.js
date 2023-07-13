import React, { Component } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import PropTypes from 'prop-types';
import { Dimensions, Platform } from 'react-native';

import { MyView } from "./MyView";


class DropdownDate extends Component {

    static propTypes = {
        displayLoader: PropTypes.bool,
        maxDate: PropTypes.date,
        minDate: PropTypes.date,
        onDonePress: PropTypes.func.isRequired,


    };

    render() {
        const now = new Date();
        return (
            <MyView hide={!this.props.displayLoader} style={styles.container}>
                <View style={styles.viewContent}>

                    {/* <DatePicker
                        date={now}
                        onDateChange={date => {
                            console.log('date is', date)
                        }}
                    /> */}

                </View>

            </MyView>
        );
    }

    onDonePress(val) {
        this.props.onDonePress(val);
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1.5,
        flexDirection: "column",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "gray",
        opacity: 0.9
    },
    viewContent: { flex: 2, backgroundColor: "#fff", flexDirection: "column" },
    viewEmpty: { flex: 3.5, backgroundColor: "gray", opacity: 0.5 },

    button: {
        height: 30,
        width: 50
    },
    closeView: {
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonContainer: {
        height: 50,
        width: "95%",
        marginTop: 35,
        alignItems: "flex-end",
        justifyContent: "flex-end"
    },

    menuContainer: {
        width: "100%",
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonView: {
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20
    },
    buttonText: {
        color: "black",
        fontSize: 20,
        fontWeight: "200",
        fontFamily: "montserrat",
        flex: 1,
        textAlign: "right",
        marginRight: 0
    }
});

export { DropdownDate };
