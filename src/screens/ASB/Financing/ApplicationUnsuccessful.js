import moment from "moment";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";

import { DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { YELLOW, MEDIUM_GREY, APPROX_SUVA_GREY } from "@constants/colors";
import {
    DATE,
    REFERENCE_NUMBER,
    APPLICATION_FALLED,
    PLZ_TRY_AGAIN,
    ACCEPTED_FOR_PROCESSING,
    OUR_BANK_STAFF,
} from "@constants/strings";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

const ApplicationUnsuccessfulScreen = ({ navigation, route }) => {
    const [showPopup, setShowPopup] = useState(false);
    function handleDone() {
        navigation.navigate(DASHBOARD);
    }
    function handleOkay() {
        setShowPopup(false);
    }
    const submitResponse = route.params?.submitResponse;
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
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
                            text={ACCEPTED_FOR_PROCESSING}
                            fontSize={20}
                            fontWeight="400"
                            lineHeight={20}
                            textAlign="left"
                            style={styles.title}
                        />
                        <Typo
                            text={OUR_BANK_STAFF}
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
                            onPress={handleDone}
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo fontSize={14} lineHeight={18} fontWeight="600" text="Done" />
                            }
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <Popup
                visible={showPopup}
                onClose={handleOkay}
                title={APPLICATION_FALLED}
                description={PLZ_TRY_AGAIN}
                primaryAction={{
                    text: "Okay",
                    onPress: handleOkay,
                }}
            />
        </ScreenContainer>
    );
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
        marginBottom: 30,
    },
});

ApplicationUnsuccessfulScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default React.memo(ApplicationUnsuccessfulScreen);
