import { AccordionList } from "accordion-collapse-react-native";
import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";

import { BLACK, GREY, WHITE } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utility";

import assets from "@assets";

import { BANKINGV2_MODULE, MAYBANK2U } from "../../../navigation/navigationConstant";

const WealthOverview = ({ data, navigation, isLoading }) => {
    function responseMapping(response) {
        const mappedData = [
            {
                id: 1,
                title: "My Assets",
                colorCode: "#005fac",
                totalAmount: response?.assets,
                body: [
                    { name: "Accounts", amount: response?.casaBal },
                    { name: "Fixed Deposits", amount: response?.fdBal },
                    { name: "Investments", amount: response?.investment },
                    { name: "Prepaid Cards", amount: response?.prepaidCardsBal },
                ],
            },
            {
                id: 2,
                title: "My Liabilities",
                colorCode: "#F5A52F",
                totalAmount: response?.liabilities,
                body: [
                    { name: "Loans", amount: response?.loansBal },
                    { name: "Cards", amount: response?.cardsBal },
                ],
            },
        ];

        const cleanUpData = [];
        mappedData.forEach((item) => {
            const cleanupBody = item.body.filter(
                (itembody) => itembody.amount !== null && itembody.amount !== undefined
            );

            const newItem = { ...item, body: cleanupBody };
            cleanUpData.push(newItem);
        });

        return cleanUpData;
    }

    function renderHeader(item, _, isExpanded) {
        const totalAmountSign = Math.sign(item?.totalAmount);
        const absoluteTotalAmount = Math.abs(item?.totalAmount);

        const displayText = (() => {
            if (item?.totalAmount === null || item?.totalAmount === undefined) return "";

            const valueSign = totalAmountSign === -1 ? "-" : "";

            return `${valueSign}RM ${commaAdder(absoluteTotalAmount?.toFixed(2))}`;
        })();
        const Wrapper = item?.totalAmount ? View : TouchableOpacity;
        return (
            <Wrapper style={styles.headerContainer} onPress={() => navigateToEmptyScreen(item?.id)}>
                <View style={styles.subHeaderContainer}>
                    <View style={styles.upperHeaderSubcontainer}>
                        <View style={styles.colorDot(item?.colorCode)} />
                        <Typo textAlign="left" text={item?.title} fontSize={14} fontWeight="600" />
                    </View>
                    <Typo
                        text={displayText}
                        fontWeight="600"
                        textAlign="left"
                        fontSize={16}
                        lineHeight={20}
                        style={styles.amount}
                    />
                </View>
                <Image
                    source={isExpanded ? assets.grayUpArrow : assets.grayDownArrow}
                    style={styles.arrowExpand}
                />
            </Wrapper>
        );
    }

    function onPressContent(itemName) {
        const index = (() => {
            switch (itemName) {
                case "Accounts":
                    return 0;
                case "Cards":
                case "Prepaid Cards":
                    return 1;
                case "Fixed Deposits":
                    return 2;
                case "Loans":
                    return 3;
                case "Investments":
                    return 4;
                default:
                    return 0;
            }
        })();
        navigation.navigate({
            name: MAYBANK2U,
            params: {
                index: index,
            },
        });
    }

    function navigateToEmptyScreen(id) {
        const params = (() => {
            if (id === 1) {
                return {
                    title: "No Assets Available",
                    subtitle: "You don’t have any balance or asset accounts at the moment.",
                };
            } else {
                return {
                    title: "No Liabilities Available",
                    subtitle: "You don’t have any balance or liabilities accounts at the moment.",
                };
            }
        })();
        navigation.navigate(BANKINGV2_MODULE, {
            screen: "ZeroAssetliabilitiesScreen",
            params,
        });
    }

    function renderContent(item) {
        const data = item?.body;

        return data?.map((bodyItem, index) => {
            const amountSign = Math.sign(bodyItem?.amount);
            const absoluteSign = Math.abs(bodyItem?.amount);

            const displayText = (() => {
                if (item?.totalAmount === null || item?.totalAmount === undefined) return "";

                const valueSign = amountSign === -1 ? "-" : "";

                return `${valueSign}RM ${commaAdder(absoluteSign?.toFixed(2))}`;
            })();
            return (
                <TouchableOpacity
                    style={styles.bodyContainer}
                    key={`${bodyItem?.name}-${index}`}
                    onPress={() => onPressContent(bodyItem?.name)}
                >
                    <View style={styles.bodyLeftContainer}>
                        <Typo
                            text={bodyItem?.name}
                            textAlign="left"
                            fontSize={12}
                            fontWeight="600"
                        />
                        <Typo
                            text={
                                (bodyItem?.amount !== null || bodyItem?.amount !== undefined) &&
                                displayText
                            }
                            textAlign="left"
                            style={styles.bodyAmount}
                            fontWeight="600"
                            fontSize={12}
                        />
                    </View>
                    <Image source={assets.blackArrowRight} style={styles.arrowRight} />
                </TouchableOpacity>
            );
        });
    }

    if (isLoading) {
        <ScreenLoader showLoader={isLoading} />;
    }
    return (
        <AccordionList list={responseMapping(data)} header={renderHeader} body={renderContent} />
    );
};

const styles = StyleSheet.create({
    amount: {
        paddingTop: 14,
    },
    arrowExpand: {
        alignSelf: "center",
        height: 15,
        tintColor: BLACK,
        width: 15,
    },
    arrowRight: {
        alignSelf: "center",
        height: 15,
        width: 15,
    },
    bodyAmount: {
        paddingTop: 20,
    },
    bodyContainer: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    bodyLeftContainer: {
        flexDirection: "column",
    },
    colorDot: (colorCode) => ({
        backgroundColor: colorCode,
        borderRadius: 7,
        height: 14,
        marginRight: 16,
        width: 14,
    }),
    headerContainer: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    subHeaderContainer: {
        flexDirection: "column",
    },
    upperHeaderSubcontainer: {
        flexDirection: "row",
    },
});

WealthOverview.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool,
    navigation: PropTypes.object,
};

export default WealthOverview;
