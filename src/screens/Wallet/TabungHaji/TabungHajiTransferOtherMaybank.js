import _ from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View } from "react-native";

import { FUNDTRANSFER_MODULE, TABUNG_HAJI_ENTER_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast, hideToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";
import { validateMaybankAccount } from "@services/apiServiceTabungHaji";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { FUND_TRANSFER_TYPE_MAYBANK } from "@constants/fundConstants";
import {
    MAYBANK,
    INPUT_MUST_CONSIST,
    INVALID_NUMBER_INVALID_TRY_AGAIN,
    CDD_ACCOUNT_NUMBER,
    CONTINUE,
    COMMON_ERROR_MSG,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

function TabungHajiTransferOtherMaybank({ navigation, route }) {
    const [accountNumber, setAccountNumber] = useState("");
    const [amountValue, setAmountValue] = useState(0);
    const [showLocalError, setShowLocalError] = useState(false);
    const [showLocalErrorMessage, setShowLocalErrorMessage] = useState("");
    const [bankName, setBankName] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const accountNumberCorrectLength = 12;

    const { tabunghajiTransferState } = route?.params;

    useEffect(() => {
        updateDataInScreen();

        TabungHajiAnalytics.otherMBBTransferLoaded();
    }, []);

    function updateDataInScreen() {
        const transferParams = {
            bankCode: "MAYBANK",
            fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
            toAccount: "",
            payeeCode: "00000",
            swiftCode: "MBBEMYKL",
        };

        setBankName(tabunghajiTransferState?.bankName);
        setTransferParams(transferParams);
    }

    function onTextInputValueChanged(text) {
        const value = text ? parseInt(text) : 0;
        const account = text.replace(/\s/g, ""); // remove whitespace

        if (account && account.length <= accountNumberCorrectLength) {
            setShowLocalError(false);
            setAccountNumber(account);
            setAmountValue(value);
        } else {
            if (!account || account.length === 0) {
                setAccountNumber("");
                setAmountValue(0);
            }
        }
    }

    function onBackPress() {
        hideToast();
        navigation.goBack();
    }

    function checkButtonDisabled() {
        if (amountValue === 0) setButtonDisabled(true);
        else if (!accountNumber) setButtonDisabled(true);
        else setButtonDisabled(false);
    }

    function onDoneClick() {
        const text = accountNumber.replace(/ /g, "");

        transferParams.toAccount = text;
        transferParams.addingFavouriteFlow = false;

        if (_.isEmpty(text)) {
            setShowLocalErrorMessage(INPUT_MUST_CONSIST);
            setShowLocalError(true);
        } else if (text.length >= 1) {
            if (text.length < accountNumberCorrectLength) {
                setShowLocalErrorMessage(INPUT_MUST_CONSIST);
                setShowLocalError(true);
            } else {
                fundTransferInquiryApi(transferParams);
            }
        } else {
            setShowLocalErrorMessage(INPUT_MUST_CONSIST);
            setShowLocalError(true);
        }

        checkButtonDisabled();
    }

    async function fundTransferInquiryApi(transferParams) {
        const {
            toAccount: { id },
        } = tabunghajiTransferState;
        let params = {};

        params = {
            bankCode: "MAYBANK",
            fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
            toAccount: accountNumber.replace(/ /g, ""), // remove whitespace
            payeeCode: "00000",
            swiftCode: "MBBEMYKL",
        };

        validateMaybankAccount(params)
            .then((response) => {
                const responseObject = response.data;
                const { accountHolderName, lookupReference } = responseObject;

                if (responseObject) {
                    if (accountHolderName && accountHolderName.length !== 0) {
                        transferParams.transferProxyRefNo = lookupReference;

                        setTransferParams(transferParams);

                        hideToast();

                        navigation.navigate(FUNDTRANSFER_MODULE, {
                            screen: TABUNG_HAJI_ENTER_AMOUNT,
                            params: {
                                ...route?.params,
                                tabunghajiTransferState: {
                                    ...tabunghajiTransferState,
                                    toAccount: {
                                        id,
                                        receiverName: accountHolderName,
                                        accNo: accountNumber,
                                        accType: MAYBANK,
                                        ...transferParams,
                                    },
                                },
                            },
                        });
                    } else {
                        showInfoToast({
                            message: INVALID_NUMBER_INVALID_TRY_AGAIN,
                        });
                    }
                }
            })
            .catch((error) => {
                showErrorToast({
                    message: error?.error?.message || COMMON_ERROR_MSG,
                });
            });
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
                    <View style={styles.container}>
                        <View style={styles.blockNew}>
                            <View style={styles.accountDetailArea}>
                                <TransferImageAndDetails
                                    title={bankName}
                                    image={{ type: "local", source: Assets.Maybank }}
                                />
                            </View>

                            <View style={Styles.descriptionContainerAmount}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    color={BLACK}
                                    textAlign="left"
                                    text={CDD_ACCOUNT_NUMBER}
                                />
                            </View>

                            <View style={Styles.amountViewTransfer}>
                                <TextInput
                                    maxLength={14}
                                    keyboardType="numeric"
                                    onChangeText={onTextInputValueChanged}
                                    value={formateAccountNumber(accountNumber)}
                                    isValidate={showLocalError}
                                    errorMessage={showLocalErrorMessage}
                                    onSubmitEditing={onDoneClick}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={true}
                                    placeholder=""
                                    autoFocus
                                />
                            </View>
                        </View>
                    </View>

                    <View style={Styles.footerButton}>
                        <ActionButton
                            disabled={buttonDisabled}
                            isLoading={false}
                            fullWidth
                            borderRadius={25}
                            onPress={onDoneClick}
                            testID="continue_button"
                            backgroundColor={buttonDisabled ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    color={buttonDisabled ? DISABLED_TEXT : BLACK}
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

TabungHajiTransferOtherMaybank.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = {
    container: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        width: "100%",
    },
    blockNew: {
        flexDirection: "column",
        flex: 1,
        marginTop: 1,
        paddingHorizontal: 24,
    },
    accountDetailArea: {
        height: 80,
        width: "100%",
        marginTop: 18,
    },
    descriptionContainerAccount: {
        marginTop: 26,
    },
    accountNumberView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    footerButton: {
        marginBottom: 36,
        width: "100%",
    },
};

export default TabungHajiTransferOtherMaybank;
