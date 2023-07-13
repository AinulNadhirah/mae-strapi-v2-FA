import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import PropTypes, { any } from "prop-types";
import { MyView } from "./MyView";
import { HighlightText } from "./HighlightText";
// import Modal from "react-native-modal";

class AlertScreen extends Component {
    static propTypes = {
        displayLoader: PropTypes.bool,
        titleText: PropTypes.string,
        detailText: PropTypes.string,
        subText: PropTypes.string,
        onClosePress: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MyView hide={!this.props.displayLoader} style={styles.container}>
                <View style={styles.errorView}>
                    <View style={styles.rightView}>
                        <View>
                            <Text style={styles.errorTitle}> {this.props.titleText}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.buttonView}
                            onPress={() => {
                                this.onClosePress();
                            }}
                            accessibilityLabel={"btnClosw"}
                        >
                            <Image
                                style={styles.button}
                                source={require("@assets/icons/ic_close.png")}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.alertView}>
                        <HighlightText
                            highlightStyle={{ fontWeight: "bold" }}
                            searchWords={["RM", "20/month"]}
                            style={styles.errorDetailText}
                            textToHighlight={this.props.detailText}
                        />
                    </View>
                    <View style={styles.detailTexttView}>
                        <Text style={styles.subtext}> {this.props.subText}</Text>
                    </View>
                </View>
            </MyView>
        );
    }

    onClosePress() {
        this.props.onClosePress();
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)", // 0.5 is opacity
    },
    errorView: {
        backgroundColor: "white",
        height: "35%",
        width: 315,
        opacity: 1,
        borderRadius: 11,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    rightView: {
        marginTop: 10,
        height: "20%",
        width: "100%",
        // backgroundColor: "red",
        flexDirection: "row",
        alignItems: "center",
    },
    alertView: {
        // marginTop: '1%',
        // backgroundColor: "green",
        width: "100%",
        height: "35%",
    },
    detailTexttView: {
        // marginTop: '1%',
        // backgroundColor: "blue",
        width: "100%",
        height: "40%",
    },

    TextView: {
        marginTop: 0,
        marginLeft: 30,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    errorTitle: {
        width: 230,
        height: 46,
        fontFamily: "Montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: "10%",
        marginTop: "10%",
    },
    errorDetailText: {
        fontFamily: "Montserrat",
        fontSize: 17,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: "10%",
        marginTop: "2%",
    },

    subtext: {
        marginLeft: "10%",
        marginTop: "2%",
        opacity: 0.5,
        fontFamily: "Montserrat",
        fontSize: 11,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 17,
        letterSpacing: 0,
        color: "#000000",
    },
    buttonView: {
        width: 50,
        height: 50,
    },
    button: {
        height: 50,
        width: 50,
    },
});

//make this component available to the app
export { AlertScreen };
