import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { GREEN, RED } from "@constants/colors";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const TransactionDetails = ({ navigation, route }) => {
    const { createdDate, totalAmount, salesCharge, statusCd, pqRefNo, gstCharge, transType } =
        route?.params?.details;

    function onPressBack() {
        navigation.goBack();
    }

    const DETAILS = [
        {
            label: "Sales charge",
            value: salesCharge ? `RM ${numberWithCommas(Number(salesCharge).toFixed(2))}` : null,
        },
        {
            label: route?.params?.govCharge ?? "",
            value: gstCharge ? `RM ${numberWithCommas(gstCharge.toFixed(2))}` : null,
        },
        {
            label: "Status",
            value: statusCd,
        },
        {
            label: "Reference ID",
            value: pqRefNo,
        },
    ];

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onPressBack} />} />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo text={createdDate} fontWeight="400" fontSize={14} />
                    <Typo
                        text={route?.params?.title}
                        fontWeight="700"
                        fontSize={20}
                        lineHeight={25}
                    />
                    <Typo
                        text={
                            totalAmount
                                ? `RM ${numberWithCommas(Number(totalAmount).toFixed(2))}`
                                : ""
                        }
                        fontWeight="700"
                        fontSize={20}
                        lineHeight={35}
                        color={transType === "02" ? RED : GREEN}
                        style={styles.amount}
                    />
                    {DETAILS?.filter(
                        (item) => item?.value !== null && item?.value !== undefined
                    )?.map((item) => {
                        return (
                            <LabelValue label={item?.label} value={item?.value} key={item?.label} />
                        );
                    })}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

TransactionDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo
                text={label}
                fontSize={14}
                fontWeight="400"
                style={styles.width40}
                textAlign="left"
            />
            <Typo
                text={value}
                fontSize={14}
                fontWeight="600"
                style={styles.width60}
                textAlign="right"
            />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    amount: { paddingBottom: 30 },
    container: {
        paddingHorizontal: 24,
    },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    width40: { width: "40%" },
    width60: { width: "60%" },
});

export default TransactionDetails;
