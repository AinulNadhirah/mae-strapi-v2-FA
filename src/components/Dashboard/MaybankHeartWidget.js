import { useFocusEffect, useRoute } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

import {
    DASHBOARD,
    PAYBILLS_MODULE,
    PAYBILLS_PAYEE_DETAILS,
    MB_HEART_TAPTASTIC,
} from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { getDonationData, getPayeeDetails, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, MEDIUM_GREY, SHADOW_LIGHT, TRANSPARENT, WHITE, YELLOW } from "@constants/colors";
import { FA_SCREEN_NAME, FA_SELECT_ACTION } from "@constants/strings";

import Images, { tapTasticAssets } from "@assets";
import assets from "@assets";

import LoadingWithLockComponent from "./LoadingWithLockComponent";

function MaybankHeartWidget({ navigation, getModel, isRefresh, isTapTastic }) {
    const [loading, setLoading] = useState(false);
    const { isPostLogin, isPostPassword } = getModel("auth");
    const { isOnboard } = getModel("user");
    const { tapTasticType } = getModel("misc");
    const [haveDonationDetails, setHaveDonationDetails] = useState(false);
    const [donationDetails, setDonationDetails] = useState({});
    const isUnmount = useRef(false);
    const route = useRoute();

    const tapTasticHeartDesc = isTapTastic
        ? `Your kind gesture is all it\ntakes to create a special Raya\nmoment for those in need.`
        : `Help those in need with \na simple gesture of kindness`;
    const getDonationDetails = useCallback(async () => {
        setDonationDetails({ totalContribution: "", individualContribution: "" });
        setHaveDonationDetails(false);

        // call api
        if (isOnboard && isPostLogin) {
            setLoading(true);

            try {
                const response = await getDonationData(false);
                console.log("[Maybank Heart Widget] response: ", response);

                if (response.data.statusCode === "000") {
                    const { currencyCode, individualContribution, totalContribution } =
                        response.data;

                    setDonationDetails({
                        totalContribution: `${currencyCode}${numeral(totalContribution).format(
                            "0,0.00"
                        )}`,
                        individualContribution: individualContribution
                            ? `${currencyCode}${numeral(individualContribution).format("0,0.00")}`
                            : "RM0.00",
                    });
                    setHaveDonationDetails(true);
                    // console.log("[Maybank Heart Widget] donation details: ", donationDetails);
                }
            } catch (error) {
                setHaveDonationDetails(false);
            } finally {
                setLoading(false);
            }
        }
    }, [isOnboard, isPostLogin]);

    useFocusEffect(
        useCallback(() => {
            const isRefreshing = route.params?.refresh;

            if (isRefreshing) {
                getDonationDetails();
            }

            return () => {};
        }, [route, getDonationDetails])
    );

    useEffect(() => {
        isUnmount.current = false;

        //Commented due to backend slowless, requirment to show once tap on donation widgets. Not to fetch after L2.
        //getDonationDetails();

        return () => {
            isUnmount.current = true;
        };
    }, [isRefresh]);

    function createRequiredFieldObj(fieldLabel, fieldValue, fieldName) {
        const alternateLabel =
            fieldName == "bilAcct" ? "Bill Account Number" : "Bill Reference Number";
        return {
            fieldLabel: fieldLabel,
            fieldValue: "",
            fieldName: fieldName,
            alternateLabel: alternateLabel,
        };
    }

    function handleGoToTAPtasticDonate() {
        navigation.navigate(PAYBILLS_MODULE, {
            screen: MB_HEART_TAPTASTIC,
            params: {
                isTapTasticReady: isTapTastic,
                tapTasticType,
                isPostLogin,
                isPostPassword,
                haveDonationDetails,
                donationDetails,
            },
        });
    }

    async function handleGoToDonate() {
        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                return;
            }
        }

        // get maybank heart payee details
        getPayeeDetails(["AJD"])
            .then((response) => {
                console.log("[MaybankHeartWidget][getPayeeDetails] >> Success");

                const mbbHeartPayeeDetails = response?.data?.resultList[0] ?? [];
                console.log(
                    "[MaybankHeartWidget][getPayeeDetails] >> mbbHeartPayeeDetails:",
                    mbbHeartPayeeDetails
                );
                // do something with the payee data

                let requiredFieldArray = [];

                if (mbbHeartPayeeDetails.billAcctRequired == "0" && requiredFieldArray.length < 2) {
                    requiredFieldArray.push(
                        createRequiredFieldObj(
                            mbbHeartPayeeDetails.bilAcctDispName,
                            mbbHeartPayeeDetails.acctId,
                            "bilAcct"
                        )
                    );
                }

                if (mbbHeartPayeeDetails.billRefRequired == "0" && requiredFieldArray.length < 2) {
                    requiredFieldArray.push(
                        createRequiredFieldObj(mbbHeartPayeeDetails.billRefDispName, "", "billRef")
                    );
                }

                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: DASHBOARD,
                    action_name: "mbb_donation",
                });

                navigation.navigate(PAYBILLS_MODULE, {
                    screen: PAYBILLS_PAYEE_DETAILS,
                    params: {
                        // ...this.props.route.params,
                        // billerInfo: mbbHeartPayeeDetails,
                        billerInfo: {
                            ...mbbHeartPayeeDetails,
                            fullName: "MaybankHeart",
                            subName: "Maybank",
                        },
                        requiredFields: [...requiredFieldArray],
                        donationFlow: true,
                    },
                });
            })
            .catch((error) => {
                console.log("[MaybankHeartWidget][getPayeeDetails] >> Exception:", error);
            });
    }

    function handleGoToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    async function handleDashboardAuth() {
        if (!isOnboard) handleGoToOnboard();
        else {
            if (isTapTastic) {
                handleGoToTAPtasticDonate();
            } else {
                handleGoToDonate();
            }
        }
    }
    const prevImage = Images.dashboardMaybankHeartWidgetWithDataBg;
    const festiveImg = isTapTastic
        ? tapTasticAssets.raya22.heartsBG
        : assets.dashboardMaybankHeartWidgetWithDataBg;
    return (
        <View style={styles.mbbHeartContainer}>
            {loading && <LoadingWithLockComponent type="expenses" isPostLogin={isPostLogin} />}
            {!loading && (
                <TouchableSpring onPress={handleDashboardAuth}>
                    {({ animateProp }) => (
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        scale: animateProp,
                                    },
                                ],
                            }}
                        >
                            <View style={styles.mbbHeartContainerCard}>
                                <ImageBackground
                                    source={isTapTastic ? festiveImg : prevImage}
                                    style={styles.cardBg}
                                    imageStyle={styles.cardBgImg}
                                    resizeMode="stretch"
                                >
                                    <View
                                        style={
                                            !isPostLogin || !haveDonationDetails || isTapTastic
                                                ? styles.mbbHeartContainerInner
                                                : styles.mbbHeartWithDataInner
                                        }
                                    >
                                        {/* L1 */}
                                        {(!isPostLogin || !haveDonationDetails || isTapTastic) && (
                                            <View style={styles.descriptionContainer}>
                                                {!isTapTastic && (
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="bold"
                                                        lineHeight={25}
                                                        color={isTapTastic ? WHITE : BLACK}
                                                        text={
                                                            isTapTastic
                                                                ? "Share the good fortune"
                                                                : "Every little bit counts!"
                                                        }
                                                        textAlign="left"
                                                    />
                                                )}
                                                {!isTapTastic && (
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={17}
                                                        color={isTapTastic ? WHITE : BLACK}
                                                        text={tapTasticHeartDesc}
                                                        textAlign="left"
                                                    />
                                                )}
                                            </View>
                                        )}
                                        {/* L2/L3 */}
                                        {isPostLogin && haveDonationDetails && !isTapTastic && (
                                            <View style={styles.descriptionContainer}>
                                                <Typography
                                                    fontSize={20}
                                                    fontWeight="bold"
                                                    lineHeight={24}
                                                    text={donationDetails.totalContribution}
                                                    textAlign="left"
                                                />
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    lineHeight={17}
                                                    text="Donated so far"
                                                    textAlign="left"
                                                />
                                            </View>
                                        )}
                                        {!isTapTastic && (
                                            <View style={styles.mbbHeartActionContainer}>
                                                <ActionButton
                                                    activeOpacity={0.8}
                                                    backgroundColor={YELLOW}
                                                    borderRadius={15}
                                                    height={30}
                                                    componentCenter={
                                                        <Typography
                                                            fontSize={12}
                                                            fontWeight="600"
                                                            lineHeight={15}
                                                            text="Donate Now"
                                                        />
                                                    }
                                                    style={styles.mbbHeartAction}
                                                    onPress={handleDashboardAuth}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    {isPostLogin && haveDonationDetails && !isTapTastic && (
                                        <View style={styles.mastheadContainer}>
                                            <View style={styles.donatedAmtLabelContainer}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={17}
                                                    fontWeight="600"
                                                >
                                                    <Typography
                                                        fontSize={12}
                                                        lineHeight={17}
                                                        fontWeight="600"
                                                        text="Thanks for making a difference. Your donation of "
                                                    />
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="bold"
                                                        lineHeight={18}
                                                        text={`${donationDetails.individualContribution}`}
                                                    />
                                                    <Typography
                                                        fontSize={12}
                                                        lineHeight={17}
                                                        fontWeight="600"
                                                        text=" will be going to our selected charities"
                                                    />
                                                </Typography>
                                            </View>
                                            {/* L2 */}
                                            {/* {isPostLogin && !isPostPassword && haveDonationDetails && (
                                            <View style={styles.donatedAmtLabelContainer}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={14}
                                                    text={`Your\ndonation to\nMaybank Heart`}
                                                    color={RED_BERRY}
                                                    textAlign="center"
                                                />
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={donationDetails.individualContribution}
                                                    color={RED_BERRY}
                                                    textAlign="center"
                                                />
                                            </View>
                                        )} */}
                                            {/* L3 */}
                                            {/* {isPostLogin && isPostPassword && haveDonationDetails && (
                                            <View style={styles.donatedAmtLabelContainer}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    text={`Every bit counts!\nYour donation of`}
                                                    color={RED_BERRY}
                                                    textAlign="center"
                                                />
                                                <Typography
                                                    fontSize={12}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={donationDetails.individualContribution}
                                                    color={RED_BERRY}
                                                    textAlign="center"
                                                />
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    text="will be going to our selected charities."
                                                    color={RED_BERRY}
                                                    textAlign="center"
                                                />
                                            </View>
                                        )} */}
                                        </View>
                                    )}
                                </ImageBackground>
                            </View>
                        </Animated.View>
                    )}
                </TouchableSpring>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardBg: {
        borderRadius: 5,
        flex: 1,
        flexDirection: "row",
        height: "100%",
        overflow: "hidden",
        width: "100%",
        justifyContent: "space-between",
    },
    cardBgImg: {
        borderRadius: 5,
        height: "100%",
    },
    descriptionContainer: {
        paddingBottom: 14,
        paddingTop: 28,
    },
    donatedAmtLabelContainer: {
        flexDirection: "column",
    },
    mastheadContainer: {
        flex: 0.45,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingRight: 18,
    },
    mbbHeartAction: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    mbbHeartActionContainer: {
        flexDirection: "row",
        // paddingVertical: 16,
    },
    mbbHeartContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    mbbHeartContainerCard: {
        backgroundColor: TRANSPARENT,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        height: 144,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    mbbHeartContainerInner: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 24,
    },
    mbbHeartWithDataInner: {
        alignItems: "flex-start",
        flex: 0.45,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
});

MaybankHeartWidget.propTypes = {
    getModel: PropTypes.func,
    isRefresh: PropTypes.any,
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    isTapTastic: PropTypes.bool,
};

export default withModelContext(MaybankHeartWidget);
