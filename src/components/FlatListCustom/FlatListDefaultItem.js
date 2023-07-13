/* eslint-disable react-native/no-color-literals */
import React from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    Platform,
} from "react-native";
const { width } = Dimensions.get("window");

export default class FlatListDefaultItem extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    onTapFunction = () => {
        let givenName = this.props.givenName;
        let familyName = this.props.familyName;
        let middleName = this.props.middleName;
        let suffix = this.props.suffix;
        let phoneNumbers = this.props.phoneNumbers;
        let profilePic = this.props.profilePicUrl;
        let isSyncedThroughMaya = this.props.isSyncedThroughMaya;
        let mayaUserId = this.props.mayaUserId;
        let id = this.props.id;

        this.props.onContactPress({
            givenName,
            familyName,
            middleName,
            suffix,
            phoneNumbers,
            profilePic,
            isSyncedThroughMaya,
            // selected: isSelected,
            mayaUserId,
            id,
        });
    };

    render() {
        const {
            givenName = "",
            familyName = "",
            middleName = "",
            suffix = "",
            phoneNumbers = [],
            isSyncedThroughMaya = false,
            onContactPress,
            profilePic = "",
            itemIndex,
            mayaUserId,
            isSelected,
        } = this.props;
        return (
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.5}
                onPress={this.onTapFunction}
            >
                {isSelected == true ? (
                    <View
                        style={Platform.OS === "ios" ? styles.tickImageView1 : styles.tickImageView}
                        accessibilityId={"tickImageView"}
                        testID={"tickImageView"}
                    >
                        <Image
                            accessibilityId={"tickImage"}
                            testID={"tickImage"}
                            style={Platform.OS === "ios" ? styles.tickImage1 : styles.tickImage}
                            source={require("@assets/icons/ic_done_green.png")}
                        />
                    </View>
                ) : null}

                <View style={styles.innerContainer}>
                    <Text
                        accessible={true}
                        testID={"name" + `${itemIndex}`}
                        accessibilityLabel={"name" + `${itemIndex}`}
                        style={styles.contactNameText}
                    >{`${givenName} ${middleName ? middleName : ""} ${
                        familyName ? familyName : ""
                    } ${suffix ? suffix : ""}`}</Text>
                    {isSyncedThroughMaya ? (
                        <Image
                            accessible={true}
                            testID={"mayaImage"}
                            accessibilityLabel={"mayaImage"}
                            style={styles.mayaImage}
                            source={require("@assets/icons/ic_maya_floating.png")}
                        />
                    ) : (
                        <Text> </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    contactNameText: {
        color: "#000000",
        fontFamily: "Montserrat-Regular",
        fontSize: 15,
    },
    container: {
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderColor: "#f2f2f2",
        borderWidth: 1,
        height: 44,
        justifyContent: "center",
        paddingLeft: 34,
        paddingRight: 48,
        width,
    },
    innerContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - (34 + 48),
    },
    mayaImage: {
        borderRadius: Platform.select({ ios: 15, android: 30 }),
        height: 30,
        width: 30,
    },
    tickImage: {
        borderRadius: Platform.select({ ios: 15, android: 30 }),
        height: 22,
        resizeMode: "contain",
        width: 22,
    },
    tickImage1: {
        height: 22,
        overflow: "hidden",
        resizeMode: "contain",
        width: 22,
    },
    tickImageView: {
        left: 5,
        position: "absolute",
        width: 1,
    },
    tickImageView1: {
        left: 5,
        position: "absolute",
        width: 22,
        height: 22,
    },
});
