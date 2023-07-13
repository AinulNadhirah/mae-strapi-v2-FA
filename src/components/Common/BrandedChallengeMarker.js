import React, { Component } from "react";
import { View, Text, Dimensions, Image, StyleSheet } from "react-native";
import { isEqual } from "apollo-utilities";
import { FUTURE_SAVE } from "@constants/strings";
import { WSAEPROVIDERFAILEDINIT } from "constants";
export const { width, height } = Dimensions.get("window");

export default class BrandedChallengeMarker extends Component {
    constructor(props) {
        super(props);
    }
    markerList = [];
    // FI-FINISHED
    // FU-FUTURE
    // FA-FAILED
    // ON-ONGOING
    renderMarkers = () => {
        console.log("--M---->" + this.props.numOfDays);
        console.log("--m---" + JSON.stringify(this.props.progress));
        this.markerList = [];
        let num = this.props.numOfDays;
        for (let j = 0; j < num; j++) {
            this.markerList.push(
                <View style={brandedStyles.componentView} key={j}>
                    <View style={brandedStyles.oneMarker}>
                        <View style={brandedStyles.dayView}>
                            <Text style={brandedStyles.dayText}>{"DAY"}</Text>
                        </View>
                        <View
                            style={
                                this.props.isStatic == true ||
                                this.props.progress[j].status === "FU" ||
                                this.props.progress[j].status === "FI"
                                    ? [
                                          brandedStyles.markerView1,
                                          { backgroundColor: "transparent" },
                                      ]
                                    : [
                                          brandedStyles.markerView1,
                                          { backgroundColor: rgb(220, 220, 220) },
                                      ]
                            }
                        >
                            <View
                                style={
                                    this.props.isStatic == true ||
                                    this.props.progress[j].status === "FU"
                                        ? [
                                              brandedStyles.markerView,
                                              {
                                                  backgroundColor: "white",
                                                  borderWidth: 1.6,
                                                  borderColor: "black",
                                              },
                                          ]
                                        : this.props.progress[j].status === "ON"
                                        ? [
                                              brandedStyles.markerView,
                                              {
                                                  backgroundColor: "white",
                                                  borderWidth: 3.5,
                                                  elevation: 7,
                                                  borderColor: rgb(74, 144, 226),
                                              },
                                          ]
                                        : this.props.progress[j].status === "FA"
                                        ? [
                                              brandedStyles.markerView,
                                              {
                                                  backgroundColor: "white",
                                                  borderWidth: 3.5,
                                                  elevation: 10,
                                                  borderColor: rgb(227, 93, 93),
                                              },
                                          ]
                                        : [
                                              brandedStyles.markerView,
                                              {
                                                  backgroundColor: rgb(74, 144, 226),
                                                  borderWidth: 3.5,
                                                  elevation: 7,
                                                  borderColor: rgb(74, 144, 226),
                                              },
                                          ]
                                }
                            >
                                <View style={brandedStyles.marketTextView}>
                                    <Text
                                        style={
                                            this.props.isStatic ||
                                            this.props.progress[j].status == "FU"
                                                ? [brandedStyles.markerText, { color: "black" }]
                                                : this.props.progress[j].status == "FI"
                                                ? [brandedStyles.markerText, { color: "white" }]
                                                : this.props.progress[j].status == "FA"
                                                ? [
                                                      brandedStyles.markerText,
                                                      { color: rgb(227, 93, 93) },
                                                  ]
                                                : [
                                                      brandedStyles.markerText,
                                                      { color: rgb(74, 144, 226) },
                                                  ]
                                        }
                                    >
                                        {j + 1}
                                    </Text>
                                </View>
                                <View style={brandedStyles.tickImageView}>
                                    {this.props.progress[j].status == "FI" ? (
                                        <Image
                                            style={brandedStyles.tickImage}
                                            source={require("@assets/Fitness/yellow_tick_out.png")}
                                        />
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                    {this.props.isStatic == true && j < num - 1 ? (
                        <View style={brandedStyles.dashView}>
                            <View style={brandedStyles.singleDashView}></View>
                            <View style={brandedStyles.singleDashView}></View>
                        </View>
                    ) : this.props.progress[j].status != "FI" && j < num - 1 ? (
                        <View style={brandedStyles.dashViewc}>
                            <View style={brandedStyles.singleDashView}></View>
                            <View style={brandedStyles.singleDashView}></View>
                            <View style={brandedStyles.singleDashView}></View>
                            <View style={brandedStyles.singleDashView}></View>
                        </View>
                    ) : this.props.progress[j].status == "FI" && j < num - 1 ? (
                        <View style={brandedStyles.dashView}>
                            <View
                                style={{
                                    width: (60 * width) / 375,
                                    height: (height * 1) / 667,
                                    // marginRight: 10 * width / 375,
                                    borderBottomWidth: 1,
                                    borderColor: rgb(74, 144, 226),
                                    marginTop: (17 * height) / 667,
                                }}
                            ></View>
                        </View>
                    ) : null}
                </View>
            );
        }
        // }
        return this.markerList;
    };

    render() {
        return <View style={brandedStyles.mainView}>{this.renderMarkers()}</View>;
    }
}

const brandedStyles = StyleSheet.create({
    mainView: {
        height: 840,
        flexDirection: "row",
        flex: 1,
        backgroundColor: "transparent", //rgb(255, 255, 255)
    },

    dashViewc: {
        marginLeft: (1 * height) / 667,
        flexDirection: "row",
        width: (width * 60) / 375,
        height: (height * 35) / 667,
        marginTop: (24 * height) / 667,
        // borderBottomColor: 'black',
        justifyContent: "center",
    },
    markerView1: {
        marginTop: (5 * height) / 667,
        width: (40 * width) / 375,
        height: (40 * width) / 375,
        borderRadius: (40 * width) / 2,
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    markerView: {
        width: (35 * width) / 375,
        height: (35 * width) / 375,
        borderRadius: (35 * width) / (2 * 375),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    marketTextView: {
        width: (width * 10) / 375,
        height: (20 * height) / 667,
        alignItems: "center",
        justifyContent: "center",
    },
    oneMarker: {
        flexDirection: "column",
        alignItems: "center",
    },
    markerText: {
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "400",
    },
    dashView: {
        flexDirection: "row",
        // width: width * 38 / 375,
        height: (height * 35) / 667,
        marginTop: (24 * height) / 667,
        // borderBottomColor: 'black',
        justifyContent: "center",
        // backgroundColor:'yellow'
    },
    singleDashView: {
        width: (6 * width) / 375,
        height: (height * 1) / 667,
        marginRight: (10 * width) / 375,
        borderBottomWidth: 1,
        borderColor: rgb(143, 143, 143),
        marginTop: (17 * height) / 667,
    },
    oneLineView: {},
    componentView: {
        height: 59,
        flexDirection: "row",
        alignItems: "center",
    },
    dayView: {
        height: (height * 19) / 667,
        width: (30 * width) / 375,
        alignItems: "center",
        marginTop: 0,
    },
    dayText: {
        color: rgb(143, 143, 143),
        fontFamily: "montserrat",
        fontSize: (13 * width) / 375,
        fontWeight: "400",
    },
    tickImageView: {
        width: (width * 19) / 375,
        // backgroundColor:'orange',
        height: (height * 18) / 667,
        position: "absolute",
        left: (22 * width) / 375,
        top: (14.5 * height) / 667,
    },
    tickImage: {
        resizeMode: "contain",
        width: (width * 19) / 375,
        height: (height * 18) / 667,
    },
});
