/* eslint-disable no-unneeded-ternary */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import {
    BANKINGV2_MODULE,
    JA_TNC,
    JA_CONFIRMATION,
    SETTINGS_MODULE,
    PROPERTY_DASHBOARD,
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

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, GREY } from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    TNC_ACCEPT_PRODUCT_TEXT,
    PLSTP_AGREE,
    PLSTP_TNC_NOTE,
    TNC_NOT_ALLOW_PROCESS_PI,
    TNC_ALLOW_PROCESS_PI,
    PN_DECL,
    PN_TEXT,
    PN_TNC_TEXT,
    PLSTP_FATCA_US_EXT,
    FATACA_CERTIFICATE,
    FATCA_TNC_SUB_TEXT_NESTED,
    FATCA_TNC_SUB_TEXT,
    FATCA_TNC_TEXT,
    PLSTP_PDS_BOLD,
    DECLARATION,
    TERMS_CONDITIONS,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_TERMSANDCONDITIONS,
} from "@constants/strings";

import Assets from "@assets";

import { fetchGetApplicants } from "../Application/LAController";
import { getEncValue, useResetNavigation } from "../Common/PropertyController";
import { saveEligibilityInput } from "./JAController";

function JATnC({ route, navigation }) {
    const [resetToApplication] = useResetNavigation(navigation);
    const [loading, setLoading] = useState(true);
    const [radioPDSChecked, setRadioPDSChecked] = useState(true);
    const [radioDeclarationChecked, setRadioDeclarationChecked] = useState(true);
    const [radioFATCA1Checked, setRadioFATCA1Checked] = useState(true);
    // const [radioFATCA2Checked, setRadioFATCA2Checked] = useState(true);
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
    const [showApplicationRemovePopup, setShowApplicationRemovePopup] = useState(false);

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

    const init = useCallback(() => {
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const tncAgreement = masterData?.tncAgreement ?? {};
        setPdsUrl(tncAgreement?.pdsUrl ?? "");
        setDeclarationUrl(tncAgreement?.declarationUrl ?? "");
        setFatca1Url(tncAgreement?.fatca1Url ?? "");
        setFatca2Url(tncAgreement?.fatca2Url ?? "");
        setPnUrl(tncAgreement?.pnUrl ?? "");
        populateSavedData();
        setLoading(false);
    }, []);

    function populateSavedData() {
        const savedData = route.params?.savedData ?? {};
        const radioPDSChecked = savedData?.radioPDSChecked ?? false;
        const radioDeclarationChecked = savedData?.radioDeclarationChecked ?? false;
        const radioFATCA1Checked = savedData?.radioFATCA1Checked ?? false;
        // const radioFATCA2Checked = savedData?.radioFATCA2Checked ?? false;
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
        // setRadioFATCA2Checked(radioFATCA2Checked);
        setRadioAcceptProductChecked(radioAcceptProductChecked);
    }

    const onBackPress = () => {
        navigation.canGoBack() && navigation.goBack();
    };

    async function onCloseTap() {
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            return;
        }
        setShowExitPopup(true);
    }

    function onRadioBtnPNTap(params) {
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
        // Hide popup
        closeExitPopup();
        const formData = getFormData();
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_TNC,
            formData,
            navParams: route?.params,
        });
        if (success) {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 1,
                            reload: true,
                        },
                    },
                ],
            });
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        closeExitPopup();
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                },
            ],
        });
    }

    function closeExitPopup() {
        setShowExitPopup(false);
    }

    function closeCancelRemovePopup() {
        setShowApplicationRemovePopup(false);
        resetToApplication();
    }
    function closeRemoveAppPopup() {
        setShowApplicationRemovePopup(false);
        setLoading(false);
    }
    async function onContinue() {
        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;
        setLoading(true);
        // Request object
        const params = {
            pds: radioPNYesChecked ? "Yes" : "No",
            declaration: radioPNYesChecked ? "Yes" : "No",
            fatca1: radioPNYesChecked ? "Yes" : "No",
            fatca2: radioPNYesChecked ? "Yes" : "No",
            pn: radioPNYesChecked ? "Yes" : "No",
            acceptProduct: radioPNYesChecked ? "Yes" : "No",
        };
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            setLoading(false);
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            return;
        }
        // call to update tnc info
        tncAgreement(params, false)
            .then((httpResp) => {
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
    }

    async function saveAndConfirm() {
        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params ?? {};
        // Save Form Data in DB before moving to next screen
        await saveEligibilityInput(
            {
                screenName: JA_TNC,
                formData,
                navParams,
            },
            false
        );
        // Navigate to Confirmation screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JA_CONFIRMATION,
            params: {
                ...navParams,
                ...formData,
            },
        });
        setLoading(false);
    }

    function validateFormDetails() {
        if (!(radioPNYesChecked || radioPNNoChecked)) {
            return false;
        }
        // Return true if all validation checks are passed
        return true;
    }

    function getFormData() {
        return {
            radioPDSChecked: radioPNYesChecked ? true : false,
            radioDeclarationChecked: radioPNYesChecked ? true : false,
            radioFATCA1Checked: radioPNYesChecked ? true : false,
            radioFATCA2Checked: radioPNYesChecked ? true : false,
            radioPNChecked,
            radioPNYesChecked,
            radioAcceptProductChecked: radioPNYesChecked ? true : false,
            consentToUsePDPA: radioPNYesChecked ? true : false,
            progressStatus: PROP_ELG_INPUT,
        };
    }
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_TERMSANDCONDITIONS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text={TERMS_CONDITIONS}
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
                                        <Text>{` ${PN_DECL}`}</Text>
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
                                <SpaceFiller height={10} />
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
                title={EXIT_JA_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
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
            {/*Application Removed popup */}
            <Popup
                visible={showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeRemoveAppPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
        </>
    );
}
JATnC.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

function RadioButtonText({ btnId, onPress, isSelected, text }) {
    const onItemPress = () => {
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
    // eslint-disable-next-line react-native/no-unused-styles
    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginVertical: 24,
    },

    groupContainer: {
        // marginLeft: 5,
        marginBottom: 15,
    },

    privacyContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 15,
        width: "100%",
    },

    radioButtonText: { flexWrap: "wrap", flex: 1 },

    radioCheckContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 25,
        width: "100%",
    },

    radioContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    countinueButton: {
        marginTop: 15,
    },

    termsText: {
        // flexWrap: "wrap",
        // flex: 1,
        // marginLeft: 10,
    },

    textLinkContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 15,
        width: "100%",
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
        paddingHorizontal: 30,
    },
});

export default JATnC;
