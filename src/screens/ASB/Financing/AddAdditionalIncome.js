import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";

import { ADDITIONAL_MONTHLY_INCOME, APPLY_LOANS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW } from "@constants/colors";
import {
    ADD_ADDITIONAL_INCOME,
    TO_MAINTAIN,
    ENTER_ADDITIONAL,
    PREPARE_YOUR_LATEST_SALARY,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    PROCEED_CAP,
    LEAVE,
    CANCEL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import Assets from "@assets";

function AddAdditionalIncome({ navigation, route }) {
    const data = route.params?.data;
    const [loanTenure, setTenure] = useState("");

    const [result, setResult] = useState([]);
    const [grassIncome, setgrassIncome] = useState("");
    const [loanInformation, setLoanInformation] = useState([]);

    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const { loanInformation, grassIncome, loanTenure } = route.params;
        setLoanInformation(loanInformation);
        setgrassIncome(grassIncome);
        setTenure(loanTenure);
        setResult(data);
        console.log("route.params loanInformation=>", loanInformation);
        console.log("route.params grassIncome=>", grassIncome);
        console.log("route.params loanTenure=>", loanTenure);
    };

    function navToProceedScreen() {
        navigation.navigate(ADDITIONAL_MONTHLY_INCOME, {
            data: result,
            loanInformation,
            grassIncome,
            loanTenure,
        });
    }

    function onCloseTap() {
        console.log("[PLSTPCreditCheck] >> [onCloseTap]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }

    function onBackTap() {
        navigation.goBack();
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        navigation.navigate(APPLY_LOANS);
    };
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_2">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} />
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
                            <Image style={Style.addIcomeIcon} source={Assets.addUserCameraIcon} />
                            <Typo
                                fontSize={14}
                                lineHeight={21}
                                fontWeight="400"
                                textAlign="left"
                                text={ADD_ADDITIONAL_INCOME}
                                style={Style.headerLabelCls}
                            />

                            <Typo
                                fontSize={16}
                                lineHeight={22}
                                fontWeight="600"
                                textAlign="left"
                                text={TO_MAINTAIN}
                                style={Style.headerDescLabelCls}
                            />
                            <View style={Style.subListItem}>
                                <Typo
                                    fontSize={18}
                                    lineHeight={22}
                                    fontWeight="700"
                                    textAlign="left"
                                    text="•"
                                    style={Style.dotSym}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={21}
                                    fontWeight="400"
                                    textAlign="left"
                                    text={ENTER_ADDITIONAL}
                                    style={Style.subListText}
                                />
                            </View>
                            <View style={Style.subListItem}>
                                <Typo
                                    fontSize={18}
                                    lineHeight={22}
                                    fontWeight="700"
                                    textAlign="left"
                                    text="•"
                                    style={Style.dotSym}
                                />
                                <Typo
                                    fontSize={14}
                                    lineHeight={21}
                                    fontWeight="400"
                                    textAlign="left"
                                    text={PREPARE_YOUR_LATEST_SALARY}
                                    style={Style.subListText}
                                />
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
                                            text={PROCEED_CAP}
                                        />
                                    }
                                    onPress={navToProceedScreen}
                                />
                            </View>
                        </FixedActionContainer>

                        <Popup
                            visible={showPopupConfirm}
                            onClose={onPopupCloseConfirm}
                            title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                            description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                            primaryAction={{
                                text: LEAVE,
                                onPress: handleLeaveBtn,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onPopupCloseConfirm,
                            }}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

AddAdditionalIncome.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    addIcomeIcon: {
        alignSelf: "center",
        height: 55,
        width: 55,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    dotSym: {
        marginRight: 10,
        marginTop: 24,
    },
    headerDescLabelCls: {
        marginTop: 5,
    },
    headerLabelCls: {
        marginTop: 25,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 20,
    },
    subListItem: {
        flexDirection: "row",
        paddingRight: 30,
    },
    subListText: {
        marginTop: 25,
    },
});

export default AddAdditionalIncome;
