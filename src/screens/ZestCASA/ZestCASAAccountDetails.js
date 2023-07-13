import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    ZEST_CASA_DECLARATION,
    ZEST_CASA_ADDITIONAL_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import accountDetailsProps from "@redux/connectors/ZestCASA/accountDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import scorePartyServiceProps, {
    scorePartyServicePropTypes,
} from "@redux/connectors/services/scorePartyConnector";

import { DARK_GREY, YELLOW, DISABLED, GREY } from "@constants/colors";
import {
    CONTINUE,
    ZEST_APPLICATION,
    STEP4OF4,
    PLEASE_SELECT,
    ACCOUNT_PURPOSE,
    FILL_IN_ACCOUNT_DETAILS,
    STEPUP_MAE_BRANCH,
    M2U_PREMIER_APPLICATION,
    STEP3OF3,
    STEPUP_MAE_ADDRESS_AREA,
    STEPUP_MAE_ADDRESS_STATE,
} from "@constants/strings";
import {
    HIGH_RISK_CUSTOMER_CODE,
    ZEST_NTB_USER,
    ZEST_CASA_CLEAR_ALL,
} from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_M2U_PREMIER_ADDITIONAL_DETAILS,
    APPLY_ZESTI_ADDITIONAL_DETAILS,
} from "./helpers/AnalyticsEventConstants";
import { updatedViewPartyBody } from "./helpers/ZestHelpers";

const ZestCASAAccountDetails = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const scorePartyReducer = useSelector((state) => state.scorePartyReducer);
    const personalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.personalDetailsReducer
    );
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.residentialDetailsReducer
    );
    const employmentDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.employmentDetailsReducer
    );

    const { userStatus, viewPartyResult } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        accountPurposeIndex,
        branchStateIndex,
        branchDistrictIndex,
        branchIndex,
        branchDistrictDropdownItems,
        branchDropdownItems,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [accountPurposeScrollPicker, setAccountPurposeScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchStateScrollPicker, setBranchStateScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchDistrictScrollPicker, setBranchDistrictScrollPicker] =
        useState(scrollPickerInitialState);

    const [branchScrollPicker, setBranchScrollPicker] = useState(scrollPickerInitialState);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountPurposeIndex, branchStateIndex, branchDistrictIndex, branchIndex]);

    useEffect(() => {
        props.checkBranchDistrictDropdownEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchDistrictDropdownItems]);

    useEffect(() => {
        props.checkBranchDropdownEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchDropdownItems]);

    const init = async () => {
        console.log("[ZestCASAAccountDetails] >> [init]");
        if (userStatus && userStatus !== ZEST_NTB_USER) callScorePartyService();
    };

    async function callScorePartyService() {
        console.log("[ZestCASAAccountDetails] >> [callScorePartyService]");

        await props.getScoreParty(
            updatedViewPartyBody(
                viewPartyResult,
                personalDetailsReducer,
                residentialDetailsReducer,
                employmentDetailsReducer
            )
        );
    }

    function onBackTap() {
        console.log("[ZestCASAAccountDetails] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASAAccountDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[ZestCASAAccountDetails] >> [onNextTap]");
        const { customerRiskRatingCode } = scorePartyReducer;
        console.log(customerRiskRatingCode);

        if (props.isAccountDetailsContinueButtonEnabled) {
            props.isFromConfirmationScreenForAccountDetails
                ? navigation.goBack()
                : customerRiskRatingCode === HIGH_RISK_CUSTOMER_CODE
                ? navigation.navigate(ZEST_CASA_ADDITIONAL_DETAILS)
                : navigation.navigate(ZEST_CASA_DECLARATION);
        }
    }

    const stepCount = () => (userStatus === ZEST_NTB_USER ? STEP4OF4 : STEP3OF3);

    function onAccountPurposeDropdownPillDidTap() {
        setAccountPurposeScrollPicker({
            isDisplay: true,
            selectedIndex: props.accountPurposeIndex,
            filterType: "",
            data: props.purpose,
        });
    }

    function onBranchStateDropdownPillDidTap() {
        setBranchStateScrollPicker({
            isDisplay: true,
            selectedIndex: props.branchStateIndex,
            filterType: "",
            data: props.branchStatesList,
        });
    }

    function onBranchDistrictDropdownPillDidTap() {
        setBranchDistrictScrollPicker({
            isDisplay: true,
            selectedIndex: props.branchDistrictIndex,
            filterType: "",
            data: props.branchDistrictDropdownItems,
        });
    }

    function onBranchDropdownPillDidTap() {
        setBranchScrollPicker({
            isDisplay: true,
            selectedIndex: props.branchIndex,
            filterType: "",
            data: props.branchDropdownItems,
        });
    }

    function onAccountPurposeScrollPickerDoneButtonDidTap(data, index) {
        props.updateAccountPurpose(index, data);
        setAccountPurposeScrollPicker(scrollPickerInitialState);
    }

    function onBranchStateScrollPickerDoneButtonDidTap(data, index) {
        props.clearDistrictData();
        props.clearBranchData();
        props.updateBranchState(index, data);
        props.getBranchDistrictDropdownItems(data.name, props.branchDistrictsList);
        setBranchStateScrollPicker(scrollPickerInitialState);
    }

    function onBranchDistrictScrollPickerDoneButtonDidTap(data, index) {
        props.clearBranchData();
        props.updateBranchDistrict(index, data);
        props.getBranchDropdownItems(data.name, props.branchList);
        setBranchDistrictScrollPicker(scrollPickerInitialState);
    }

    function onBranchListScrollPickerDoneButtonDidTap(data, index) {
        props.updateBranch(index, data);
        setBranchScrollPicker(scrollPickerInitialState);
    }

    function onScrollPickerCancelButtonDidTap() {
        setAccountPurposeScrollPicker(scrollPickerInitialState);
        setBranchStateScrollPicker(scrollPickerInitialState);
        setBranchDistrictScrollPicker(scrollPickerInitialState);
        setBranchScrollPicker(scrollPickerInitialState);
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
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={stepCount()}
                                    color={DARK_GREY}
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
                                            text={FILL_IN_ACCOUNT_DETAILS}
                                        />
                                        {buildAccountDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isAccountDetailsContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isAccountDetailsContinueButtonEnabled
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
                    showMenu={accountPurposeScrollPicker.isDisplay}
                    list={accountPurposeScrollPicker.data}
                    selectedIndex={accountPurposeScrollPicker.selectedIndex}
                    onRightButtonPress={onAccountPurposeScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={branchStateScrollPicker.isDisplay}
                    list={branchStateScrollPicker.data}
                    selectedIndex={branchStateScrollPicker.selectedIndex}
                    onRightButtonPress={onBranchStateScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={branchDistrictScrollPicker.isDisplay}
                    list={branchDistrictScrollPicker.data}
                    selectedIndex={branchDistrictScrollPicker.selectedIndex}
                    onRightButtonPress={onBranchDistrictScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={branchScrollPicker.isDisplay}
                    list={branchScrollPicker.data}
                    selectedIndex={branchScrollPicker.selectedIndex}
                    onRightButtonPress={onBranchListScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildAccountDetailsForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={STEPUP_MAE_ADDRESS_STATE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.branchStateValue && props.branchStateValue.name
                            ? props.branchStateValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onBranchStateDropdownPillDidTap}
                />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_ADDRESS_AREA}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.branchDistrictValue && props.branchDistrictValue.name
                            ? props.branchDistrictValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onBranchDistrictDropdownPillDidTap}
                    isDisabled={!props.isBranchDistrictDropdownEnabled}
                />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_BRANCH}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.branchValue && props.branchValue.name
                            ? props.branchValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onBranchDropdownPillDidTap}
                    isDisabled={!props.isBranchDropdownEnabled}
                />

                <View style={Style.divider} />
                <TitleAndDropdownPill
                    title={ACCOUNT_PURPOSE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.accountPurposeValue && props.accountPurposeValue.name
                            ? props.accountPurposeValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onAccountPurposeDropdownPillDidTap}
                />
            </React.Fragment>
        );
    }
};

export const accountDetailsPropTypes = (ZestCASAAccountDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...entryPropTypes,
    ...downTimeServicePropTypes,
    ...scorePartyServicePropTypes,

    // State
    accountPurposeIndex: PropTypes.number,
    accountPurposeValue: PropTypes.object,
    branchStateIndex: PropTypes.number,
    branchStateValue: PropTypes.object,
    branchDistrictIndex: PropTypes.number,
    branchDistrictValue: PropTypes.object,
    branchIndex: PropTypes.number,
    branchValue: PropTypes.object,
    isAccountDetailsContinueButtonEnabled: PropTypes.bool,
    isBranchDistrictDropdownEnabled: PropTypes.bool,
    isBranchDropdownEnabled: PropTypes.bool,
    isFromConfirmationScreenForAccountDetails: PropTypes.bool,
    branchDistrictDropdownItems: PropTypes.array,
    branchDropdownItems: PropTypes.array,

    // Dispatch
    updateAccountPurpose: PropTypes.func,
    updateBranchState: PropTypes.func,
    updateBranchDistrict: PropTypes.func,
    updateBranch: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    checkBranchDistrictDropdownEnabled: PropTypes.func,
    checkBranchDropdownEnabled: PropTypes.func,
    clearAccountDetailsReducer: PropTypes.func,
    clearDistrictData: PropTypes.func,
    clearBranchData: PropTypes.func,
    updateConfirmationScreenStatusForAccountDetails: PropTypes.func,
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

    divider: {
        borderColor: GREY,
        borderStyle: "solid",
        borderWidth: 0.5,
        height: 1,
        marginTop: 26,
        width: "100%",
    },
    formContainer: {
        marginBottom: 40,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(
        scorePartyServiceProps(entryProps(accountDetailsProps(ZestCASAAccountDetails)))
    )
);
