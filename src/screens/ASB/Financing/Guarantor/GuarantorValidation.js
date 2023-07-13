import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";

import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";

import asbDeclineBecomeAGuarantor from "@redux/reducers/ASBServices/asbDeclineBecomeAGuarantorReducer";

import { MEDIUM_GREY, ROYAL_BLUE, SEPARATOR, WHITE } from "@constants/colors";
import {
    BECOME_GUARANTOR,
    DECLINE,
    CANCEL,
    DECLINE_BECOME_GUARANTOR_TITLE,
    DECLINE_BECOME_GUARANTOR_DESC,
    REJECT,
    DECLINE_BECOME_GUARANTOR_TOAST,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

const GaurantorValidation = ({ route, navigation }) => {
    const dispatch = useDispatch();

    const title = route?.params?.title;
    const subTitle = route?.params?.subTitle;
    const subTitle2 = route?.params?.subTitle2;
    const subTitle3 = route?.params?.subTitle3;
    const onDoneTap = route?.params?.onDoneTap;
    const headingTitle = route?.params?.headingTitle;
    const headingTitleValue = route?.params?.headingTitleValue;
    const bodyList = route?.params?.bodyList;
    const mainApplicantName = route?.params?.mainApplicantName;
    const onCancelTap = route?.params?.onCancelTap;
    const userDataDecline = route?.params?.userDataDecline;

    const [cancelPopup, setCancelPopup] = useState(false);

    function onBackTap() {
        console.log("[GaurantorValidation] >> [onBackTap]");
        navigation.goBack();
    }

    function onPopupCloseConfirm() {
        setCancelPopup(false);
    }

    function handleLeaveBtn() {
        setCancelPopup(false);
        navigation.goBack();
        dispatch(
            asbDeclineBecomeAGuarantor(userDataDecline, () => {
                showSuccessToast({
                    message: DECLINE_BECOME_GUARANTOR_TOAST,
                });
                navigation.goBack();
            })
        );
    }

    function onDeclineBecomeGuarantor() {
        setCancelPopup(true);
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                style={styles.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={styles.formContainer}>
                                    <View>
                                        {title && (
                                            <Typo
                                                fontSize={14}
                                                fontWeight="300"
                                                lineHeight={23}
                                                textAlign="left"
                                                text={title}
                                            />
                                        )}
                                        {subTitle && <SpaceFiller height={4} />}
                                        {subTitle && (
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={24}
                                                textAlign="left"
                                                text={subTitle}
                                            />
                                        )}
                                        {subTitle2 && <SpaceFiller height={12} />}
                                        {subTitle2 && (
                                            <Typo
                                                fontSize={14}
                                                fontWeight="300"
                                                lineHeight={21}
                                                textAlign="left"
                                                text={subTitle2}
                                            />
                                        )}

                                        {subTitle3 && <SpaceFiller height={32} />}

                                        {subTitle3 && (
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={21}
                                                textAlign="left"
                                                text={subTitle3}
                                            />
                                        )}

                                        <SpaceFiller height={12} />

                                        {buildGuarantorValidationForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                        <Popup
                            visible={cancelPopup}
                            title={DECLINE_BECOME_GUARANTOR_TITLE}
                            description={DECLINE_BECOME_GUARANTOR_DESC(mainApplicantName)}
                            onClose={onPopupCloseConfirm}
                            primaryAction={{
                                text: REJECT,
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

    function buildGuarantorValidationForm() {
        return (
            <View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <View style={styles.shadow}>
                            <Spring style={styles.card} activeOpacity={0.9}>
                                <View style={styles.cardBody}>
                                    <SpaceFiller height={14} />
                                    <View style={styles.formContainerCard}>
                                        <View>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="center"
                                                text={headingTitle}
                                            />
                                            <SpaceFiller height={4} />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="center"
                                                text={headingTitleValue}
                                            />
                                        </View>
                                    </View>
                                    <SpaceFiller height={14} />
                                    <View style={styles.recRow} />
                                    <SpaceFiller height={24} />
                                    {bodyList.map((data, index) => {
                                        return (
                                            <View key={index}>
                                                <View style={styles.cardBodyRow}>
                                                    <View style={styles.cardBodyColL}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="400"
                                                            letterSpacing={0}
                                                            textAlign="left"
                                                            text={data.heading}
                                                        />
                                                    </View>
                                                    <View style={styles.cardBodyColR}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            fontWeight="600"
                                                            letterSpacing={0}
                                                            textAlign="right"
                                                            text={data.headingValue}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </Spring>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={styles.bottomBtnContCls}>
                    <View style={styles.footer}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={BECOME_GUARANTOR}
                                />
                            }
                            onPress={onDoneTap}
                        />
                        <SpaceFiller height={12} />
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            backgroundColor={MEDIUM_GREY}
                            componentCenter={
                                <Typo
                                    text={DECLINE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={ROYAL_BLUE}
                                />
                            }
                            onPress={onCancelTap ?? onDeclineBecomeGuarantor}
                        />
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GaurantorValidation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
});

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },

    cardBody: {
        paddingHorizontal: 16,
    },
    cardBodyColL: {
        width: "70%",
    },
    cardBodyColR: {
        width: "30%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    container: {
        flex: 1,
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    formContainerCard: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },
});

export default GaurantorValidation;
