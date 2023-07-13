import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";

import { addCommas, shortStpRefNum } from "@screens/PLSTP/PLSTPController";

import {
    TAB_NAVIGATOR,
    PLSTP_SUCCESS,
    PLSTP_PREQUAL2_FAIL,
    DASHBOARD,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    ONE_TAP_AUTH_MODULE,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { plstpCounterOffer } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, GREY, ROYAL_BLUE, TRANSPARENT, WHITE, YELLOW } from "@constants/colors";
import {
    PLSTP_COUNTER_TITLE,
    PLSTP_COUNTER_DESC,
    PLSTP_COUNTER_REQUEST,
    PLSTP_COUNTER_BANK_OFFER,
    MONTHLY_PAYS,
    INTEREST_RATE,
    TENURE,
    PLSTP_SUCCESS_ADDON,
    PLSTP_COUNTER_TRNFR,
    REQ_LOAN_AMOUNT,
    APP_LOAN_AMOUNT,
    PAYOUT_ACCOUNT,
    REFERENCE_ID,
    ACCEPT,
    PLSTP_COUNTER_DECLINE,
    PLSTP_COUNTER_LATER,
    PLSTP_COUNTER_DECLINE_MSG,
    CONFIRM,
    CANCEL,
    FA_ACTION_NAME,
    FA_SELECT_ACTION,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_REFERENCE_ID,
} from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import Assets from "@assets";

function PLSTPCounterOffer({ route, navigation }) {
    const { initParams } = route?.params ?? {};
    const { stpRefNum, finalCarlosResponse } = initParams;
    const [prequalSuccessDetails, setPrequalSuccessDetails] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showDecline, setShowDecline] = useState(false);
    const [statusType, setStatusType] = useState("");

    const { getModel } = useModelController();
    const [challenge, setChallenge] = useState({});

    const [cq, setCQ] = useState({
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    });
    const initialCQState = {
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (challenge?.answer) {
            counterOfferAPI(statusType);
        }
    }, [challenge]);

    function getDisbursedAmount() {
        if (parseInt(finalCarlosResponse.disbursedAmount) > 0)
            return `RM ${addCommas(finalCarlosResponse.disbursedAmount)}`;

        if (parseInt(finalCarlosResponse.premiumAmount) > 0) {
            return (
                parseFloat(finalCarlosResponse.approvedAmount) -
                parseFloat(finalCarlosResponse.premiumAmount)
            );
        }
        return `RM ${addCommas(parseFloat(finalCarlosResponse.approvedAmount))}`;
    }

    function init() {
        console.log("[PLSTPCounterOffer] >> [init]");
        const prequal2SuccessDetails = [
            {
                title: MONTHLY_PAYS,
                value:
                    finalCarlosResponse?.monthlyInstalment &&
                    `RM ${addCommas(finalCarlosResponse?.monthlyInstalment)}`,
            },
            {
                title: INTEREST_RATE,
                value: `${finalCarlosResponse?.loanInterest}% p.a.`,
            },
            {
                title: TENURE,
                value: `${finalCarlosResponse?.loanTenure} years`,
            },
            {
                title: REQ_LOAN_AMOUNT,
                value:
                    finalCarlosResponse?.reqLoanAmount &&
                    `RM ${addCommas(finalCarlosResponse?.reqLoanAmount)}`,
            },
            {
                title: APP_LOAN_AMOUNT,
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
                title: PLSTP_COUNTER_TRNFR,
                value: getDisbursedAmount(),
            },
            {
                title: PAYOUT_ACCOUNT,
                value: finalCarlosResponse?.disbursedAccount
                    ? `${finalCarlosResponse?.disbursedAccountName} \n ${finalCarlosResponse?.disbursedAccount}`
                    : "",
            },
            {
                title: REFERENCE_ID,
                value: shortStpRefNum(stpRefNum),
            },
        ];
        setPrequalSuccessDetails(prequal2SuccessDetails);
        setShowDecline(!(initParams?.counterOfferDecision === "A"));
    }

    async function counterOfferAPIReq(payload) {
        try {
            const response = await plstpCounterOffer(payload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            if (error?.error?.code === 428) {
                setChallenge(error?.error?.result?.challenge);
                setCQ({
                    isRSARequired: true,
                    isRSALoader: false,
                    challengeQuestion: error?.error?.result?.challenge?.questionText,
                    RSACount: cq.RSACount + 1,
                    RSAError: cq.RSACount > 0,
                });
                return;
            } else if (error?.error?.code === 422) {
                //422 : RSA Deny 423: RSA Locked
                const { statusDescription, serverDate } = error?.error?.result;

                const params = {
                    statusDescription,
                    additionalStatusDescription: "",
                    serverDate,
                    nextParams: { screen: DASHBOARD },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                };
                navigation.navigate(COMMON_MODULE, {
                    screen: RSA_DENY_SCREEN,
                    params,
                });
            } else if (error?.error?.code === 423) {
                const reason = error?.error?.result?.statusDescription;
                const loggedOutDateTime = error?.error?.result?.serverDate;
                const lockedOutDateTime = error?.error?.result?.serverDate;
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Locked",
                    params: {
                        reason,
                        loggedOutDateTime,
                        lockedOutDateTime,
                    },
                });
            } else {
                showErrorToast({ message: error?.message });
            }
            onChallengeSnackClosePress();
            return null;
        }
    }

    async function counterOfferAPI(counterStatusType) {
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        setStatusType(counterStatusType);
        const data = {
            counterStatusType,
            stpRefNo: stpRefNum,
            mobileSDKData,
            challenge,
        };
        const result = await counterOfferAPIReq(data);
        console.log("counterOfferAPIReq Result :: ", result);
        if (result?.data?.code === 200) {
            setCQ({ ...initialCQState });
            const { carlosResponse } = result?.data?.result;
            const custInfo = {
                shortRefNo: result?.data?.result?.stpRefNo,
                dateTime: carlosResponse?.dateTime,
            };
            const finalJson = Object.assign(initParams, {
                finalCarlosResponse: carlosResponse,
                customerInfo: custInfo,
                submissionResponse: result?.data?.result,
            });
            if (carlosResponse.submissionStatus === "DISBURSED") {
                navigation.navigate(PLSTP_SUCCESS, {
                    ...route.params,
                    initParams: finalJson,
                });
            } else if (carlosResponse.submissionStatus === "WITHDRAWN") {
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    initParams: finalJson,
                    from: "counter_decline",
                });
            } else if (carlosResponse.submissionStatus === "APPROVED") {
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    initParams: finalJson,
                    from: "approved",
                    loanType: initParams?.loanType,
                    refresh: true,
                });
            } else if (carlosResponse.submissionStatus === "COUNTER_OFFER") {
                navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                    ...route.params,
                    initParams: finalJson,
                    from: "counter_timeout",
                });
            } else {
                //DECIDE_LATER
                navigation.navigate(TAB_NAVIGATOR, {
                    screen: "Tab",
                    params: {
                        screen: "Maybank2u",
                    },
                });
            }
        } else if (result?.data?.code === 400) {
            navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                ...route.params,
                from: "counter_timeout",
            });
        } else {
            // showErrorToast({
            //     message: result?.data?.message,
            // });
            console.log("Failure scenario");
        }
    }

    function onAcceptTap() {
        console.log("[PLSTPCounterOffer] >> [onAcceptTap]");
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_COffer",
            [FA_REFERENCE_ID]: shortStpRefNum(stpRefNum),
        });
        counterOfferAPI("ACCEPT");
    }

    function onDeclineTap() {
        console.log("[PLSTPCounterOffer] >> [onDeclineTap]");
        setShowPopup(true);
    }

    function decideLaterTap() {
        console.log("[PLSTPCounterOffer] >> [decideLaterTap]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_COffer",
            [FA_ACTION_NAME]: "Decide Later",
        });
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    }

    function proceedDeclineCounterOffer() {
        console.log("proceedDeclineCounterOffer");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_COffer",
            [FA_ACTION_NAME]: "Decline Offer",
        });
        counterOfferAPI("DECLINE");
        handleClosePopup();
    }

    function handleClosePopup() {
        setShowPopup(false);
    }

    function onChallengeSnackClosePress() {
        setCQ({ ...initialCQState });
    }

    async function onChallengeQuestionSubmitPress(answer) {
        // const { challenge } = state;
        const cqAns = {
            ...challenge,
            answer,
        };
        setChallenge(cqAns);
        setCQ({
            ...cq,
            isRSALoader: true,
            RSAError: false,
        });
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_COffer">
            <ScreenLayout useSafeArea paddingHorizontal={0} paddingBottom={0}>
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.counterTitle}>
                            <Typo
                                text={PLSTP_COUNTER_TITLE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={23}
                                textAlign="left"
                            />
                            <SpaceFiller height={16} />
                            <Typo
                                text={PLSTP_COUNTER_DESC}
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={30}
                                textAlign="left"
                            />
                        </View>
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailsRowContainer}>
                                <View>
                                    <Typo
                                        text={PLSTP_COUNTER_REQUEST}
                                        fontSize={14}
                                        lineHeight={19}
                                        fontWeight="400"
                                        color={GREY}
                                    />
                                    <Typo
                                        text={`RM ${addCommas(finalCarlosResponse?.reqLoanAmount)}`}
                                        fontSize={20}
                                        lineHeight={24}
                                        fontWeight="700"
                                        color={GREY}
                                    />
                                </View>
                                <Image source={Assets.plstparrow} style={styles.image} />
                                <View>
                                    <Typo
                                        text={PLSTP_COUNTER_BANK_OFFER}
                                        fontSize={14}
                                        lineHeight={19}
                                        fontWeight="400"
                                    />
                                    <Typo
                                        text={`RM ${addCommas(
                                            finalCarlosResponse?.approvedAmount
                                        )}`} //need to change once api is ready
                                        fontSize={20}
                                        lineHeight={24}
                                        fontWeight="700"
                                    />
                                </View>
                            </View>
                            <View style={styles.graySeparator} />
                            {prequalSuccessDetails.map((detailData, index) => {
                                const { title, value } = detailData;
                                if (!value) return;
                                return (
                                    <React.Fragment key={`${title}-${index}`}>
                                        <InlineTypography
                                            label={title}
                                            value={value}
                                            componentID={`successDetail${index}`}
                                            numberOfLines={title === PAYOUT_ACCOUNT ? 4 : 2}
                                            leftFont={14}
                                            leftFontWeight={400}
                                            rightFont={14}
                                            rightFontWeight={600}
                                            rightFontWeight="700"
                                            style={styles.successList}
                                        />
                                        {title === TENURE && <View style={styles.graySeparator} />}
                                        {title === PLSTP_COUNTER_TRNFR && (
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
                                    text={ACCEPT}
                                />
                            }
                            onPress={onAcceptTap}
                        />
                        {showDecline && (
                            <ActionButton
                                activeOpacity={1}
                                backgroundColor={WHITE}
                                borderColor={GREY}
                                borderWidth={1}
                                fullWidth
                                style={styles.buttonDeclineMargin}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={PLSTP_COUNTER_DECLINE}
                                    />
                                }
                                onPress={onDeclineTap}
                            />
                        )}
                        <TouchableOpacity
                            onPress={decideLaterTap}
                            activeOpacity={0.8}
                            style={styles.buttonMargin}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={PLSTP_COUNTER_LATER}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <ChallengeQuestion
                loader={cq.isRSALoader}
                display={cq.isRSARequired}
                displyError={cq.RSAError}
                questionText={cq.challengeQuestion}
                onSubmitPress={onChallengeQuestionSubmitPress}
                onSnackClosePress={onChallengeSnackClosePress}
            />
            <Popup
                visible={showPopup}
                title={PLSTP_COUNTER_DECLINE}
                description={PLSTP_COUNTER_DECLINE_MSG}
                onClose={handleClosePopup}
                primaryAction={{
                    text: CONFIRM,
                    onPress: proceedDeclineCounterOffer,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: handleClosePopup,
                }}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    buttonDeclineMargin: {
        marginTop: 18,
    },
    buttonMargin: {
        marginTop: 30,
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginBottom: 36,
        marginHorizontal: 24,
        marginTop: 50,
    },

    counterTitle: {
        paddingHorizontal: 20,
    },
    detailsContainer: {
        backgroundColor: WHITE,
        borderColor: TRANSPARENT,
        borderRadius: 8,
        marginTop: 41,
        paddingVertical: 15,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        width: "100%",
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
        // paddingHorizontal: 10
    },
    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginBottom: 10,
        marginTop: 20,
    },
    image: {
        height: 34,
        width: 34,
    },
    successList: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
});

export default PLSTPCounterOffer;
