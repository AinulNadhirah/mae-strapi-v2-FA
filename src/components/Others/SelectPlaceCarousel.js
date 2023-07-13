import React, { Component } from "react";
import { Text, View, TouchableOpacity, ImageBackground, Alert } from "react-native";

import { wp, viewportHeight, viewportWidth } from "@styles/main";
import Carousel from "react-native-snap-carousel";

/////////////////////////////////////////////////////

export const slideWidthGoalSelect = wp(10);

export const itemHorizontalMarginGoalSelect = wp(3);

export const itemWidthGoalSelect = slideWidthGoalSelect + itemHorizontalMarginGoalSelect * 16;

export const itemHeightGoalSelect = viewportHeight * 0.32;

export const sliderWidthGaolItem = viewportWidth + 80;
export const sliderHeightGoalSelect = 5;

export const entryBorderRadiusGoalSelect = 12;
/////////////////////////////////////////////////////

const SelectPlaceCarousel = ({ data, callback }) => {
    function callbackEvent(title) {
        callback(title);
    }

    function renderItem({ item }) {
        return (
            <View style={[styles.budgetingContent, item.id == 0 ? styles.firstMargin : ""]}>
                <TouchableOpacity
                    onPress={() => callbackEvent(item.title)}
                    style={[styles.buttonStyle]}
                    underlayColor={"#fff"}
                >
                    <Text style={styles.textStyle}>{item.title}</Text>
                </TouchableOpacity>
            </View>
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
                // loop={true}
                firstItem={0}
                renderItem={renderItem}
                sliderWidth={sliderWidthGaolItem}
                sliderHeight={sliderHeightGoalSelect}
                itemWidth={itemWidthGoalSelect}
                activeSlideAlignment={"start"}
            />
        </View>
    );
};
const styles = {
    textStyle: {
        textAlign: "center",
        color: "#000",
        fontSize: 20,
        fontWeight: "600",
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        marginLeft: 10,
    },
    buttonStyle: {
        alignContent: "center",
        justifyContent: "center",
        height: 55,
        borderRadius: 45,
        backgroundColor: "red",
    },
    budgetingContent: {
        flexDirection: "row",
        borderRadius: 45,
        borderWidth: 1,
        borderColor: "#000",
        marginRight: 5,
        marginLeft: 8,
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#fff",
    },
    firstMargin: {
        marginLeft: 40,
    },
};
export default SelectPlaceCarousel;
