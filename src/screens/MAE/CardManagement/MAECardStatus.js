import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef } from "react";
import { Dimensions, StyleSheet, Image, View, ScrollView } from "react-native";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { checkS2WEarnedChances } from "@services";

import { YELLOW, FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

function MAECardStatus({ route, navigation }) {
    const status = route?.params?.status ?? Strings.FAIL_STATUS;
    const headerText = route?.params?.headerText ?? Strings.PAYMENT_FAIL;
    const detailsArray = route?.params?.detailsArray ?? null;
    const serverError = route?.params?.serverError ?? "";
    const isS2uFlow = route?.params?.isS2uFlow;

    const { getModel, updateModel } = useModelController();
    const { redirectFrom } = route?.params;
    const timer = useRef(null);

    useEffect(() => {
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // checkForEarnedChances(isShowS2w);

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled) {
            const isSuccess = status === "success";

            if (isSuccess && !isS2uFlow) {
                updateWalletBalance(updateModel);
            }
        }

        return () => {
            timer.current && clearTimeout(timer.current);
        };
    }, []);

    /**
     * S2W chances earned checkers
     */
    const checkForEarnedChances = useCallback(
        (isShowS2w) => {
            // check if campaign is running and check if it matched the list
            // delayed the check a lil bit to let user see the acknowledge screen
            timer.current && clearTimeout(timer.current);

            timer.current = setTimeout(async () => {
                const {
                    misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                    s2w: { txnTypeList },
                } = getModel(["misc", "s2w"]);

                if (
                    (isCampaignPeriod || isTapTasticReady) &&
                    txnTypeList.includes("MAECARDAPPLY") &&
                    isShowS2w
                ) {
                    try {
                        const params = {
                            txnType: "MAECARDAPPLY",
                        };

                        // const response = {
                        //     data: {
                        //         displayPopup: true,
                        //         chance: 1,
                        //     },
                        // };
                        const response = await checkS2WEarnedChances(params);

                        if (response) {
                            const { displayPopup, chance } = response.data;
                            console.log("displayPopup", displayPopup, "chance", chance);

                            if (displayPopup) {
                                // go to earned chances screen
                                navigation.push("TabNavigator", {
                                    screen: "CampaignChancesEarned",
                                    params: {
                                        chances: chance,
                                        isTapTasticReady,
                                        tapTasticType,
                                    },
                                });
                            }
                        }
                    } catch (error) {
                        // can't do nothing
                    }
                }
            }, 400);
        },
        [navigation, getModel]
    );

    const onDoneTap = () => {
        console.log("[MAECardStatus] >> [onDoneTap]");

        const onDone = route.params?.onDone ?? null;
        if (onDone) {
            onDone();
        } else {
            navigation.goBack();
        }
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={<React.Fragment />}
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView style={Style.scrollViewCls} showsVerticalScrollIndicator={false}>
                        {/* Image Block */}
                        <View style={Style.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={Style.statusIconCls}
                                source={
                                    status == "failure" ? Assets.icFailedIcon : Assets.icTickNew
                                }
                            />
                        </View>

                        {/* Desc */}
                        <Typo
                            fontSize={20}
                            fontWeight={redirectFrom === "MAECardPurchaseLimit" ? "400" : "300"}
                            lineHeight={28}
                            textAlign="left"
                            text={headerText}
                            style={Style.descTextCls}
                        />

                        {/* Server Error */}
                        <Typo
                            fontSize={redirectFrom === "MAECardPurchaseLimit" ? 14 : 12}
                            lineHeight={redirectFrom === "MAECardPurchaseLimit" ? 20 : 18}
                            textAlign="left"
                            color={FADE_GREY}
                            ellipsizeMode="tail"
                            numberOfLines={3}
                            text={serverError}
                        />

                        {/* Status Details */}
                        {detailsArray && (
                            <View style={Style.detailsViewCls}>
                                {detailsArray.map((prop, key) => {
                                    return (
                                        <View style={Style.detailsBlockCls} key={key}>
                                            <Typo
                                                fontSize={12}
                                                lineHeight={18}
                                                letterSpacing={0}
                                                text={prop.key}
                                            />

                                            <Typo
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="right"
                                                text={prop.value}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={Style.bottomBtnContCls}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={Strings.DONE}
                                    />
                                }
                                onPress={onDoneTap}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

MAECardStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    descTextCls: {
        marginBottom: 5,
    },

    detailsBlockCls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    detailsViewCls: {
        marginTop: 30,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    statusIconCls: {
        height: 52,
        width: 57,
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 20) / 100,
        width: "100%",
    },
});

export default MAECardStatus;
