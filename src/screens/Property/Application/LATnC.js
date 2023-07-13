import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_TNC,
    LA_CONFIRMATION,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { tncAgreement } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    FATCA_TNC_TEXT,
    FATCA_TNC_SUB_TEXT,
    FATCA_TNC_SUB_TEXT_NESTED,
    TNC_ACCEPT_PRODUCT_TEXT,
    PLSTP_FATCA_US_EXT,
    PN_DECL,
    PN_TNC_TEXT,
    FATACA_CERTIFICATE,
    TNC_NOT_ALLOW_PROCESS_PI,
    TNC_ALLOW_PROCESS_PI,
    PN_TEXT,
    PLSTP_AGREE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    PLSTP_PDS_BOLD,
    PLSTP_TNC_NOTE,
    DECLARATION,
} from "@constants/strings";

import Assets from "@assets";

import { useResetNavigation } from "../Common/PropertyController";
import { saveLAInput } from "./LAController";

function LATnC({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [loading, setLoading] = useState(true);
    const [radioPDSChecked, setRadioPDSChecked] = useState(true);
    const [radioDeclarationChecked, setRadioDeclarationChecked] = useState(true);
    const [radioFATCA1Checked, setRadioFATCA1Checked] = useState(true);
    const [radioFATCA2Checked, setRadioFATCA2Checked] = useState(true);
    const [radioPNChecked, setRadioPNChecked] = useState(true);
    const [radioPNYesChecked, setRadioPNYesChecked] = useState("");
    const [radioPNNoChecked, setRadioPNNoChecked] = useState(false);
    const [radioAcceptProductChecked, setRadioAcceptProductChecked] = useState(true);

    const [pdsUrl, setPdsUrl] = useState("");
    const [declarationUrl, setDeclarationUrl] = useState("");
    const [fatca1Url, setFatca1Url] = useState("");
    const [fatca2Url, setFatca2Url] = useState("");
    const [pnUrl, setPnUrl] = useState("");

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [showExitPopup, setShowExitPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setContinueDisabled(!(radioPNYesChecked || radioPNNoChecked));
    }, [
        radioPDSChecked,
        radioDeclarationChecked,
        radioPNChecked,
        radioPNYesChecked,
        radioPNNoChecked,
        radioFATCA1Checked,
        radioAcceptProductChecked,
    ]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_Terms&Conditions",
        });
    }, []);

    const init = useCallback(() => {
        console.log("[LATnC] >> [init]");
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const tncAgreement = masterData?.tncAgreement ?? {};

        setPdsUrl(tncAgreement?.pdsUrl ?? "");
        setDeclarationUrl(tncAgreement?.declarationUrl ?? "");
        setFatca1Url(tncAgreement?.fatca1Url ?? "");
        setFatca2Url(tncAgreement?.fatca2Url ?? "");
        setPnUrl(tncAgreement?.pnUrl ?? "");

        // Pre-populate data for resume flow
        const resumeFlow = navParams?.resumeFlow ?? false;
        if (resumeFlow) populateSavedData();
        setLoading(false);
    }, []);

    function populateSavedData() {
        console.log("[LATnC] >> [populateSavedData]");

        const savedData = route.params?.savedData ?? {};
        const radioPDSChecked = savedData?.radioPDSChecked ?? false;
        const radioDeclarationChecked = savedData?.radioDeclarationChecked ?? false;
        const radioFATCA1Checked = savedData?.radioFATCA1Checked ?? false;
        const radioFATCA2Checked = savedData?.radioFATCA2Checked ?? false;
        const radioPNChecked = savedData?.radioPNChecked ?? null;
        const radioPNYesChecked = savedData?.radioPNYesChecked ?? null;
        const radioAcceptProductChecked = savedData?.radioAcceptProductChecked ?? false;

        if (radioPNChecked) {
            if (radioPNYesChecked !== null) {
                if (radioPNYesChecked) {
                    setRadioPNYesChecked(true);
                    setRadioPNNoChecked(false);
                } else {
                    setRadioPNYesChecked(false);
                    setRadioPNNoChecked(true);
                }
            }
            setRadioPNChecked(true);
        }
        setRadioPDSChecked(radioPDSChecked);
        setRadioDeclarationChecked(radioDeclarationChecked);
        setRadioFATCA1Checked(radioFATCA1Checked);
        setRadioFATCA2Checked(radioFATCA2Checked);
        setRadioAcceptProductChecked(radioAcceptProductChecked);
    }

    const onBackPress = () => {
        console.log("[LATnC] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[LATnC] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    function onRadioBtnPNTap(params) {
        console.log("[LATnC] >> [onRadioBtnPNTap]");
        if (radioPNChecked) {
            const radioBtnId = params.radioBtnId;
            if (radioBtnId === "Yes") {
                setRadioPNYesChecked(true);
                setRadioPNNoChecked(false);
            } else if (radioBtnId === "No") {
                setRadioPNYesChecked(false);
                setRadioPNNoChecked(true);
            }
            setRadioPNChecked(true);
        }
    }

    function onLinkPress(linkType) {
        console.log("[LATnC] >> [onLinkPress]" + linkType);
        const props = getPdfProps(linkType);

        if (props) {
            navigation.navigate(SETTINGS_MODULE, {
                screen: "PdfSetting",
                params: props,
            });
        }
    }

    function getPdfProps(linkType) {
        switch (linkType) {
            case "PDS":
                return {
                    title: "Product Disclosure Sheet",
                    source: pdsUrl,
                };
            case "DECLARATION":
                return {
                    title: "Declaration",
                    source: declarationUrl,
                };
            case "FATCAI":
                return {
                    title: "FATCA / CRS self-certification",
                    source: fatca1Url,
                };
            case "FATCAII":
                return {
                    title: "FATCA / CRS self-certification",
                    source: fatca2Url,
                };
            case "PS":
                return {
                    title: PN_TEXT,
                    source: pnUrl,
                };
            default:
                return null;
        }
    }

    async function onExitPopupSave() {
        console.log("[LATnC] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_TNC,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LATnC] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LATnC] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    async function onContinue() {
        console.log("[LATnC] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        setLoading(true);

        // Request object
        const params = {
            pds: radioPDSChecked ? "Yes" : "No",
            declaration: radioDeclarationChecked ? "Yes" : "No",
            fatca1: radioFATCA1Checked ? "Yes" : "No",
            fatca2: radioFATCA2Checked ? "Yes" : "No",
            pn: radioPNYesChecked ? "Yes" : "No",
            acceptProduct: radioAcceptProductChecked ? "Yes" : "No",
        };

        // call to update tnc info
        tncAgreement(params, false)
            .then((httpResp) => {
                console.log("[LATnC][tncAgreement] >> Response: ", httpResp);

                const statusCode = httpResp?.data?.result?.statusCode ?? null;
                const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;

                if (statusCode === "0000") {
                    saveAndConfirm();
                } else {
                    setLoading(false);
                    showErrorToast({ message: statusDesc ?? COMMON_ERROR_MSG });
                }
            })
            .catch((error) => {
                setLoading(false);
                // Show error message
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_Terms&Conditions",
        });
    }

    async function saveAndConfirm() {
        console.log("[LAProductPlans] >> [saveAndConfirm]");

        // Retrieve form data
        const formData = getFormData();

        const navParams = route?.params ?? {};

        // Save Form Data in DB before moving to next screen
        await saveLAInput(
            {
                screenName: LA_TNC,
                formData,
                navParams,
            },
            false
        );

        // Navigate to Confirmation screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CONFIRMATION,
            params: {
                ...navParams,
                ...formData,
            },
        });
        setLoading(false);
    }

    function validateFormDetails() {
        console.log("[LATnC] >> [validateFormDetails]");
        // eslint-disable-next-line sonarjs/prefer-single-boolean-return
        if (!(radioPNYesChecked || radioPNNoChecked)) {
            return false;
        }

        // Return true if all validation checks are passed
        return true;
    }

    function getFormData() {
        console.log("[LATnC] >> [getFormData]");
        return {
            radioPDSChecked,
            radioDeclarationChecked,
            radioFATCA1Checked,
            radioFATCA2Checked,
            radioPNChecked,
            radioPNYesChecked,
            radioAcceptProductChecked,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text="Terms & Conditions"
                                    lineHeight={19}
                                    fontSize={16}
                                    fontWeight="600"
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
                            {/* Product Disclosure Sheet */}
                            <TouchableOpacity>
                                <View style={styles.radioCheckContainer}>
                                    <Typo
                                        lineHeight={20}
                                        letterSpacing={0}
                                        textAlign="left"
                                        style={styles.termsText}
                                    >
                                        <Text>{PLSTP_TNC_NOTE}</Text>
                                        <TypographyWithLink
                                            text={PLSTP_PDS_BOLD}
                                            type="PDS"
                                            onPress={onLinkPress}
                                        />
                                        <Text>{` and other relevant documents attached.`}</Text>
                                    </Typo>
                                </View>
                            </TouchableOpacity>

                            {/* Declaration */}
                            <TouchableOpacity>
                                <View style={styles.textLinkContainer}>
                                    <Typo
                                        lineHeight={20}
                                        letterSpacing={0}
                                        textAlign="left"
                                        style={styles.termsText}
                                    >
                                        <Text>{`I have read and agreed to/understood the `}</Text>
                                        <TypographyWithLink
                                            text={`${DECLARATION}.`}
                                            type="DECLARATION"
                                            onPress={onLinkPress}
                                        />
                                    </Typo>
                                </View>
                            </TouchableOpacity>

                            {/* FATCA I*/}
                            <TouchableOpacity>
                                <View style={styles.radioCheckContainer}>
                                    <Typo
                                        lineHeight={20}
                                        letterSpacing={0}
                                        textAlign="left"
                                        style={styles.termsText}
                                    >
                                        <Text>{FATCA_TNC_TEXT}</Text>
                                        <TypographyWithLink
                                            text={FATCA_TNC_SUB_TEXT}
                                            type="FATCAI"
                                            onPress={onLinkPress}
                                        />
                                        <Text>{FATCA_TNC_SUB_TEXT_NESTED}</Text>
                                        <TypographyWithLink
                                            text={FATACA_CERTIFICATE}
                                            type="FATCAII"
                                            onPress={onLinkPress}
                                        />
                                        <Text>{PLSTP_FATCA_US_EXT}</Text>
                                    </Typo>
                                </View>
                            </TouchableOpacity>

                            {/* Privacy Statement */}
                            <TouchableOpacity>
                                <View style={styles.privacyContainer}>
                                    <Typo
                                        lineHeight={20}
                                        letterSpacing={0}
                                        textAlign="left"
                                        style={styles.termsText}
                                    >
                                        <Text>{PN_TNC_TEXT}</Text>
                                        <TypographyWithLink
                                            text={PN_TEXT}
                                            type="PS"
                                            onPress={onLinkPress}
                                        />
                                        <Text>{PN_DECL}</Text>
                                    </Typo>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.groupContainer}>
                                <RadioButtonText
                                    btnId="Yes"
                                    onPress={onRadioBtnPNTap}
                                    isSelected={radioPNYesChecked === true}
                                    text={TNC_ALLOW_PROCESS_PI}
                                />

                                <SpaceFiller height={15} />

                                <RadioButtonText
                                    btnId="No"
                                    onPress={onRadioBtnPNTap}
                                    isSelected={radioPNNoChecked}
                                    text={TNC_NOT_ALLOW_PROCESS_PI}
                                />
                            </View>

                            {/* Accept this product / services */}
                            <TouchableOpacity>
                                <View style={styles.radioCheckContainer}>
                                    <Typo
                                        lineHeight={20}
                                        textAlign="left"
                                        style={styles.termsText}
                                        text={TNC_ACCEPT_PRODUCT_TEXT}
                                    />
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                style={styles.countinueButton}
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={PLSTP_AGREE}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

LATnC.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

function RadioButtonText({ btnId, onPress, isSelected, text }) {
    const onItemPress = () => {
        console.log("[RadioButtonText] >> [onItemPress]" + btnId);
        if (onPress) onPress({ radioBtnId: btnId });
    };

    return (
        <TouchableOpacity style={styles.radioContainer} onPress={onItemPress}>
            <Image
                style={styles.tickImage}
                source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />
            <Typo textAlign="left" lineHeight={18} text={text} style={styles.radioButtonText} />
        </TouchableOpacity>
    );
}

RadioButtonText.propTypes = {
    btnId: PropTypes.number,
    onPress: PropTypes.func,
    isSelected: PropTypes.bool,
    text: PropTypes.string,
};

const TypographyWithLink = ({ text, type, onPress }) => {
    const onLinkPress = () => {
        console.log("[TypographyWithLink] >> [onLinkPress]");
        if (onPress) onPress(type);
    };

    return (
        <Typo
            lineHeight={20}
            fontWeight="600"
            textAlign="left"
            style={styles.textUnderline}
            text={text}
            onPress={onLinkPress}
        />
    );
};

TypographyWithLink.propTypes = {
    text: PropTypes.string,
    type: PropTypes.string,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    groupContainer: {
        marginLeft: 15,
        marginTop: 25,
        marginBottom: 25,
    },

    privacyContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "90%",
    },

    radioButtonText: { flexWrap: "wrap", flex: 1 },

    radioCheckContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 15,
        width: "90%",
    },

    countinueButton: {
        marginTop: 15,
    },

    radioContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    termsText: {
        flexWrap: "wrap",
        flex: 1,
        marginLeft: 10,
    },

    textLinkContainer: {
        flexDirection: "row",
        marginBottom: 15,
        justifyContent: "flex-start",
    },

    textUnderline: {
        textDecorationLine: "underline",
    },

    tickImage: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 24,
    },
});

export default LATnC;
