import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Text, Image, ScrollView, ImageBackground, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

import {
    DASHBOARD,
    PAYBILLS_MODULE,
    PAYBILLS_PAYEE_DETAILS,
    MB_HEART_TAPTASTIC,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";

import { getDonationData, getPayeeDetails, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, TRANSPARENT, WHITE } from "@constants/colors";
import { FA_SCREEN_NAME, FA_SELECT_ACTION } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { responsive } from "@utils";

import Assets, { tapTasticAssets } from "../../../assets";

class MaybankHeartTaptastic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            haveDonations: false,
            individualContribution: "RM0.00",
            totalContribution: "RM0.00",
        };
    }

    componentDidMount() {
        const { donationDetails, isPostLogin, isPostPassword } = this.props.route?.params;
        if (!donationDetails?.individualContribution) {
            this.getDonationDetails(isPostLogin, isPostPassword);
        }
    }

    getDonationDetails = async (isPostLogin, isPostPassword) => {
        if (!(isPostLogin || isPostPassword)) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[GatewayScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                this.onBackPress();
                return;
            }
        }
        const response = await getDonationData(false);
        console.log("[MaybankHeartTaptastic] response: ", response);
        if (response.data.statusCode === "000") {
            const { currencyCode, individualContribution, totalContribution } = response.data;
            this.setState({
                totalContribution: `${currencyCode}${numeral(totalContribution).format("0,0.00")}`,
                individualContribution: individualContribution
                    ? `${currencyCode}${numeral(individualContribution).format("0,0.00")}`
                    : "RM0.00",
                haveDonations: true,
            });
        }
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={
                    <HeaderBackButton
                        isWhite={this.props.route?.params?.tapTasticType === "raya22"}
                        onPress={this.onBackPress}
                    />
                }
                headerCenterElement={
                    <HeaderLabel>
                        <Text
                            style={
                                this.props.route?.params?.tapTasticType === "raya22" && {
                                    color: WHITE,
                                }
                            }
                        >
                            MaybankHeart
                        </Text>
                    </HeaderLabel>
                }
            />
        );
    };

    createRequiredFieldObj = (fieldLabel, fieldValue, fieldName) => {
        const alternateLabel =
            fieldName == "bilAcct" ? "Bill Account Number" : "Bill Reference Number";
        return {
            fieldLabel: fieldLabel,
            fieldValue: "",
            fieldName: fieldName,
            alternateLabel: alternateLabel,
        };
    };

    handleGoToDonate = async () => {
        // L3 call to invoke login page
        const { navigation, route } = this.props;
        const { isPostPassword } = route?.params;
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
                console.log("[MaybankHeartTaptastic][getPayeeDetails] >> Success");

                const mbbHeartPayeeDetails = response?.data?.resultList[0] ?? [];
                console.log(
                    "[MaybankHeartTaptastic][getPayeeDetails] >> mbbHeartPayeeDetails:",
                    mbbHeartPayeeDetails
                );
                // do something with the payee data

                let requiredFieldArray = [];

                if (mbbHeartPayeeDetails.billAcctRequired == "0" && requiredFieldArray.length < 2) {
                    requiredFieldArray.push(
                        this.createRequiredFieldObj(
                            mbbHeartPayeeDetails.bilAcctDispName,
                            mbbHeartPayeeDetails.acctId,
                            "bilAcct"
                        )
                    );
                }

                if (mbbHeartPayeeDetails.billRefRequired == "0" && requiredFieldArray.length < 2) {
                    requiredFieldArray.push(
                        this.createRequiredFieldObj(
                            mbbHeartPayeeDetails.billRefDispName,
                            "",
                            "billRef"
                        )
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
                        fromScreen: MB_HEART_TAPTASTIC,
                        fromModule: PAYBILLS_MODULE,
                    },
                });
            })
            .catch((error) => {
                console.log("[MaybankHeartTaptastic][getPayeeDetails] >> Exception:", error);
            });
    };
    renderNgo = (isCny) => {
        if (!isCny) {
            return this.renderCnyNgo();
        }
        return (
            <>
                <View style={Styles.column}>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeart1} />
                        <Typo
                            text="Kechara Food
                            Kitchen Society"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeart3} />
                        <Typo
                            text="Yayasan Sejahtera"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                </View>
                <View style={Styles.column}>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeart2} />
                        <Typo
                            text="Persatuan Kebajikan Kasih"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeart4} />
                        <Typo
                            text="Pertiwi Soup Kitchen"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                </View>
            </>
        );
    };
    renderCnyNgo = () => {
        return (
            <>
                <View style={Styles.column}>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeartCny1} />
                        <Typo
                            text="Dignity for Children"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeartCny3} />
                        <Typo
                            text="Saujana Cares Foundation (SCF)"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                </View>
                <View style={Styles.column}>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeartCny2} />
                        <Typo
                            text="IDEAS Autism Centre (IAC)"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                    <View style={Styles.iconRow}>
                        <Image style={Styles.icon} source={Assets.icHeartCny4} />
                        <Typo
                            text="Astronautical Association of Malaysia (Astro X)"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    </View>
                </View>
            </>
        );
    };
    render() {
        const {
            isTapTasticReady,
            tapTasticType,
            isPostLogin,
            isPostPassword,
            haveDonationDetails,
            donationDetails,
        } = this.props.route?.params;
        const { haveDonations, individualContribution, totalContribution } = this.state;
        const noDonationsMade =
            (haveDonations && individualContribution === "RM0.00") ||
            donationDetails?.individualContribution === "RM0.00";
        return (
            <ScreenContainer
                backgroundType="image"
                backgroundImage={tapTasticAssets?.raya22?.bgLoginSkin}
                backgroundColor={MEDIUM_GREY}
            >
                {!(donationDetails?.totalContribution || haveDonations) ? (
                    <ScreenLoader showLoader />
                ) : (
                    <ScreenLayout
                        header={this.getHeaderUI()}
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            style={Styles.scrollView}
                        >
                            {noDonationsMade && (
                                <Animatable.View
                                    animation="fadeInUp"
                                    duration={700}
                                    useNativeDriver
                                    style={Styles.desc0}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        text="Help make someone’s Raya season more special by supporting the following NGOs who are helping the underprivileged communities in Malaysia."
                                    />
                                </Animatable.View>
                            )}

                            <Animatable.View animation="fadeInUp" duration={300} useNativeDriver>
                                <Animatable.View
                                    animation="fadeInUp"
                                    duration={300}
                                    useNativeDriver
                                    style={Styles.totalDonation}
                                >
                                    <Typo
                                        fontSize={25}
                                        fontWeight="600"
                                        lineHeight={25}
                                        text={
                                            haveDonations
                                                ? totalContribution
                                                : donationDetails?.totalContribution
                                        }
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={40}
                                        text="Total donation"
                                    />
                                </Animatable.View>
                                {!noDonationsMade && (
                                    <Animatable.View
                                        animation="fadeInUp"
                                        duration={500}
                                        useNativeDriver
                                        style={Styles.yourDonation}
                                    >
                                        <Typo>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={16}
                                                text="Your Donation: "
                                            />
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={16}
                                                text={`${
                                                    haveDonations
                                                        ? individualContribution
                                                        : donationDetails?.individualContribution
                                                }`}
                                            />
                                        </Typo>
                                    </Animatable.View>
                                )}
                            </Animatable.View>
                            {!noDonationsMade && (
                                <Animatable.View
                                    animation="fadeInUp"
                                    duration={700}
                                    useNativeDriver
                                    style={Styles.desc1}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        text="Thank you for helping to make the Raya season more special for the less fortunate."
                                    />
                                </Animatable.View>
                            )}

                            <Animatable.View
                                animation="fadeInUp"
                                duration={700}
                                useNativeDriver
                                style={Styles.desc2}
                            >
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    text="Contributions made through this campaign will be distributed equally to the NGOs as follows:"
                                />
                                <Animatable.View
                                    animation="fadeInUp"
                                    duration={700}
                                    useNativeDriver
                                    style={Styles.donationBodyContainer}
                                >
                                    {this.renderNgo(tapTasticType === "raya22")}
                                </Animatable.View>
                            </Animatable.View>

                            <View style={Styles.buttonContainer}>
                                <ActionButton
                                    // disabled={this.state.disableAddButton}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.handleGoToDonate}
                                    // backgroundColor={this.state.disableAddButton ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Donate Now"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </ScrollView>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

MaybankHeartTaptastic.propTypes = {
    navigation: PropTypes.any,
    route: PropTypes.any,
};

export default MaybankHeartTaptastic;

const Styles = {
    buttonContainer: { paddingHorizontal: 20, marginVertical: 30 },
    column: {
        width: "50%",
        justifyContent: "flex-start",
        flexDirection: "column",
    },
    container: {
        flex: 1,
        alignItems: "flex-start",
        width: "100%",
    },
    desc0: { marginVertical: "5%", paddingHorizontal: 50 },
    desc1: {
        marginTop: "5%",
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderBottomColor: MEDIUM_GREY,
        borderColor: TRANSPARENT,
        paddingBottom: "5%",
        width: "90%",
        marginHorizontal: "5%",
    },
    desc2: {
        width: "90%",
        marginHorizontal: "5%",
        paddingVertical: 30,
    },
    donationBodyContainer: {
        marginTop: 30,
        flexDirection: "row",
        paddingHorizontal: 5,
    },
    totalDonation: {
        height: 105,
        marginHorizontal: 20,
        backgroundColor: "#FFFFFF",
        width: "90%",
        borderColor: MEDIUM_GREY,
        borderWidth: 1.5,
        borderRadius: 8,
        paddingTop: "7%",
        zIndex: 2,
    },
    scrollView: {
        flex: 1,
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
    },
    icon: {
        width: 90,
        height: 40,
        padding: 50,
        marginHorizontal: 30,
        marginVertical: 18,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: MEDIUM_GREY,
    },
    iconRow: {
        alignContent: "center",
        alignItems: "center",
        height: 200,
    },
    imageBG: { bottom: 0, left: 0, right: 0, position: "absolute" },
    yourDonation: {
        flex: 1,
        height: 45,
        marginTop: -10,
        marginHorizontal: 20,
        paddingTop: 20,
        backgroundColor: "#fce698",
        width: "90%",
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderWidth: 0.5,
        borderTopColor: TRANSPARENT,
        borderColor: MEDIUM_GREY,
    },
};
