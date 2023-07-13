import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

import { DUITNOW_CONFIRMATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { bankingGetDataMayaM2u } from "@services";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY_100,
    GREY_200,
    TRANSPARENT,
} from "@constants/colors";
import * as Strings from "@constants/strings";
import {
    DUITNOW,
    FA_SETTINGS_DUITNOW_REGISTRATION_LINKACCOUNT,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT,
    SELECT_ACCOUNT,
} from "@constants/strings";

import { generateHaptic } from "@utils";

import Images from "@assets";

const OVERLAY = "rgba(0, 0, 0, 0.4)";
const { width } = Dimensions.get("window");

const Card = ({ number, code, type, children, isSelected, item, onPress }) => {
    const CARD_IMAGE = type === "casa" ? Images.cardbgOne : Images.onboardingMaeBg;

    function handlePress() {
        if (number && code) {
            onPress({
                no: number,
                code,
                item,
            });
        }
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.cardButton}>
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
                                source={Images.whiteTick}
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
    number: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
    item: PropTypes.any,
};

const Account = ({ name, number, amount, data, ...props }) => (
    <Card name={name} number={number} item={data} {...props}>
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
                text={number}
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
    name: PropTypes.string,
    number: PropTypes.string,
    amount: PropTypes.string,
    noMae: PropTypes.bool,
    data: PropTypes.any,
};

function DuitnowSelectAccount({ navigation, route }) {
    const [selectedAccount, setSelectedAccount] = useState({
        no: null,
        code: "",
        item: [],
    });
    const [maeAccount, setMaeAccount] = useState(null);
    const [accountList, setAccountList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    function handleClose() {
        navigation.goBack();
    }
    async function handleProceed() {
        if (!loading && selectedAccount) {
            setLoading(false);
            setSelectedAccount({
                no: "",
                code: "",
                item: [],
            });
            const params = {
                accountInfo: selectedAccount.item,
                proxyDetails: route?.params?.proxyDetails,
                type: route?.params?.proxyDetails?.type,
            };
            navigation.navigate(DUITNOW_CONFIRMATION, { proxyDetails: params });
        }
    }

    function handleSelectAccount({ no, code, item }) {
        if (!loading) {
            generateHaptic("selection", true);

            setSelectedAccount({
                no,
                code,
                item,
            });
        }
    }
    const getAllAccounts = useCallback(async () => {
        try {
            setLoadingData(true);

            const path = "/summary?type=A";

            const response = await bankingGetDataMayaM2u(path, false);

            if (response && response.data && response.data.code === 0) {
                const { accountListings } = response.data.result;

                if (accountListings && accountListings.length) {
                    const isPrimary = accountListings.find((account) => account.primary);
                    const mae = accountListings.find(
                        (account) =>
                            (account.group === "0YD" || account.group === "CCD") &&
                            account.type === "D"
                    );
                    const withoutMae = mae
                        ? accountListings.filter((account) => account.number !== mae.number)
                        : accountListings;

                    setAccountList(withoutMae);

                    if (mae) {
                        // set mae by default on onboarding
                        setMaeAccount(mae);

                        if (!isPrimary) {
                            setSelectedAccount({
                                no: mae.number.substring(0, 12),
                                code: mae.code,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            // error when retrieving the data
        } finally {
            setLoadingData(false);
        }
    }, [route]);

    useEffect(() => {
        getAllAccounts();
    }, [getAllAccounts]);

    const analyticScreenName = useMemo(
        () =>
            route?.params?.proxyDetails?.type === SELECT_ACCOUNT
                ? FA_SETTINGS_DUITNOW_REGISTRATION_LINKACCOUNT
                : FA_SETTINGS_DUITNOW_SWITCHACCOUNT,
        [route?.params?.proxyDetails?.type]
    );

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={YELLOW}
                        headerCenterElement={
                            <Typo text={DUITNOW} fontWeight={600} fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleClose} />}
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
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={30}
                                style={styles.label}
                                text={Strings.DUITNOW_LINKTEXT}
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

                            {!loadingData && maeAccount && (
                                <Account
                                    code={maeAccount.code}
                                    type="mae"
                                    name={maeAccount.name}
                                    number={maeAccount.number.substring(0, 12)}
                                    amount={`RM ${maeAccount.balance}`}
                                    onPress={handleSelectAccount}
                                    account={maeAccount}
                                    data={maeAccount}
                                    isSelected={
                                        selectedAccount.no === maeAccount.number.substring(0, 12)
                                    }
                                />
                            )}

                            {!loadingData &&
                                accountList.map((account, index) => (
                                    <Account
                                        code={account.code}
                                        key={`${account.number}-${index}`}
                                        name={account.name}
                                        number={account.number.substring(0, 12)}
                                        amount={`RM ${account.balance}`}
                                        onPress={handleSelectAccount}
                                        account={account}
                                        data={account}
                                        isSelected={
                                            selectedAccount.no === account.number.substring(0, 12)
                                        }
                                        type="casa"
                                    />
                                ))}
                        </View>
                    </ScrollView>

                    <FixedActionContainer>
                        <ActionButton
                            disabled={!selectedAccount?.code}
                            isLoading={loading}
                            fullWidth
                            borderRadius={25}
                            onPress={handleProceed}
                            backgroundColor={!selectedAccount?.code ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    color={!selectedAccount?.code ? DISABLED_TEXT : BLACK}
                                    text={route.params?.proceedTitle ?? "Continue"}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

DuitnowSelectAccount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
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
    cardBg: {
        backgroundColor: TRANSPARENT,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        left: -24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    cardButton: {
        paddingBottom: 24,
        paddingHorizontal: 24,
        width,
    },
    cardChildContainer: {
        padding: 16,
    },
    cardContainer: {
        position: "relative",
        width: "100%",
    },
    cardInner: {
        borderRadius: 8,
        height: 110,
        overflow: "hidden",
        width: "100%",
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
        paddingVertical: 18,
    },
    instruction: {
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 40,
        paddingTop: 8,
    },
    selectedCheck: { height: 38, width: 38 },
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
});

export default DuitnowSelectAccount;
