import React, { Component } from "react";
import { Dimensions, Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { withNavigation } from "@react-navigation/compat";
import { OverlappingPictures } from "./overlappingPictures";
import * as ModelClass from "@utils/dataModel/modelClass";

export const { width, height } = Dimensions.get("window");

export class AddBuddies extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        //console.log(" props rxd: " + txt + imageUrl)
        // console.log("addBuddy" + this.props.participantName)
        return (
            <TouchableOpacity
                style={Styles.ContactView}
                accessibilityId={"ContactView"}
                testID={"ContactView"}
                onPress={() => {
                    ModelClass.COMMON_DATA.contactsMultiSelectAllowed = true;
                    this.props.addBuddy
                        ? this.props.navigation.navigate("ContactScreen", {
                              navigationRoute: "FitnessInvite",
                          })
                        : null;
                }}
                activeOpacity={this.props.addBuddy ? 0.6 : 1}
            >
                <View
                    style={Styles.MyImageView}
                    accessibilityId={"MyImageView"}
                    testID={"MyImageView"}
                >
                    {this.props.addBuddy ? (
                        <Image
                            accessibilityLabel={"MyImage"}
                            testID={"MyImage"}
                            style={Styles.MyImage}
                            source={this.props.imageUrl}
                        />
                    ) : null}
                    {this.props.profileImage != null ||
                    (this.props.participantName != null &&
                        this.props.participantName.length > 0) ? (
                        <OverlappingPictures
                            picArray={[
                                {
                                    participantPic: this.props.profileImage,
                                    participantName: this.props.participantName,
                                },
                            ]}
                            addBuddies={true}
                        />
                    ) : null}
                </View>

                <View style={Styles.YouView} accessibilityLabel="YouView" testID="YouView">
                    <Text style={Styles.You} accessibilityLabel="You" testID="You">
                        {this.props.givenName} {this.props.familyName}
                    </Text>
                </View>

                {this.props.crossImage ? (
                    <TouchableOpacity
                        style={Styles.CrossImageView}
                        accessibilityId={"CrossImageView"}
                        testID={"CrossImageView"}
                        onPress={() => {
                            this.props.crossPressed(this.props.givenName, this.props.familyName);
                        }}
                    >
                        <Image
                            accessibilityLabel={"CrossImage"}
                            testID={"CrossImage"}
                            style={Styles.CrossImage}
                            source={this.props.crossImage}
                        />
                    </TouchableOpacity>
                ) : null}
            </TouchableOpacity>
        );
    }
}
export const Styles = StyleSheet.create({
    ContactView: {
        height: (height * 65) / 667,
        width: (width * 285) / 375,
        borderRadius: (height * 32.5) / 667,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    MyImageView: {
        position: "absolute",
        left: (width * 4) / 375,
    },
    MyImage: {
        resizeMode: "contain",
        width: (width * 55) / 375,
        height: (width * 55) / 375,
        borderRadius: (width * 55) / 375 / 2,
    },
    YouView: {
        position: "absolute",
        left: (width * 73) / 375,
        top: (height * 25) / 667,
        height: (height * 30) / 667,
    },
    You: {
        fontFamily: "montserrat",
        fontSize: 15,
        lineHeight: 18.4,
        letterSpacing: 0,
        color: "#000000",
    },
    CrossImageView: {
        position: "absolute",
        left: (width * 240) / 375,
        top: (height * 18) / 667,
    },
    CrossImage: {
        resizeMode: "contain",
        width: (width * 30) / 375,
        height: (height * 30) / 667,
        opacity: 0.5,
    },
});

//export { AddBuddies };
export default withNavigation(AddBuddies);
