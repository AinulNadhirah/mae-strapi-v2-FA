import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    PDF_VIEWER,
    COMMON_MODULE,
    DEACTIVATE_CARDS_CASA_CONFIRMATION,
    SECURE_SWITCH_STACK,
    M2U_DEACTIVATE,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import KillSwitchConfirmation from "@components/KillSwitchConfirmation";

import {
    BLACK,
    WHITE,
    MEDIUM_GREY,
    YELLOW,
    GREY,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";
import {
    NEXT,
    PLEASE_SELECT,
    BLOCK_CREDIT_CARD,
    BLOCK_CREDIT_CARDS_DESC,
    REASON_TO_BLOCK,
    KILL_SWITCH_TC_LINK,
    TERMS_CONDITIONS,
    CONFIRM,
    BLOCK_CREDIT_CARD_CONFIRMATION_MODEL,
    CANCEL,
    SUSPECTED_UNAUTHORISED_CARD_USAGE,
    MISPLACED_CARD,
    BLOCK_DETAILS,
    TERMS_AND_CONDITIONS_TEXT,
    TERMS_AND_CONDITIONS,
} from "@constants/strings";
import { BLOCK_REASON } from "@constants/data";

import Assets from "@assets";

const ACCOUNT_TYPES = [
    {
        title: SUSPECTED_UNAUTHORISED_CARD_USAGE,
        value: SUSPECTED_UNAUTHORISED_CARD_USAGE,
    },
    {
        title: MISPLACED_CARD,
        value: MISPLACED_CARD,
    },
];

const SelectCASAList = ({ route, navigation }) => {
    const { fromModule, fromScreen, itemsListForDeactivation, itemToDeactivate } = route.params;
    const insets = useSafeAreaInsets();

    const [showReasonsPicker, setShowReasonsPicker] = useState(false);
    const [selectedReason, setSelectedReason] = useState(PLEASE_SELECT);
    const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);
    const [showConfirmationModel, setShowConfirmationModel] = useState(false);

    function onBackHandler() {
        navigation.goBack();
    }

    function onCloseHandler() {
        if (fromModule && fromScreen) {
            navigation.navigate(fromModule, { screen: fromScreen });
        }
    }

    function onCloseReasonsPicker() {
        setShowReasonsPicker(false);
    }

    function onSelectReason(value) {
        setSelectedReason(value);
        setShowReasonsPicker(false);
    }

    function onClickReasonsPicker() {
        setShowReasonsPicker(true);
    }

    function onClickConfirmOnModel() {
        setShowConfirmationModel(false);
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: DEACTIVATE_CARDS_CASA_CONFIRMATION,
            params: {
                from: M2U_DEACTIVATE,
                fromModule,
                fromScreen,
                itemsListForDeactivation: [
                    ...itemsListForDeactivation,
                    {
                        id: BLOCK_REASON,
                        title: BLOCK_DETAILS,
                        showEdit: true,
                        navBackInd: 1,
                        listItems: [
                            {
                                title: REASON_TO_BLOCK,
                                blockReason: selectedReason,
                            },
                        ],
                    },
                ],
                itemToDeactivate,
            },
        });
    }

    function onClickTermsAndConditionsLink() {
        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEWER,
            params: {
                file: KILL_SWITCH_TC_LINK,
                type: "url",
                title: TERMS_CONDITIONS,
                showShare: false,
            },
        });
    }

    useEffect(() => {
        setIsNextButtonEnabled(selectedReason !== PLEASE_SELECT);
    }, [selectedReason]);

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={null}
                            headerLeftElement={<HeaderBackButton onPress={onBackHandler} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseHandler} />}
                        />
                    }
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                        <View>
                            <View style={styles.suspendAccHeading}>
                                <Typo
                                    text={BLOCK_CREDIT_CARD}
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.suspendAccTitle}
                                />
                                <Typo
                                    text={BLOCK_CREDIT_CARDS_DESC}
                                    fontSize={16}
                                    lineHeight={20}
                                    fontWeight="600"
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text={REASON_TO_BLOCK}
                                />
                                <View style={styles.dropDownView}>
                                    <TouchableOpacity
                                        style={styles.touchableView}
                                        onPress={onClickReasonsPicker}
                                    >
                                        <View>
                                            <Typo
                                                fontSize={13}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={23}
                                                letterSpacing={0}
                                                color={BLACK}
                                                textAlign="left"
                                                text={selectedReason}
                                                style={styles.dropDownText}
                                            />

                                            <Image
                                                style={styles.dropDownIcon}
                                                source={Assets.downArrow}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.termsConditionsOuterContainer}>
                                <View style={styles.termsConditionsContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        lineHeight={20}
                                        textAlign="left"
                                    >
                                        {TERMS_AND_CONDITIONS_TEXT}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={20}
                                            fontWeight="600"
                                            text={TERMS_AND_CONDITIONS}
                                            style={styles.textUnderline}
                                            onPressText={onClickTermsAndConditionsLink}
                                            textAlign="left"
                                        />
                                    </Typo>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </ScreenLayout>
                <FixedActionContainer>
                    <View
                        style={[
                            styles.btnFooter,
                            {
                                marginBottom: insets.bottom,
                            },
                        ]}
                    >
                        <ActionButton
                            fullWidth
                            disabled={!isNextButtonEnabled}
                            backgroundColor={isNextButtonEnabled ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={isNextButtonEnabled ? BLACK : DISABLED_TEXT}
                                    text={NEXT}
                                />
                            }
                            onPress={() => {
                                setShowConfirmationModel(true);
                            }}
                        />
                    </View>
                </FixedActionContainer>
                <Popup
                    visible={showConfirmationModel}
                    onClose={() => {
                        setShowConfirmationModel(false);
                    }}
                    ContentComponent={<KillSwitchConfirmation
                        {...BLOCK_CREDIT_CARD_CONFIRMATION_MODEL}
                        primaryAction={{
                            text: CONFIRM,
                            onPress: onClickConfirmOnModel,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: () => {
                                setShowConfirmationModel(false);
                            }
                        }}
                    />}
                />
            </ScreenContainer>
            <ScrollPicker
                showPicker={showReasonsPicker}
                items={ACCOUNT_TYPES}
                onCancelButtonPressed={onCloseReasonsPicker}
                onDoneButtonPressed={onSelectReason}
                itemHeight={60}
            />
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    btnFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    dropDownIcon: {
        height: 8,
        marginLeft: "88%",
        marginTop: -10,
        width: 15,
    },

    dropDownText: {
        height: 19,
        marginLeft: "5%",
        marginTop: -10,
        maxWidth: "75%",
        width: "75%",
    },

    dropDownView: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 1,
        height: 48,
        marginTop: 16,
        width: "100%",
    },

    fieldContainer: {
        marginLeft: 24,
        marginRight: 24,
    },
    scrollViewContainer: {
        backgroundColor: MEDIUM_GREY,
    },
    suspendAccHeading: {
        marginBottom: 36,
        marginLeft: 24,
        marginRight: 24,
        marginTop: 16,
    },
    suspendAccTitle: {
        paddingBottom: 4,
    },
    termsConditionsContainer: {
        borderTopWidth: 1,
        borderTopColor: GREY,
        paddingVertical: 24,
    },
    termsConditionsOuterContainer: {
        marginHorizontal: 24,
        marginVertical: 36,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
    touchableView: {
        alignItems: "center",
        flexDirection: "row",
        height: "100%",
        marginLeft: "6%",
        width: "100%",
    },
});

SelectCASAList.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default SelectCASAList;
