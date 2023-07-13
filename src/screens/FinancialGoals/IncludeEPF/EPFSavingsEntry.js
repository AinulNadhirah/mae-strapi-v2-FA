import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import {
    BANKINGV2_MODULE,
    CURRENT_EPF_SAVING,
    FINANCIAL_GOAL_OVERVIEW,
    GOAL_SIMULATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getCommonParam } from "@services";

import { CONTINUE, INCLUDE_EPF_SAVING } from "@constants/strings";

import Images from "@assets";

export default function EPFSavingsEntry({ navigation, route }) {
    const [isLoading, setIsLoading] = useState(false);

    const epfSubtitle = `Your EPF savings should fit into your overall investment strategy. By including your EPF information into the simulation, we can recommend a comprehensive overall retirement plan.\n`;
    const [epfDescription, setEpfDescription] =
        useState(`Kindly take note that we will not make any withdrawals from your EPF account, and these information are used solely for calculation purposes. The calculation assumes an average dividend of % per year.
\nIf you foresee a change in employment or a salary increment in future, you will be able to update your EPF information at any given time.`);

    useEffect(() => {
        getEPF();
    }, [getEPF]);

    const getEPF = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getCommonParam("EPF_R", false);
            if (response?.data) {
                //setEpfReturnRate(response?.data?.paramValue);
                setEpfDescription(`Kindly take note that we will not make any withdrawals from your EPF account, and these information are used solely for calculation purposes. The calculation assumes an average dividend of ${
                    response?.data[0]?.paramValue
                        ? numeral(response?.data[0]?.paramValue * 100).format("0,0.00")
                        : 0
                }% per year.
                \nIf you foresee a change in employment or a salary increment in future, you will be able to update your EPF information at any given time.`);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                showErrorToast({ message: "Something went wrong, please try again" });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message });
        }
    }, []);

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCrossButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen:
                route?.params?.from === GOAL_SIMULATION ? GOAL_SIMULATION : FINANCIAL_GOAL_OVERVIEW,
        });
    }

    const CloseButton = () => (
        <TouchableOpacity onPress={onCrossButtonPress} style={styles.closeButton}>
            <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
        </TouchableOpacity>
    );

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CURRENT_EPF_SAVING,
            params: {
                ...route?.params,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="image" analyticScreenName="FinancialGoals_Retirement_EPF">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={INCLUDE_EPF_SAVING}
                            />
                        }
                        headerLeftElement={
                            <HeaderBackButton onPress={onBackButtonPress} testID="go_back" />
                        }
                        headerRightElement={<CloseButton />}
                    />
                }
                useSafeArea
                paddingBottom={0}
                paddingHorizontal={0}
            >
                {isLoading && (
                    <View style={styles.loader}>
                        <ScreenLoader showLoader />
                    </View>
                )}
                {!isLoading && (
                    <>
                        <View style={styles.viewFlexStyles}>
                            <View>
                                <Image source={Images.kwsp} style={styles.epfImage} />

                                <SpaceFiller height={24} />
                                <Typo
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={22}
                                    textAlign="left"
                                    text={epfSubtitle}
                                />

                                <Typo
                                    fontWeight="400"
                                    fontSize={14}
                                    lineHeight={22}
                                    textAlign="left"
                                    text={epfDescription}
                                />
                            </View>
                        </View>
                        <FixedActionContainer>
                            <ActionButton
                                onPress={onPressContinue}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={CONTINUE}
                                    />
                                }
                                fullWidth
                            />
                        </FixedActionContainer>
                    </>
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}

EPFSavingsEntry.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
    },
    epfImage: {
        alignSelf: "center",
        height: 64,
        marginBottom: 20,
        width: 64,
    },
    loader: {
        alignSelf: "center",
        flex: 1,
        justifyContent: "center",
    },
    viewFlexStyles: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24 },
});
