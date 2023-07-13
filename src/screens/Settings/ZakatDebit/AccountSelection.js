import PropTypes from "prop-types";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Image, Dimensions } from "react-native";

import {
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, fetchZakatDebitAccts } from "@services";

import { BLACK, YELLOW, WHITE, SHADOW_LIGHT, OVERLAY, DISABLED, DISABLED_TEXT } from "@constants/colors";
import {
    ZAKAT_NO_ISLAMICACCT_TO_SELECT,
    COMMON_ERROR_MSG
} from "@constants/strings";

import assets from "@assets";
import { formateAccountNumber, removeWhiteSpaces } from "@utils/dataModel/utilityPartial.3";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

const Card = ({ item, type, children, isSelected, onPress }) => {
    const CARD_IMAGE = type === "casa" ? assets.casaFullBg : assets.maeFullBg;

    function handlePress() {
        if (item?.number) {
            onPress({
                item
            });
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={styles.cardButton}
            testID={`choose_account_${item?.number.substring(0, 12)}`}
        >
            <View style={styles.cardContainer}>
                <View style={styles.cardInner}>
                    {isSelected && (
                        <Animatable.View
                            animation="fadeIn"
                            duration={500}
                            style={styles.selectedOverlay}
                        >
                            <Animatable.Image
                                animation="bounceIn"
                                duration={300}
                                source={assets.whiteTick}
                                style={styles.selectedCheck}
                            />
                        </Animatable.View>
                    )}
                    <Image source={CARD_IMAGE} style={styles.cardBg} />
                    <View style={styles.cardChildContainer}>{children}</View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

Card.propTypes = {
    item: PropTypes.object,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
};

const Account = ({ account, amount, noMae, ...props }) => (
    <Card item={account} {...props}>
        <>
            <Typo
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                text={account?.name}
                color={WHITE}
                textAlign="left"
            />
            <Typo
                fontSize={12}
                fontWeight="normal"
                lineHeight={18}
                text={formateAccountNumber(account?.number.substring(0, 12), 12)}
                color={WHITE}
                textAlign="left"
                style={styles.accountDescription}
            />
            <Typo
                fontSize={16}
                fontWeight="600"
                lineHeight={18}
                text={amount}
                color={WHITE}
                textAlign="left"
            />
        </>
    </Card>
);

Account.propTypes = {
    account: PropTypes.object,
    amount: PropTypes.string,
    noMae: PropTypes.bool,
    onPress: PropTypes.func,
};

const AccountSelection = ({ navigation, route }) => {
    const scrollView = useRef();

    const [buttonEnabled, setButtonEnabled] = useState(false);
    
    const [accountList, setAccountList] = useState([]);

    const [zakatAllowedAccounts, setZakatAllowedAccounts] = useState([]);
    const [zakatFilteredAccts, setZakatFilteredAccts] = useState([]);

    const [maeAccount, setMaeAccount] = useState(false);

    const [maeAvailable, setMaeAvailable] = useState(false);

    const fetchZakatDropDowns = useCallback(async () => {
        try {
            const response = await fetchZakatDebitAccts(true);
            if (response?.data) {
                const { allowedAccounts } = { ...response?.data?.data };
                setZakatAllowedAccounts(allowedAccounts);
            }
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    }, []);

    const fetchCASAAccounts = useCallback(async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (response?.data) {
                setAccountList(response?.data?.result?.accountListings);
                setMaeAvailable(response?.data?.result?.maeAvailable);
            }
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    }, []);

    useEffect(() => {
        if (zakatAllowedAccounts && accountList && zakatAllowedAccounts.length && accountList.length) {
            const newAccts = accountList.filter((mainAcct) => {
                return zakatAllowedAccounts.filter((zakatAcct) => 
                    (mainAcct?.code === zakatAcct?.subServiceCode && mainAcct?.type === zakatAcct?.note1)).length;
            });
            if (!newAccts.length) {
                showErrorToast({ message: ZAKAT_NO_ISLAMICACCT_TO_SELECT });
            }

            const mae = newAccts.find(
                (account) =>
                    (account.group === "0YD" || account.group === "CCD") &&
                    account.type === "D"
            );
    
            const withoutMae = mae
                            ? newAccts.filter((account) => account.number !== mae.number)
                            : newAccts;
    
            setZakatFilteredAccts(withoutMae);
            setMaeAccount(mae);
        }
    }, [accountList, zakatAllowedAccounts]);

    useEffect(() => {
        if (route?.params?.zakatDetails?.accountNo && zakatFilteredAccts.length) {
            const accountDetails = route?.params?.zakatDetails?.accountNo?.split(":");
            if (accountDetails && accountDetails.length) {
                const acctNum = removeWhiteSpaces(accountDetails[1]);
                const acct = zakatFilteredAccts.filter((d) => d.number.substring(0, 12) === acctNum);
                if (!acct.length) {
                    if (maeAccount.number.substring(0, 12) === acctNum.substring(0, 12)) {
                        setAccountSelect(maeAccount);
                    }
                } else {
                    setAccountSelect(acct[0]);
                }
            }
        }
    }, [zakatFilteredAccts]);

    useEffect(() => {
        fetchCASAAccounts();
        fetchZakatDropDowns();
    }, [fetchCASAAccounts, fetchZakatDropDowns]);

    function onPressBack() {
        navigation.goBack();
    }

    const [accountSelect, setAccountSelect] = useState(null);

    useEffect(() => {
        if (accountSelect?.number) setButtonEnabled(true);
        if (!accountSelect?.number) setButtonEnabled(false);

        const { accountNo } = route?.params?.zakatDetails ?? "";
        setButtonEnabled(accountNo.split(":")[1] !== accountSelect?.number.substring(0, 12));
    }, [accountSelect]);

    function onNavigateNext() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "AccountConfirm",
            params: {
                account: accountSelect
            }
        });
    }

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: height });
    }

    function handleSelectAccount({ item: account }) {
        setAccountSelect(account);
    }

    return (
        <>
            <ScreenContainer backgroundType="color" 
                analyticScreenName="Settings_AutoDebitZakat_SwitchAccount_SelectAccount">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>Auto Debit for Zakat</HeaderLabel>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView
                        ref={scrollView}
                        style={styles.container}
                        onContentSizeChange={onContentSizeChange}
                    >
                        <View style={styles.marginBottomStyle}>
                            <Typo
                                text="Select your preferred Maybank account for auto debiting"
                                fontWeight="400"
                                fontSize={16}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.title}
                            />
                        </View>

                        {
                            zakatFilteredAccts.map((account, index) => (
                                <Account
                                    key={`${account?.number}-${index}`}
                                    name={account?.name}
                                    account={account}
                                    amount={`RM ${account?.balance}`}
                                    onPress={handleSelectAccount}
                                    isSelected={
                                        accountSelect?.number?.substring(0, 12) ===
                                        account?.number.substring(0, 12)
                                    }
                                    type="casa"
                                />
                            ))
                        }
                        {
                            maeAccount && maeAvailable 
                                ? (
                                    <Account
                                        key={`${maeAccount?.number}`}
                                        name={maeAccount?.name}
                                        account={maeAccount}
                                        amount={`RM ${maeAccount?.balance}`}
                                        onPress={handleSelectAccount}
                                        isSelected={
                                            accountSelect?.number?.substring(0, 12) ===
                                            maeAccount?.number.substring(0, 12)
                                        }
                                        type="mae"
                                    />
                                ) 
                                : null
                        }
                    </ScrollView>
                    <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onNavigateNext}
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                text="Continue"
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
};

AccountSelection.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    title: {
        paddingTop: 16,
    },
    marginBottomStyle: {
        marginTop: 24,
        marginBottom: 24
    },
    cardBg: {
        borderRadius: 8,
        bottom: 0,
        height: "105%",
        left: -24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    cardButton: {
        paddingBottom: 24,
    },
    cardChildContainer: {
        padding: 16,
    },
    cardContainer: {
        elevation: 8,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    cardInner: {
        borderRadius: 8,
        height: 116,
        overflow: "hidden",
        width: "100%",
    },
    selectedOverlay: {
        alignItems: "center",
        backgroundColor: OVERLAY,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: width - 48,
        zIndex: 5,
    },
    selectedCheck: { height: 38, width: 38 },
    accountDescription: {
        paddingBottom: 27,
        paddingTop: 4,
    },
});

export default AccountSelection;
