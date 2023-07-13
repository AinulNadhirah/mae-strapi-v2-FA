import { useFocusEffect } from "@react-navigation/core";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import {
    BANKINGV2_MODULE,
    WEALTH_ERROR_HANDLING_SCREEN,
    WEALTH_PRODUCT_DETAILS_SCREEN,
    WEALTH_VIEW_TRANSACTION,
} from "@navigation/navigationConstant";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import InvestmentDetailScreenTemplate from "@components/ScreenTemplates/InvestmentDetailScreenTemplate";
import Typo from "@components/Text";

import { getDigitalWealthModule } from "@services";
import { GABankingWealth } from "@services/analytics/analyticsBanking";

import { GREEN, RED } from "@constants/colors";

import { floatWithCommas, formateAccountNumber } from "@utils/dataModel/utilityPartial.3";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const WealthProductDetailsScreen = ({ route, navigation }) => {
    const productType = route.params?.item?.productType;
    const accountNumber = route.params?.item?.number;
    const [data, setData] = useState(null);
    const [accountData, setAccountData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [disclaimer, setDisclaimer] = useState("");

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.refreshRequired) {
                fetchDetails();
            }
        }, [fetchDetails, route.params?.refreshRequired])
    );

    const fetchDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const subUrl =
                "/getAccountDetails" + "?productType=" + productType + "&acctNos=" + accountNumber;

            const response = await getDigitalWealthModule(subUrl, true);

            if (response?.maintenance) {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    params: {
                        error: "ScheduledMaintenance",
                    },
                });
                return;
            }

            const responseData = response?.data;
            setData(responseData);

            const accountData = dataMapping(responseData);
            setAccountData(accountData);
            setDisclaimer(disclaimerText(responseData.investmentType));
            if (accountData.length) {
                GABankingWealth.viewScreenWealthCardDetails(
                    accountData[0].key,
                    responseData.investmentType
                );
            }
        } catch (error) {
            ErrorLogger(error);
            if (error?.status === "nonetwork") {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    error: "NoConnection",
                    fromPage: WEALTH_PRODUCT_DETAILS_SCREEN,
                });
            } else {
                navigation.replace(WEALTH_ERROR_HANDLING_SCREEN, {
                    params: {
                        error: "TechnicalError",
                    },
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [accountNumber, dataMapping, navigation, productType]);

    //Transaction History
    const showTransaction = (() => {
        switch (data?.investmentType) {
            case "SL":
            case "G":
            case "IG":
                return true;
            default:
                return false;
        }
    })();

    const showAsOfDate = (() => {
        return !(
            data?.investmentType === "SL" ||
            data?.investmentType === "G" ||
            data?.investmentType === "IG"
        );
    })();

    const disclaimerText = (investmentType) => {
        if (investmentType === "S") {
            return "1. For portfolios with foreign shares, Market Value and Unrealised Gains/Losses are estimated based on an average of Maybank’s Buying and Selling.\n2. Transferred shares are not included in the calculation of Market Value and Unrealised Gains/Losses. \n3. Foreign Shares without Unrealised Gains/Losses are not included in the calculation of Market Value. \n4. Maybank Group and its officers shall not be liable for any and all liability for loss, damage, or costs howsoever arising, including but not limited to loss of profits, that may result directly or indirectly for your use of any of the electronic trading system.";
        } else {
            return null;
        }
    };

    const decimalFormatting = (value, decimalFormat) => {
        if (typeof value === "number") {
            return value.toFixed(decimalFormat);
        }
        return value;
    };

    const dataMapping = useCallback(
        (responseData) => {
            if (responseData?.investmentType === "G" || responseData?.investmentType === "SL") {
                return [
                    {
                        details: [
                            {
                                name: "Total Units",
                                value: `${floatWithCommas(responseData?.totalUnits)} g`,
                            },
                        ],
                    },
                ];
            } else if (responseData?.investmentType === "IG") {
                const resultDataDisplay = responseData.data[0];
                return [
                    {
                        details: [
                            {
                                name: "Grand Total",
                                value: `${resultDataDisplay?.grandTotal}`,
                            },
                            {
                                name: "Total Purchased",
                                value: `RM ${Numeral(resultDataDisplay?.totalPurchased).format(
                                    "0, 0.00"
                                )}`,
                            },
                            {
                                name: "Average Purchase Price",
                                value: `RM ${Numeral(resultDataDisplay?.avgBuyPrice).format(
                                    "0, 0.00"
                                )} / g`,
                            },
                            {
                                name: "Unrealised Gains/Losses",
                                value: `${resultDataDisplay?.unrealisedGainLoss}`,
                                showPlusMinusSign: true,
                                isString: false,
                                allowOtherChar: "%",
                                decimalFormatValue: 2,
                                zeroGreenColor: true,
                            },
                            {
                                name: "Current Value",
                                value: `RM ${Numeral(resultDataDisplay?.currentMarketValue).format(
                                    "0, 0.00"
                                )}`,
                            },
                        ],
                    },
                ];
            } else {
                return mapAccountData(responseData?.data, responseData?.investmentType);
            }
        },
        [mapAccountData]
    );

    const mapAccountData = useCallback((accountData, investmentType) => {
        switch (investmentType) {
            case "S":
                return accountData.map((item) => {
                    return {
                        key: item?.stockCode + " " + item?.stockName,
                        details: [
                            {
                                name: "Exchange",
                                value: item?.exchange,
                            },
                            {
                                name: "Stock Quantity",
                                value: floatWithCommas(item?.quantity),
                            },
                            {
                                name: "Last Price",
                                value: decimalFormatting(item?.lastPrice, 3),
                            },
                            {
                                name: "Currency",
                                value: item?.currency,
                            },
                            {
                                name: "Average Buy Price",
                                value: decimalFormatting(item?.averageBuyPrice, 3),
                            },
                            {
                                name: "Unrealised Gains/Losses in RM",
                                value: item?.unrealisedGainLossRm,
                                isString: false,
                                showPlusMinusSign: true,
                            },
                        ],
                    };
                });
            case "R":
                return accountData.map((item) => {
                    return {
                        key: item?.bondName,
                        details: [
                            {
                                name: "Bond Currency",
                                value: item?.currency,
                            },
                            {
                                name: "Nominal Value",
                                value: `${Numeral(item?.nominalValue).format("0,0.00")}`,
                            },
                            {
                                name: "Market Value in RM",
                                value: `${Numeral(item?.marketValueRm).format("0,0.00")}`,
                            },
                        ],
                    };
                });
            case "D":
                return accountData.map((item) => {
                    return {
                        key: item?.dealNumber + " - " + item?.investmentCurrency,
                        details: [
                            {
                                name: "Investment Currency",
                                value: item?.investmentCurrency,
                            },
                            {
                                name: "Amount",
                                value: `${Numeral(item?.amount).format("0,0.00")}`,
                            },
                            {
                                name: "RM Equivalent",
                                value: `${Numeral(item?.equivalentAmountRm).format("0,0.00")}`,
                            },
                            {
                                name: "Alternate Currency",
                                value: item?.alternateCurrency,
                            },
                            {
                                name: "Transaction Date",
                                value: item?.transactionDate,
                            },
                            {
                                name: "Value Date",
                                value: item?.valueDate,
                            },
                            {
                                name: "Fixing Date",
                                value: item?.fixingDate,
                            },
                            {
                                name: "Maturity Date",
                                value: item?.maturityDate,
                            },
                        ],
                    };
                });
            case "SI":
                return accountData.map((item) => {
                    return {
                        key: item?.fundName,
                        details: [
                            {
                                name: "Investment Amount",
                                value: `${item?.investmentAmount}`,
                            },
                            {
                                name: "RM Equivalent",
                                value: `${Numeral(item?.RMequivalent).format("0,0.00")}`,
                            },
                            {
                                name: "Coupon",
                                value: item?.coupon,
                            },
                            {
                                name: "Trade Date",
                                value: item?.tradeDate,
                            },
                            {
                                name: "Maturity Date",
                                value: item?.maturityDate,
                            },
                        ],
                    };
                });
            case "U":
                return accountData.map((item) => {
                    return {
                        key: item?.fundName,
                        details: [
                            {
                                name: "Unit Held",
                                value: `${Numeral(item?.unitHeld).format("0, 0.00")}`,
                            },
                            {
                                name: "Currency",
                                value: item?.currency,
                            },
                            {
                                name: "Latest NAV per unit",
                                value: decimalFormatting(item?.latestNav, 4),
                            },
                            {
                                name: "Current Value**",
                                value: `${Numeral(item?.currentVal).format("0, 0.00")}`,
                            },
                            {
                                name: "Current Value** in RM",
                                value: `${Numeral(item?.currentValRm).format("0, 0.00")}`,
                            },
                            {
                                name: "Unrealised Gains/Losses in RM",
                                value: item?.unrealisedGainLoss,
                                isString: false,
                                showPlusMinusSign: true,
                            },
                        ],
                    };
                });
            case "MMD":
            case "CCMD":
            case "CCMDFC":
            case "FCA":
                return accountData.map((item) => {
                    return {
                        key: item?.dealNumber + " - " + item?.currency,
                        details: [
                            {
                                name: "Currency",
                                value: item?.currency,
                            },
                            {
                                name: "Amount",
                                value: item?.amount,
                            },
                            {
                                name: "Interest / Profit (P.A)",
                                value: item?.interestRate,
                            },
                            {
                                name: "Term",
                                value: item?.term,
                            },
                            {
                                name: "Maturity Date",
                                value: item?.maturityDate,
                            },
                        ],
                    };
                });
            default:
        }
    }, []);

    function onPressViewTransaction() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: WEALTH_VIEW_TRANSACTION,
            params: {
                navigation,
                accountNumber: data?.number,
                accountType: data?.investmentType,
            },
        });
    }

    function navigateBack() {
        navigation.goBack();
    }

    const showBalanceAsterisk = (() => {
        return !(
            data?.investmentType === "G" ||
            data?.investmentType === "SL" ||
            data?.investmentType === "IG"
        );
    })();

    const logEventFunc = (index) => {
        GABankingWealth.viewScreenWealthCardDetails(accountData[index].key, data?.investmentType);
    };

    // zero balance amount screen for unit trust
    if (!data?.total && data?.investmentType === "U") {
        return (
            <EmptyUnitTrustDetails
                onCloseButtonPressed={navigateBack}
                accountName={data?.name}
                accountNumber={data?.number}
                accountBalance={data?.total}
                description="Transaction History Unavailable"
                imageSrc={Assets.illustrationEmptyState}
            />
        );
    } else if (accountData) {
        return (
            <InvestmentDetailScreenTemplate
                accountBalance={data?.total}
                showBalanceAsterisk={showBalanceAsterisk}
                accountName={data?.name}
                accountNumber={data?.number}
                onHeaderCloseButtonPressed={navigateBack}
                isLoading={isLoading}
                accountData={accountData}
                note={data?.note}
                disclaimer={disclaimer}
                asOfDate={showAsOfDate && data?.lastModifiedDate}
                showTransaction={showTransaction}
                onPressViewTransaction={showTransaction && onPressViewTransaction}
                logEventFunc={logEventFunc}
            />
        );
    } else {
        // remove after all product type handled
        return null;
    }
};

WealthProductDetailsScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const EmptyUnitTrustDetails = ({
    onCloseButtonPressed,
    accountName,
    accountNumber,
    accountBalance,
    description,
    imageSrc,
}) => {
    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onCloseButtonPressed} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <View>
                        <Typo text={accountName} fontSize={16} lineHeight={19} fontWeight="600" />
                        <View style={styles.headerTextContainer}>
                            <Typo
                                text={formateAccountNumber(accountNumber, 12)}
                                fontSize={14}
                                lineHeight={18}
                            />
                        </View>
                        <Typo
                            text={`RM ${Numeral(accountBalance).format("0,0.00")}`}
                            fontSize={18}
                            fontWeight="bold"
                            lineHeight={32}
                            color={accountBalance > 0 ? GREEN : RED}
                            style={styles.amount}
                        />
                        <Typo
                            text={description}
                            fontSize={16}
                            lineHeight={19}
                            fontWeight="600"
                            style={styles.description}
                        />
                    </View>
                    <ImageBackground style={styles.image} source={imageSrc} />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

EmptyUnitTrustDetails.propTypes = {
    onCloseButtonPressed: PropTypes.func,
    accountName: PropTypes.string,
    accountNumber: PropTypes.number,
    accountBalance: PropTypes.number,
    description: PropTypes.string,
    imageSrc: PropTypes.string,
};

const styles = StyleSheet.create({
    amount: {
        paddingBottom: 25,
    },
    container: {
        height: "100%",
        justifyContent: "space-between",
        width: "100%",
    },
    headerTextContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
    },
    image: {
        height: 300,
        resizeMode: "cover",
        width: "100%",
    },
});

export default WealthProductDetailsScreen;
