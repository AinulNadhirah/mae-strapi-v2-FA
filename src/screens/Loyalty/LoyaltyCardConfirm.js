import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, AppState } from "react-native";
import Barcode from "react-native-barcode-builder";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { LOYALTY_ADD_CARD, LOYALTY_CARD_PHOTO } from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { Input } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import { submitLoyalityCard, removeLoyalityCard, editLoyalityCard } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, ROYAL_BLUE, YELLOW, DISABLED, MEDIUM_GREY } from "@constants/colors";
import {
    CANCEL,
    CARD_PHOTO,
    CONFIRM,
    DESCRIPTION,
    EDIT_CARD,
    FA_ACTION_NAME,
    FA_EDIT_CARD,
    FA_FORM_COMPLETE,
    FA_LOYALTY_CARD_REMOVE,
    FA_LOYALTY_CARD_REVIEW,
    FA_LOYALTY_CARD_VIEW,
    FA_OPEN_MENU,
    FA_REMOVE_CARD,
    FA_SCREEN_NAME,
    FA_SELECT_MENU,
    FA_VIEW_SCREEN,
    REMOVE,
    REMOVE_CARD,
    REMOVE_PARTNER_CARD_QUES,
    VIEW_CARD_PHOTO,
} from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

let editCardDetails = {};

class LoyaltyCardConfirm extends Component {
    constructor(props) {
        super(props);
        editCardDetails = {};
        this.state = {
            ...editCardDetails,
            showMenu: false,
            showPopup: false,
            isSubmitDisabled: false,
            menuArray: [
                {
                    menuLabel: EDIT_CARD,
                    menuParam: "editCard",
                },
                {
                    menuLabel: REMOVE_CARD,
                    menuParam: "removeCard",
                },
            ],
            cardName: "",
            cardNo: "",
            expiryDateInput: "",
            notes: "",
            barCode: "1068559",
            cardDetails: "",
            cardFrontImage: "",
            cardBackImage: "",
            cardFrontImageB64: "",
            cardBackImageB64: "",
            colorCode: "",
            from: props.route.params.from,
            isEditable: props.route.params.from == "viewCard" ? false : true,
            appState: AppState.currentState,
            textColor: props?.route?.params?.colorText,
        };
    }

    componentDidMount = () => {
        console.log("[LoyaltyCardConfirm] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                this.state.from === "viewCard" ? FA_LOYALTY_CARD_VIEW : FA_LOYALTY_CARD_REVIEW,
        });
        AppState.addEventListener("change", this._handleAppStateChange);
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    componentWillUnmount() {
        AppState.removeEventListener("change", this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        this.setState({ appState: nextAppState });
    };

    onScreenFocus = () => {
        // const me = this;
        console.log("[LoyaltyCardConfirm] >> [onScreenFocus]");
        const params = this.props?.route?.params;
        if (params) {
            if (params?.cardDetails) {
                const cardDetails = params?.cardDetails;
                // cardDetails.cardFrontImageB64 = base64Str ? base64Str : cardDetails.cardFrontImage;

                this.setState({
                    cardDetails: cardDetails,
                    cardName: cardDetails.cardName,
                    colorCode: cardDetails.colorCode
                        ? cardDetails.colorCode
                        : cardDetails.color.colorCode,
                    cardNo: cardDetails.cardNo,
                    expiryDateInput: cardDetails.expiryDateInput ? cardDetails.expiryDateInput : "",
                    notes: cardDetails.notes,
                    barCode: cardDetails.cardNo,
                    cardFrontImage: cardDetails.cardFrontImage ? cardDetails.cardFrontImage : "",
                    cardBackImage: cardDetails.cardBackImage ? cardDetails.cardBackImage : "",
                    cardFrontImageB64: cardDetails.cardFrontImageB64
                        ? cardDetails.cardFrontImageB64
                        : "",
                    cardBackImageB64: cardDetails.cardBackImageB64
                        ? cardDetails.cardBackImageB64
                        : "",
                });
            }
            if (params?.cardCaptureData) {
                this.setState({
                    cardFrontImage: params?.cardCaptureData?.cardFrontImage || "",
                    cardBackImage: params?.cardCaptureData?.cardBackImage || "",
                    cardFrontImageB64: params?.cardCaptureData?.cardFrontImageB64 || "",
                    cardBackImageB64: params?.cardCaptureData?.cardBackImageB64 || "",
                    from: this.props?.route?.from || "",
                    isEditable: this.props?.route?.from == "viewCard" ? false : true,
                });
            }
        }
    };

    onBackTap = () => {
        console.log("[LoyaltyCardConfirm] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onToggleMenu = () => {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: FA_LOYALTY_CARD_VIEW,
        });
        this.setState({ showMenu: !this.state.showMenu });
    };

    onCloseBtn = () => {
        console.log("[LoyaltyCardConfirm] >> [onCloseBtn]");
        this.props.navigation.navigate("Dashboard", {
            screen: "Loyalty",
            params: {
                loadCards: false,
            },
        });
    };

    onMenuItemPress = (param) => {
        this.setState({ showMenu: false });
        switch (param) {
            case "editCard":
                this.editCard();
                break;
            case "removeCard":
                this.removeCard();
                break;
        }
    };

    editCard = () => {
        console.log("[LoyaltyCardConfirm] >> [editCard]");
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_LOYALTY_CARD_VIEW,
            [FA_ACTION_NAME]: FA_EDIT_CARD,
        });
        this.editCardDetails = this.prepareCardDetails();
        this.props.navigation.navigate(LOYALTY_ADD_CARD, {
            editCardDetails: this.editCardDetails,
            from: "editCard",
        });
    };

    prepareCardDetails = () => {
        this.editCardDetails = { ...this.state };
        console.log("LoyaltyCardConfirm >> preparecardDetails >> ", this.editCardDetails);
        return this.editCardDetails;
    };

    removeCard = () => {
        console.log("[LoyaltyCardConfirm] >> [removeCard]");
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: FA_LOYALTY_CARD_VIEW,
            [FA_ACTION_NAME]: FA_REMOVE_CARD,
        });
        this.setState({ showPopup: false });
        setTimeout(() => {
            this.setState({ showPopup: true });
        }, 0);
    };

    confirmRemoveCard = (btn) => {
        console.log("[LoyaltyCardConfirm] >> [confirmRemoveCard]", btn);
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_LOYALTY_CARD_REMOVE,
        });
        this.setState({ showPopup: false });
        removeLoyalityCard(this.state.cardDetails.id)
            .then((response) => {
                // console.log("[LoyaltyCardConfirm][loadCards] >> Success", response);
                showSuccessToast({
                    message: "You've successfully removed your loyalty card.",
                });
                this.props.navigation.navigate("Dashboard", {
                    screen: "Loyalty",
                    params: {
                        loadCards: true,
                    },
                });
            })
            .catch((error) => {
                console.log("[LoyaltyCardConfirm][loadCards] >> Failure", error);
            });
    };

    cancelRemoveCard = () => {
        this.setState({ showPopup: false });
    };

    onDescChange = (text) => {
        this.setState({
            notes: text,
        });
    };

    onCameraClick = () => {
        console.log("[LoyaltyCardConfirm] >> [onCameraClick]");
        // if (!this.state.isEditable) {
        // 	return;
        // }
        const { cardFrontImage, cardBackImage, cardBackImageB64, cardFrontImageB64 } = this.state;
        this.props.navigation.navigate(LOYALTY_CARD_PHOTO, {
            cardFrontImageB64: cardFrontImageB64,
            cardBackImageB64: cardBackImageB64,
            cardFrontImage: cardFrontImage,
            cardBackImage: cardBackImage,
            from: "confirmCard",
            navigateFrom: this.props?.route?.params?.from,
        });
    };

    onViewCardPhoto = () => {
        console.log("[LoyaltyCardConfirm] >> [onViewCardPhoto]");
        this.props.navigation.navigate(LOYALTY_CARD_PHOTO, {
            cardFrontImageB64: this.state.cardFrontImageB64,
            cardBackImageB64: this.state.cardBackImageB64,
            cardFrontImage: this.state.cardFrontImage,
            cardBackImage: this.state.cardBackImage,
            from: "viewCard",
            navigateFrom: this.props?.route?.params?.from,
        });
    };

    onConfirmTap = () => {
        console.log("[LoyaltyCardConfirm] >> [onConfirmTap]");
        this.setState({ isSubmitDisabled: true });
        this.submitLoyalityCards();
    };

    submitLoyalityCards = async () => {
        const {
            misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
            s2w: { txnTypeList },
        } = this.props.getModel(["misc", "s2w"]);
        //Ali/Omid
        let data = {};
        let color = {};
        const cardDetails = this.state.cardDetails;
        // data.cardBackImage = this.state.cardBackImage;
        // data.cardFrontImage = this.state.cardFrontImage;
        data.cardName = cardDetails.cardName;
        data.cardNo = cardDetails.cardNo;
        color.colorId = cardDetails.colorId ? cardDetails.colorId : cardDetails.color.colorId;
        color.colorCode = cardDetails.colorCode
            ? cardDetails.colorCode
            : cardDetails.color.colorCode;
        data.color = color;
        data.expiryDate = "";
        data.notes = this.state.notes;
        data.expiryDateInput = cardDetails.expiryDateInput;
        data.id = cardDetails.id;

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

        if (cardDetails.id) {
            this.editCardDetails(formdata);
            return;
        }

        submitLoyalityCard(formdata)
            .then((response) => {
                console.log("[LoyaltyCardConfirm][loadCards] >> Success", response);

                this.props.navigation.navigate("Dashboard", {
                    screen: "Loyalty",
                    params: {
                        loadCards: true,
                        // s2w: response.data.result?.s2w,
                    },
                });

                if (response?.data?.code === 0) {
                    // check for earned chances
                    const { txnType, displayPopup, chance, generic } = response?.data?.result?.s2w;
                    if (
                        (isCampaignPeriod || isTapTasticReady) &&
                        (txnTypeList.includes(txnType) || txnTypeList.includes("MAELOYALTYCARD")) &&
                        displayPopup
                    ) {
                        this.props.navigation.push("TabNavigator", {
                            screen: "CampaignChancesEarned",
                            params: {
                                chances: chance,
                                isCapped: generic,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        });
                    }
                }
            })
            .catch((error) => {
                this.setState({ isSubmitDisabled: false });
                console.log("[LoyaltyCardConfirm][loadCards] >> Failure", error);
            });
    };

    editCardDetails = (data) => {
        editLoyalityCard(data)
            .then((response) => {
                console.log("[LoyaltyCardConfirm][loadCards] >> Success", response);
                this.props.navigation.navigate("Dashboard", {
                    screen: "Loyalty",
                    params: {
                        loadCards: true,
                    },
                });
            })
            .catch((error) => {
                this.setState({ isSubmitDisabled: false });
                console.log("[LoyaltyCardConfirm][loadCards] >> Failure", error);
            });
    };
    render() {
        console.log("[LoyaltyCardConfirm] >> [render]");
        const {
            showMenu,
            showPopup,
            menuArray,
            colorCode,
            notes,
            isSubmitDisabled,
            barCode,
            appState,
            textColor,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={
                                    this.state.from === "viewCard" ? (
                                        <HeaderDotDotDotButton onPress={this.onToggleMenu} />
                                    ) : (
                                        <HeaderCloseButton onPress={this.onCloseBtn} />
                                    )
                                }
                            />
                        }
                    >
                        <KeyboardAwareScrollView
                            style={styles.container}
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                        >
                            <View style={styles.fieldContainer}>
                                {/* Card Overview */}
                                <View
                                    style={[
                                        styles.cardLayout,
                                        {
                                            backgroundColor: colorCode ? colorCode : MEDIUM_GREY,
                                        },
                                    ]}
                                >
                                    <View style={styles.cardName}>
                                        <Typo
                                            fontSize={14}
                                            textAlign="left"
                                            color={textColor}
                                            fontWeight="600"
                                            text={this.state.cardName}
                                        />
                                    </View>
                                    <View style={styles.cardNo}>
                                        <Typo
                                            fontSize={20}
                                            textAlign="left"
                                            color={textColor}
                                            lineHeight={22}
                                            fontWeight="300"
                                            text={Utility.accountNumSeparator(this.state.cardNo)}
                                        />
                                    </View>
                                    {!!this.state.expiryDateInput && (
                                        <View style={styles.expiryDateInput}>
                                            <Typo
                                                fontSize={12}
                                                textAlign="left"
                                                color={textColor}
                                                fontWeight="300"
                                                text={`Expiry Date ${this.state.expiryDateInput}`}
                                            />
                                        </View>
                                    )}
                                </View>
                                {!!this.state.cardFrontImage && (
                                    <TouchableOpacity
                                        style={styles.viewCardPhoto}
                                        onPress={this.onViewCardPhoto}
                                        accessibilityLabel={"viewCardPhoto"}
                                    >
                                        <Typo
                                            text={VIEW_CARD_PHOTO}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={ROYAL_BLUE}
                                        />
                                    </TouchableOpacity>
                                )}
                                {/* Card Barcode */}
                                <View style={styles.barCodeImage}>
                                    {appState === "active" && (
                                        <Barcode
                                            value={barCode}
                                            height={80}
                                            background={MEDIUM_GREY}
                                        />
                                    )}
                                </View>
                                {/* Card Barcode Numer */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        text={this.state.barCode}
                                    />
                                </View>
                                {/* Card Description */}
                                <InlineEditor
                                    label={DESCRIPTION}
                                    value={notes}
                                    componentID="loyaltyDesc"
                                    placeHolder="Optional"
                                    isEditable={this.state.isEditable}
                                    color={ROYAL_BLUE}
                                    maxLength={30}
                                    onValueChange={this.onDescChange}
                                    style={styles.loyaltyDesc}
                                />
                                {/* Card Camera */}
                                {!this.state.cardFrontImage && (
                                    <View style={styles.rightViewContainer}>
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
                                                <Image
                                                    accessible={true}
                                                    testID={"cameraImage"}
                                                    accessibilityLabel={"cameraImage"}
                                                    style={styles.cameraImage}
                                                    source={Assets.icSelectCamera}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                {/* Card Confirm Button */}
                                {/* {this.state.from != "viewCard" ? (
                                    <View style={styles.confirmButton}>
                                        <ActionButton
                                            backgroundColor={isSubmitDisabled ? DISABLED : YELLOW}
                                            borderRadius={20}
                                            disabled={isSubmitDisabled}
                                            height={48}
                                            width="100%"
                                            componentCenter={
                                                <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Confirm" />
                                            }
                                            onPress={this.onConfirmTap}
                                        />
                                    </View>
                                ) : null} */}
                            </View>
                        </KeyboardAwareScrollView>
                        {/* Card Confirm Button */}
                        {this.state.from !== "viewCard" && (
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
                                            text={CONFIRM}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        )}
                    </ScreenLayout>
                </ScreenContainer>

                {showMenu && (
                    <TopMenu
                        onClose={this.onToggleMenu}
                        navigation={this.props.navigation}
                        menuArray={menuArray}
                        onItemPress={this.onMenuItemPress}
                    />
                )}
                <Popup
                    visible={showPopup}
                    onClose={this.cancelRemoveCard}
                    title={REMOVE}
                    description={REMOVE_PARTNER_CARD_QUES}
                    primaryAction={{
                        text: CONFIRM,
                        onPress: this.confirmRemoveCard,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: this.cancelRemoveCard,
                    }}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    barCodeImage: {
        alignContent: "center",
        alignItems: "center",
        height: 100,
        justifyContent: "center",
        marginTop: 20,
        overflow: "hidden",
    },
    cameraImage: {
        height: 30,
        marginTop: 10,
        resizeMode: Platform.OS != "ios" ? "center" : "contain",
        width: 30,
    },
    cardLayout: {
        borderRadius: 14,
        height: 190,
        marginTop: 16,
    },
    cardName: {
        height: 30,
        marginLeft: 15,
        marginTop: 20,
    },
    cardNo: {
        height: 50,
        marginLeft: 15,
        marginTop: 10,
    },
    confirmButton: {
        marginTop: 40,
    },
    container: {
        flex: 1,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 22,
    },
    contentRightView: {
        height: 50,
        marginTop: 10,
        position: "absolute",
        right: 0,
        // shadowColor: "rgba(0, 0, 0, 0.27)",
        // shadowOffset: {
        // 	width: 0,
        // 	height: 0
        // },
        // shadowOpacity: 1,
        // shadowRadius: 4
    },
    contentTextRightView: {
        height: 50,
        marginTop: -20,
        position: "absolute",
        right: 0,
        width: 80,
    },
    expiryDateInput: {
        height: 30,
        marginLeft: 15,
        marginTop: 5,
    },
    fieldContainer: {
        marginBottom: 36,
        marginHorizontal: 36,
    },
    inputNotes: {
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "bold",
        marginRight: 0,
        textAlign: "center",
    },
    loyaltyDesc: {
        height: 50,
        marginTop: 20,
    },
    rightViewContainer: {
        flexDirection: "row",
    },
    viewCardPhoto: {
        alignItems: "center",
        height: 26,
        marginTop: 30,
    },
});

export default withModelContext(LoyaltyCardConfirm);
