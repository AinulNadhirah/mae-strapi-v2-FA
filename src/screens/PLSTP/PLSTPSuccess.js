import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import { addCommas } from "@screens/PLSTP/PLSTPController";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, GREY, TRANSPARENT, WHITE, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    MONTHLY_PAYS,
    INTEREST_RATE,
    TENURE,
    PLSTP_APP_SUCCESS_AMOUNT,
    PLSTP_SUCCESS_TITLE,
    PLSTP_SUCCESS_DESC,
    PLSTP_SUCCESS_ADDON,
    PLSTP_SUCCESS_BTN,
    PLSTP_SUCCESS_TRANSFER,
    PAYOUT_ACCOUNT,
    REFERENCE_ID,
    FA_REFERENCE_ID,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_COMPLETE,
} from "@constants/strings";

import Assets from "@assets";

function PLSTPSuccess({ route, navigation }) {
    const params = route?.params ?? {};
    const { submissionResponse, finalCarlosResponse } = params?.initParams;
    const [prequalSuccessDetails, setPrequalSuccessDetails] = useState([]);
    const [viewMoreDetails, setViewMoreDetails] = useState(true);

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PLSTPSuccess] >> [init]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_Disbursed",
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_Disbursed",
            [FA_REFERENCE_ID]: submissionResponse?.stpRefNo,
        });
        const prequal2SuccessDetails = [
            {
                title: MONTHLY_PAYS,
                value:
                    finalCarlosResponse?.monthlyInstalment &&
                    `RM ${addCommas(finalCarlosResponse?.monthlyInstalment)}`,
            },
            {
                title: INTEREST_RATE,
                value:
                    finalCarlosResponse?.loanInterest &&
                    `${finalCarlosResponse?.loanInterest}% p.a.`,
            },
            {
                title: TENURE,
                value:
                    finalCarlosResponse?.loanTenure && `${finalCarlosResponse?.loanTenure} years`,
            },
            {
                title: PLSTP_APP_SUCCESS_AMOUNT,
                value:
                    finalCarlosResponse?.approvedAmount &&
                    `RM ${addCommas(finalCarlosResponse?.approvedAmount)}`,
            },
            {
                title: PLSTP_SUCCESS_ADDON,
                value:
                    parseInt(finalCarlosResponse?.premiumAmount) > 0 &&
                    `RM ${addCommas(finalCarlosResponse?.premiumAmount)}`,
            },
            {
                title: PLSTP_SUCCESS_TRANSFER,
                value:
                    finalCarlosResponse?.disbursedAmount &&
                    `RM ${addCommas(finalCarlosResponse?.disbursedAmount)}`,
            },
            {
                title: PAYOUT_ACCOUNT,
                value: finalCarlosResponse?.disbursedAccount
                    ? `${finalCarlosResponse?.disbursedAccountName} \n ${finalCarlosResponse?.disbursedAccount}`
                    : "",
            },
            {
                title: REFERENCE_ID,
                value: submissionResponse?.stpRefNo,
            },
        ];
        setPrequalSuccessDetails(prequal2SuccessDetails);
    };

    const onViewAccountTap = () => {
        console.log("[PLSTPSuccess] >> [onViewAccountTap]");
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    };

    function viewDetailsTap() {
        setViewMoreDetails(!viewMoreDetails);
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_Disbursed">
            <ScreenLayout useSafeArea paddingHorizontal={0} paddingBottom={0}>
                <ScrollView>
                    <View style={styles.container}>
                        <Image source={Assets.icTickNew} style={styles.image} />
                        <Typo
                            text={PLSTP_SUCCESS_TITLE}
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        <SpaceFiller height={22} />
                        <Typo
                            text={PLSTP_SUCCESS_DESC}
                            fontSize={15}
                            fontWeight="300"
                            lineHeight={20}
                            textAlign="left"
                        />
                        <View style={styles.detailsContainer}>
                            <View>
                                <Typo
                                    text={PLSTP_SUCCESS_TRANSFER}
                                    fontSize={14}
                                    lineHeight={19}
                                    fontWeight="400"
                                />
                                <Typo
                                    text={
                                        finalCarlosResponse?.disbursedAmount &&
                                        `RM ${addCommas(finalCarlosResponse?.disbursedAmount)}`
                                    }
                                    fontSize={24}
                                    lineHeight={29}
                                    fontWeight="700"
                                />
                            </View>
                            <View style={styles.graySeparator} />
                            {prequalSuccessDetails.map((detailData, index) => {
                                const { title, value } = detailData;
                                if (!value || (viewMoreDetails && index > 2)) return;
                                return (
                                    <React.Fragment key={`${title}-${index}`}>
                                        <InlineTypography
                                            label={title}
                                            value={value}
                                            componentID={`successDetail${index}`}
                                            leftFont={14}
                                            leftFontWeight="400"
                                            numberOfLines={title === PAYOUT_ACCOUNT ? 4 : 2}
                                            rightFont={14}
                                            rightFontWeight={600}
                                            rightFontWeight="700"
                                            style={styles.successList}
                                        />
                                        {title === "Tenure" && viewMoreDetails && (
                                            <TouchableOpacity
                                                onPress={viewDetailsTap}
                                                activeOpacity={0.8}
                                            >
                                                <Typo
                                                    style={styles.successList}
                                                    color={ROYAL_BLUE}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    lineHeight={18}
                                                    text="View full details"
                                                />
                                            </TouchableOpacity>
                                        )}
                                        {title === "Tenure" && !viewMoreDetails && (
                                            <View style={styles.graySeparator} />
                                        )}
                                        {title === "Amount Transferred" && (
                                            <View style={styles.graySeparator} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
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
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PLSTP_SUCCESS_BTN}
                                />
                            }
                            onPress={onViewAccountTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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

    detailsContainer: {
        backgroundColor: WHITE,
        borderColor: TRANSPARENT,
        borderRadius: 8,
        marginTop: 41,
        paddingVertical: 20,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        width: "100%",
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginBottom: 10,
        marginTop: 20,
    },
    image: {
        height: 56,
        marginBottom: 28,
        marginTop: 100,
        width: 56,
    },
    successList: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
});

export default PLSTPSuccess;
