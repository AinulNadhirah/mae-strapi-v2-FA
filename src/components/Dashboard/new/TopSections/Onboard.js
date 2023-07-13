import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";

import Loader from "@components/Dashboard/new/TopSections/Loader";
import SelectedAccount from "@components/Dashboard/new/TopSections/SelectedAccount";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { BLUE, QUARTZ, RHYTHM } from "@constants/colors";
import {
    SELECT_ACCOUNT_DASHBOARD_ERROR_DESC,
    SELECT_ACCOUNT_DASHBOARD_ERROR_TITLE,
    VIEW_ALL_ACCOUNT,
} from "@constants/strings";

import Assets from "@assets";

const Onboard = ({ data, navigation, isLoading, initialLoading }) => {
    const [initialShowBalance, setInitialShowBalance] = useState(null);
    const { getModel, updateModel } = useModelController();
    const {
        auth: { isPostLogin },
        wallet: { showBalanceDashboard },
    } = getModel(["auth", "wallet"]);

    const navigateToAccountsListing = () => {
        navigation.navigate("Maybank2u");
    };

    useEffect(() => {
        if (!_.isNull(initialShowBalance) && isPostLogin) {
            saveShowBalanceFlag(initialShowBalance);
        }
    }, [isPostLogin, initialShowBalance]);

    const onShowBalance = (showBalance) => {
        if (isPostLogin || !showBalance) {
            saveShowBalanceFlag(showBalance);
            setInitialShowBalance(null);
        } else {
            updateModel({
                ui: {
                    touchId: true,
                },
            });
            setInitialShowBalance(showBalance);
        }
    };

    const saveShowBalanceFlag = (showBalanceDashboard) => {
        updateModel({
            wallet: {
                showBalanceDashboard,
            },
        });

        //update AsyncStorage
        AsyncStorage.setItem("showBalanceDashboard", `${showBalanceDashboard}`);
    };

    const PrimaryAccount = useCallback(() => {
        return (
            <>
                <SelectedAccount
                    data={data}
                    showBalance={showBalanceDashboard}
                    onShowBalance={onShowBalance}
                    navigation={navigation}
                />
                <SpaceFiller height={24} />
                <TouchableOpacity onPress={navigateToAccountsListing}>
                    <Typo
                        text={VIEW_ALL_ACCOUNT}
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                        numberOfLines={1}
                        color={BLUE}
                    />
                </TouchableOpacity>
            </>
        );
    }, [data, showBalanceDashboard, isPostLogin]);

    const NoData = () => {
        return (
            <>
                <Image source={Assets.dashboard.topSection.noNetwork} />
                <SpaceFiller height={8} />
                <Typo
                    text={SELECT_ACCOUNT_DASHBOARD_ERROR_TITLE}
                    fontWeight="600"
                    fontSize={18}
                    lineHeight={20}
                    textAlign="left"
                    numberOfLines={1}
                    color={QUARTZ}
                />
                <SpaceFiller height={4} />
                <Typo
                    text={SELECT_ACCOUNT_DASHBOARD_ERROR_DESC}
                    fontWeight="400"
                    fontSize={12}
                    lineHeight={18}
                    textAlign="left"
                    numberOfLines={1}
                    color={RHYTHM}
                />
                <SpaceFiller height={36} />
            </>
        );
    };

    return isLoading || initialLoading ? <Loader /> : data ? <PrimaryAccount /> : <NoData />;
};

Onboard.propTypes = {
    data: PropTypes.object,
    navigation: PropTypes.object,
    isLoading: PropTypes.bool,
    initialLoading: PropTypes.bool,
};

export default Onboard;
