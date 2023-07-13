import React, { Component } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    ImageBackground,
    Image,
    TouchableNativeFeedback,
} from "react-native";

import {
    sliderWidthGaolItem,
    itemHeightGoalSelect,
    itemWidthGoalSelect,
    entryBorderRadiusGoalSelect,
    sliderHeightGoalSelect,
} from "@styles/main";

import commonStyle from "@styles/main";
import Carousel from "react-native-snap-carousel";

const SelectGoalCarousel = ({ data, callback }) => {
    function callbackEvent(index) {
        callback(index);
    }

    function renderItem({ item }) {
        return (
            // <View  style={[styles.mainContainer]}>
            <TouchableOpacity
                accessibilityLabel={item.title.split("\n")[0]}
                testID={item.title.split("\n")[0]}
                onPress={() => callbackEvent(item)}
                style={[
                    styles.goalSlideItem,
                    styles.goalSlideItemMargin,
                    item.id == 0 ? styles.firstMargin : "",
                ]}
            >
                <View style={[styles.goalSlideItem]}>
                    <View style={[styles.imgeView]}>
                        {item.path == "46" && (
                            <Image source={item.path} style={styles.deactivateImage} />
                        )}
                        {item.path != "46" && (
                            <Image source={item.path} style={styles.goalListImage} />
                        )}
                    </View>
                    <Text style={[styles.goalSlideItemText, commonStyle.font]}>{item.title}</Text>
                    {item.path == "46" && (
                        <Text style={[styles.goalSlideItemValue, commonStyle.font]}>
                            {"RM " + item.value}
                        </Text>
                    )}
                    <Text style={[styles.goalSlideItemTextDec, commonStyle.font]}>{item.des}</Text>
                </View>
            </TouchableOpacity>
            // </View>
        );
    }
    return (
        <View>
            <Carousel
                ref={(c) => {
                    this._carousel = c;
                }}
                data={data}
                layout={"default"}
                inactiveSlideScale={1}
                activeSlideScale={1}
                firstItem={0}
                renderItem={renderItem}
                sliderWidth={sliderWidthGaolItem}
                sliderHeight={sliderHeightGoalSelect}
                itemWidth={itemWidthGoalSelect}
                activeSlideAlignment={"center"}
            />
        </View>
    );
};
const styles = {
    goalSlideItem: {
        height: itemHeightGoalSelect,
        width: itemWidthGoalSelect,
        backgroundColor: "#fff",
        borderTopLeftRadius: entryBorderRadiusGoalSelect,
        borderTopRightRadius: entryBorderRadiusGoalSelect,
        borderBottomLeftRadius: entryBorderRadiusGoalSelect,
        borderBottomRightRadius: entryBorderRadiusGoalSelect,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
    },
    imgeView: {
        height: 70,
        width: 70,
        // backgroundColor: "red",
        marginTop: "15%",
        marginLeft: "20%",
    },

    mainContainer: {
        marginLeft: "-80%",
        backgroundColor: "blue",
        // height:300
    },

    goalSlideItemMargin: {
        marginRight: 0,
        marginLeft: 2,
    },
    goalList: {
        marginTop: "7%",
    },
    goalListImage: {
        // marginTop:"15%",
        width: 70,
        height: 70,
        resizeMode: "contain",
    },

    deactivateImage: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        marginTop: "60%",
        // backgroundColor:'green'
    },
    goalSlideItemText: {
        textAlign: "justify",
        marginTop: "10%",
        fontFamily: "montserrat",
        fontSize: 22,
        marginLeft: "15%",
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    goalSlideItemTextDec: {
        marginLeft: "15%",
        marginTop: 3,
        textAlign: "justify",
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 19,
        letterSpacing: 0,
        color: "#000000",
    },
    goalSlideItemValue: {
        marginLeft: "15%",
        marginTop: 3,
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 28,
        letterSpacing: 0,
        color: "#4a90e2",
    },
    firstMargin: {
        //marginLeft: 50,
    },
};
export default SelectGoalCarousel;
