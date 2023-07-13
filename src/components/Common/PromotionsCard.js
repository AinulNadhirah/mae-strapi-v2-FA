import React, { Component } from "react";
import { Dimensions, Text, View, Image, StyleSheet } from "react-native";
import { withNavigation } from "@react-navigation/compat";
import { HighlightText } from "@components/Common/HighlightText";

export const { width, height } = Dimensions.get("window");

export class PromotionsCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View
                style={Styles.promotionsCardView}
                accessibilityLabel={"promotionsCardView"}
                testID={"promotionsCardView"}
            >
                <View
                    style={Styles.CardImageView}
                    accessibilityId={"CardImageView"}
                    testID={"CardImageView"}
                >
                    <Image
                        accessibilityLabel={"CardImage"}
                        testID={"CardImage"}
                        style={Styles.CardImage}
                        source={this.props.imageUrl}
                    />
                </View>
                <View
                    style={Styles.titleTxtView}
                    accessibilityLabel="titleTxtView"
                    testID="titleTxtView"
                >
                    <Text style={Styles.titleTxt} accessibilityLabel="titleTxt" testID="titleTxt">
                        {this.props.titleTxt}
                    </Text>
                </View>
                <View
                    style={Styles.bodyTxtView}
                    accessibilityLabel="bodyTxtView"
                    testID="bodyTxtView"
                >
                    {this.props.txtBold ? (
                        <HighlightText
                            highlightStyle={{ fontWeight: "bold" }}
                            searchWords={this.props.txtBold}
                            style={Styles.bodyTxt}
                            textToHighlight={this.props.bodyTxt}
                            accessibilityLabel="bodyTxt"
                            testID="bodyTxt"
                        />
                    ) : (
                        <Text style={Styles.bodyTxt} accessibilityLabel="bodyTxt" testID="bodyTxt">
                            {this.props.bodyTxt}
                        </Text>
                    )}
                </View>
                <View style={Styles.TnCView} accessibilityLabel="TnCView" testID="TnCView">
                    <Text style={Styles.TnC} accessibilityLabel="TnC" testID="TnC">
                        {this.props.TnC}
                    </Text>
                </View>
            </View>
        );
    }
}
export const Styles = StyleSheet.create({
    promotionsCardView: {
        width: (275 * width) / 375,
        height: (168 * height) / 667,
        borderRadius: (10 * width) / 375,
        backgroundColor: "white",
        top: (19 * height) / 667,
    },
    spaceBetweenCards: {
        height: (height * 11) / 667,
        backgroundColor: "blue",
    },
    CardImageView: {
        left: (width * 0) / 375,
        top: (height * 0) / 667,
    },
    CardImage: {
        width: (width * 275) / 375,
        height: (height * 168) / 667,
        borderRadius: (10 * width) / 375,
    },
    titleTxtView: {
        position: "absolute",
        left: (width * 20) / 375,
        top: (height * 18) / 667,
        height: (height * 18) / 667,
    },
    titleTxt: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.15,
        color: "rgb(255,255,255)",
    },
    bodyTxtView: {
        position: "absolute",
        left: (width * 20) / 375,
        top: (height * 71) / 667,
        height: (height * 54) / 667,
        width: (width * 160) / 375,
    },
    bodyTxt: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.15,
        color: "rgb(255,255,255)",
    },
    TnCView: {
        position: "absolute",
        left: (width * 20) / 375,
        top: (height * 137) / 667,
        height: (height * 16) / 667,
        width: (width * 61) / 375,
    },
    TnC: {
        fontFamily: "Montserrat-Regular",
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: -0.13,
        color: "rgb(255,255,255)",
    },
});

export default withNavigation(PromotionsCard);
