import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
    Image,
    View,
    Dimensions,
} from "react-native";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Strings from "@constants/strings";
import { checkifUrlImage } from "@utils/dataModel/utility";
import { ErrorMessage } from "../ErrorMessage";
import { Avatar } from "../Avatar";
import { CircularNameView } from "../CircularNameView";

export const { width, height } = Dimensions.get("window");

export default class FrequentlyContactAvatar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showMaxAlert: false,
        };
    }

    onAvatarTapFunction() {
        let givenName = this.props.givenName;
        let familyName = this.props.familyName;
        let phoneNumbers = this.props.phoneNumbers;
        let mayaUserId = this.props.mayaUserId;
        let isSyncedThroughMaya = this.props.isSyncedThroughMaya;
        let profilePic = this.props.profilePicUrl;
        let id = this.props.item.id;
        let selected = !this.props.selected;

        this.props.onContactAvatarPressMulti({
            givenName,
            familyName,
            phoneNumbers,
            mayaUserId,
            isSyncedThroughMaya,
            selected,
            profilePic,
            id,
        });
    }
    onAvatarSingleTapFunction() {
        this.props.onContactAvatarPress(this.props.item);
    }

    render() {
        const {
            givenName,
            familyName,
            phoneNumbers,
            thumbnailPath,
            onContactAvatarPress,
            isSelected,
        } = this.props;
        return (
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.5}
                onPress={() =>
                    this.props.singleTag
                        ? this.onAvatarSingleTapFunction()
                        : this.onAvatarTapFunction()
                }
            >
                {isSelected ? (
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

                {this.props.profilePicUrl === null ||
                this.props.profilePicUrl === "undefined" ||
                this.props.profilePicUrl === "" ? (
                    <CircularNameView
                        isBig={false}
                        isContact={true}
                        text={
                            givenName === null ||
                            givenName === "undefined" ||
                            givenName === "" ||
                            givenName.match(/\b\w/g) === null
                                ? ""
                                : givenName.match(/\b\w/g).join("").substring(0, 2)
                        }
                    />
                ) : (
                    <Avatar
                        name={givenName.substring(0, 2)}
                        imageUri={
                            checkifUrlImage(this.props.profilePicUrl)
                                ? this.props.profilePicUrl
                                : "data:image/jpeg;base64," + this.props.profilePicUrl
                        }
                        radius={58}
                    />
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {givenName}
                    </Text>
                    {familyName ? (
                        <Text style={styles.nameText} numberOfLines={1}>
                            {familyName}
                        </Text>
                    ) : null}
                </View>
                {this.state.showMaxAlert === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ showMaxAlert: false });
                        }}
                        title={Strings.WARNING}
                        description={
                            !ModelClass.COMMON_DATA.contactsMultiSelectAllowed
                                ? Strings.MAX_CONTACT_LIST_PAGE
                                : Strings.MAX_BUDDIES_CONTACT_LIST_PAGE +
                                  ModelClass.COMMON_DATA.contactsSelectLimit +
                                  Strings.INCLUDIN_YOU
                        }
                        showOk={true}
                        onOkPress={() => {
                            // this.textSelect.current.focus()
                            this.setState({ showMaxAlert: false });
                        }}
                    />
                ) : null}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: 'red'
    },
    textContainer: {
        marginTop: (10 * height) / 667,
        width: (58 * width) / 375,
        height: (35 * height) / 667,
        justifyContent: "space-between",
        alignItems: "center",
    },
    nameText: {
        fontFamily: "montserrat",
        color: "#000000",
        fontSize: 13,
        // fontWeight: "700"
    },
    tickImageView: {
        position: "absolute",
        left: 1,
        top: 1,
        width: 1,
        elevation: 1,
    },
    tickImageView1: {
        position: "absolute",
        left: 1,
        top: 1,
        width: 18,
        height: 18,
        elevation: 1,
    },
    tickImage: {
        resizeMode: "contain",
        width: 18,
        height: 18,
        borderRadius: Platform.select({ ios: 15, android: 30 }),
    },
    tickImage1: {
        resizeMode: "contain",
        overflow: "hidden",
        width: 18,
        height: 18,
    },
});
