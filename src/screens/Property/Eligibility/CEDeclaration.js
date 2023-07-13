/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    CE_UNIT_SELECTION,
    CE_PROPERTY_NAME,
    CE_DECLARATION,
    MAE_ACC_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { getPropertyStaffConsentCheck } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import {
    CE_CRA_ISMAESTAFF_TEXT,
    CE_CRA_SUB_TEXT,
    CE_CRA_TEXT,
    CHECK_ELIGIBILITY,
    FA_FORM_PROCEED,
    FA_PROPERTY_CE_CC,
    FA_SCREEN_NAME,
    PLSTP_AGREE,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";

import { getMDMData, useResetNavigation } from "../Common/PropertyController";
import { saveEligibilityInput } from "./CEController";

function CEDeclaration({ route, navigation }) {
    const [resetToDiscover] = useResetNavigation(navigation);
    const [isMAEStaff, setIsMAEStaff] = useState(false);
    const { updateModel } = useModelController();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[CEDeclaration] >> [init]");

        const httpResp = await getPropertyStaffConsentCheck(false).catch((error) => {
            console.log("[CEDeclaration][getPropertyStaffConsentCheck] >> Exception: ", error);
        });

        const result = httpResp?.data?.result;

        if (result) {
            const navParams = route?.params ?? {};
            let mdmData = navParams?.mdmData ?? {};
            if (isEmpty(mdmData)) mdmData = await getMDMData();

            setIsMAEStaff(mdmData?.staff);
        }
    };

    function onBackPress() {
        console.log("[CEDeclaration] >> [onBackPress]");

        const from = route?.params?.from ?? "";

        if (from === MAE_ACC_DASHBOARD) {
            resetToDiscover();
        } else {
            navigation.canGoBack() && navigation.goBack();
        }
    }

    async function onPressConfirm() {
        console.log("[CEDeclaration] >> [onPressConfirm]");

        updateModel({
            property: {
                isConsentGiven: true,
            },
        });

        // Call method to save data and continue to next screen
        saveAndContinue();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_CC,
        });
    }

    async function saveAndContinue() {
        console.log("[CEDeclaration] >> [saveAndContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Save Form Data in DB before moving to next screen
        const { syncId, stpId } = await saveEligibilityInput({
            screenName: CE_DECLARATION,
            formData: {},
            navParams,
            saveData: resumeFlow ? "Y" : "N",
        });

        if (navParams?.isPropertyListed === "Y") {
            // Navigate to Unit Selection screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_UNIT_SELECTION,
                params: {
                    ...route.params,
                    syncId,
                    stpId,
                },
            });
        } else {
            // Navigate to Property Name screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PROPERTY_NAME,
                params: {
                    ...navParams,
                    syncId,
                    stpId,
                },
            });
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_PROPERTY_CE_CC}
        >
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackPress} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={24}
                useSafeArea
            >
                <>
                    <View style={styles.wrapper}>
                        <Typo
                            fontWeight="400"
                            fontSize={22}
                            lineHeight={18}
                            text={CHECK_ELIGIBILITY}
                            textAlign="left"
                            style={styles.title}
                        />

                        <Typo
                            fontSize={18}
                            fontWeight="600"
                            lineHeight={28}
                            style={styles.label}
                            text={CE_CRA_TEXT}
                            textAlign="left"
                        />

                        <View style={styles.radioCheckContainer}>
                            <Typo
                                lineHeight={20}
                                textAlign="left"
                                style={styles.agreeLabel}
                                text={CE_CRA_SUB_TEXT}
                            />
                        </View>

                        {isMAEStaff && (
                            <View style={styles.radioCheckstaffContainer}>
                                <Typo
                                    lineHeight={20}
                                    textAlign="left"
                                    style={styles.agreeLabel}
                                    text={CE_CRA_ISMAESTAFF_TEXT}
                                />
                            </View>
                        )}
                    </View>

                    <FixedActionContainer>
                        <ActionButton
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    color={BLACK}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PLSTP_AGREE}
                                />
                            }
                            onPress={onPressConfirm}
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

CEDeclaration.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    agreeLabel: {
        paddingRight: 24,
        paddingTop: 0,
    },

    label: {
        paddingBottom: 24,
        paddingTop: 8,
    },

    radioCheckContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    radioCheckstaffContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 15,
    },

    title: {
        paddingTop: 24,
    },

    wrapper: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 36,
    },
});

export default CEDeclaration;
