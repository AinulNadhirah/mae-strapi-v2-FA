/* eslint-disable react-native/no-color-literals */
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Dimensions, Image, TouchableOpacity, Platform } from "react-native";

import Typo from "@components/Text";

import { FADED_GRAY } from "@constants/colors";

import Assets from "@assets";

const { width } = Dimensions.get("window");

class ContactItem extends React.Component {
    constructor(props) {
        super(props);
    }

    onTapFunction = async () => {
        let {
            name,
            phoneNumbers,
            phoneNumber,
            formatedPhoneNumber,
            isSyncedThroughMaya,
            isSelected,
            mayaUserId,
            mayaUserName,
            profilePicUrl,
            thumbnailPath,
            isMultipleSelection,
            onDoneEvent,
            onContactPress,
        } = this.props;

        await onContactPress({
            name,
            phoneNumbers,
            phoneNumber,
            formatedPhoneNumber,
            isSyncedThroughMaya,
            isSelected,
            mayaUserId,
            mayaUserName,
            profilePicUrl,
            thumbnailPath,
        });

        if (!isMultipleSelection) {
            onDoneEvent();
        }
    };

    shouldComponentUpdate = (nextProps, nextState) => {
        return (
            this.props.isSelected != nextProps.isSelected ||
            this.props.name != nextProps.name ||
            this.props.phoneNumber != nextProps.phoneNumber
        );
    };

    render() {
        // shouldcomponentupdate
        const {
            name,
            formatedPhoneNumber = "",
            isSyncedThroughMaya,
            isSelected,
            isMultipleSelection,
        } = this.props;
        return (
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.5}
                onPress={this.onTapFunction}
            >
                <View style={styles.innerContainer}>
                    {/* label */}
                    <View style={styles.contactNameTextContainer}>
                        <View>
                            <Typo fontSize={14} numberOfLines={1} text={`${name}`} />
                        </View>
                        <View style={styles.contactNameTextContainerSub}>
                            <Typo
                                fontSize={12}
                                color={FADED_GRAY}
                                text={
                                    formatedPhoneNumber
                                        ? formatedPhoneNumber.replace(/^6/, "")
                                        : "-"
                                }
                            />
                        </View>
                    </View>

                    {/* Tick Icon  */}
                    {isMultipleSelection && (
                        <View
                            style={styles.tickImageView}
                            accessibilityId="tickImageView"
                            testID="tickImageView"
                        >
                            {isSelected ? (
                                <Image
                                    accessibilityId="tickImage"
                                    testID="tickImage"
                                    style={
                                        Platform.OS === "ios" ? styles.tickImage1 : styles.tickImage
                                    }
                                    source={Assets.tickIcon}
                                />
                            ) : null}
                        </View>
                    )}

                    {/* MAYA User Icon */}
                    {isSyncedThroughMaya && (
                        <View
                            style={styles.mayaImageView}
                            accessibilityId="mayaImageView"
                            testID="mayaImageView"
                        >
                            <Image
                                accessible={true}
                                testID="mayaImage"
                                accessibilityLabel="mayaImage"
                                style={styles.mayaImage}
                                source={Assets.mayaIcon}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    contactNameTextContainer: {
        alignItems: "flex-start",
        flex: 1,
    },

    contactNameTextContainerSub: { paddingTop: 4 },
    container: {
        backgroundColor: "#ffffff",
        borderColor: "#f2f2f2",
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        height: 65,
        paddingLeft: 24,
        paddingRight: 24,
        width,
    },
    innerContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        paddingTop: 13,
        paddingBottom: 11,
    },
    mayaImage: {
        borderRadius: Platform.select({ ios: 15, android: 30 }),
        height: 32,
        width: 32,
    },
    mayaImageView: {
        height: 32,
        marginLeft: 8,
        width: 32,
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
        height: 22,
        marginLeft: 8,
        width: 22,
    },
});

ContactItem.propTypes = {
    isSelected: PropTypes.bool,
};

ContactItem.defaultProps = {
    isSelected: false,
};

const Memoiz = React.memo(ContactItem);
export default Memoiz;
