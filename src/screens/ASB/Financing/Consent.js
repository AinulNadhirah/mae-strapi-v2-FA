import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSelector } from "react-redux";

import {
    APPLICATION_FINANCE_DETAILS,
    APPLY_LOANS,
    DASHBOARD,
    MENU,
    MORE,
    TAB,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { updateConsent } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    CREDIT_TNC,
    ASB_FINANCING,
    ASB_TERMS,
    PLSTP_AGREE,
    CREDIT_CONSET,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

function ASBConsentScreen({ navigation, route }) {
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    const [isConsentPressed, setIsConsentPressed] = useState(false);

    useEffect(() => {
        const reload = route?.params?.reload;
        reload ?? setIsConsentPressed(false);

        async function initialize() {
            await init();
        }
        initialize();
    }, [route?.params]);

    const init = async () => {
        console.log(
            "customerName**",
            prePostQualReducer?.customerName
                ? prePostQualReducer?.customerName
                : resumeStpDetails?.stpCustomerName
        );
        console.log("customerPAN**");
    };

    async function onDoneTap() {
        if (!isConsentPressed) {
            try {
                setIsConsentPressed(true);
                const data = {
                    userInfo: {
                        userId: "",
                        pan: "",
                        customerId: prePostQualReducer?.idNo
                            ? prePostQualReducer?.idNo
                            : resumeStpDetails?.stpIdno,
                        cusType: "",
                        gcif: prePostQualReducer?.localCifNo
                            ? prePostQualReducer?.localCifNo
                            : resumeStpDetails?.stpGcifNo,
                        token: "",
                        contactNumber: "",
                        userName: "",
                    },
                    creditRequest: {
                        stpreferenceNo: prePostQualReducer?.data?.stpreferenceNo
                            ? prePostQualReducer?.data?.stpreferenceNo
                            : resumeStpDetails?.stpReferenceNo,

                        idType: "NEW_IC",
                        idNumber: prePostQualReducer?.idNo
                            ? prePostQualReducer?.idNo
                            : resumeStpDetails?.stpIdno,
                        customerName: prePostQualReducer?.customerName
                            ? prePostQualReducer?.customerName
                            : resumeStpDetails?.stpCustomerName,
                    },
                };

                const response = await updateConsent(data, true);

                const result = response?.data?.result;
                const statusCode = result?.statusCode;
                if (statusCode === "0000") {
                    navToNextScreen(true);
                } else if (statusCode === "W001") {
                    showInfoToast({
                        message: result?.statusDesc,
                    });
                    setIsConsentPressed(false);
                } else {
                    navToNextScreen(statusCode !== "W001");
                }
            } catch (error) {
                navToNextScreen(true);
            }
        }
    }

    async function navToNextScreen() {
        navigation.navigate(APPLICATION_FINANCE_DETAILS);
    }

    function onCloseTap() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        navigation.navigate(APPLY_LOANS);
    }

    function onBackTap() {
        navigation.navigate(MORE, {
            screen: MENU,
            params: {
                goTo: {
                    screen: DASHBOARD,
                    params: {
                        redirect: {
                            screen: TAB_NAVIGATOR,
                            params: {
                                screen: TAB,
                                params: {
                                    screen: DASHBOARD,
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_ASBFinancing">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text="" />
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
                            {/* Credit Title */}
                            <Typo
                                fontSize={14}
                                lineHeight={23}
                                fontWeight="300"
                                textAlign="left"
                                text={ASB_FINANCING}
                                style={Style.headerLabelCls}
                            />

                            {/* Credit Desc */}
                            <Typo
                                fontSize={16}
                                lineHeight={20}
                                fontWeight="600"
                                textAlign="left"
                                text={CREDIT_CONSET}
                                style={Style.headerDescLabelCls}
                            />

                            {/* Credit TNC Desc */}
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
                                <View style={Style.textContainerDes}>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={20}
                                        fontWeight="400"
                                        textAlign="left"
                                        text={ASB_TERMS}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bottom docked button container */}
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
                                            text={PLSTP_AGREE}
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
    textContainerDes: {
        marginTop: 30,
        width: "100%",
    },
});

export default ASBConsentScreen;

ASBConsentScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    onPress: PropTypes.func,
};
