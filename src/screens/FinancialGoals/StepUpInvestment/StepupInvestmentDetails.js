import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";

import { BANKINGV2_MODULE, STEPUP_INCREASE_MONTHLY_PAYMENT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import Images from "@assets";

function StepupInvestmentDetails({ navigation, route }) {
    let { gapStripe: gapValue, projectedGoalShortfall: gapAmount } =
        route.params?.goalDetails ?? null;

    function onBackButtonPress() {
        navigation.goBack();
    }

    const CloseButton = () => (
        <TouchableOpacity onPress={onBackButtonPress} style={styles.closeButton}>
            <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
        </TouchableOpacity>
    );

    function gotoStpeUpInvesmentMonthlyPayment() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: STEPUP_INCREASE_MONTHLY_PAYMENT,
            params: {
                gapValue,
            },
        });
    }

    const numberWithCommas = (val) => {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 3) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Step-up Investment"
                            />
                        }
                        headerLeftElement={
                            <HeaderBackButton onPress={onBackButtonPress} testID="go_back" />
                        }
                        headerRightElement={<CloseButton />}
                    />
                }
                paddingBottom={0}
                useSafeArea
                paddingHorizontal={0}
            >
                <View style={styles.viewFlexStyles}>
                    <View>
                        <View style={styles.centerStyle}>
                            <Image source={Images.stepUpInvestment} style={styles.rightPanel6} />
                        </View>

                        <SpaceFiller height={24} />

                        {gapValue > 0 ? (
                            <Typo
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={22}
                                textAlign="left"
                                text="When you step-up your investment, you can increase your monthly contribution for the next year by any amount you wish, so that you can still achieve your target goal and possibly save some more."
                            />
                        ) : (
                            <Typo
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={22}
                                textAlign="left"
                                text="Stepping up your investment allows you to start with your desired monthly investment and increase it annually for the entire duration of your goal."
                            />
                        )}
                        <SpaceFiller height={24} />

                        {gapValue > 0 ? (
                            <View style={styles.warningSignView}>
                                <Image source={Images.redWarning} style={styles.rightPanel3} />
                                <View style={styles.warningTextStyle}>
                                    <Typo
                                        text={`You currently have a gap of RM ${numberWithCommas(
                                            gapAmount
                                        )} to achiveve your target goal`}
                                        fontSize={12}
                                        fontWeight="400"
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.onTrackSignView}>
                                <Image
                                    source={Images.icRoundedGreenTick}
                                    style={styles.rightPanel3}
                                />
                                <Typo
                                    text="You're right on track to reach your goal!"
                                    fontSize={12}
                                />
                            </View>
                        )}

                        {gapValue > 0 ? (
                            <>
                                <SpaceFiller height={24} />
                                <Typo
                                    fontWeight="400"
                                    fontSize={16}
                                    lineHeight={22}
                                    textAlign="left"
                                    text="You can choose to increase your monthly contribution in the following year by a certain amount or percentage (think salary incerement percentage) to close the gap and achieve your retirement goal."
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.rightQ2}>
                                    <Typo
                                        fontWeight="400"
                                        fontSize={16}
                                        lineHeight={20}
                                        textAlign="left"
                                        text="Alternatively, you can choose how much you want your investment to grow every year to calculate your next monthly investment amount, to go beyond your initial target."
                                    />
                                </View>

                                <SpaceFiller height={24} />

                                <View style={styles.rightQ3}>
                                    <Typo
                                        fontWeight="400"
                                        fontSize={16}
                                        lineHeight={20}
                                        textAlign="left"
                                        text="You can increase your monthly contribution in the following year by a certain amount or percentage (think salary increment percentage) to grow your retirement fund."
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
                <FixedActionContainer>
                    <ActionButton
                        style={styles.secondButtonText}
                        onPress={gotoStpeUpInvesmentMonthlyPayment}
                        componentCenter={
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Continue" />
                        }
                        fullWidth
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

StepupInvestmentDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Memoiz = React.memo(StepupInvestmentDetails);

const styles = StyleSheet.create({
    centerStyle: { alignItems: "center" },
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
    onTrackSignView: {
        alignItems: "center",
        backgroundColor: `#CCF1D7`,
        borderRadius: 8,
        flexDirection: "row",
        height: 40,
        justifyContent: "flex-start",
    },
    rightPanel3: { margin: 12 },
    rightPanel6: { margin: 12 },
    rightQ2: { marginTop: 18 },
    rightQ3: { marginTop: 8 },
    secondButtonText: {
        marginTop: 10,
    },
    viewFlexStyles: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24 },
    warningSignView: {
        alignItems: "center",
        backgroundColor: `rgba(254, 168, 168, 1)`,
        borderRadius: 8,
        flexDirection: "row",
        height: 54,
        justifyContent: "flex-start",
        width: Dimensions.get("screen").width - 50,
    },
    warningTextStyle: {
        alignItems: "flex-start",
        width: "80%",
    },
});

export default Memoiz;
