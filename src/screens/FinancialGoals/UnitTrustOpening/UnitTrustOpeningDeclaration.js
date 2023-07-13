import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_TERMS_AND_CONDITIONS,
    UNIT_TRUST_OPENING_ACKNOWLEDGEMENT,
    UNIT_TRUST_OPENING_DECLARATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TitleAndDropdownPill from "@components/FinancialGoal/TitleAndDropdownPill";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, createUTAccount } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    AGREE_PROCEED,
    CONTINUE,
    DROPDOWN_DEFAULT_TEXT,
    FA_FIN_GOAL_APPLY_UT_DECLARE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    NO,
    YES,
} from "@constants/strings";

import assets from "@assets";

const UnitTrustOpeningDeclaration = ({ navigation, route }) => {
    const [accountList, setAccountList] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPEP, setIsPEP] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showToolTip, setShowToolTip] = useState(false);
    const [currentPicker, setCurrentPicker] = useState(null);
    const [currentPickerOptions, setCurrentPickerOptions] = useState([]);
    const [selectedSourceOfFund, setSelectedSourceOfFund] = useState(null);
    const [selectedSourceOfWealth, setSelectedSourceOfWealth] = useState(null);
    const toolTipTitle = useRef("");
    const toolTipDesc = useRef("");

    const PICKER = {
        account: "account",
        sourceOfFund: "sourceOfFund",
        sourceOfWealth: "sourceOfWealth",
    };

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_APPLY_UT_DECLARE,
        });
    }, []);

    useEffect(() => {
        fetchCASAAccount();
    }, [fetchCASAAccount]);

    useEffect(() => {
        switch (true) {
            case selectedAccount !== null &&
                isPEP === YES &&
                selectedSourceOfFund !== null &&
                selectedSourceOfWealth !== null: // notes: yes have to check for source of fund, source of wealth selected once backend integration happens
            case selectedAccount !== null && isPEP === NO:
                setButtonEnabled(true);
                break;
            default:
                setButtonEnabled(false);
                break;
        }
    }, [isPEP, selectedAccount, selectedSourceOfFund, selectedSourceOfWealth]);

    const fetchCASAAccount = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (response?.data) {
                const accounts = response?.data?.result?.accountListings?.map((item) => {
                    return {
                        title: item?.number?.slice(0, 12),
                        value: item?.number?.slice(0, 12),
                        type: item?.type,
                    };
                });
                setIsLoading(false);
                setAccountList(accounts ?? []);
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message });
        }
    }, []);

    function onCrossButtonPress() {
        if (route?.params?.fromScreen) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.fromScreen,
            });
        } else {
            navigation.goBack();
        }
    }

    function onAccountPress() {
        setCurrentPicker(PICKER.account);
        setCurrentPickerOptions(accountList);
        setShowPicker(true);
    }

    function onScrollPickerDoneButtonPressed(index) {
        switch (currentPicker) {
            case PICKER.account:
                setSelectedAccount(index);
                setShowPicker(false);
                break;
            case PICKER.sourceOfFund:
                setSelectedSourceOfFund(index);
                setShowPicker(false);
                break;

            case PICKER.sourceOfWealth:
                setSelectedSourceOfWealth(index);
                setShowPicker(false);
                break;
            default:
                return;
        }
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    function onPressRadio(value) {
        setIsPEP(value);
        if (isPEP === NO) {
            setSelectedSourceOfFund(null);
            setSelectedSourceOfWealth(null);
        }
    }

    function onSourceOfFundPress() {
        const options = route?.params?.referenceData?.sourceOfFund.map((item) => {
            return {
                title: item?.label,
                value: item?.value,
            };
        });
        setCurrentPicker(PICKER.sourceOfFund);
        setCurrentPickerOptions(options);
        setShowPicker(true);
    }

    function onSourceOfWealthPress() {
        const options = route?.params?.referenceData?.sourceOfWealth.map((item) => {
            return {
                title: item?.label,
                value: item?.value,
            };
        });
        setCurrentPicker(PICKER.sourceOfWealth);
        setCurrentPickerOptions(options);
        setShowPicker(true);
    }

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TERMS_AND_CONDITIONS,
            params: {
                showAgreeButton: true,
                ctaText: AGREE_PROCEED,
                ctaAction: onPressTncCTA,
                fromScreen: UNIT_TRUST_OPENING_DECLARATION,
                crossButtonScreen: route?.params?.crossButtonScreen,
            },
        });
    }

    async function onPressTncCTA() {
        // trigger create UT account API
        try {
            const requestBody = {
                ...route?.params?.eligibleData,
                settlementAccount: selectedAccount,
                pepDeclare: isPEP === YES ? true : false,
                sourceOfFund: selectedSourceOfFund,
                sourceOfWealth: selectedSourceOfWealth,
                riskDateEntered: route?.params?.clientRiskDate,
                riskProfileScores: route?.params?.gbiRiskLevel,
            };
            const response = await createUTAccount(requestBody, true);
            if (response?.data?.message === "SUCCESS") {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: UNIT_TRUST_OPENING_ACKNOWLEDGEMENT,
                    params: {
                        fromScreen: route?.params?.fromScreen,
                    },
                });
            } else {
                showErrorToast({ message: "Something went wrong" });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }

    function onPressToolTip(toolTip) {
        setShowToolTip(true);
        switch (toolTip) {
            case "settleAccount":
                toolTipTitle.current = "Settlement Account";
                toolTipDesc.current = "This account is used for your redemption transactions";
                break;
            case "pep":
                toolTipTitle.current = "Are you a Politically Exposed Person";
                toolTipDesc.current =
                    "Individuals with a high-profile political role or entrusted with a prominent public function (either domestically, by a foreign country or by an international organisation). E.g.Prime Minister, Deputy Minister, Royalties etc.";
                break;
            case "sourceOfFund":
                toolTipTitle.current = "Source of Fund";
                toolTipDesc.current =
                    "The main source of your money that is used in this transaction.";
                break;
            case "sourceOfWealth":
                toolTipTitle.current = "Source of Wealth";
                toolTipDesc.current = "The main source of your total assets";
                break;
            default:
                break;
        }
    }

    function onCloseToolTip() {
        setShowToolTip(false);
    }

    const selectedAccountText = (() => {
        const accType = accountList
            .filter((item) => item?.value === selectedAccount)
            .map((item) => {
                if (item?.type === "S") {
                    return "Saving Account -i";
                } else {
                    return "Current Account -i";
                }
            });
        return selectedAccount
            ? `${accType?.[0]} ${selectedAccount.slice(0, 12)}`
            : DROPDOWN_DEFAULT_TEXT;
    })();

    const selectedSourceOfFundLabel = (() => {
        const selected = route?.params?.referenceData?.sourceOfFund?.find(
            (item) => item?.value === selectedSourceOfFund
        );
        return selected?.label;
    })();

    const selectedSourceOfWealthLabel = (() => {
        const selected = route?.params?.referenceData?.sourceOfWealth?.find(
            (item) => item?.value === selectedSourceOfWealth
        );
        return selected?.label;
    })();

    if (isLoading) {
        return <ScreenLoader showLoader />;
    } else {
        return (
            <>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={onCrossButtonPress} />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <ScrollView style={styles.container}>
                            <Typo
                                text="Declaration"
                                fontWeight="600"
                                fontSize={14}
                                textAlign="left"
                            />
                            <TitleAndDropdownPill
                                title="Settlement Account"
                                // eslint-disable-next-line react/jsx-no-bind
                                onPressToolTip={() => onPressToolTip("settleAccount")}
                                dropdownTitle={selectedAccountText ?? DROPDOWN_DEFAULT_TEXT}
                                dropdownOnPress={onAccountPress}
                                isDisabled={false}
                            />
                            <TitleWithToolTip
                                title="Are you a Politically Exposed Person"
                                // eslint-disable-next-line react/jsx-no-bind
                                onPressToolTip={() => onPressToolTip("pep")}
                            />
                            <View style={styles.radioContainer}>
                                <View style={styles.yesRadio}>
                                    <ColorRadioButton
                                        title={YES}
                                        onRadioButtonPressed={onPressRadio}
                                        isSelected={isPEP === YES}
                                    />
                                </View>
                                <ColorRadioButton
                                    title={NO}
                                    onRadioButtonPressed={onPressRadio}
                                    isSelected={isPEP === NO}
                                />
                            </View>
                            {isPEP === YES && (
                                <>
                                    <TitleAndDropdownPill
                                        title="Source of Fund"
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onPressToolTip={() => onPressToolTip("sourceOfFund")}
                                        dropdownTitle={
                                            selectedSourceOfFundLabel ?? DROPDOWN_DEFAULT_TEXT
                                        }
                                        dropdownOnPress={onSourceOfFundPress}
                                        isDisabled={false}
                                    />
                                    <TitleAndDropdownPill
                                        title="Source of Wealth"
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onPressToolTip={() => onPressToolTip("sourceOfWealth")}
                                        dropdownTitle={
                                            selectedSourceOfWealthLabel ?? DROPDOWN_DEFAULT_TEXT
                                        }
                                        dropdownOnPress={onSourceOfWealthPress}
                                        isDisabled={false}
                                    />
                                </>
                            )}
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                disabled={!buttonEnabled}
                                backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                                onPress={onPressContinue}
                                style={styles.button}
                                componentCenter={
                                    <Typo
                                        text={CONTINUE}
                                        fontWeight="600"
                                        fontSize={14}
                                        color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={showPicker}
                    items={currentPickerOptions}
                    selectedIndex={null}
                    onDoneButtonPressed={onScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={onScrollPickerCancelButtonPressed}
                />
                <Popup
                    visible={showToolTip}
                    title={toolTipTitle.current}
                    description={toolTipDesc.current}
                    onClose={onCloseToolTip}
                />
            </>
        );
    }
};

const TitleWithToolTip = ({ title, onPressToolTip }) => {
    return (
        <View style={styles.titleWithToolTipContainer}>
            <Typo text={title} fontSize={14} fontWeight="400" textAlign="left" />
            <TouchableOpacity onPress={onPressToolTip}>
                <Image style={styles.infoIcon} source={assets.icInformation} />
            </TouchableOpacity>
        </View>
    );
};

TitleWithToolTip.propTypes = {
    title: PropTypes.string,
    onPressToolTip: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    infoIcon: {
        height: 12,
        marginLeft: 8,
        width: 12,
    },
    radioContainer: { alignItems: "flex-start", flexDirection: "row" },

    titleWithToolTipContainer: {
        flexDirection: "row",
        paddingBottom: 10,
        paddingTop: 30,
    },
    yesRadio: { width: 100 },
});

export default UnitTrustOpeningDeclaration;
