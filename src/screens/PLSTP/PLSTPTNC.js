import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";

import { getS2UStatus } from "@screens/PLSTP/PLSTPController";

import {
    PLSTP_CONFIRMATION,
    SETTINGS_MODULE,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    PLSTP_TNC,
    PLSTP_OTHER_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { PLRiskUpdate } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, BLACK, GREY, TRANSPARENT } from "@constants/colors";
import {
    STEP_9,
    TERMS_CONDITIONS,
    PLSTP_PRIVACY_NOTE,
    PLSTP_PRIVACY_NOTE_BOLD,
    PLSTP_PRIVACY_NOTE_MM,
    PLSTP_ALLOW_PROCESS_PI,
    PLSTP_NOT_ALLOW_PROCESS_PI,
    PLSTP_AGREE,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    ACTIVATE,
    PLSTP_TNC_NOTE,
    PLSTP_TNC_BOLD,
    PLSTP_PDS_BOLD,
    PLSTP_TNC_NOTE_MM,
    PLSTP_FATCA_US,
    PLSTP_FATCA_US_BOLD,
    PLSTP_FATCA_US_EXT,
    PLSTP_FATCA,
    PLSTP_FATCA_BOLD,
    PLSTP_FATCA_EXT,
    PLSTP_AGREE_NOTE,
} from "@constants/strings";
import {
    PLSTP_ISL_TNC,
    PLSTP_ISL_PDS,
    PLSTP_ISL_FATCA,
    PLSTP_ISL_CRS,
    PLSTP_ISL_PDPA,
    PLSTP_CON_TNC,
    PLSTP_CON_FATCA,
    PLSTP_CON_PDS,
    PLSTP_CON_CRS,
    PLSTP_CON_PDPA,
} from "@constants/url";

import Assets from "@assets";

function PLSTPTNC({ route, navigation }) {
    const [group, setGroup] = useState(false);
    const [pdpYes, setPdpYes] = useState(false);
    const [pdpNo, setPdpNo] = useState(false);
    const [pdpVal, setPdpVal] = useState();
    const [fatca, setFatca] = useState(false);
    const [dcrsr, setDcrsr] = useState(false);
    const [pdi, setPdi] = useState(false);
    const [ea, setEa] = useState(false);
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);
    const { initParams } = route?.params;
    const { customerInfo, stpRefNum } = initParams;

    const [s2uData, setS2uData] = useState({});

    const { getModel, updateModel } = useModelController();

    useEffect(() => {
        init();
    }, [route.params]);

    useEffect(() => {
        setIsContinueDisabled(!(group && pdpVal && pdi && ea));
    }, [group, pdi, pdpVal, ea]);

    const init = async () => {
        console.log("[PLSTPTNC] >> [init]");
        if (customerInfo.group) {
            setGroup(customerInfo.group);
            setFatca(customerInfo.fatca);
            setDcrsr(customerInfo.crs);
            setPdi(customerInfo.pdi);
            setPdpVal(customerInfo.pdp);
            setEa(customerInfo.ea);
            if (customerInfo.pdp === "Y") {
                setPdpYes(true);
                setPdpNo(false);
            } else if (customerInfo.pdp === "N") {
                setPdpNo(true);
                setPdpYes(false);
            }
        }
        const { flow, secure2uValidateData } = await getS2UStatus(getModel, updateModel);
        setS2uData({ flow, secure2uValidateData });
    };

    const onRadioBtnPDPATap = (params) => {
        console.log("[PLSTPTNC] >> [onRadioBtnPDPATap]");
        const radioBtnId = params.radioBtnId;
        if (radioBtnId === "Yes") {
            setPdpYes(true);
            setPdpNo(false);
            setPdpVal("Y");
        } else if (radioBtnId === "No") {
            setPdpNo(true);
            setPdpYes(false);
            setPdpVal("N");
        }
    };

    const onDoneTap = () => {
        console.log("[PLSTPTNC] >> [onDoneTap]");
        // Return if button is disabled
        if (isContinueDisabled) return;
        if (!dcrsr) {
            showErrorToast({
                message: "Please confirm that you are not a tax resident to continue.",
            });
            return;
        }

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_9",
        });
        const data = {
            stpRefNo: stpRefNum,
            group,
            pdp: pdpVal,
            fatca,
            crs: dcrsr,
            pdi,
            ea,
        };
        PLRiskUpdate(data)
            .then((result) => {
                if (result?.data?.code === 200) {
                    Object.assign(customerInfo, { group, pdp: pdpVal, fatca, crs: dcrsr, pdi, ea });
                    // navigation.navigate(PLSTP_CONFIRMATION, {
                    //     ...route.params,
                    // });
                    s2uFlowCheck();
                } else {
                    showErrorToast({
                        message: result?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPPersonalDetails][onDoneTap] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    const s2uFlowCheck = async () => {
        //plSecure2uValidateData
        //plflow
        //twoFAType
        if (s2uData && s2uData.flow === "S2UReg") {
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: ACTIVATE,
                params: {
                    flowParams: {
                        success: { stack: BANKINGV2_MODULE, screen: PLSTP_CONFIRMATION },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: PLSTP_TNC,
                        },
                        params: {
                            ...route.params,
                            s2uData,
                        },
                    },
                },
            });
        } else {
            navigation.navigate(PLSTP_CONFIRMATION, {
                ...route.params,
                s2uData,
            });
        }
    };

    const onBackTap = () => {
        console.log("[PLSTPTNC] >> [onBackTap]");
        navigation.navigate(PLSTP_OTHER_DETAILS, {
            ...route.params,
        });
    };

    const onCloseTap = () => {
        console.log("[PLSTPTNC] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    const onRadioBtnTap = (from) => {
        console.log("[PLSTPTNC] >> [onRadioBtnTNCTap] >>");
        switch (from) {
            case "GROUP":
                setGroup(!group);
                break;
            case "FATCA":
                setFatca(!fatca);
                break;
            case "PDI":
                setPdi(!pdi);
                break;
            case "CRS":
                setDcrsr(!dcrsr);
                break;
            case "EA":
                setEa(!ea);
                break;
            default:
                return;
        }
    };

    const onLinkTap = (from) => {
        console.log("[PLSTPTNC] >> [onRadioBtnTNCTap] >>");
        let url, title;
        const loanType = customerInfo?.loanTypeValue;
        switch (from) {
            case "GROUP":
                url = loanType === "015" ? PLSTP_ISL_PDPA : PLSTP_CON_PDPA;
                title = "Maybank Group Privacy Notice";
                break;
            case "FATCA":
                url = loanType === "015" ? PLSTP_ISL_FATCA : PLSTP_CON_FATCA;
                title = "FATCA";
                break;
            case "PDI":
                url = loanType === "015" ? PLSTP_ISL_PDS : PLSTP_CON_PDS;
                title = "Product Disclosure Sheet";
                break;
            case "TNC":
                url = loanType === "015" ? PLSTP_ISL_TNC : PLSTP_CON_TNC;
                title = "Terms & Conditions";
                break;
            case "CRS":
                url = loanType === "015" ? PLSTP_ISL_CRS : PLSTP_CON_CRS;
                title = "CRS";
                break;
            default:
                return;
        }

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_9">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_9}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                            <View style={Style.formContainer}>
                                {/* Loan details desc */}
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={TERMS_CONDITIONS}
                                    style={Style.headerLabelCls}
                                />
                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity onPress={() => onRadioBtnTap("PDI")}>
                                        <Image
                                            style={Style.image}
                                            source={
                                                pdi
                                                    ? Assets.icRadioChecked
                                                    : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                        >
                                            {PLSTP_TNC_NOTE}
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="700"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={Style.underline}
                                                text={PLSTP_TNC_BOLD}
                                                onPress={() => onLinkTap("TNC")}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="700"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={Style.underline}
                                                text={PLSTP_PDS_BOLD}
                                                onPress={() => onLinkTap("PDI")}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={PLSTP_TNC_NOTE_MM}
                                            />
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity onPress={() => onRadioBtnTap("FATCA")}>
                                        <Image
                                            style={Style.image}
                                            source={
                                                fatca
                                                    ? Assets.icRadioChecked
                                                    : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                        >
                                            {PLSTP_FATCA_US}
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="700"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={Style.underline}
                                                text={PLSTP_FATCA_US_BOLD}
                                                onPress={() => onLinkTap("FATCA")}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={PLSTP_FATCA_US_EXT}
                                            />
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity onPress={() => onRadioBtnTap("CRS")}>
                                        <Image
                                            style={Style.image}
                                            source={
                                                dcrsr
                                                    ? Assets.icRadioChecked
                                                    : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                        >
                                            {PLSTP_FATCA}
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="700"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={Style.underline}
                                                text={PLSTP_FATCA_BOLD}
                                                onPress={() => onLinkTap("CRS")}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={PLSTP_FATCA_EXT}
                                            />
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity onPress={() => onRadioBtnTap("GROUP")}>
                                        <Image
                                            style={Style.image}
                                            source={
                                                group
                                                    ? Assets.icRadioChecked
                                                    : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            textAlign="left"
                                            // style={Style.headerLabelCls}
                                        >
                                            {PLSTP_PRIVACY_NOTE}
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="700"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={Style.underline}
                                                text={PLSTP_PRIVACY_NOTE_BOLD}
                                                onPress={() => onLinkTap("GROUP")}
                                            />
                                            {PLSTP_PRIVACY_NOTE_MM}
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Style.groupContainer}>
                                    <ColorRadioButton
                                        title={PLSTP_ALLOW_PROCESS_PI}
                                        isSelected={pdpYes}
                                        fontSize={14}
                                        fontWeight={400}
                                        onRadioButtonPressed={(value) => {
                                            onRadioBtnPDPATap({ radioBtnId: "Yes" });
                                        }}
                                    />
                                    <ColorRadioButton
                                        title={PLSTP_NOT_ALLOW_PROCESS_PI}
                                        isSelected={pdpNo}
                                        fontSize={14}
                                        fontWeight={400}
                                        onRadioButtonPressed={(value) => {
                                            onRadioBtnPDPATap({ radioBtnId: "No" });
                                        }}
                                    />
                                </View>
                                <View style={Style.graySeparator} />

                                <View style={Style.radioCheckContainer}>
                                    <TouchableOpacity onPress={() => onRadioBtnTap("EA")}>
                                        <Image
                                            style={Style.image}
                                            source={
                                                ea ? Assets.icRadioChecked : Assets.icRadioUnchecked
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={Style.textContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="400"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={PLSTP_AGREE_NOTE}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_AGREE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    formContainer: {
        marginBottom: 40,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginVertical: 15,
    },

    groupContainer: {
        marginBottom: 10,
        marginLeft: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        marginTop: 2,
        width: 20,
    },

    radioCheckContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 20,
    },

    scrollViewCls: {
        paddingHorizontal: 26,
    },

    textContainer: {
        width: "90%",
    },

    underline: {
        textDecorationLine: "underline",
    },
});

export default PLSTPTNC;
