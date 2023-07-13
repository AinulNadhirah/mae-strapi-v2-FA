import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import LinearGradient from "react-native-linear-gradient";

import { APPLY_M2U_SECURITY_IMAGE } from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    WHITE,
    BLACK,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    SHADOW,
} from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, NEW_MAE } from "@constants/strings";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

class UploadSecurityImage extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            selfieImgData: "",
            filledUserDetails: props.route.params?.filledUserDetails,
            isNextDisabled: true,
        };

        const navigateFrom = props.route.params?.filledUserDetails?.onBoardDetails2?.from;
        if (navigateFrom === ZEST_NTB_USER || navigateFrom === NEW_MAE) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: APPLY_M2U_SECURITY_IMAGE,
            });
        }
    }

    componentDidMount() {
        console.log("[UploadSecurityImage] >> [componentDidMount]");
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    onScreenFocus = () => {
        console.log("[UploadSecurityImage] >> [onScreenFocus]");
        if (this.props.route.params) {
            if (this.props.route.params.selfieImgData) {
                this.setState({
                    selfieImgData: this.props.route.params.selfieImgData
                        ? this.props.route.params.selfieImgData
                        : "",
                    isNextDisabled: false,
                });
            }
            if (this.props.route.params?.username) {
                const { filledUserDetails } = this.state;
                const usernameDetails = {
                    username: this.props.route.params?.username,
                    password: this.props.route.params?.pw,
                };
                filledUserDetails.usernameDetails = usernameDetails;
            }
        }
    };

    onBackTap = () => {
        console.log("[UploadSecurityImage] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[UploadSecurityImage] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    moveToNext = () => {
        console.log("[UploadSecurityImage] >> [moveToNext]");
        // Selfie upload check
        if (this.state.selfieImgData != "") {
            const filledUserDetails = this.prepareUserDetails();
            this.props.navigation.navigate(navigationConstant.M2U_SECUIRTY_PHRASE, {
                filledUserDetails,
            });
        }
    };

    prepareUserDetails = () => {
        let securityPhraseImage = { selfieImage: this.state.selfieImgData };
        let MAEUserDetails = this.state?.filledUserDetails || {};
        MAEUserDetails.securityPhraseImage = securityPhraseImage;
        console.log("UploadSecurityImage >> prepareUserDetails >> ", MAEUserDetails);
        return MAEUserDetails;
    };

    retake = () => {
        console.log("[UploadSecurityImage] >> [retake]");
    };

    selfiImageClicked = () => {
        console.log("[UploadSecurityImage] >> [selfiImageClicked]");

        let popupButtons = [
            {
                text: "Take Photo",
                onPress: this.onTakePhoto,
            },
            {
                text: "From Gallery",
                onPress: this.onFromGallery,
            },
        ];

        Alert.alert("Select action", "", popupButtons, { cancelable: true });
    };

    onTakePhoto = async () => {
        console.log("[UploadSecurityImage] >> [onTakePhoto]");
        const { filledUserDetails } = this.state;
        var permission = await Utility.checkCamPermission();
        if (permission) {
            this.props.navigation.navigate(navigationConstant.SCAN_KYC_SCREEN, {
                filledUserDetails,
                openCamText: "Place your photo in the circle",
            });
        }
    };

    onFromGallery = async () => {
        console.log("[UploadSecurityImage] >> [onFromGallery]");

        const image = await ImagePicker.openPicker({
            cropping: true,
            includeBase64: true,
            compressImageQuality: 1,
            includeExif: true,
            freeStyleCropEnabled: true,
            mediaType: "photo",
            cropperCircleOverlay: true,
            showCropGuidelines: false,
            hideBottomControls: true,
        });
        const base64Data = image?.data ?? "";

        if (base64Data) {
            this.setState({
                selfieImgData: image.data,
                isNextDisabled: false,
            });
        } else {
            console.log(
                "[UploadSecurityImage][onFromGallery] >> ImagePicker Failure Callback: ",
                image
            );
        }
    };

    render() {
        const { selfieImgData, isNextDisabled, filledUserDetails } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            filledUserDetails?.from != "updateDetails" ? (
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    }
                                />
                            ) : null
                        }
                    >
                        <ScrollView>
                            <View
                                style={
                                    filledUserDetails?.from === "updateDetails"
                                        ? styles.updateFormContainer
                                        : styles.formContainer
                                }
                            >
                                <React.Fragment>
                                    <View style={styles.fieldContainer}>
                                        {/* Title */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={23}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={"Create a Maybank2u ID"}
                                        />

                                        {/* Description */}
                                        <Typo
                                            fontSize={20}
                                            lineHeight={30}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={"Upload a security image"}
                                        />
                                        <View style={styles.profilePicture}>
                                            <TouchableOpacity
                                                style={styles.selfibuttonView}
                                                onPress={this.selfiImageClicked}
                                                accessibilityLabel={"selfiImageButton"}
                                            >
                                                <View style={styles.profilePictureCircle}>
                                                    <Image
                                                        source={
                                                            selfieImgData
                                                                ? {
                                                                      uri: `data:image/jpeg;base64,${selfieImgData}`,
                                                                  }
                                                                : Assets.selfieImage
                                                        }
                                                        style={styles.profilePictureImage}
                                                    />
                                                </View>
                                                <View style={styles.profilePictureAdd}>
                                                    <Image
                                                        source={Assets.cameraPlus}
                                                        style={styles.profilePictureAddIcon}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </React.Fragment>
                            </View>
                        </ScrollView>
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={20}
                                height={48}
                                disabled={isNextDisabled}
                                backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                        text="Continue"
                                    />
                                }
                                onPress={this.moveToNext}
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

UploadSecurityImage.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.shape({
                onBoardDetails2: PropTypes.shape({
                    from: PropTypes.string,
                }),
            }),
        }),
    }),
};

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
    },
    formContainer: {
        marginHorizontal: 36,
    },
    updateFormContainer: {
        marginHorizontal: 36,
        marginTop: 80,
    },
    fieldContainer: {
        marginTop: 24,
    },
    selfibuttonView: {
        marginTop: 50,
        position: "relative",
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
    profilePictureCircle: {
        borderRadius: 80,
        overflow: "hidden",
    },
    profilePictureImage: {
        height: 160,
        width: 160,
    },
    profilePictureAdd: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        bottom: 0,
        elevation: 10,
        height: 48,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 14,
        width: 48,
    },
    profilePictureAddIcon: {
        height: 16,
        width: 19,
    },
    profilePictureInner: {
        marginBottom: 16,
        position: "relative",
    },
    profilePicture: {
        alignItems: "center",
        paddingVertical: 28,
    },
});

export default UploadSecurityImage;
