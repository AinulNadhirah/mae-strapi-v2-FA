import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { ZEST_CASA_ACCOUNT_NOT_FOUND, ZEST_CASA_LOGIN_ENTRY } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInputWithReturnType";

import {
    ACTIVATE_ACCOUNT_ID_NUMBER_ACTION,
    ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ZestCASA/identityDetailsAction";
import { getMasterData } from "@redux/services/apiMasterData";
import { prePostQual } from "@redux/services/apiPrePostQual";

import { BLACK, DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    MYKAD_NUMBER,
    MYKAD_NUMBER_PLACEHOLDER,
    ZEST_CASA_ACCOUNT_ACTIVATION_ENTER_MYKAD,
    ACCOUNT_ACTIVATION,
} from "@constants/strings";
import { ZEST_CASA_RESUME_CUSTOMER_INQUIRY_NTB } from "@constants/url";
import {
    MYKAD_CODE,
    ZEST_CASA_CLEAR_ALL,
    PRE_QUAL_PRE_LOGIN_FLAG,
    ZEST_DRAFT_BRANCH_USER,
    ZEST_DRAFT_USER,
} from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";

const ZestCASAActivateAccountIdentityDetails = (props) => {
    const { navigation } = props;

    // Hooks for access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAActivateAccountIdentityDetails] >> [init]");
        dispatch(getMasterData());
    };

    function onCloseTap() {
        console.log("[ZestCASAActivateAccountIdentityDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.goBack();
    }

    function onNextTap() {
        if (identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled) {
            const body = {
                idType: MYKAD_CODE,
                birthDate: "",
                preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
                icNo: identityDetailsReducer.identityNumber,
            };
            callPreQualService(ZEST_CASA_RESUME_CUSTOMER_INQUIRY_NTB, body, (result) => {
                if (result) navigation.navigate(ZEST_CASA_LOGIN_ENTRY);
            });
        }
    }

    async function callPreQualService(extendedUrl, body, callback) {
        dispatch(
            prePostQual(
                extendedUrl,
                body,
                (result, userStatus) => {
                    const { statusCode } = result;
                    if (userStatus === ZEST_DRAFT_BRANCH_USER) {
                        navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    } else if (userStatus === ZEST_DRAFT_USER) {
                        callback(result);
                    } else if (statusCode === 400) {
                        navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: false,
                        });
                    } else {
                        navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    }
                },
                true
            )
        );
    }

    function onMyKadInputDidChange(value) {
        dispatch({ type: ACTIVATE_ACCOUNT_ID_NUMBER_ACTION, identityNumber: value });
        dispatch({ type: ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION });
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Zest_CASA_Activate_Account_Identity_Details"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
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
                            <View style={Style.formContainer}>
                                <View style={Style.contentContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={ACCOUNT_ACTIVATION}
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={ZEST_CASA_ACCOUNT_ACTIVATION_ENTER_MYKAD}
                                    />
                                    <SpaceFiller height={36} />
                                    {buildMyKadDetailsView()}
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        identityDetailsReducer.isActivationAccountIdentityContinueButtonEnabled
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
            </ScreenContainer>
        </React.Fragment>
    );

    function buildMyKadDetailsView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={MYKAD_NUMBER}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={identityDetailsReducer.identityNumberErrorMessage}
                    isValid={identityDetailsReducer.identityNumberErrorMessage === null}
                    isValidate
                    maxLength={12}
                    keyboardType="number-pad"
                    placeholder={MYKAD_NUMBER_PLACEHOLDER}
                    onChangeText={onMyKadInputDidChange}
                    value={identityDetailsReducer.identityNumber}
                    returnKeyType="done"
                />
                <SpaceFiller height={16} />
            </React.Fragment>
        );
    }
};

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

export const activateAccountIdentityDetailsPropTypes =
    (ZestCASAActivateAccountIdentityDetails.propTypes = {
        ...entryPropTypes,
    });

export default ZestCASAActivateAccountIdentityDetails;
