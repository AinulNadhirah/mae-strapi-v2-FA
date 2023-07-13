import React, { Component } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import Carousel from "react-native-snap-carousel";
import NavigationService from "@navigation/navigationService";
import { sliderWidth, itemWidth, entryBorderRadius } from "@styles/main";
import Styles from "@styles/NewGoalCarousel";

class NewGoalCarousel extends Component {
    offerItemClick = (offer) => {};

    renderItem({ item, index }) {
        return (
            <TouchableOpacity
                onPress={() => {
                    NavigationService.navigate("SelectGoalScreen", { userName: "Lucy" });
                }}
            >
                <View style={Styles.goalSlide}>
                    <View style={Styles.goalSlideImg}>
                        <Image
                            style={Styles.imgWalking}
                            source={
                                item.type == 1
                                    ? require("@assets/icons/ic_quick_action.png")
                                    : item.type == 2
                                    ? require("@assets/icons/ic_payment.png")
                                    : require("@assets/icons/ic_goal_family.png")
                            }
                        />
                    </View>
                    <View style={Styles.goalSlideText}>
                        <Text style={Styles.goalSlideDecText}>{item.title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View>
                <Carousel
                    ref={(c) => {
                        this._carousel = c;
                    }}
                    data={this.props.data}
                    renderItem={this.renderItem}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    style={Styles.carousel}
                />
            </View>
        );
    }
}

export default NewGoalCarousel;
