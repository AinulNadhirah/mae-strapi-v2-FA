import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import {
    Dimensions,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import CardFlip from "react-native-card-flip";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { BLACK, FADE_GREY, MEDIUM_GREY, SHADOW, YELLOW } from "@constants/colors";
import { DONE, FAIL_STATUS, MAE_VIRTUAL_CARD_TAP_TO_FLIP, PAYMENT_FAIL } from "@constants/strings";

import { accountNumSeparator, debitCardNumSeperator } from "@utils/dataModel/utilityPartial.4";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

function MAEVirtualCardStatus({ route }) {
    const [renewalStatus, setRenewalStatus] = useState(FAIL_STATUS);
    const [headerText, setHeaderText] = useState(PAYMENT_FAIL);
    const [detailsArray, setDetailsArray] = useState(null);
    const [serverError, setServerError] = useState("");
    const [newMAECardNo, setNewMAECardNo] = useState("");
    const cardRef = useRef(null);

    useEffect(() => {
        if (route?.params) {
            const { status, headerText, detailsArray, serverError, maeCardNo } = route?.params;
            setRenewalStatus(status);
            setHeaderText(headerText);
            setDetailsArray(detailsArray);
            setServerError(serverError);
            setNewMAECardNo(maeCardNo);
        }
    }, [route]);

    function onCardTap() {
        cardRef.current.flip();
    }

    function onDoneTap() {
        const { onDone } = route?.params;
        if (onDone) onDone();
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                <ScrollView style={Style.scrollViewCls} showsVerticalScrollIndicator={false}>
                    {renewalStatus === FAIL_STATUS ? (
                        <>
                            {/* Image Block */}
                            <View style={Style.statusPgImgBlockCls}>
                                <Image
                                    resizeMode="contain"
                                    style={Style.statusIconCls}
                                    source={Assets.icFailedIcon}
                                />
                            </View>

                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="400"
                                lineHeight={30}
                                textAlign="left"
                                text={headerText}
                                style={Style.descTextClsFail}
                            />

                            {/* Server Error */}
                            <Typo
                                fontSize={12}
                                lineHeight={18}
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
                        </>
                    ) : (
                        <>
                            {/* Desc */}
                            <Typo
                                fontSize={20}
                                fontWeight="400"
                                lineHeight={30}
                                textAlign="center"
                                text={headerText}
                                style={Style.descTextClsSuccess}
                            />

                            {/* Image Block */}
                            <View style={Style.virtualCardRenewedSection}>
                                {/* Tappable Card */}
                                <CardFlip
                                    style={Style.virtualCardImage}
                                    friction={6}
                                    perspective={1000}
                                    flipHorizontal={true}
                                    flipVertical={false}
                                    flip={false}
                                    clickable={true}
                                    ref={cardRef}
                                >
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={Style.virtualCard}
                                        onPress={onCardTap}
                                    >
                                        <ImageBackground
                                            resizeMode="cover"
                                            style={Style.cardImage}
                                            imageStyle={Style.virtualCard}
                                            source={Assets.debitCardFrontImage}
                                        >
                                            <Typo
                                                fontSize={12}
                                                lineHeight={23}
                                                fontWeight="600"
                                                color={BLACK}
                                                textAlign="left"
                                                style={Style.cardNumberCls}
                                                text={accountNumSeparator(newMAECardNo)}
                                            />
                                        </ImageBackground>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={Style.virtualCard}
                                        onPress={onCardTap}
                                    >
                                        <ImageBackground
                                            resizeMode="cover"
                                            style={Style.cardImage}
                                            imageStyle={Style.virtualCard}
                                            source={Assets.debitCardBackImage}
                                        >
                                            <Typo
                                                fontSize={12}
                                                lineHeight={23}
                                                fontWeight="600"
                                                color={BLACK}
                                                textAlign="left"
                                                style={Style.virtualCardNumberTextCls}
                                                text={debitCardNumSeperator(newMAECardNo)}
                                            />
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </CardFlip>
                                <Typo
                                    fontSize={12}
                                    lineHeight={16}
                                    fontWeight="400"
                                    color={BLACK}
                                    textAlign="center"
                                    style={Style.flipHelpText}
                                    text={MAE_VIRTUAL_CARD_TAP_TO_FLIP}
                                />
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Bottom docked button container */}
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
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

MAEVirtualCardStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    cardImage: {
        alignItems: "center",
        height: 300,
        width: 188,
    },

    cardNumberCls: {
        left: 15,
        position: "absolute",
        textShadowColor: SHADOW,
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 8,
        top: 70,
    },

    descTextClsFail: {
        marginBottom: 5,
    },

    descTextClsSuccess: {
        marginBottom: 5,
        marginTop: (screenHeight * 15) / 100,
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

    flipHelpText: {
        marginTop: 10,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    statusIconCls: {
        height: 60,
        width: 60,
    },

    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 20) / 100,
        width: "100%",
    },

    virtualCard: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },

    virtualCardImage: {
        height: 300,
        marginTop: 20,
        width: "100%",
    },

    virtualCardNumberTextCls: {
        left: -50,
        top: 93,
        transform: [{ rotate: "90deg" }],
        width: 170,
    },

    virtualCardRenewedSection: {
        marginTop: 24,
    },
});

export default MAEVirtualCardStatus;
