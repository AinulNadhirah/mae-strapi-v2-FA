import PropTypes from "prop-types";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";

import {
    ZAKAT_DEBIT_ACCT_SELECT, ZAKAT_SERVICES_STACK
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { YELLOW, SEPARATOR_GRAY, BLACK } from "@constants/colors";
import {
    ZAKAT_NOTE_POINT1,
    COMMON_ERROR_MSG,
    SUCC_STATUS,
    ZAKAT_AUTO_DEBIT_TEXT,
    ZAKAT_AUTO_DEBIT_PAYNOTIFER,
    ZAKAT_NO_ISLAMICACCT_TO_SELECT
} from "@constants/strings";

import Assets from "@assets";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { checkZakatEligibilityRegistration, fetchZakatDebitAccts, bankingGetDataMayaM2u, fetchzakatCalculationDetailsAPI } from "@services";
import { showErrorToast, showInfoToast } from "@components/Toast";
import HTML from "react-native-render-html";
import { TouchableOpacity } from "react-native-gesture-handler";
import CalculationNotes from "./s2uUtility/CalculationNotes";

const ZakatDebitCalculation = (props, route) => {
    const { navigation } = props;

    function onBackTap() {
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[ZakatDebitCalculation] >> [onNextTap]");
        moveToNext();
    }

    const moveToNext = async () => {
        await checkIFCustomerIsEligible();
    };

    function getHeaderImage() {
        return Assets.zakatDebitEntryHeader;
    }

    const [zakatIntroData, setZakatIntroData] = useState();

    const SUBTITLE = [
        {
            header: `Auto calculate your zakat amount on ${zakatIntroData?.Auto_Calculate_Zakat_amount_On ?? ""} every year`,
            description: `Based on ${zakatIntroData?.Wealth_percentage ?? ""} of your total wealth with Maybank Islamic and subject to the nisab amount of your preferred zakat body.`
        },
        {
            header: `Notify you of the final zakat amount via push notification by ${zakatIntroData?.Get_Push_Notification_On ?? ""} every year`,
            description: `You can also view and download your Zakat statement through Maybank2u.`
        },
        {
            header: `Auto debit the zakat from your account on ${zakatIntroData?.Get_Push_Notification_On ?? ""} every year`
        }
    ];

    const ZAKAT_NOTE = [
        ZAKAT_NOTE_POINT1,
        `Auto debits that are set up after ${zakatIntroData?.Auto_Calculate_Zakat_amount_On ?? ""} in the current year will only be calculated and deducted starting the next year.`,
        "You may cancel your auto debit for this zakat anytime through your Maybank2u Settings."
    ];

    const getZakatIntroDetails = useCallback(async () => {
        try {
            const response = await fetchzakatCalculationDetailsAPI();
            setZakatIntroData(response.data);
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, []);

    useEffect(() => {
        getZakatIntroDetails();
    }, [getZakatIntroDetails]);

    function headerHighlight() {
        return (
            <View style={Style.highlightChipContainer}>
                <TouchableOpacity style={Style.highlightView}>
                <Typo
                    text="Zakat Simpanan & Pelaburan"
                    fontWeight="600"
                    fontSize={12}
                    color="#ffffff"
                    lineHeight={24}
                    textAlign="left"
                />
                </TouchableOpacity>
            </View>
        );
    }

    function getHeaderDescription() {
        //return isZest ? ZEST_ENTRY_DESCRIPTION : M2U_PREMIER_ENTRY_DESCRIPTION;
        return (
            <>
                <SpaceFiller height={20} />
                <View >
                    <Typo
                        text={ZAKAT_AUTO_DEBIT_TEXT}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={24}
                        textAlign="left"
                    />
                    <Typo
                        text={ZAKAT_AUTO_DEBIT_PAYNOTIFER}
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={20}
                        textAlign="left"
                    />
                    <Typo
                        text="Upon setup, we will:"
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={40}
                        textAlign="left"
                    />
                    <CalculationNotes notes={SUBTITLE}/>
                </View>
                <SpaceFiller height={24} />
                <View style={Style.separator} />
                <SpaceFiller height={12} />
                <View style={Style.footerNotesStyle}>
                    <Typo
                        text="Note:"
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={18}
                        textAlign="left"
                    />

                    {ZAKAT_NOTE.map((item, index) => {
                        return (
                            <View key={index} style={Style.calculationPointsContainer}>
                                <Typo
                                    text={`${++index}.`}
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={18}
                                    style={Style.tickPointerStyle}
                                />
                                <HTML
                                    html={item}
                                    baseFontStyle={Style.numberTextStyle}
                                    tagsStyles={{
                                        b: {
                                            fontFamily: "montserrat",
                                            fontSize: 12,
                                            fontWeight: "400",
                                            color: BLACK,
                                        },
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>
            </>
        );
    }

    const fetchAllAccounts = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", true);
            if (response?.data) {
                const accounts = response?.data?.result?.accountListings;
                if (accounts.length) {
                    const accountsTemp = response?.data?.result?.accountListings?.map((item) => {
                        return {
                            number: item?.number?.slice(0, 12),
                            name: item?.name,
                            code: item?.code,
                            group: item?.group,
                            type: item?.type,
                            jointAccount: item?.jointAccount
                        };
                    });
                    if (accountsTemp.length) {
                        await fetchZakatDropDowns(accountsTemp, response?.data?.result?.maeAvailable);
                    }
                } else {
                    showInfoToast({ message: ZAKAT_NO_ISLAMICACCT_TO_SELECT });
                }
            }
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    };

    const fetchZakatDropDowns = useCallback(async (accountsList, maeAvailable) => {
        try {
            const response = await fetchZakatDebitAccts(false);
            if (response?.data) {
                const { allowedAccounts, zakatBodyList, zakatTypeList } = { ...response?.data?.data };
                if (allowedAccounts && accountsList && allowedAccounts.length && accountsList.length) {
                    const newAccts = accountsList.filter((mainAcct) => {
                        return allowedAccounts.filter((zakatAcct) => 
                            (mainAcct?.code === zakatAcct?.subServiceCode && mainAcct?.type === zakatAcct?.note1 && !mainAcct.jointAccount)).length;
                    });
                    if (!newAccts.length) {
                        showInfoToast({ message: ZAKAT_NO_ISLAMICACCT_TO_SELECT });
                    } else {
                        navigation.navigate(ZAKAT_SERVICES_STACK, {
                            screen: ZAKAT_DEBIT_ACCT_SELECT,
                            params: {
                                zakatAccts: newAccts,
                                zakatBody: zakatBodyList,
                                zakatTypes: zakatTypeList,
                                isMaeAvailable: maeAvailable
                            }
                        });
                    }
                } else {
                    showInfoToast({ message: ZAKAT_NO_ISLAMICACCT_TO_SELECT });
                }
            }
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    }, []);

    async function checkIFCustomerIsEligible() {
        try {
            const response = await checkZakatEligibilityRegistration();
            const { status, message } = { ...response.data };
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                //await fetchZakatDropDowns();
                await fetchAllAccounts();
            } else {
                showInfoToast({
                    message
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }

    const scrollView = useRef();

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" 
                analyticScreenName="Apply_AutoDebitZakat_Introduction">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false} ref={scrollView}
                            >
                            <Image source={getHeaderImage()} style={Style.bgImage} />
                            
                            <View style={Style.container}>
                                {
                                    headerHighlight()
                                }
                                {
                                    getHeaderDescription()
                                }
                            </View>
                            
                        </ScrollView>
                        
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    activeOpacity={props.statusDownTime === "success" ? 1 : 0.5}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text="Set Up Now"
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

ZakatDebitCalculation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    props: PropTypes.object,
    statusDownTime: PropTypes.string,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    bgImage: { resizeMode: "cover", width: "100%" },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    calculationPointsContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        marginVertical: 5,
        paddingRight: 20,
    },
    footerNotesStyle: {
        // borderTopWidth: 0.5, 
        // borderTopColor: FADE_GREY, 
        opacity: 0.3,
        //marginTop: 20
        paddingBottom: 24
    },
    numberTextStyle: {
        color: `#000000`,
        fontFamily: "montserrat",
        fontSize: 11,
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "left",
        letterSpacing: 0,
        width: "90%",
    },
    tickPointerStyle: {
        height: 15,
        width: 12,
        marginRight: 10,
    },
    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        //marginVertical: 30,
    },
    highlightChipContainer: {
        marginTop: 16,
        alignItems: 'flex-start',
    },
    highlightView: {
        borderRadius: 12,
        backgroundColor: `#4597A0`,
        paddingHorizontal: 16,
    },
});

export default ZakatDebitCalculation;
