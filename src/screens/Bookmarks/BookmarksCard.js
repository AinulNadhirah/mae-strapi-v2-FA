/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import { Dimensions, Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { withNavigation } from "@react-navigation/compat";
import HTML from "react-native-render-html";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

export const { width, height } = Dimensions.get("window");

export class BookmarksCard extends Component {
    constructor(props) {
        super(props);
    }

    renderBodyText = (item) => {
        let fullText;

        if (item.length > 150) {
            fullText = item.toString().substring(0, 150);
        } else {
            fullText = item;
        }

        return fullText != null ? fullText.replace(/\r?\n|\r/g, " ") : "";
    };

    render() {
        return (
            <View
                style={Styles.bookmarksCardView}
                accessibilityLabel={"bookmarksCardView"}
                testID={"bookmarksCardView"}
                // onPress={() => this.props.cardPressed(this.props)}
            >
                <Image
                    style={Styles.imageStyles}
                    source={
                        this.props.data.imageUrl != null ? { uri: this.props.data.imageUrl } : ""
                    }
                />
                <View
                    style={Styles.headingView}
                    accessibilityLabel="headingView"
                    testID="headingView"
                >
                    <Text
                        style={Styles.headingText}
                        accessibilityLabel="headingText"
                        testID="headingText"
                    >
                        {this.props.data.title != null
                            ? this.props.data.title.toString().replace(/\r?\n|\r/g, " ")
                            : ""}
                    </Text>
                </View>
                <View
                    style={Styles.subHeadingView}
                    accessibilityLabel="subHeadingView"
                    testID="subHeadingView"
                >
                    <HTML
                        html={
                            this.props.data.summary != null
                                ? this.renderBodyText(this.props.data.summary)
                                : ""
                        }
                        imagesMaxWidth={Dimensions.get("window").width}
                        onLinkPress={(evt, href) => {
                            console.log("href is", href);

                            NavigationService.navigateToModule(
                                navigationConstant.COMMON_MODULE,
                                navigationConstant.WEBVIEW_INAPP_SCREEN
                            );
                        }}
                        onParsed={() => {
                            console.log("Loaded Page sucesfully");
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={Styles.linkView}
                    accessibilityLabel="linkView"
                    testID="linkView"
                    onPress={() => this.props.linkPressed(this.props.data)}
                >
                    <Text style={Styles.linkText} accessibilityLabel="linkText" testID="linkText">
                        {this.props.data.introText}
                    </Text>
                    {/* {"Discover More"}</Text> */}
                </TouchableOpacity>
                <View
                    style={Styles.buttonsView}
                    accessibilityLabel="buttonsView"
                    testID="buttonsView"
                >
                    <TouchableOpacity
                        style={Styles.likeButton}
                        accessibilityLabel="buttonsView"
                        testID="buttonsView"
                        onPress={() => this.props.likePressed(this.props.data)}
                    >
                        <Image
                            style={[Styles.likeButtonIcon]}
                            source={
                                this.props.data.userContent.emotionStatus == "LIKE"
                                    ? require("@assets/icons/ic_like_done.png")
                                    : require("@assets/icons/ic_like_no.png")
                            }
                        />
                    </TouchableOpacity>
                    <Text style={Styles.likeCount}>
                        {this.props.data.likeCount ? this.props.data.likeCount : "0"}
                    </Text>
                    <TouchableOpacity
                        style={Styles.bookmarkButton}
                        accessibilityLabel="buttonsView"
                        testID="buttonsView"
                        onPress={() => this.props.bookmarkPressed(this.props.data)}
                    >
                        <Image
                            style={[Styles.bookmarkButtonIcon]}
                            source={
                                this.props.data.userContent.isBookmarked
                                    ? require("@assets/icons/ic_bookmark_done.png")
                                    : require("@assets/icons/ic_bookmark_no.png")
                            }
                        />
                    </TouchableOpacity>
                </View>
                <View style={Styles.marginSpace} />
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    bookmarksCardView: {
        width: width,
        backgroundColor: "white",
    },
    imageStyles: {
        width: width,
        height: (230 * height) / 667,
        resizeMode: "cover",
        borderRadius: (10 * height) / 667,
    },
    headingView: {
        marginLeft: (50 * width) / 375,
        marginRight: (50 * width) / 375,
        marginTop: (20 * height) / 667,
        justifyContent: "center",
    },
    headingText: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        lineHeight: 23,
        color: "black",
    },
    subHeadingView: {
        marginLeft: (50 * width) / 375,
        marginRight: (50 * width) / 375,
        marginTop: (2 * height) / 667,
        justifyContent: "center",
    },
    subHeadingText: {
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        lineHeight: 33,
        color: "black",
    },
    linkView: {
        marginLeft: (50 * width) / 375,
        marginRight: (50 * width) / 375,
        marginTop: (5 * height) / 667,
        justifyContent: "center",
    },
    linkText: {
        fontFamily: "Montserrat-Bold",
        fontSize: 13,
        lineHeight: 23,
        color: "#2477cf",
    },
    buttonsView: {
        marginLeft: (50 * width) / 375,
        width: (275 * width) / 375,
        marginTop: (10 * height) / 667,
        flexDirection: "row",
    },
    likeButton: {
        height: (25 * width) / 375,
        width: (25 * width) / 375,
    },
    likeButtonIcon: {
        height: (25 * width) / 375,
        width: (25 * width) / 375,
        resizeMode: "contain",
    },
    likeCount: {
        width: (150 * width) / 375,
        marginLeft: (10 * width) / 375,
        fontFamily: "Montserrat-Regular",
        fontSize: 15,
        lineHeight: (25 * width) / 375,
        color: "#000",
    },
    bookmarkButton: {
        marginLeft: (65 * width) / 375,
        height: (25 * width) / 375,
        width: (25 * width) / 375,
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    bookmarkButtonIcon: {
        height: (25 * width) / 375,
        width: (25 * width) / 375,
        resizeMode: "contain",
    },
    marginSpace: {
        height: (height * 30) / 667,
        backgroundColor: "transparent",
    },
});

export default withNavigation(BookmarksCard);
