import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { BANKINGV2_MODULE } from "@navigation/navigationConstant";

import MainBalance from "@components/Dashboard/new/TopSections/MainBalance";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { AUBERGINE, RHYTHM } from "@constants/colors";

import { formateAccountNumber } from "@utils/dataModel/utilityPartial.3";

const SelectedAccount = ({ data, showBalance, onShowBalance, navigation }) => {
    const balance = data?.value;
    const name = showBalance ? data?.name : "Account";
    const number = showBalance ? formateAccountNumber(data?.number, 12) : "**** **** ****";

    const onPressAccount = () => {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: "AccountDetailsScreen",
            params: {
                prevData: data,
                tabName: "Accounts",
                isAccountSuspended: data?.statusCode === "06",
                isJointAccount: data?.jointAccount,
                fromScreen: "Dashboard",
            },
        });
    };
    return (
        <TouchableOpacity
            style={styles.contentContainer}
            onPress={onPressAccount}
            disabled={!showBalance}
        >
            <Typo
                text={name}
                fontWeight="600"
                fontSize={20}
                lineHeight={20}
                textAlign="left"
                numberOfLines={1}
                color={AUBERGINE}
            />
            <SpaceFiller height={4} />
            <Typo
                text={number}
                fontWeight="400"
                fontSize={14}
                lineHeight={18}
                textAlign="left"
                numberOfLines={1}
                color={RHYTHM}
            />
            <SpaceFiller height={12} />
            <MainBalance
                showBalance={showBalance}
                balance={balance}
                onPressVisible={onShowBalance}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: "center",
    },
});

SelectedAccount.propTypes = {
    data: PropTypes.object,
    showBalance: PropTypes.bool,
    onShowBalance: PropTypes.func,
    navigation: PropTypes.object,
};

export default SelectedAccount;
