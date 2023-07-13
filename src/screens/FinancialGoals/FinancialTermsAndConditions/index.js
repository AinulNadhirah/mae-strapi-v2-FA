import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Modal from "react-native-modal";

import {
    BANKINGV2_MODULE,
    FUND_ALLOCATION,
    KICKSTART_CONFIRMATION,
    UNIT_TRUST_OPENING_DECLARATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, YELLOW } from "@constants/colors";
import {
    FA_FIN_STARTINVEST_TNC,
    FA_FIN_GOAL_APPLY_UT_TNC,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    TERMS_CONDITIONS,
    I_HAVE_READ_AND_AGREE,
} from "@constants/strings";
import { FINANCIAL_PIDM_BROCHURE, FINANCIAL_UNIT_TRUST_GUIDE } from "@constants/url";

const FinancialTermsAndConditions = ({ navigation, route }) => {
    const termsCondition = [
        "If you redeem your unit in a unit trust fund and then purchase unit in another, you will probably have to pay a sales charge. However, if you switch from one fund to another managed by the same UTMC, it is likely that you may not have to pay any sales charge. Do you know about switching?",
        "Different types of unit trust carry different levels of risk. Some are higher in risk than others. Do you know the risk of investing in the fund? Make sure you know what your fund is investing in.",
        "If you are a first time investor in a UTMC, you may be eligible for cooling-off right, whereby you can change your mind within six(6) business days after investing and withdraw your unit trust investment. Find out about your eligibility for cooling-off.",
        "A company may market and distribute unit trust funds using a nominee system. If you are investing through a company which uses a nominee system, your right as a unit holder may be limited. Have you found out if your right as unit holder will be limited in any way?",
    ];

    const { fromScreen, crossButtonScreen } = route?.params;

    const [showBrowser, setShowBrowser] = useState(false);
    const [browserDetail, setBrowserDetail] = useState({});

    useEffect(() => {
        switch (fromScreen) {
            case UNIT_TRUST_OPENING_DECLARATION:
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: FA_FIN_GOAL_APPLY_UT_TNC,
                });
                break;
            case KICKSTART_CONFIRMATION:
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_TNC,
                });
                break;
            default:
                break;
        }
    }, [fromScreen]);

    function onPressBack() {
        navigation.goBack();
    }
    function onPressClose() {
        if (fromScreen === KICKSTART_CONFIRMATION) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FUND_ALLOCATION,
            });
        } else if (crossButtonScreen) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: crossButtonScreen,
            });
        } else {
            navigation.goBack();
        }
    }

    function onPressPIDMBrochure() {
        setBrowserDetail({
            title: "PIDM Brochure",
            url: FINANCIAL_PIDM_BROCHURE,
        });
        setShowBrowser(true);
    }
    function onPressUnitTrust() {
        setBrowserDetail({
            title: "Unit Trust Invesment Guide",
            url: FINANCIAL_UNIT_TRUST_GUIDE,
        });
        setShowBrowser(true);
    }

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    return (
        <ScreenContainer>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={
                            !route?.params?.hideCrossButton ? (
                                <HeaderCloseButton onPress={onPressClose} />
                            ) : null
                        }
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={
                            <Typo
                                text={TERMS_CONDITIONS}
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Typo textAlign="left" fontWeight="400" fontSize={14} lineHeight={20}>
                        {I_HAVE_READ_AND_AGREE}
                        <Typo
                            text="PIDM brochure"
                            fontWeight="600"
                            fontSize={14}
                            style={styles.pidmText}
                            onPress={onPressPIDMBrochure}
                        />
                        <Typo text=" and " fontWeight="400" fontSize={14} />
                        <Typo
                            text="Unit Trust Investment Guide"
                            fontWeight="600"
                            fontSize={14}
                            style={styles.pidmText}
                            onPress={onPressUnitTrust}
                        />
                    </Typo>
                    <Typo
                        text="I have read and understand to the Preinvestment Form below "
                        textAlign="left"
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        style={styles.subtitle}
                    />
                    {termsCondition.map((item, index) => {
                        return <PointDisplay text={item} index={index + 1} key={index} />;
                    })}
                </ScrollView>
                {route?.params?.showAgreeButton && (
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            backgroundColor={YELLOW}
                            onPress={route?.params?.ctaAction}
                            style={styles.button}
                            componentCenter={
                                <Typo
                                    text={route?.params.ctaText}
                                    fontWeight="600"
                                    fontSize={14}
                                    color={BLACK}
                                />
                            }
                        />
                    </FixedActionContainer>
                )}
            </ScreenLayout>
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
                <Browser
                    source={{ uri: browserDetail?.url }}
                    title={browserDetail?.title}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
        </ScreenContainer>
    );
};

FinancialTermsAndConditions.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const PointDisplay = ({ index, text }) => {
    return (
        <View style={styles.pointDisplayContainer}>
            <Typo text={`${index}.  `} fontWeight="400" fontSize={12} lineHeight={18} />
            <Typo text={text} fontWeight="400" fontSize={12} textAlign="left" lineHeight={18} />
        </View>
    );
};

PointDisplay.propTypes = {
    index: PropTypes.number,
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    button: {
        marginRight: 24,
    },
    container: {
        flex: 1,
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    modal: { margin: 0 },
    pidmText: {
        textDecorationLine: "underline",
    },
    pointDisplayContainer: {
        flexDirection: "row",
        paddingRight: 20,
        paddingTop: 20,
    },
    subtitle: {
        paddingTop: 20,
    },
});

export default FinancialTermsAndConditions;
