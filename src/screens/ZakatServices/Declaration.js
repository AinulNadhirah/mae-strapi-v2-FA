/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import {
    ZAKAT_DEBIT_CONFIRMATION,
    ZAKAT_SERVICES_STACK,
    PDF_VIEW,
    COMMON_MODULE
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import SpaceFiller from "@components/Placeholders/SpaceFiller";

import {
    TNC_ZAKAT_DECLARATION,
    PDS_ZAKAT_DECLARATION,
    PRIVACY_NOTICE_ZAKAT_DECLARATION
} from "@constants/premierUrl";

import {
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    YELLOW,
} from "@constants/colors";
import {
    I_HEREBY_DECLARE_ZAKAT_POINT_1,
    I_HEREBY_DECLARE_ZAKAT_POINT_2,
    I_HEREBY_DECLARE_ZAKAT_POINT_3,
    ZAKAT_PRIVACY_NOTICE_LINK,
    I_HEREBY_DECLARE_ZAKAT_POINT_4,
    PLSTP_TNC_NOTE,
    TERMS_CONDITIONS,
} from "@constants/strings";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";

const Declaration = ({ navigation, route }) => {
    const [isTncSelected, setIsTncSelected] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);

    const { params: zakatParams } = { ...route };

    useEffect(() => {
        setButtonEnabled(isTncSelected === true || isTncSelected === false);
    }, [isTncSelected]);

    function onPressBack() {
        navigation.goBack();
    }

    function onCloseButton() {
        navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "MAE_ACC_DASHBOARD"
            },
        });
    }

    function onPressConfirm() {
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_DEBIT_CONFIRMATION, 
            params: {
                ...zakatParams,
                consent: isTncSelected
            }
        });
    }

    function onTNCLinkDidTap() {
        const params = {
            file: TNC_ZAKAT_DECLARATION,
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };
        showPdfScreen(params);
    }

    function onPDSLinkDidTap () {
        const params = {
            file: PDS_ZAKAT_DECLARATION,
            share: false,
            type: "url",
            title: "Product Disclosure Sheet",
            pdfType: "shareReceipt",
        };
        showPdfScreen(params);
    }

    function onPrivacyNoticeLinkDidTap () {
        const params = {
            file: PRIVACY_NOTICE_ZAKAT_DECLARATION,
            share: false,
            type: "url",
            title: "Privacy Notice",
            pdfType: "shareReceipt",
        };
        showPdfScreen(params);
    }

    function showPdfScreen (params) {
        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }

    return (
        <ScreenContainer analyticScreenName="Apply_AutoDebitZakat_Declaration">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseButton}/>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <SpaceFiller height={16}/>
                    <Typo text="Declaration" fontWeight="600" fontSize={14} textAlign="left" />
                    <SpaceFiller height={24}/>
                    <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                        {PLSTP_TNC_NOTE}
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={styles.underline}
                            text={TERMS_CONDITIONS}
                            onPress={onTNCLinkDidTap}
                        />
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="400"
                            letterSpacing={0}
                            textAlign="left"
                            text=" and "
                        />
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={styles.underline}
                            text="Product Disclosure Sheet"
                            onPress={onPDSLinkDidTap}
                        />
                    </Typo>

                    <SpaceFiller height={24}/>

                    <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left" text={I_HEREBY_DECLARE_ZAKAT_POINT_1}/>
                    <SpaceFiller height={24}/>
                    <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left" text={I_HEREBY_DECLARE_ZAKAT_POINT_2}/>
                    <SpaceFiller height={24}/>

                    <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                        {I_HEREBY_DECLARE_ZAKAT_POINT_3}
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={styles.underline}
                            text={ZAKAT_PRIVACY_NOTICE_LINK}
                            onPress={onPrivacyNoticeLinkDidTap}
                        />
                        
                        {I_HEREBY_DECLARE_ZAKAT_POINT_4}
                    </Typo>

                    <SpaceFiller height={8}/>
                    <View style={styles.paddingTermsConditions}>
                        <View style={styles.tncContainer}>
                            <TouchableOpacity onPress={() => setIsTncSelected(true)}>
                                {isTncSelected === true ? <RadioChecked /> : <RadioUnchecked />}
                            </TouchableOpacity>
                            <Typo
                                text="Yes, I expressly agree to be contacted"
                                textAlign="left"
                                lineHeight={18}
                                fontWeight="400"
                                fontSize={14}
                                style={styles.tncText}
                            />
                        </View>
                        <View style={styles.tncContainer}>
                            <TouchableOpacity onPress={() => setIsTncSelected(false)}>
                                {isTncSelected === false ? <RadioChecked /> : <RadioUnchecked />}
                            </TouchableOpacity>
                            <Typo
                                text="No, I do not agree to be contacted"
                                textAlign="left"
                                lineHeight={18}
                                fontWeight="400"
                                fontSize={14}
                                style={styles.tncText}
                            />
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressConfirm}
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                text="Agree & Confirm"
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

Declaration.propTypes = {
    props: PropTypes.object,
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
    index: PropTypes.number,
};

const LabelValue = ({ label, value }) => {
    return (
        <View style={styles.labelValueContainer}>
            <Typo text={label} fontSize={14} fontWeight="400" />
            <Typo text={value} fontSize={14} fontWeight="600" />
        </View>
    );
};

LabelValue.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    underline: {
        textDecorationLine: "underline",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    labelValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 24,
    },
    tncContainer: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    tncText: {
        paddingLeft: 10,
    },
    paddingTermsConditions: {
        paddingBottom: 24
    }
});

export default Declaration;
