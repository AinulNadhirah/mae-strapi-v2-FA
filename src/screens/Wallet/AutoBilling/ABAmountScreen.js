import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";

import {
    AUTOBILLING_CONFIRMATION,
    AUTOBILLING_DASHBOARD,
    AUTOBILLING_STACK,
    ONE_TAP_AUTH_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { MEDIUM_GREY, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import { numberMasking } from "@utils/dataModel/rtdHelper";
import { checks2UFlow } from "@utils/dataModel/utility";

function ABAmountScreen({ navigation, route, getModel }) {
    const [state, setState] = useState({
        errorMessage: "",
        showLocalError: false,
        showLocalErrorMessage: "",
        transferParams: {},
        screenData: {
            image: {
                image: Strings.DUINTNOW_IMAGE,
                imageName: Strings.DUINTNOW_IMAGE,
                imageUrl: Strings.DUINTNOW_IMAGE,
                shortName: "",
                type: true,
            },
            name: "",
            description1: "",
            description2: "",
            imageBase64: false,
        },
        amount: "",
        maxAmount: 0.0,
        screenLabel: Strings.ENTER_AMOUNT,
        screenTitle: Strings.TRANSFER,
        imageBase64: true,
        amountLength: 8,
        amountValue: 0,
    });

    function updateState(stateData) {
        setState({ ...state, ...stateData });
    }

    useEffect(() => {
        updateDataInScreen();
    }, []);

    async function updateDataInScreen() {
        const transferParams = route.params?.transferParams ?? state.screenData;

        const {
            amount,
            maxAmount,
            amountError,
            debtorAccountNumber,
            amountLength,
            maxAmountError,
            debtorName,
            image,
        } = transferParams || {};

        const screenData = {
            image,
            name: numberMasking(debtorAccountNumber),
            description1: debtorName,
            description2: Strings.BANK_ACCT_NO,
        };
        const amountTemp = amount ? amount.toString().replace(/,/g, "").replace(".", "") : 0.0;
        const amountValue = amountTemp ? Numeral(amountTemp).value() : 0;
        if (amountValue >= 0.01) {
            changeText(amountValue);
        }

        updateState({
            screenTitle: Strings.RTP_CHARGE_CUSTOMER,
            screenLabel: Strings.ENTER_AMOUNT,
            maxAmount,
            transferParams,
            errorMessage: amountError,
            screenData,
            amountLength: amountLength ?? 8,
            maxAmountError: maxAmountError ?? amountError,
            image,
        });
    }

    function changeText(val) {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = numberWithCommas(value);
            updateState({ amount: formatted, amountValue: value, showLocalError: false });
        } else {
            updateState({ amount: "", amountValue: value, showLocalError: false });
        }
    }

    function numberWithCommas(val) {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    }

    async function doneClick() {
        let { amount } = state || {};
        const { maxAmount, errorMessage, maxAmountError } = state || {};
        const amountFinal = amount;
        amount = amount ? amount.toString().replace(/,/g, "") : "0.00";
        let amountText = Numeral(amount).value();

        if (amountText == null || amountText === "undefined" || amountText.length === 0) {
            amountText = 0;
        }

        if (amountText < 0.01) {
            updateState({ showLocalErrorMessage: errorMessage, showLocalError: true });
        } else if (amountText > maxAmount) {
            updateState({
                showLocalErrorMessage: maxAmountError,
                showLocalError: true,
            });
        } else {
            updateState({ showLocalError: false });
            const { transferParams } = state || {};
            const modParams = { ...transferParams };
            const amountValue = amountFinal
                ? amountFinal.toString().replace(/,/g, "").replace(".", "")
                : 0;
            modParams.amount = amountFinal;
            modParams.formattedAmount = amountFinal;
            modParams.amountValue = amountValue;
            modParams.serviceFee = amountText > 5000.0 ? 0.5 : 0.0;
            modParams.transferFlow = 28;
            const { flow, secure2uValidateData } = await checks2UFlow(72, getModel);
            const params = {
                ...route.params,
                transferParams: modParams,
                secure2uValidateData,
                flow,
            };
            if (flow === "S2UReg") {
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: Strings.ACTIVATE,
                    params: {
                        flowParams: {
                            success: {
                                stack: AUTOBILLING_STACK,
                                screen: AUTOBILLING_CONFIRMATION,
                            },
                            fail: {
                                stack: AUTOBILLING_STACK,
                                screen: AUTOBILLING_DASHBOARD,
                            },

                            params: { ...params, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigation.navigate(AUTOBILLING_STACK, {
                    screen: AUTOBILLING_CONFIRMATION,
                    params,
                });
            }
        }
    }

    function onBackPress() {
        navigation.pop();
    }

    const { errorMessage, showErrorModal } = state || {};
    const amount = route.params.transferParams?.limitAmount
        ? Numeral(route.params.transferParams?.limitAmount).format("0,0.00")
        : "50000.00";
    return (
        <ScreenContainer
            backgroundType="color"
            showErrorModal={showErrorModal}
            errorMessage={errorMessage}
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={state.screenTitle}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <React.Fragment>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={Styles.container}>
                            <View style={Styles.logoInfoContainer}>
                                <AccountDetailsView
                                    data={state.screenData}
                                    base64={state.imageBase64}
                                    image={state.image}
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
                                    text={state.screenLabel}
                                />
                            </View>

                            <View style={Styles.amountViewTransfer}>
                                <TextInput
                                    style={Styles.duitNowAmount}
                                    prefixStyle={[Styles.duitNowAmountFaded]}
                                    accessibilityLabel="Password"
                                    isValidate={state.showLocalError}
                                    errorMessage={state.showLocalErrorMessage}
                                    onSubmitEditing={this.onDone}
                                    value={state.amount}
                                    prefix={Strings.CURRENCY_CODE}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={false}
                                    placeholder="0.00"
                                />
                            </View>
                            {state.showLocalError === false ? (
                                <View style={Styles.mtop}>
                                    <Typo
                                        fontSize={13}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color={BLACK}
                                        textAlign="left"
                                        text={`Limit : RM ${amount}`}
                                    />
                                </View>
                            ) : null}
                        </View>
                    </ScrollView>
                    <NumericalKeyboard
                        value={`${state.amountValue}`}
                        onChangeText={changeText}
                        maxLength={state.amountLength}
                        onDone={doneClick}
                    />
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ABAmountScreen.propTypes = {
    getModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },

    descriptionContainerAmount: {
        paddingTop: 26,
    },
    mtop: {
        marginTop: 10,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
};
export default withModelContext(ABAmountScreen);
