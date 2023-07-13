import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    ImageBackground,
    Dimensions,
    StyleSheet,
    ScrollView,
} from "react-native";

import {
    LOYALTY_ADD_CARD,
    LOYALTY_CONFIRM_CARD,
    LOYALTY_SCAN_CARD,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { getLoyaltyImage } from "@services";

import { YELLOW, DISABLED, NEARYLY_DARK_GREY, WHITE } from "@constants/colors";

import { checkCamPermission } from "@utils/dataModel/utility";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");

const screenHeight = Dimensions.get("window").height;
let cardCaptureData = {};

class LoyaltyCardPhoto extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    cardCaptureData = {};
    constructor(props) {
        super(props);

        this.state = {
            ...cardCaptureData,
            isSubmitDisabled: true,
            cardFrontImage: "",
            cardBackImage: "",
            cardFrontImageB64: "",
            cardBackImageB64: "",
            from: "",
            navigateFrom: "",
        };
    }

    componentDidMount() {
        console.log("[LoyaltyCardPhoto] >> [componentDidMount]");
        const params = this.props?.route?.params;
        this.setState({
            cardFrontImage: params?.cardFrontImage || "",
            cardBackImage: params?.cardBackImage || "",
            cardFrontImageB64: params?.cardFrontImageB64 || "",
            cardBackImageB64: params?.cardBackImageB64 || "",
            from: params?.from || "",
            navigateFrom: params?.navigateFrom || "",
        });
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    onScreenFocus = () => {
        console.log("[LoyaltyCardPhoto] >> [onScreenFocus]");
        const params = this.props?.route?.params;
        if (params) {
            if (params?.cardFrontImage && params?.cardFrontImage.includes("https://")) {
                this.getLoyaltyImages(params?.cardFrontImage, "front");
            } else {
                this.setState({
                    cardFrontImageB64: params?.cardFrontImageB64,
                    cardFrontImage: params?.cardFrontImage,
                });
            }
            if (params?.cardBackImage && params?.cardBackImage.includes("https://")) {
                this.getLoyaltyImages(params?.cardBackImage, "back");
            } else {
                this.setState({
                    cardBackImageB64: params?.cardBackImageB64,
                    cardBackImage: params?.cardBackImage,
                });
            }
            if (params?.cardFrontImage && params?.cardBackImage) {
                this.setState({ isSubmitDisabled: false });
            }
        }
    };

    getLoyaltyImages = (imageUrl, cardSide) => {
        getLoyaltyImage(imageUrl)
            .then((response) => {
                const base64Str = Buffer.from(response.data, "binary").toString("base64");
                cardSide === "front"
                    ? this.setState({ cardFrontImageB64: base64Str ? base64Str : "" })
                    : this.setState({ cardBackImageB64: base64Str ? base64Str : "" });
                cardSide === "front"
                    ? this.setState({ cardFrontImage: this.props?.route?.params?.cardFrontImage })
                    : this.setState({ cardBackImage: this.props?.route?.params?.cardBackImage });
            })
            .catch((error) => {
                console.log("[LoyaltyAddCardForm][getloyaltyImage] >> Failure", error);
            });
    };

    onConfirmTap = () => {
        console.log("[LoyaltyCardPhoto] >> [onConfirmTap]");
        this.cardCaptureData = this.prepareCardCaptureData();
        const from = this.state.from;
        if (from == "addCard") {
            this.props.navigation.navigate(LOYALTY_ADD_CARD, {
                cardCaptureData: this.cardCaptureData,
                from: "LoyaltyCardPhoto",
            });
        } else if (from == "confirmCard") {
            this.props.navigation.navigate(LOYALTY_CONFIRM_CARD, {
                cardCaptureData: this.cardCaptureData,
                from: "LoyaltyCardPhoto",
            });
        } else if (from == "viewCard") {
            this.props.navigation.navigate(LOYALTY_CONFIRM_CARD, {
                from: "LoyaltyCardPhoto",
            });
        } else {
            console.log("[LoyaltyCardPhoto] >> [onConfirmTap] >> [else]", from);
        }
    };

    prepareCardCaptureData = () => {
        this.cardCaptureData = { ...this.state };
        console.log("[LoyaltyCardPhoto] >> [prepareAddCardDetails] >> ", this.cardCaptureData);
        return this.cardCaptureData;
    };

    frontImagePressed = async () => {
        console.log("[LoyaltyCardPhoto] >> [frontImagePressed]");
        const { navigateFrom } = this.state;
        const permission = await checkCamPermission();
        if (permission && this.state.from != "viewCard") {
            this.props.navigation.navigate(LOYALTY_SCAN_CARD, { from: "front", navigateFrom });
        } else {
            console.log("Just View the card. To edit click on edit button");
        }
    };

    backImagePressed = async () => {
        console.log("[LoyaltyCardPhoto] >> [backImagePressed]");
        const { navigateFrom } = this.state;
        const permission = await checkCamPermission();
        if (permission && this.state.from != "viewCard") {
            this.props.navigation.navigate(LOYALTY_SCAN_CARD, { from: "back", navigateFrom });
        } else {
            console.log("Just View the card. To edit click on edit button");
        }
    };

    onBackTap = () => {
        console.log("[LoyaltyCardPhoto] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[LoyaltyCardPhoto] >> [onCloseTap]");
        this.props.navigation.navigate("Dashboard", {
            screen: "Loyalty",
            params: {
                loadCards: false,
            },
        });
    };

    render() {
        const { cardFrontImage, isSubmitDisabled } = this.state;
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Card Photo"
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                >
                    <React.Fragment>
                        <ScrollView style={styles.viewContainer}>
                            <View style={styles.fieldContainer}>
                                {/* Top Image Capture Tab */}
                                {cardFrontImage != "" ? (
                                    <TouchableOpacity
                                        style={styles.captureButton}
                                        onPress={this.frontImagePressed}
                                        accessibilityLabel={"frontPicClick"}
                                    >
                                        <View>
                                            <ImageBackground
                                                style={styles.capturedImage}
                                                imageStyle={styles.capturedImageStyle}
                                                source={{
                                                    uri: `data:image/gif;base64,${this.state.cardFrontImageB64}`,
                                                }}
                                            >
                                                <Image
                                                    accessible={true}
                                                    testID={"cameraImg"}
                                                    accessibilityLabel={"cameraImg"}
                                                    style={[
                                                        styles.captureIcon,
                                                        {
                                                            marginLeft: (200 * width) / 325,
                                                            marginTop: (110 * height) / 750,
                                                        },
                                                    ]}
                                                    source={Assets.icYellowCamIcon}
                                                />
                                            </ImageBackground>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.captureMainView}>
                                        <TouchableOpacity
                                            style={styles.camerabuttonView}
                                            onPress={this.frontImagePressed}
                                            accessibilityLabel={"frontPicClick1"}
                                        >
                                            <Image
                                                style={styles.cameraImage}
                                                source={Assets.icCameraWhiteBG}
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={23}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="center"
                                                text={"Front"}
                                                color={NEARYLY_DARK_GREY}
                                                style={{ marginTop: 31 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {/* Bottom Image Capture Tab */}
                                {this.state.cardBackImage != "" ? (
                                    <TouchableOpacity
                                        style={styles.captureButton}
                                        onPress={this.backImagePressed}
                                        accessibilityLabel={"backPicClick"}
                                    >
                                        <View>
                                            <ImageBackground
                                                style={styles.capturedImage}
                                                imageStyle={styles.capturedImageStyle}
                                                source={{
                                                    uri: `data:image/gif;base64,${this.state.cardBackImageB64}`,
                                                }}
                                            >
                                                <Image
                                                    accessible={true}
                                                    testID={"cameraImg"}
                                                    accessibilityLabel={"cameraImg"}
                                                    style={[
                                                        styles.captureIcon,
                                                        {
                                                            marginLeft: (200 * width) / 325,
                                                            marginTop: (110 * height) / 750,
                                                        },
                                                    ]}
                                                    source={Assets.icYellowCamIcon}
                                                />
                                            </ImageBackground>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.captureMainView}>
                                        <TouchableOpacity
                                            style={styles.camerabuttonView}
                                            onPress={this.backImagePressed}
                                            accessibilityLabel={"backPicClick1"}
                                        >
                                            <Image
                                                style={styles.cameraImage}
                                                source={Assets.icCameraWhiteBG}
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={23}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="center"
                                                text={"Back"}
                                                color={NEARYLY_DARK_GREY}
                                                style={{ marginTop: 31 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                        {/* Card Confirm Button */}
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                onPress={this.onConfirmTap}
                                disabled={isSubmitDisabled}
                                backgroundColor={isSubmitDisabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Done"
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    cameraImage: {
        alignItems: "center",
        height: 21,
        width: 25,
    },
    camerabuttonView: {
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        width: "100%",
    },
    captureButton: {
        borderRadius: 8,
        height: (screenHeight * 22) / 100,
        marginTop: (screenHeight * 3) / 100,
        width: "100%",
    },
    captureIcon: {
        height: 42,
        resizeMode: "contain",
        width: 42,
    },
    captureMainView: {
        borderColor: "#cfcfcf",
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 2.5,
        height: (screenHeight * 22) / 95,
        marginTop: (screenHeight * 3) / 100,
        position: "relative",
        width: "100%",
        backgroundColor: WHITE,
    },
    capturedImage: {
        borderColor: "#cfcfcf",
        alignItems: "center",
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 2.5,
        flexDirection: "row",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        // backgroundColor: "transparent",
    },
    capturedImageStyle: {
        borderRadius: 5,
        height: "100%",
        width: "100%",
    },
    confirmButton: {
        marginTop: 40,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
    },
});

export default LoyaltyCardPhoto;
