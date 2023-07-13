import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, APPROX_SUVA_GREY } from "@constants/colors";
import {
    DATE,
    REFERENCE_NUMBER,
    FINANCING_ACCOUNT_SUCCESS_MSG,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
    FINANCING_SUCCESSFUL_SUBMIT,
    FINANCING_ACCOUNT_CREATED_SUBMIT,
    DONE,
} from "@constants/strings";

import Assets from "@assets";

import { FA_FORM_COMPLETE } from "../../../constants/strings";

const screenHeight = Dimensions.get("window").height;

const ApplicationFinancingSuccessful = ({ navigation, route }) => {
    const submitResponse = route.params?.submitResponse;

    function onDoneTap() {
        console.log("onDoneTap");
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_iETFinancingApproved",
            [FA_TRANSACTION_ID]: submitResponse.requestMsgRefNo,
        });
        showSuccessToast({
            message: FINANCING_ACCOUNT_SUCCESS_MSG,
        });
        navigation.navigate(navigationConstant.DASHBOARD);
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_ASBFinancing_iETFinancingApproved"
        >
            <ScreenLayout
                header={<HeaderLayout />}
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIcon}
                                source={Assets.icTickNew}
                            />
                        </View>
                        <Typo
                            text={FINANCING_SUCCESSFUL_SUBMIT}
                            fontSize={20}
                            fontWeight="400"
                            lineHeight={20}
                            textAlign="left"
                            style={styles.title}
                        />
                        <Typo
                            text={FINANCING_ACCOUNT_CREATED_SUBMIT}
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={20}
                            textAlign="left"
                            style={styles.subTitle}
                            color={APPROX_SUVA_GREY}
                        />
                        <View>
                            <React.Fragment>
                                <View style={styles.detailsRowContainer}>
                                    <Typo
                                        text={REFERENCE_NUMBER}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.textRow}
                                    />
                                    <Typo
                                        text={submitResponse.requestMsgRefNo}
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="right"
                                        style={styles.textRow}
                                    />
                                </View>
                                <View style={styles.detailsRowContainer}>
                                    <Typo
                                        text={DATE}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.textRow}
                                    />
                                    <Typo
                                        text={
                                            submitResponse?.msgBody?.trantime &&
                                            moment(
                                                submitResponse?.msgBody?.trantime,
                                                "DD/MM/YYYY"
                                            ).format("D MMMM YYYY")
                                        }
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="right"
                                        style={styles.textRow}
                                    />
                                </View>
                            </React.Fragment>
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo fontSize={14} lineHeight={18} fontWeight="600" text={DONE} />
                            }
                            onPress={onDoneTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

ApplicationFinancingSuccessful.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
const styles = StyleSheet.create({
    bottomBtnContCls: {
        flex: 1,
        justifyContent: "space-around",
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        paddingBottom: 24,
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    statusIcon: {
        height: 56,
        width: 56,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 5) / 100,
        width: "100%",
    },
    subTitle: {
        marginBottom: 40,
        width: "90%",
    },
    textRow: {
        marginBottom: 15,
    },
    title: {
        marginBottom: 15,
    },
});

export default React.memo(ApplicationFinancingSuccessful);
