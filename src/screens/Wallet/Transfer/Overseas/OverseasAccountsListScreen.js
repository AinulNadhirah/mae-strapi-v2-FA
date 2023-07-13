import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import AccountSelectionCard from "@components/Common/AccountSelectionCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/TextWithInfo";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY_100,
    GREY_200,
    FADE_GREY,
} from "@constants/colors";
import { CONTINUE, MAE_NOT_AVAILABLE } from "@constants/strings";

import { generateHaptic } from "@utils";
import { formateAccountNumber } from "@utils/dataModel/utility";

function Account({ account, name, number, amount, isSelected, ...props }) {
    function renderContents() {
        return (
            <>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text={name}
                    color={WHITE}
                    textAlign="left"
                />
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={formateAccountNumber(number, 12)}
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
        );
    }
    return (
        <AccountSelectionCard
            account={account}
            name={name}
            number={number}
            isSelected={isSelected}
            {...props}
        >
            {renderContents()}
        </AccountSelectionCard>
    );
}

Account.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    amount: PropTypes.string,
    noMae: PropTypes.bool,
    onPress: PropTypes.func,
    account: PropTypes.string,
    isSelected: PropTypes.bool,
};

function OverseasAccountsListScreen({ navigation, route, updateModel }) {
    const { accList, transferParams } = route?.params || {};
    const [accountList, setAccountList] = useState(accList ?? []);

    const accSelectedM2U = accountList.filter((item) => {
        return item?.selected === true;
    })[0];

    const [selectedAccount, setSelectedAccount] = useState({
        no: accSelectedM2U?.number,
        code: accSelectedM2U?.code,
        account: accSelectedM2U,
    });
    const [loadingData, setLoadingData] = useState(false);
    const loadingRef = useRef(false);

    function onBackPress() {
        navigation.goBack();
    }

    function handleSelectAccount({ account }) {
        generateHaptic("selection", true);

        const accountListUpdated = accountList.map((acc) => {
            return {
                ...acc,
                selected: acc?.number === account?.number,
            };
        });
        setAccountList(accountListUpdated);
        const accountChosen = accountListUpdated.filter((acc) => {
            return acc?.selected === true;
        });
        setSelectedAccount({
            no: accountChosen[0]?.number,
            code: accountChosen[0]?.code,
            account: accountChosen[0],
        });
    }

    function handleProceed() {
        const accObj = selectedAccount?.account?.number ? selectedAccount : null;
        if (!loadingRef.current) {
            updateModel({
                overseasTransfers: {
                    selectedAccount: accObj ?? {
                        no: accSelectedM2U?.number,
                        code: accSelectedM2U?.code,
                        account: accSelectedM2U,
                    },
                },
            });
            navigation.navigate("OverseasEnterAmount", {
                transferParams: {
                    ...transferParams,
                    selectedAccount: accObj ?? {
                        no: accSelectedM2U?.number,
                        code: accSelectedM2U?.code,
                        account: accSelectedM2U,
                    },
                },
            });
        }
    }

    const getAllAccounts = useCallback(() => {
        try {
            setLoadingData(true);
            if (accList?.length) {
                const newAccountList = accList.filter((account) => {
                    return (
                        account?.code &&
                        !(
                            account?.type === "D" &&
                            (account?.group === "0YD" || account?.group === "CCD")
                        )
                    );
                });

                setAccountList(newAccountList);
            }
        } catch (error) {
            // error when retrieving the data
        } finally {
            setLoadingData(false);
            RemittanceAnalytics.accountSelectionLoaded();
        }
    }, [route, accList]);

    useEffect(() => {
        getAllAccounts();
    }, [getAllAccounts]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <HeaderLabel>
                                    <Text>Select Account</Text>
                                </HeaderLabel>
                            }
                        />
                    }
                    useSafeArea
                >
                    <>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.container}
                        >
                            <View style={styles.instruction}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Select debiting account"
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.accountList}>
                                {loadingData && (
                                    <View style={styles.cardLoader}>
                                        <View style={styles.cardLoaderInner}>
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderTitle}
                                            />
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderAccount}
                                            />
                                            <Shimmer
                                                autoRun
                                                visible={false}
                                                style={styles.cardLoaderBalance}
                                            />
                                        </View>
                                    </View>
                                )}

                                {!loadingData &&
                                    accountList.map((account, index) => {
                                        return (
                                            <Account
                                                account={account}
                                                code={account?.code}
                                                key={`${account?.number}-${index}`}
                                                name={account?.name}
                                                number={account?.number.substring(0, 12)}
                                                amount={`RM ${account?.balance}`}
                                                onPress={handleSelectAccount}
                                                isSelected={account?.selected === true}
                                                type="casa"
                                            />
                                        );
                                    })}
                                <>
                                    <View style={styles.viewRowDescriberTwo}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={FADE_GREY}
                                            text={MAE_NOT_AVAILABLE}
                                        />
                                    </View>
                                </>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={!selectedAccount?.code}
                                fullWidth
                                borderRadius={25}
                                onPress={handleProceed}
                                testID="choose_account_continue"
                                backgroundColor={selectedAccount?.code ? YELLOW : DISABLED}
                                componentCenter={
                                    <Typo
                                        color={!selectedAccount?.code ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OverseasAccountsListScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    accountDescription: {
        paddingBottom: 27,
        paddingTop: 4,
    },
    accountList: {
        alignItems: "center",
        justifyContent: "center",
    },
    cardLoader: {
        paddingHorizontal: 24,
        width: "100%",
    },
    cardLoaderAccount: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 24,
        width: "40%",
    },
    cardLoaderBalance: {
        backgroundColor: GREY_100,
        height: 8,
        width: "30%",
    },
    cardLoaderInner: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        padding: 24,
        width: "100%",
    },
    cardLoaderTitle: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 8,
        width: "30%",
    },
    container: {
        flexDirection: "column",
        paddingBottom: 18,
    },
    instruction: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    viewRowDescriberTwo: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 0,
        marginLeft: 0,
        marginTop: 4,
        paddingHorizontal: 24,
    },
});

export default withModelContext(OverseasAccountsListScreen);
