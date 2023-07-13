import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch } from "react-redux";

import { ASB_GUARANTOR_INCOME_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { asbBecomeAGuarantor } from "@redux/services/ASBServices/asbBecomeAGuarantor";

import { YELLOW } from "@constants/colors";
import { CREDIT_TNC, CREDIT_CONSET, GUARANTOR, CONTINUE } from "@constants/strings";

import { goBackHomeScreen } from "../helpers/ASBHelpers";

function GuarantorConsent({ navigation, route }) {
    const dispatch = useDispatch();

    const userData = route?.params?.userData;

    async function onDoneTap() {
        dispatch(
            asbBecomeAGuarantor(userData, (response) => {
                if (response) {
                    navigation.navigate(ASB_GUARANTOR_INCOME_DETAILS, {
                        currentSteps: 1,
                        totalSteps: 4,
                    });
                }
            })
        );
    }

    function onCloseTap() {
        goBackHomeScreen(navigation);
    }

    function onBackTap() {
        console.log("[GuarantorEmploymentDetails] >> [onBackTap]");
        navigation.goBack();
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_2">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text={""} />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo
                                fontSize={14}
                                lineHeight={23}
                                fontWeight="300"
                                textAlign="left"
                                text={GUARANTOR}
                                style={Style.headerLabelCls}
                            />
                            <SpaceFiller height={4} />
                            <Typo
                                fontSize={16}
                                lineHeight={20}
                                fontWeight="600"
                                textAlign="left"
                                text={CREDIT_CONSET}
                                style={Style.headerDescLabelCls}
                            />

                            <View style={Style.radioCheckContainer}>
                                <View style={Style.textContainer}>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="400"
                                        textAlign="left"
                                        text={CREDIT_TNC}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    headerDescLabelCls: {
        marginTop: 10,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: 10,
    },

    scrollViewCls: {
        paddingHorizontal: 24,
    },

    textContainer: {
        width: "100%",
    },
});

export default GuarantorConsent;

GuarantorConsent.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};
