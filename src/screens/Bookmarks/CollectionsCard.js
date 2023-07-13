import React, { Component } from "react";
import {
    Dimensions,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ImageBackground,
} from "react-native";
import { withNavigation } from "@react-navigation/compat";
import * as strings from "@constants/strings";

export const { width, height } = Dimensions.get("window");
export class CollectionsCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let collectionTitle = "";
        let backgroundImage = "";
        switch (this.props.collectionData.defaultType) {
            case "ALL":
                collectionTitle = strings.ALL_COLLECTION;
                backgroundImage = require("@assets/images/all-items.jpeg");
                break;
            case "FOOD":
                collectionTitle =
                    this.props.collectionData.collectionName == ""
                        ? strings.FOOD_COLLECTION
                        : this.props.collectionData.collectionName;
                backgroundImage = this.props.collectionData.backgroundImage
                    ? { uri: "data:image/jpeg;base64," + this.props.collectionData.backgroundImage }
                    : require("@assets/images/food.jpeg");
                break;
            case "TRAVEL":
                collectionTitle =
                    this.props.collectionData.collectionName == ""
                        ? strings.TRAVEL_COLLECTION
                        : this.props.collectionData.collectionName;
                backgroundImage = this.props.collectionData.backgroundImage
                    ? { uri: "data:image/jpeg;base64," + this.props.collectionData.backgroundImage }
                    : require("@assets/images/travel.jpeg");
                break;
            case "SHOPPING":
                collectionTitle =
                    this.props.collectionData.collectionName == ""
                        ? strings.SHOP_COLLECTION
                        : this.props.collectionData.collectionName;
                backgroundImage = this.props.collectionData.backgroundImage
                    ? { uri: "data:image/jpeg;base64," + this.props.collectionData.backgroundImage }
                    : require("@assets/images/shopping.jpeg");
                break;
            case "OTHERS":
                collectionTitle = this.props.collectionData.collectionName;
                backgroundImage = this.props.collectionData.backgroundImage
                    ? { uri: "data:image/jpeg;base64," + this.props.collectionData.backgroundImage }
                    : "";
                break;
        }
        return (
            <TouchableOpacity
                style={Styles.collectionsCardView}
                accessibilityLabel={"collectionsCardView"}
                testID={"collectionsCardView"}
                onPress={() => this.props.cardPressed(this.props.collectionData)}
            >
                <ImageBackground
                    style={Styles.imageBackgroundView}
                    source={backgroundImage}
                    imageStyle={Styles.imageBackground}
                >
                    <View
                        style={Styles.titleTextView}
                        accessibilityLabel="titleTextView"
                        testID="titleTextView"
                    >
                        <Text
                            style={[
                                Styles.titleText,
                                { color: backgroundImage == "" ? "black" : "white" },
                            ]}
                            accessibilityLabel="titleText"
                            testID="titleText"
                        >
                            {collectionTitle}
                        </Text>
                    </View>
                    <View
                        style={Styles.itemCountView}
                        accessibilityLabel="itemCountView"
                        testID="itemCountView"
                    >
                        <Text
                            style={[
                                Styles.itemCountText,
                                { color: backgroundImage == "" ? "black" : "white" },
                            ]}
                            accessibilityLabel="itemCountText"
                            testID="itemCountText"
                        >
                            {this.props.collectionData.numberOfItems
                                ? this.props.collectionData.numberOfItems
                                : "0"}
                            {this.props.collectionData.numberOfItems == 1 ? " item" : " items"}
                        </Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    }
}
const Styles = StyleSheet.create({
    collectionsCardView: {
        width: (275 * width) / 375,
        height: (168 * height) / 667,
        borderRadius: (15 * width) / 375,
        backgroundColor: "white",
        marginBottom: (10 * height) / 667,
        elevation: 1,
    },
    imageBackgroundView: {
        // backgroundColor: 'transparent',
        flex: 1,
        justifyContent: "flex-end",
    },
    imageBackground: {
        width: (275 * width) / 375,
        height: (168 * height) / 667,
        borderRadius: (15 * width) / 375,
        resizeMode: "cover",
    },
    titleTextView: {
        marginLeft: (20 * width) / 375,
        height: (23 * height) / 667,
        justifyContent: "center",
    },
    titleText: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 15,
        lineHeight: 23,
    },
    itemCountView: {
        marginBottom: (12 * height) / 667,
        marginLeft: (20 * width) / 375,
        height: (height * 23) / 667,
        width: (width * 200) / 375,
        justifyContent: "center",
    },
    itemCountText: {
        fontFamily: "Montserrat-Regular",
        fontSize: 11,
        lineHeight: 23,
    },
});

export default withNavigation(CollectionsCard);
