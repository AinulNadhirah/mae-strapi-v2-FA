import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, ScrollView, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";

import { ZEST_CASA_DECLARATION } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import additionalDetailsProps from "@redux/connectors/ZestCASA/additionalDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, DISABLED, YELLOW } from "@constants/colors";
import {
    ADDITIONAL_INFORMATION,
    CONTINUE,
    FILL_IN_ADDITIONAL_DETAILS,
    M2U_PREMIER_APPLICATION,
    PLEASE_SELECT,
    PRIMARY_SOURCE_WEALTH,
    ZEST_APPLICATION,
    ZEST_CASA_PRIMARY_INCOME,
    ZEST_CASA_SOURCE_OF_WEALTH,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_M2U_PREMIER_ADDITIONAL_DETAILS,
    APPLY_ZESTI_ADDITIONAL_DETAILS,
} from "./helpers/AnalyticsEventConstants";

const ZestCASAAdditionalDetails = (props) => {
    const { navigation } = props;

    const { primaryIncomeIndex, primaryWealthIndex } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [primaryIncomeScrollPicker, setPrimaryIncomeScrollPicker] =
        useState(scrollPickerInitialState);

    const [primarySourceOfWealthScrollPicker, setPrimarySourceOfWealthScrollPicker] =
        useState(scrollPickerInitialState);

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryIncomeIndex, primaryWealthIndex]);

    const init = async () => {
        console.log("[ZestCASAAdditionalDetails] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASAAdditionalDetails] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASAAdditionalDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[ZestCASAAdditionalDetails] >> [onNextTap]");
        if (props.isAdditionalDetailsContinueButtonEnabled) {
            props.isFromConfirmationScreenForAdditionalDetails
                ? navigation.goBack()
                : navigation.navigate(ZEST_CASA_DECLARATION);
        }
    }

    function onInfoIconDidTap() {
        setIsPopupVisible(true);
    }

    function onPopupCrossButtonDidTap() {
        setIsPopupVisible(false);
    }

    function onPrimaryIncomeDropdownDidTap() {
        setPrimaryIncomeScrollPicker({
            isDisplay: true,
            selectedIndex: props.primaryIncomeIndex,
            filterType: "",
            data: props.sourceOfFundOrigin,
        });
    }

    function onPrimarySourceOfWealthDropdownDidTap() {
        setPrimarySourceOfWealthScrollPicker({
            isDisplay: true,
            selectedIndex: props.primaryWealthIndex,
            filterType: "",
            data: props.sourceOfWealthOrigin,
        });
    }

    function onPrimaryIncomeScrollPickerDoneButtonDidTap(data, index) {
        props.updatePrimaryIncome(index, data);
        setPrimaryIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onPrimarySourceOfWealthScrollPickerDoneButtonDidTap(data, index) {
        props.updatePrimaryWealth(index, data);
        setPrimarySourceOfWealthScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setPrimaryIncomeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setPrimarySourceOfWealthScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    const analyticScreenName = props.isZest
        ? APPLY_ZESTI_ADDITIONAL_DETAILS
        : APPLY_M2U_PREMIER_ADDITIONAL_DETAILS;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={ADDITIONAL_INFORMATION}
                                    color={BLACK}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={
                                                props.isZest
                                                    ? ZEST_APPLICATION
                                                    : M2U_PREMIER_APPLICATION
                                            }
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={FILL_IN_ADDITIONAL_DETAILS}
                                        />
                                        {buildAdditionalDetailsView()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isAdditionalDetailsContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isAdditionalDetailsContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <ScrollPickerView
                    showMenu={primaryIncomeScrollPicker.isDisplay}
                    list={primaryIncomeScrollPicker.data}
                    selectedIndex={primaryIncomeScrollPicker.selectedIndex}
                    onRightButtonPress={onPrimaryIncomeScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={primarySourceOfWealthScrollPicker.isDisplay}
                    list={primarySourceOfWealthScrollPicker.data}
                    selectedIndex={primarySourceOfWealthScrollPicker.selectedIndex}
                    onRightButtonPress={onPrimarySourceOfWealthScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                {buildSourceOfWealthInfoPopupDialog()}
            </ScreenContainer>
        </React.Fragment>
    );

    function buildAdditionalDetailsView() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={ZEST_CASA_PRIMARY_INCOME}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.primaryIncomeValue && props.primaryIncomeValue.name
                            ? props.primaryIncomeValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onPrimaryIncomeDropdownDidTap}
                />
                <TitleAndDropdownPillWithIcon
                    title={PRIMARY_SOURCE_WEALTH}
                    titleFontWeight="400"
                    dropdownOnInfoPress={onInfoIconDidTap}
                    dropdownTitle={
                        props.primaryWealthValue && props.primaryWealthValue.name
                            ? props.primaryWealthValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onPrimarySourceOfWealthDropdownDidTap}
                />
            </React.Fragment>
        );
    }

    function buildSourceOfWealthInfoPopupDialog() {
        return (
            <Popup
                visible={isPopupVisible}
                title={PRIMARY_SOURCE_WEALTH}
                description={ZEST_CASA_SOURCE_OF_WEALTH}
                onClose={onPopupCrossButtonDidTap}
            />
        );
    }
};

export const additionalDetailsPropTypes = (ZestCASAAdditionalDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...entryPropTypes,
    ...downTimeServicePropTypes,

    // States
    primaryIncomeIndex: PropTypes.string,
    primaryIncomeValue: PropTypes.string,
    primaryWealthIndex: PropTypes.string,
    primaryWealthValue: PropTypes.string,
    isFromConfirmationScreenForAdditionalDetails: PropTypes.bool,
    isAdditionalDetailsContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updatePrimaryIncome: PropTypes.func,
    updatePrimaryWealth: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(entryProps(additionalDetailsProps(ZestCASAAdditionalDetails)))
);
