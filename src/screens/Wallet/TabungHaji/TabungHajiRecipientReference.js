import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    FUNDTRANSFER_MODULE,
    ONE_TAP_AUTH_MODULE,
    TRANSFER_TAB_SCREEN,
    TABUNG_HAJI_CONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { useModelController } from "@context";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    OWN_TH,
    OWN_MBB,
    OTHER_TH,
    OTHER_MBB,
    TABUNGHAJI,
    TABUNG_HAJI,
    MAYBANK_TO_OWN_TH,
    MAYBANK_TO_OTHER_TH,
    TH_TO_OWN_MAYBANK,
    TH_TO_OTHER_MAYBANK,
    TH_TO_OWN_TH,
    TH_TO_OTHER_TH,
    MBB_OWN_TH,
    MBB_OTHER_TH,
    TH_OWN_MBB,
    TH_OTHER_MBB,
    TH_OWN_TH,
    TH_OTHER_TH,
    ENTER_RECIPIENT_REFERENCE,
    CONTINUE,
    SECURE2U_COOLING,
    ACTIVATE,
    INPUT_MUST_ALPHANUMERICAL,
    COMMON_ERROR_MSG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { alphaNumericRegex } from "@utils/dataModel";
import { formateAccountNumber, checks2UFlow } from "@utils/dataModel/utility";
import { S2UFlowEnum } from "@utils/dataModel/utilityEnum";

import Assets from "@assets";

function TabungHajiRecipientReference({ navigation, route }) {
    const {
        tabunghajiTransferState,
        tabunghajiTransferState: { bankName, fromAccount, toAccount },
    } = route?.params;

    const { getModel } = useModelController();

    const [referenceText, setReferenceText] = useState(
        route?.params?.tabunghajiTransferState?.referenceText || ""
    );
    const [isReferenceValueValid, setIsReferenceValueValid] = useState(true);
    const [isReferenceErrorMessage, setIsReferenceErrorMessage] = useState("");
    const [beneficiaryName, setBeneficiaryName] = useState("-");
    const [accNumber, setAccNumber] = useState("-");

    useEffect(() => {
        updateDataInScreen();

        if (bankName === TABUNG_HAJI) {
            TabungHajiAnalytics.referenceSelectionLoaded(TABUNGHAJI);
        } else {
            if (toAccount?.id === OWN_MBB) {
                TabungHajiAnalytics.referenceSelectionLoaded("Own");
            } else if (toAccount?.id === OTHER_MBB) {
                TabungHajiAnalytics.referenceSelectionLoaded("Others");
            }
        }
    });

    async function updateDataInScreen() {
        setBeneficiaryName(toAccount?.receiverName);
        setAccNumber(toAccount?.accNo);
    }

    function onBackPress() {
        navigation.goBack();
    }

    function onTextInputValueChanged(text) {
        setReferenceText(text);
        setIsReferenceValueValid(alphaNumericRegex(text));
        setIsReferenceErrorMessage(INPUT_MUST_ALPHANUMERICAL);
    }

    function onTextDone() {
        Keyboard.dismiss();
    }

    async function handleReferenceConfirmation() {
        try {
            let fundS2uCode = "";
            let fundTransferType = "";
            let transferType = "";

            if (fromAccount?.id === OWN_MBB && toAccount?.id === OWN_TH) {
                fundTransferType = MAYBANK_TO_OWN_TH;
                transferType = MBB_OWN_TH;
                fundS2uCode = 56;
            } else if (fromAccount?.id === OWN_MBB && toAccount?.id === OTHER_TH) {
                fundTransferType = MAYBANK_TO_OTHER_TH;
                transferType = MBB_OTHER_TH;
                fundS2uCode = 57;
            } else if (fromAccount?.id === OWN_TH && toAccount?.id === OWN_MBB) {
                fundTransferType = TH_TO_OWN_MAYBANK;
                transferType = TH_OWN_MBB;
                fundS2uCode = 58;
            } else if (fromAccount?.id === OWN_TH && toAccount?.id === OTHER_MBB) {
                fundTransferType = TH_TO_OTHER_MAYBANK;
                transferType = TH_OTHER_MBB;
                fundS2uCode = 59;
            } else if (fromAccount?.id === OWN_TH && toAccount?.id === OWN_TH) {
                fundTransferType = TH_TO_OWN_TH;
                transferType = TH_OWN_TH;
                fundS2uCode = 60;
            } else {
                fundTransferType = TH_TO_OTHER_TH;
                transferType = TH_OTHER_TH;
                fundS2uCode = 61;
            }

            if (isReferenceValueValid) {
                Keyboard.dismiss();
                const { flow } = await checks2UFlow(fundS2uCode, getModel);
                const isFav = tabunghajiTransferState?.favourite ?? false;
                if (flow === SECURE2U_COOLING && !isFav) {
                    navigateToS2UCooling(navigation.navigate);
                } else if (flow === S2UFlowEnum.s2uReg && !isFav) {
                    navigation.navigate(ONE_TAP_AUTH_MODULE, {
                        screen: ACTIVATE,
                        params: {
                            flowParams: {
                                success: {
                                    stack: FUNDTRANSFER_MODULE,
                                    screen: TABUNG_HAJI_CONFIRMATION,
                                },
                                fail: {
                                    stack: FUNDTRANSFER_MODULE,
                                    screen: TRANSFER_TAB_SCREEN,
                                },
                                params: {
                                    ...route?.params,
                                    tabunghajiTransferState: {
                                        ...tabunghajiTransferState,
                                        fundTransferType,
                                        transferType,
                                        fundS2uCode,
                                        referenceText,
                                    },
                                },
                            },
                        },
                    });
                } else {
                    Keyboard.dismiss();
                    navigation.navigate(FUNDTRANSFER_MODULE, {
                        screen: TABUNG_HAJI_CONFIRMATION,
                        params: {
                            ...route?.params,
                            tabunghajiTransferState: {
                                ...tabunghajiTransferState,
                                fundTransferType,
                                transferType,
                                fundS2uCode,
                                referenceText,
                            },
                        },
                    });
                }
            }
        } catch (error) {
            showErrorToast({
                message: error || COMMON_ERROR_MSG,
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color" showOverlay={false} backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={TRANSFER_TO_HEADER}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <React.Fragment>
                    <View style={Styles.container}>
                        <View style={Styles.blockNew}>
                            <View style={Styles.accountDetailArea}>
                                <TransferImageAndDetails
                                    title={formateAccountNumber(accNumber)}
                                    subtitle={beneficiaryName}
                                    description={bankName}
                                    image={{
                                        type: "local",
                                        source:
                                            bankName === TABUNG_HAJI
                                                ? Assets.tabunghajiTextLogo
                                                : Assets.Maybank,
                                    }}
                                />
                            </View>

                            <View style={Styles.descriptionContainerReference}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    color={BLACK}
                                    textAlign="left"
                                    text={ENTER_RECIPIENT_REFERENCE}
                                />
                            </View>

                            <View style={Styles.referenceViewTransfer}>
                                <TextInput
                                    maxLength={20}
                                    onChangeText={onTextInputValueChanged}
                                    value={referenceText}
                                    isValidate
                                    isValid={isReferenceValueValid}
                                    errorMessage={isReferenceErrorMessage}
                                    onSubmitEditing={onTextDone}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    placeholder=""
                                    editable={true}
                                    autoFocus
                                />
                            </View>
                        </View>
                    </View>
                    <View style={Styles.footerButton}>
                        <ActionButton
                            disabled={referenceText.length < 3}
                            fullWidth
                            borderRadius={25}
                            onPress={handleReferenceConfirmation}
                            backgroundColor={referenceText.length < 3 ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    color={referenceText.length < 3 ? DISABLED_TEXT : BLACK}
                                    text={CONTINUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </View>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

TabungHajiRecipientReference.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Styles = StyleSheet.create({
    accountDetailArea: {
        height: 80,
        marginTop: 18,
        width: "100%",
    },
    blockNew: {
        flex: 1,
        marginTop: 1,
        paddingHorizontal: 24,
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        width: "100%",
    },
    descriptionContainerReference: {
        marginTop: 26,
    },
    footerButton: {
        marginBottom: 36,
        paddingHorizontal: 36,
        width: "100%",
    },
    referenceViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
});

export default TabungHajiRecipientReference;
