import { useNavigation } from "@react-navigation/core";
import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";

// import { ApplePayButton } from "react-native-payments";
import {
    APPLE_PAY_ACK,
    PROMOS_MODULE,
    PROMO_DETAILS,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { YELLOW } from "@constants/colors";
import { DONE, APPLE_PAY_SUCCESS_TITLE, APPLE_PAY_SUCCESS_DESC, FA_CARD_APPLE_PAY_CARD_ADDED } from "@constants/strings";

import Assets from "@assets";
import { GABankingApplePay } from "@services/analytics/analyticsBanking";

function ApplePayAck({ route }) {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const { applePayPromotion, applePayPromotionID } = getModel("applePay");

    function onDoneTap() {
        console.log("[ApplePayAck] >> [onDoneTap]");
        GABankingApplePay.onSuccessScreenApplePayCardAdded();
        //TODO : APPLE PAY need api from Faiz for promoflag and promoid
        if (applePayPromotion && applePayPromotionID) {
            navigation.navigate(PROMOS_MODULE, {
                screen: PROMO_DETAILS,
                params: {
                    itemDetails: {
                        id: applePayPromotionID,
                    },
                    callPage: APPLE_PAY_ACK,
                    index: 0,
                },
            });
        } else {
            handleClose();
        }
    }

    function handleClose() {
        if (
            route?.params?.entryPoint === "CARDS_DASHBOARD" ||
            route?.params?.entryPoint === "CARDS_DETAIL" ||
            route?.params?.entryPoint === "BANKINGDASHBOARDSCREEN"
        ) {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                },
            });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Dashboard",
            });
        }
    }

    // const onPressApplePay = () => {
    //     console.log("onPressApplePay");
    // };

    return (
        <ScreenContainer backgroundType="color" analyticTabName={FA_CARD_APPLE_PAY_CARD_ADDED}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                useSafeArea
            >
                <ScrollView>
                    <View style={styles.container}>
                        <Image source={Assets.icTickNew} style={styles.image} />
                        <Typo
                            text={APPLE_PAY_SUCCESS_TITLE}
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        <SpaceFiller height={22} />
                        <Typo
                            text={APPLE_PAY_SUCCESS_DESC}
                            fontSize={15}
                            fontWeight="300"
                            lineHeight={20}
                            textAlign="left"
                        />
                        <View style={styles.imageStyle}>
                            <Image source={Assets.appleWave} style={styles.appleWaveImage} />
                            <Image source={Assets.applePay} style={styles.applePayImage} />
                            {/* <View style={styles.payBtn}>
                                <ApplePayButton
                                    type="plain"
                                    style="whiteOutline"
                                    onPress={onPressApplePay}
                                />
                            </View> */}
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={1}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo fontSize={14} lineHeight={18} fontWeight="600" text={DONE} />
                            }
                            onPress={onDoneTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    applePayImage: {
        height: 42,
        marginLeft: 22,
        width: 66,
    },

    appleWaveImage: {
        height: 42,
        width: 72,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginBottom: 36,
        marginHorizontal: 24,
    },
    image: {
        height: 56,
        marginBottom: 28,
        marginTop: 100,
        width: 56,
    },
    imageStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 22,
        width: "100%",
    },
    // payBtn: {
    //     width: "40%",
    //     marginLeft: "10%",
    // },
});

ApplePayAck.propTypes = {
    route: PropTypes.object.isRequired,
};

export default ApplePayAck;
