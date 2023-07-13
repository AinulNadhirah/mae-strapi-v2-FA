import React, { Component } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";

import {
    SETUP_BENIFIT_WALLET,
    UPGRADE_WALLET_BENIFIT,
    SETUP_MAE_BENIFIT_ONE,
    SETUP_MAE_BENIFIT_TWO,
    SETUP_MAE_BENIFIT_THREE,
    SETUP_MAE_BENIFIT_FOUR,
    CONTINUE,
} from "@constants/strings";
import { MEDIUM_GREY, BLACK } from "@constants/colors";
import { MAE_SETEPUP_ADDRESS } from "@navigation/navigationConstant";
import Assets from "@assets";
import { HighlightText } from "@components/Common/HighlightText";
import { maegetStepupData } from "@services/index";

class StepUpBenefits extends Component {
    constructor(props) {
        super(props);
    }

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[StepUpBenefits] >> [onBackButtonPress]");

        this.props.navigation.goBack();
    };

    onContinueButtonPress = async () => {
        console.log("[StepUpBenefits] >> [onContinueButtonPress]");

        const params = this.props?.route?.params ?? {};
        const response = await maegetStepupData(true, null).catch((error) => {
            console.log("[onContinueButtonPress][maegetStepupData] >> Exception: ", error);
        });
        const result = response?.data?.result ?? {};

        this.props.navigation.navigate(MAE_SETEPUP_ADDRESS, {
            ...params,
            masterdata: result,
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={this.onBackButtonPress} />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ScrollView style={styles.containerView}>
                            {/* Description */}
                            <Typo
                                textAlign="left"
                                fontSize={20}
                                lineHeight={28}
                                fontWeight="300"
                                text={SETUP_BENIFIT_WALLET}
                                style={styles.headerCls}
                            />

                            {/* Benefits Label */}
                            <Typo
                                textAlign="left"
                                fontSize={15}
                                lineHeight={23}
                                fontWeight="600"
                                text={UPGRADE_WALLET_BENIFIT}
                                style={styles.subHeaderCls}
                            />

                            {/* Benefit Point1 */}
                            <View style={styles.benefitsPointViewCls}>
                                <Image
                                    source={Assets.icTickBlackDarkSmall}
                                    resizeMode="contain"
                                    style={styles.tickImgCls}
                                />
                                <Typo
                                    textAlign="left"
                                    fontSize={13}
                                    lineHeight={17}
                                    text={SETUP_MAE_BENIFIT_ONE}
                                    style={styles.pointLabelCls}
                                />
                            </View>

                            {/* Benefit Point2 */}
                            <View style={styles.benefitsPointViewCls}>
                                <Image
                                    source={Assets.icTickBlackDarkSmall}
                                    resizeMode="contain"
                                    style={styles.tickImgCls}
                                />
                                <HighlightText
                                    highlightStyle={{ fontWeight: "bold" }}
                                    searchWords={["5% bonus"]}
                                    style={styles.message}
                                    textToHighlight={SETUP_MAE_BENIFIT_TWO}
                                />
                            </View>

                            {/* Benefit Point3 */}
                            <View style={styles.benefitsPointViewCls}>
                                <Image
                                    source={Assets.icTickBlackDarkSmall}
                                    resizeMode="contain"
                                    style={styles.tickImgCls}
                                />
                                <Typo
                                    textAlign="left"
                                    fontSize={13}
                                    lineHeight={17}
                                    text={SETUP_MAE_BENIFIT_THREE}
                                    style={styles.pointLabelCls}
                                />
                            </View>

                            {/* Benefit Point4 */}
                            <View
                                style={[
                                    styles.benefitsPointViewCls,
                                    styles.lastBenefitsPointViewCls,
                                ]}
                            >
                                <Image
                                    source={Assets.icTickBlackDarkSmall}
                                    resizeMode="contain"
                                    style={styles.tickImgCls}
                                />
                                <Typo
                                    textAlign="left"
                                    fontSize={13}
                                    lineHeight={17}
                                    text={SETUP_MAE_BENIFIT_FOUR}
                                    style={styles.pointLabelCls}
                                />
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueButtonPress}
                                componentCenter={
                                    <Typo
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    benefitsPointViewCls: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 16,
        marginHorizontal: 12,
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 16,
        width: "100%",
    },

    headerCls: {
        marginHorizontal: 12,
        marginTop: 15,
    },

    lastBenefitsPointViewCls: {
        marginBottom: 32,
    },

    message: {
        color: BLACK,
        fontFamily: "montserrat",
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        marginLeft: 12,
        textAlign: "left",
    },

    pointLabelCls: {
        marginLeft: 12,
    },

    subHeaderCls: {
        marginBottom: 20,
        marginHorizontal: 12,
        marginTop: 35,
    },

    tickImgCls: {
        height: 15,
        width: 12,
    },
});

export default StepUpBenefits;
