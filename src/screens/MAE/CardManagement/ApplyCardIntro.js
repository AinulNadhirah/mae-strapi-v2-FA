import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, Image, View, ScrollView, ImageBackground } from "react-native";

import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";

import {
    MAE_CARD_ADDRESS,
    APPLY_CARD_INTRO,
    MAE_MODULE_STACK,
    APPLY_MAE_SCREEN,
    MAE_HUAWEI_SCREEN,
    BANKINGV2_MODULE,
    MAE_CARDDETAILS,
    MAE_CARD_EMPLOYMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getMAEMasterData, getGCIFDetails, maeCustomerInfo } from "@services";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { APPLY_MAE_CARD_BENEFITS } from "@constants/data";
import {
    MAE_CARD_AMOUNT,
    COMMON_ERROR_MSG,
    INSUFF_BALANCE_TITLE,
    INSUFF_BALANCE_POPUP_MSG,
    TOPUP_NOW,
    PROCEED,
    MAE_REQUESTCARD,
    MAE_PHYSICAL_CARD,
    CONTINUE,
    FA_CARD_REQUESTCARD_MAE,
    UNABLE_TO_VERIFY_IDENTITY_TRY_AGAIN,
    VERIFICATION_NEEDED,
    NEED_TO_CHECK_IDENTITY,
    PLSTP_UD_MYKAD,
    PASSPORT,
    MISSING_USER_DETAILS,
    UNABLE_TO_VERIFY_IDENTITY_CONTACT_BRANCH,
    CANNOT_PLACE_MAE_CARD_REQ,
    BENEFITS,
} from "@constants/strings";
import { GCIF_DETAILS_API, GCIF_DETAILS_API_V2 } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { convertMayaMobileFormat } from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    getApplyMAECardNavParams,
    massageMasterData,
    massageGCIFData,
} from "./CardManagementController";

class ApplyCardIntro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Others
            cardDetails: null,
            entryPoint: null,
            ekycSuccess: false,
            noteText: null,
            trinityFlag: null,

            // Logged in User Info
            m2uUserId: null,
            mobileNumber: null,
            fullName: null,
            residentCountry: null,

            // Popup related
            showPopup: false,
            popupAction: null,
            popupTitle: "",
            popupMsg: "",
            popupPrimaryBtnText: "",
        };
    }

    componentDidMount = () => {
        console.log("[ApplyCardIntro] >> [componentDidMount]");

        // Fetch details of logged in user
        this.retrieveLoggedInUserDetails();

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    retrieveLoggedInUserDetails = () => {
        console.log("[ApplyCardIntro] >> [retrieveLoggedInUserDetails]");

        const { getModel } = this.props;
        const { m2uUserId, fullName } = getModel("user");
        const { m2uPhoneNumber } = getModel("m2uDetails");
        const userMayaFormatNum = convertMayaMobileFormat(m2uPhoneNumber);

        this.setState(
            {
                m2uUserId,
                fullName,
                mobileNumber: userMayaFormatNum,
            },
            () => {
                // Call method to manage data after init
                this.manageDataOnInit();
            }
        );
    };

    manageDataOnInit = () => {
        console.log("[ApplyCardIntro] >> [manageDataOnInit]");

        const { entryPoint, cardDetails, residentCountry, serviceCharge, trinityFlag } =
            this.props?.route?.params ?? {};

        this.setState({
            entryPoint,
            cardDetails,
            residentCountry,
            trinityFlag,
            noteText: isNaN(serviceCharge)
                ? null
                : MAE_CARD_AMOUNT.replace("[serviceCharge]", numeral(serviceCharge).format("0,0")),
        });
    };

    onScreenFocus = () => {
        console.log("[ApplyCardIntro] >> [onScreenFocus]");

        const params = this.props.route?.params ?? null;
        if (!params) return;

        const { from, eKycStatus, ekycSuccess } = params;
        if (from === "TopUp") {
            // Reset value of navigation params
            this.props.navigation.setParams({
                from: null,
            });

            this.reloadCardDetails();
        } else if (from === "eKYC") {
            // Reset value of navigation params
            this.props.navigation.setParams({
                ...params,
                from: null,
                ekycRefId: null,
            });

            if (eKycStatus === "05" || ekycSuccess) {
                this.setState(
                    {
                        ekycSuccess: true,
                    },
                    () => {
                        this.onContinue();
                    }
                );
            } else {
                showErrorToast({
                    message: UNABLE_TO_VERIFY_IDENTITY_TRY_AGAIN,
                });
            }
        }
    };

    reloadCardDetails = async () => {
        console.log("[ApplyCardIntro] >> [reloadCardDetails]");

        const { entryPoint, trinityFlag } = this.state;

        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, true).catch((error) => {
            console.log("[ApplyCardIntro][maeCustomerInfo] >> Exception: ", error);
        });

        const maeCustomerInfoData = httpResp?.data?.result ?? null;
        if (!maeCustomerInfoData) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            return;
        }

        const navParams = getApplyMAECardNavParams(maeCustomerInfoData, trinityFlag);
        this.props.navigation.setParams({
            entryPoint,
            ...navParams,
        });

        // Re-render view with reloaded data
        this.manageDataOnInit();
    };

    onBackTap = () => {
        console.log("[ApplyCardIntro] >> [onBackTap]");

        const { ekycSuccess } = this.state;
        const { entryPoint } = this.props.route.params;

        if (ekycSuccess && entryPoint === "CARD_DETAILS") {
            this.props.navigation.navigate(MAE_CARDDETAILS, {
                ekycSuccess,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    isETB = (applicantType) => {
        console.log("[ApplyCardIntro] >> [isETB]");

        return (
            applicantType === "0" ||
            applicantType === "5" ||
            applicantType === "6" ||
            applicantType === "7" ||
            applicantType === "8"
        );
    };

    hidePopup = () => {
        console.log("[ApplyCardIntro] >> [hidePopup]");

        this.setState({ showPopup: false, popupAction: null });
    };

    showPopup = (popupAction) => {
        console.log("[ApplyCardIntro] >> [showPopup]");

        const { serviceCharge } = this.props.route.params;

        if (popupAction === "TOPUP") {
            this.setState({
                popupTitle: INSUFF_BALANCE_TITLE,
                popupMsg: INSUFF_BALANCE_POPUP_MSG.replace(
                    "[serviceCharge]",
                    numeral(serviceCharge).format("0,0.00")
                ),
                popupPrimaryBtnText: TOPUP_NOW,
            });
        } else {
            this.setState({
                popupTitle: VERIFICATION_NEEDED,
                popupMsg: NEED_TO_CHECK_IDENTITY,
                popupPrimaryBtnText: PROCEED,
            });
        }

        this.setState({ showPopup: true, popupAction });
    };

    onPopupBtnPress = () => {
        console.log("[CardDetails] >> [onPopupBtnPress]");

        const { popupAction } = this.state;

        if (popupAction === "TOPUP") {
            this.gotoTopUpFlow();
        } else {
            this.gotoeKYCFlow();
        }
    };

    gotoTopUpFlow = () => {
        console.log("[ApplyCardIntro] >> [gotoTopUpFlow]");

        // Hide popup
        this.hidePopup();

        const { cardDetails } = this.state;

        // Navigate to Top Up flow
        onMAETopUpButtonTap({
            data: {
                acctNo: cardDetails.maeAcctNo,
            },
            routeFrom: APPLY_CARD_INTRO,
        });
    };

    balanceCheck = () => {
        console.log("[ApplyCardIntro] >> [balanceCheck]");

        const { maeAcctBalance, serviceCharge } = this.props.route.params;

        // Return true for invalid details
        if (isNaN(maeAcctBalance) || isNaN(serviceCharge)) return true;

        if (parseFloat(maeAcctBalance) < parseFloat(serviceCharge)) {
            this.showPopup("TOPUP");
            return false;
        }

        return true;
    };

    gotoeKYCFlow = () => {
        console.log("[ApplyCardIntro] >> [gotoeKYCFlow]");

        // Hide popup
        this.hidePopup();

        const navParams = this.props.route.params;
        const { fullName, residentCountry } = this.state;
        const { idType, icNo } = navParams;
        const selectedIDType = idType === "01" ? PLSTP_UD_MYKAD : PASSPORT;

        // Error checking for mandatory field
        if (!icNo) {
            showErrorToast({
                message: MISSING_USER_DETAILS,
            });
            return;
        }

        const eKycParams = {
            selectedIDType,
            entryStack: BANKINGV2_MODULE,
            entryScreen: APPLY_CARD_INTRO,
            entryParams: { ...navParams, from: "eKYC" },
            from: APPLY_CARD_INTRO,
            idNo: icNo,
            fullName,
            passportCountry: residentCountry,
            passportCountryCode: "", //TODO Zoloz : Need to check in cards API
            reqType: "E02",
            isNameCheck: false,
            sceneCode: "MAE",
        };
        const filledUserDetails = {
            entryStack: BANKINGV2_MODULE,
            entryScreen: APPLY_CARD_INTRO,
            entryParams: { ...navParams, from: "eKYC" },
            onBoardDetails: {
                fullName,
            },
            onBoardDetails2: {
                selectedIDType,
                idNo: icNo,
                passportCountry: residentCountry,
                from: APPLY_CARD_INTRO,
            },
        };
        // Navigate to eKYC module
        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: APPLY_MAE_SCREEN,
            params: { eKycParams, filledUserDetails },
        });
    };

    eKYCStatusCheck = () => {
        console.log("[ApplyCardIntro] >> [eKYCStatusCheck]");

        const { eKycStatus, retryCntExceed, ekycSuccess } = this.props.route.params;
        const eKycStatusCondition =
            eKycStatus === "00" ||
            eKycStatus === "01" ||
            eKycStatus === "00a" ||
            eKycStatus === "01a";

        // Condition to show error when user is not supposed to apply card due to eKYC max retry limit reached
        if ((eKycStatusCondition && retryCntExceed) || eKycStatus === "02") {
            showErrorToast({
                message: UNABLE_TO_VERIFY_IDENTITY_CONTACT_BRANCH,
            });
            return false;
        }

        // Condition to proceed with eKYC
        if (eKycStatusCondition && !ekycSuccess) {
            this.showPopup("EKYC");
            return false;
        }

        return true;
    };

    onContinue = async () => {
        console.log("[ApplyCardIntro] >> [onContinue]");
        const { getModel } = this.props;
        const { isZoloz } = getModel("misc");
        const params = this.props?.route?.params ?? {};
        const { cardDetails, m2uUserId, mobileNumber, trinityFlag } = this.state;
        const { idType, applicantType, serviceCharge, icNo, customerType, eKycStatus } = params;

        const isETB = this.isETB(applicantType);
        const cardStatus = cardDetails?.cardStatus ?? null;
        const cardNextAction = cardDetails?.cardNextAction ?? null;

        if (
            isPureHuawei &&
            !isZoloz &&
            (eKycStatus === "00" ||
                eKycStatus === "01" ||
                eKycStatus === "00a" ||
                eKycStatus === "01a")
        ) {
            this.props.navigation.navigate(MAE_MODULE_STACK, {
                screen: MAE_HUAWEI_SCREEN,
                params: {
                    for: "HAC", //Huawei Apply Card
                },
            });
            return;
        }

        // Strict value checking for users who can apply for MAE card
        if (cardStatus === "000" && cardNextAction === "001") {
            // eKYC status check - applicable only for NTB customers
            if ((!isETB || (isETB && customerType === "10")) && !this.eKYCStatusCheck()) return;

            // Min balance check
            if (!this.balanceCheck()) return;

            // Fetch Master Data
            const masterDataResp = await getMAEMasterData().catch((error) => {
                console.log("[ApplyCardIntro][getMAEMasterData] >> Exception: ", error);
            });
            const masterData = masterDataResp?.data?.result ?? null;

            // Fetch GCIF data - for prepopulation
            const gcifUrl = trinityFlag === "Y" ? GCIF_DETAILS_API_V2 : GCIF_DETAILS_API;
            const gcifParams = trinityFlag === "Y" ? { requestType: "maePhysicalCard" } : null;
            const gcifResp = await getGCIFDetails(gcifUrl, gcifParams).catch((error) => {
                console.log("[ApplyCardIntro][getGCIFDetails] >> Exception: ", error);
            });
            const gcifData = gcifResp?.data?.result ?? null;
            const statusCode = gcifData?.statusCode ?? null;
            const statusDesc = gcifData?.statusDesc ?? COMMON_ERROR_MSG;

            // Check for High Risk customer application in progress scenario
            if (statusCode === "HR02") {
                showErrorToast({
                    message: statusDesc,
                });
                return;
            }

            // TODO: Commented ETB scoring change temporarily. To be uncommented in Sept release.
            /*const nextScreen =
                customerType === "10" || (isETB && scoringInd === "N")
                    ? MAE_CARD_EMPLOYMENT
                    : MAE_CARD_ADDRESS;*/
            const nextScreen = customerType === "10" ? MAE_CARD_EMPLOYMENT : MAE_CARD_ADDRESS;
            const navParams = {
                ...params,
                masterData: massageMasterData(masterData, idType),
                gcifData: massageGCIFData(gcifData, idType, icNo),
                cardDetails,
                m2uUserId,
                mobileNumber,
                serviceCharge,
            };

            if (trinityFlag === "Y") {
                // Navigate to Employment/Address screen
                this.props.navigation.navigate(nextScreen, navParams);
            } else {
                // Navigate to Address screen
                this.props.navigation.navigate(MAE_CARD_ADDRESS, navParams);
            }
        } else {
            showErrorToast({
                message: CANNOT_PLACE_MAE_CARD_REQ,
            });
        }
    };

    render() {
        const { noteText } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_CARD_REQUESTCARD_MAE}
            >
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={MAE_REQUESTCARD}
                                    />
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <ScrollView
                                style={Style.scrollViewCls}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Get a MAE... */}
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    fontWeight="300"
                                    text={MAE_PHYSICAL_CARD}
                                    style={Style.headerTextCls}
                                />

                                {/* MAE Card */}
                                <View style={Style.cardContainerCls}>
                                    <ImageBackground
                                        resizeMode="stretch"
                                        style={Style.cardImageCls}
                                        imageStyle={Style.cardImageStyle}
                                        source={Assets.debitCardFrontImage}
                                    />
                                </View>

                                {/* Note:... */}
                                {noteText && (
                                    <Typo
                                        textAlign="left"
                                        fontSize={12}
                                        lineHeight={18}
                                        text={noteText}
                                        style={Style.noteTextCls}
                                    />
                                )}

                                {/* Benefits Label */}
                                <Typo
                                    textAlign="left"
                                    fontSize={15}
                                    lineHeight={23}
                                    fontWeight="600"
                                    text={BENEFITS}
                                    style={Style.benefitsLabelCls}
                                />

                                {/* Benefit Points */}
                                {APPLY_MAE_CARD_BENEFITS.map((text, index) => {
                                    return (
                                        <View
                                            style={[
                                                Style.benefitsPointViewCls,
                                                APPLY_MAE_CARD_BENEFITS.length - 1 === index
                                                    ? Style.pointViewLast
                                                    : Style.pointViewMargin,
                                            ]}
                                            key={index}
                                        >
                                            <Image
                                                source={Assets.blackTick16}
                                                resizeMode="contain"
                                                style={Style.benefPtsImgCls}
                                            />

                                            <Typo
                                                textAlign="left"
                                                fontSize={13}
                                                lineHeight={17}
                                                text={text}
                                                style={Style.benefPtsTextCls}
                                            />
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* Bottom docked button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={CONTINUE}
                                            />
                                        }
                                        onPress={this.onContinue}
                                    />
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* Insufficient Balance Popup */}
                    <Popup
                        visible={this.state.showPopup}
                        title={this.state.popupTitle}
                        description={this.state.popupMsg}
                        onClose={this.hidePopup}
                        primaryAction={{
                            text: this.state.popupPrimaryBtnText,
                            onPress: this.onPopupBtnPress,
                        }}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

ApplyCardIntro.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Style = StyleSheet.create({
    benefPtsImgCls: {
        height: 15,
        width: 12,
    },
    benefPtsTextCls: {
        marginLeft: 12,
    },
    benefitsLabelCls: {
        marginBottom: 12,
        marginHorizontal: 12,
        marginTop: 25,
    },

    benefitsPointViewCls: {
        alignItems: "center",
        flexDirection: "row",
        marginHorizontal: 12,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    cardContainerCls: {
        alignItems: "center",
        height: 300,
        justifyContent: "center",
        width: "100%",
    },

    cardImageCls: {
        alignItems: "center",
        height: "100%",
        width: 180,
    },

    cardImageStyle: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },

    headerTextCls: {
        marginHorizontal: 12,
        marginVertical: 15,
    },

    noteTextCls: {
        marginHorizontal: 12,
        marginTop: 15,
    },

    pointViewLast: { marginBottom: 46 },

    pointViewMargin: { marginBottom: 16 },

    scrollViewCls: {
        paddingHorizontal: 24,
    },
});

export default withModelContext(ApplyCardIntro);
