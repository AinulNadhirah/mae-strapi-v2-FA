import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    LOYALTY_SCAN_CARD,
    LOYALTY_COLOURS,
    LOYALTY_CARD_PHOTO,
    LOYALTY_CONFIRM_CARD,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { Input } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { editLoyalityCard, getLoyaltyImage } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, BLACK, WHITE } from "@constants/colors";
import {
    CARD_COLOR,
    CARD_NAME,
    CARD_PHOTO,
    CONFIRM,
    CONTINUE,
    DESCRIPTION,
    ENTER_CARD_NAME,
    EXPIRY_DATE,
    FA_LOYALTY_CARD_ADD,
    FA_LOYALTY_CARD_PHOTO,
    FA_LOYALTY_EDIT_CARD,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    LOYALTY_CARD_SENSITIVE_INFO,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex } from "@utils/dataModel";

import Assets from "@assets";

let cardDetails = {};

class LoyaltyAddCardForm extends Component {
    constructor(props) {
        super(props);
        cardDetails = {};
        this.state = {
            ...cardDetails,
            isSubmitDisabled: true,
            id: "",
            isValidName: "",
            isValidNumber: "",
            isValidExp: "",
            cardName: "",
            cardNo: "",
            expiryDateInput: "",
            notes: "",
            colorCode: "#fdc200",
            colorId: "3",
            cardFrontImage: "",
            cardBackImage: "",
            cardFrontImageB64: "",
            cardBackImageB64: "",
            isEditCard: false,
            headerTitle: "Add Loyalty Card",
            colorWhiteList: [
                "#ff1744",
                "#ff9100",
                "#6200ea",
                "#7c909b",
                "#d12f6a",
                "#00b0ff",
                "#7a2f2f",
                "#f15b3d",
                "#1684b1",
                "#04bf1e",
                "#720a79",
                "#be0434",
            ],
        };
    }

    componentDidMount = () => {
        console.log("[LoyaltyAddCardForm] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                this.props?.route?.params?.from === "editCard"
                    ? FA_LOYALTY_EDIT_CARD
                    : FA_LOYALTY_CARD_ADD,
        });
        this.setState({
            isEditCard: this.props?.route?.params?.from === "editCard" ? true : false,
            headerTitle:
                this.props?.route?.params?.from === "editCard"
                    ? "Edit Loyalty Card"
                    : "Add Loyalty Card",
            isSubmitDisabled: this.props?.route?.params?.from === "editCard" ? false : true,
        });
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        // const me = this;
        console.log("[LoyaltyAddCardForm] >> [onScreenFocus]");
        if (this.props?.route?.params) {
            if (this.props?.route?.params?.editCardDetails && !this.state.id) {
                const cardDetails = this.props?.route?.params?.editCardDetails?.cardDetails;
                this.setState(
                    {
                        id: this.props?.route?.params?.editCardDetails?.cardDetails?.id,
                        cardName: cardDetails.cardName,
                        cardNo: cardDetails.cardNo,
                        expiryDateInput: cardDetails.expiryDateInput,
                        notes: cardDetails.notes,
                        colorCode: cardDetails.colorCode
                            ? cardDetails.colorCode
                            : cardDetails.color.colorCode,
                        colorId: cardDetails.colorId
                            ? cardDetails.colorId
                            : cardDetails.color.colorId,
                        cardFrontImage: this.props?.route?.params?.editCardDetails?.cardFrontImage,
                        cardBackImage: this.props?.route?.params?.editCardDetails?.cardBackImage,
                    },
                    () => {
                        this.enableDisableBtn();
                    }
                );

                if (this.props?.route?.params?.editCardDetails?.cardFrontImage) {
                    this.getLoyaltyImages(
                        this.props?.route?.params?.editCardDetails?.cardFrontImage,
                        "front"
                    );
                }
                if (this.props?.route?.params?.editCardDetails?.cardBackImage) {
                    this.getLoyaltyImages(
                        this.props?.route?.params?.editCardDetails?.cardBackImage,
                        "back"
                    );
                }
            }
            if (this.props?.route?.params?.colourDetails) {
                this.setState({
                    colorCode: this.props?.route?.params?.colourDetails?.selectedColor,
                    colorId: this.props?.route?.params?.colourDetails?.selectedColorId,
                });
            }
            if (this.props?.route?.params?.barcodeNumber) {
                this.setState({ cardNo: this.props?.route?.params?.barcodeNumber }, () => {
                    this.enableDisableBtn();
                });
            }
            if (this.props?.route?.params?.cardCaptureData) {
                this.setState({
                    cardFrontImage: this.props?.route?.params?.cardCaptureData?.cardFrontImage,
                    cardBackImage: this.props?.route?.params?.cardCaptureData?.cardBackImage,
                    cardFrontImageB64:
                        this.props?.route?.params?.cardCaptureData?.cardFrontImageB64,
                    cardBackImageB64: this.props?.route?.params?.cardCaptureData?.cardBackImageB64,
                });
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
            })
            .catch((error) => {
                console.log("[LoyaltyAddCardForm][getloyaltyImage] >> Failure", error);
            });
    };

    onBackTap = () => {
        console.log("[LoyaltyAddCardForm] >> [onBackTap]");
        this.props.navigation.goBack();
    };
    onCloseTap = () => {
        console.log("[LoyaltyAddCardForm] >> [onCloseTap]");
        this.props.navigation.navigate("Dashboard", {
            screen: "Loyalty",
            params: {
                loadCards: false,
            },
        });
    };

    enableDisableBtn = () => {
        console.log("[LoyaltyAddCardForm] >> [enableDisableBtn]");
        if (this.state.cardName.length > 0 && this.state.cardNo.length > 0) {
            this.setState({
                isSubmitDisabled: false,
            });
        } else {
            this.setState({
                isSubmitDisabled: true,
            });
        }
    };

    onInputTextChange = (params) => {
        console.log("[LoyaltyAddCardForm] >> [onInputTextChange]");
        const key = params["key"];
        const value = params["value"];
        this.setState(
            {
                [key]: value,
                isValidExp: "",
                isValidName: "",
                isValidNumber: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onExpiryCheck = () => {
        console.log("[LoyaltyAddCardForm] >> [expiryDateValidation]");
        let errorMessage = "";
        const number = this.state.expiryDateInput;
        // Expiry date - Length check
        if (number && number.toString().length === 5 && number.toString().indexOf("/") === 2) {
            const expiryMM = parseInt(number.split("/")[0]);
            const expiryYY = parseInt(number.split("/")[1]);
            // Valid expiry month check
            if (expiryMM < 0 || expiryMM > 12) {
                errorMessage = "Invalid expiry date";
            }
            // Valid expiry year check
            if (expiryYY.toString().length !== 2) {
                errorMessage = "Invalid expiry date";
            }
        } else if (number && number.toString().length > 0 && number.toString().length < 5) {
            errorMessage = "Invalid expiry date";
        }
        this.setState({ isValidExp: errorMessage });
        return errorMessage ? false : true;
    };

    onNameCheck = () => {
        console.log("[LoyaltyAddCardForm] >> [onNameCheck]");
        let errorMessage = "";
        const text = this.state.cardName;
        if (text.length < 4) {
            errorMessage = "Loyalty card name must be more than 3 characters";
        } else if (!leadingOrDoubleSpaceRegex(text)) {
            errorMessage = "Loyalty card name should not contain leading/double spaces";
        }
        this.setState({ isValidName: errorMessage });
        return errorMessage ? false : true;
    };

    onNumberCheck = () => {
        console.log("[LoyaltyAddCardForm] >> [onNumberCheck]");
        let errorMessage = "";
        const text = this.state.cardNo;
        if (text.length < 4) {
            errorMessage = "Loyalty card number must be more than 3 characters";
        } else if (!leadingOrDoubleSpaceRegex(text)) {
            errorMessage = "Loyalty card number must not contain leading/double spaces";
        }
        this.setState({ isValidNumber: errorMessage });
        return errorMessage ? false : true;
    };

    onExpiryChange = (text) => {
        if (!text) {
            this.setState({ expiryDateInput: text, isValidExp: "" });
            return;
        }
        const date1 = text.replace(/^(\d\d)(\d)$/g, "$1/$2");
        const date2 = date1.replace(/^(\d\d\/\d\d)(\d+)$/g, "$1/$2");
        const date3 = date2.replace(/[^\d\/]/g, "");
        this.setState({
            expiryDateInput: date3,
            isValidExp: "",
        });
    };

    startBarcodeCamera = () => {
        console.log("[LoyaltyAddCardForm] >> [startBarcodeCamera]");
        this.props.navigation.navigate(LOYALTY_SCAN_CARD, { from: "barcode" });
    };

    onColourChange = () => {
        console.log("[LoyaltyAddCardForm] >> [onColourChange]");
        this.props.navigation.navigate(LOYALTY_COLOURS);
    };

    onDescChange = (text) => {
        this.setState({
            notes: text,
        });
    };

    onCameraClick = () => {
        console.log("[LoyaltyAddCardForm] >> [onCameraClick]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOYALTY_CARD_PHOTO,
        });
        const { cardFrontImage, cardBackImage, cardBackImageB64, cardFrontImageB64 } = this.state;
        this.props.navigation.navigate(LOYALTY_CARD_PHOTO, {
            cardFrontImage: cardFrontImage,
            cardBackImage: cardBackImage,
            cardFrontImageB64: cardFrontImageB64,
            cardBackImageB64: cardBackImageB64,
            from: "addCard",
            navigateFrom: "addCard",
        });
    };

    onConfirmTap = () => {
        console.log("[LoyaltyAddCardForm] >> [onConfirmTap]");
        this.cardDetails = this.preparecardDetails();
        const colorText = this.state.colorWhiteList.includes(this.cardDetails?.colorCode)
            ? WHITE
            : BLACK;
        if (this.onNameCheck() && this.onNumberCheck() && this.onExpiryCheck()) {
            if (this.state.isEditCard) {
                this.setState({
                    isSubmitDisabled: true,
                });
                this.onSubmitEditCardDetails();
            } else {
                this.props.navigation.navigate(LOYALTY_CONFIRM_CARD, {
                    cardDetails: this.cardDetails,
                    from: "addCard",
                    colorText,
                });
            }
        }
    };

    onSubmitEditCardDetails = () => {
        console.log("[LoyaltyAddCardForm][onSubmitEditCardDetails]");
        let data = {};
        let color = {};
        // data.cardBackImage = this.state.cardBackImage;
        // data.cardFrontImage = this.state.cardFrontImage;
        data.cardName = this.state.cardName;
        data.cardNo = this.state.cardNo;
        color.colorId = this.state.colorId;
        color.colorCode = this.state.colorCode;
        data.color = color;
        data.expiryDate = "";
        data.id = this.state.id;
        data.notes = this.state.notes;
        data.expiryDateInput = this.state.expiryDateInput;

        const iOSURIFront = this.state.cardFrontImage.replace("file://", "");
        const iOSURIBack = this.state.cardBackImage.replace("file://", "");

        const frontImage = Platform.OS == "android" ? this.state.cardFrontImage : iOSURIFront;
        const backImage = Platform.OS == "android" ? this.state.cardBackImage : iOSURIBack;
        let formdata = new FormData();
        if (
            frontImage &&
            backImage &&
            !this.state.cardFrontImage.includes("https://") &&
            !this.state.cardBackImage.includes("https://")
        ) {
            formdata.append("frontImage", {
                uri: frontImage,
                name: "frontImage",
                type: "image/jpeg",
            });
            formdata.append("backImage", { uri: backImage, name: "backImage", type: "image/jpeg" });
        }
        formdata.append("entity", JSON.stringify(data));

        editLoyalityCard(formdata)
            .then((response) => {
                // console.log("[LoyaltyAddCardForm][onCommitEditCardDetails] >> Success", response);
                this.props.navigation.navigate("Dashboard", {
                    screen: "Loyalty",
                    params: {
                        loadCards: true,
                    },
                });
            })
            .catch((error) => {
                this.setState({
                    isSubmitDisabled: false,
                });
                console.log("[LoyaltyAddCardForm][onCommitEditCardDetails] >> Failure", error);
            });
    };

    preparecardDetails = () => {
        this.cardDetails = { ...this.state };
        console.log("LoyaltyAddCardForm >> preparecardDetails >> ", this.cardDetails);
        return this.cardDetails;
    };

    render() {
        console.log("[LoyaltyAddCardForm] >> [render]");
        const {
            isSubmitDisabled,
            isValidName,
            isValidNumber,
            isValidExp,
            cardName,
            cardNo,
            expiryDateInput,
            notes,
            colorCode,
            cardFrontImageB64,
            headerTitle,
        } = this.state;
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
                                    text={headerTitle}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                >
                    <KeyboardAwareScrollView
                        style={styles.viewContainer}
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={styles.fieldContainer}>
                            {/* Card Name */}
                            <View style={styles.containerTitle}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text={CARD_NAME}
                                />
                            </View>
                            <View>
                                <TextInput
                                    maxLength={20}
                                    isValid={!isValidName}
                                    isValidate
                                    errorMessage={isValidName}
                                    value={cardName}
                                    placeholder={ENTER_CARD_NAME}
                                    onChangeText={(value) => {
                                        this.onInputTextChange({ key: "cardName", value });
                                    }}
                                />
                            </View>

                            {/* Card Number */}
                            <View style={styles.containerTitle}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text="Card number"
                                />
                            </View>
                            <View style={styles.contentLeftView}>
                                <View style={styles.textinputView}>
                                    <TextInput
                                        maxLength={16}
                                        isValidate
                                        isValid={!isValidNumber}
                                        errorMessage={isValidNumber}
                                        value={cardNo}
                                        placeholder="0000000000000"
                                        onChangeText={(value) => {
                                            this.onInputTextChange({ key: "cardNo", value });
                                        }}
                                    />
                                </View>
                                <View style={styles.barcodeIcon}>
                                    <TouchableOpacity onPress={this.startBarcodeCamera}>
                                        <Image
                                            accessible={true}
                                            testID={"barcodeCameraIcon"}
                                            accessibilityLabel={"barcodeCameraIcon"}
                                            style={styles.rightSideImage}
                                            source={Assets.icBarcodeScanner}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Card Expiry */}
                            <View style={styles.containerTitle}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text={EXPIRY_DATE}
                                />
                            </View>
                            <View>
                                <TextInput
                                    maxLength={5}
                                    isValid={!isValidExp}
                                    isValidate
                                    errorMessage={isValidExp}
                                    value={expiryDateInput}
                                    placeholder="MM/YY"
                                    keyboardType={"numeric"}
                                    onChangeText={this.onExpiryChange}
                                    returnKeyType="done"
                                />
                            </View>

                            {/* Card Color */}
                            <View style={styles.contentLeftView}>
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={CARD_COLOR}
                                    />
                                </View>
                                <View style={styles.contentCircleRightView}>
                                    <TouchableOpacity
                                        onPress={this.onColourChange}
                                        style={[styles.circleStyle, { backgroundColor: colorCode }]}
                                    />
                                </View>
                            </View>
                            {/* Card Description */}
                            <InlineEditor
                                label={DESCRIPTION}
                                value={notes}
                                componentID="loyaltyDesc"
                                placeHolder={"Optional"}
                                isEditable
                                maxLength={30}
                                onValueChange={(value) => {
                                    this.onInputTextChange({ key: "notes", value });
                                }}
                                style={styles.inlineEditor}
                            />
                            {/* Card Camera */}
                            <View style={styles.contentLeftView}>
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text={CARD_PHOTO}
                                    />
                                </View>
                                <View style={styles.contentRightView}>
                                    <TouchableOpacity onPress={this.onCameraClick}>
                                        {!cardFrontImageB64 ? (
                                            <Image
                                                accessible={true}
                                                testID={"cameraIcon"}
                                                accessibilityLabel={"cameraIcon"}
                                                style={styles.rightSideCameraImage}
                                                source={Assets.icSelectCamera}
                                            />
                                        ) : (
                                            <ImageBackground
                                                testID={"cardFrontImg"}
                                                accessibilityLabel={"cardFrontImg"}
                                                style={styles.cardCaptureImg}
                                                imageStyle={styles.backgroundImgView}
                                                source={{
                                                    uri: `data:image/jpeg;base64,${cardFrontImageB64}`,
                                                }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Typo
                                fontSize={14}
                                lineHeight={20}
                                fontWeight="600"
                                textAlign="left"
                                color={BLACK}
                                style={styles.loyaltyNote}
                            >
                                {"Note: "}
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    // fontWeight="normal"
                                    color={BLACK}
                                    textAlign="left"
                                    text={LOYALTY_CARD_SENSITIVE_INFO}
                                    style={{ fontWeight: "normal" }}
                                />
                            </Typo>
                        </View>
                    </KeyboardAwareScrollView>
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
                                    text={this.state.isEditCard ? CONFIRM : CONTINUE}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    backgroundImgView: {
        borderRadius: 25,
        height: 50,
        width: 50,
    },
    barcodeIcon: {
        height: 50,
        position: "absolute",
        right: 0,
    },
    cardCaptureImg: {
        height: 50,
        width: 50,
    },
    circleStyle: {
        alignItems: "center",
        borderRadius: 50,
        height: 28,
        justifyContent: "center",
        width: 28,
    },
    confirmButton: {
        marginTop: 40,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    contentCircleRightView: {
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 23,
        flex: 1,
        height: 34,
        justifyContent: "center",
        marginTop: 20,
        position: "absolute",
        right: 3,
        shadowColor: "rgba(0, 0, 0, 0.27)",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        width: 34,
    },
    contentLeftView: {
        flexDirection: "row",
    },
    contentRightView: {
        height: 50,
        marginTop: 20,
        position: "absolute",
        right: 0,
    },
    fieldContainer: {
        marginBottom: 44,
        marginHorizontal: 36,
    },
    inlineEditor: {
        height: 55,
        marginTop: 37,
    },
    loyaltyNote: {
        marginTop: 35,
    },
    rightSideCameraImage: {
        height: 30,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 30,
    },
    rightSideImage: {
        height: 30,
        marginTop: 10,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 30,
    },
    textinputView: {
        width: "100%",
    },
    viewContainer: {
        flex: 1,
    },
});

export default LoyaltyAddCardForm;
