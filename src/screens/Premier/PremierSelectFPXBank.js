import React from "react";
import { StyleSheet, View, ScrollView, Platform, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { invokeFPXAuthReq, isNTBUser } from "@screens/Premier/helpers/premierHelpers";

import { SETTINGS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import BankList from "@components/Others/BankList";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { GET_BANK_SELECTED_ITEM } from "@redux/actions/services/getBankListAction";
import selectFPXBankProps from "@redux/connectors/ZestCASA/selectFPXBankConnector";
import authoriseFPXTransactionServiceProps, {
    authoriseFPXTransactionServicePropTypes,
} from "@redux/connectors/services/authoriseFPXTransactionConnector";
import getBankListServiceProps, {
    getBankListServicePropTypes,
} from "@redux/connectors/services/getBankListConnector";

import { MARINER, TRANSPARENT } from "@constants/colors";
import {
    PM1_DRAFT_USER,
    PMA_DRAFT_USER,
    PM1_NTB_USER,
    PMA_NTB_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGS_DRAFT_USER,
    KAWANKU_SAVINGSI_DRAFT_USER,
} from "@constants/premierConfiguration";
import {
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
} from "@constants/premierStrings";
import { PREMIER_CASA_FPX_TNC_URL } from "@constants/premierUrl";
import { FPX_TNC } from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";

const PremierSelectFPXBank = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();
    const { isZestApplyDebitCardEnable } = getModel("zestModule");

    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const getBankListReducer = useSelector((state) => state.getBankListReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const { userStatus } = prePostQualReducer;
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;

    function onBackTap() {
        console.log("[PremierSelectFPXBank] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[PremierSelectFPXBank] >> [onCloseTap]");
        navigation.popToTop();
        navigation.goBack();
    }

    function onBankListItemDidTap(item) {
        console.log("[PremierSelectFPXBank] >> [onBankListItemPress]", item);
        dispatch({ type: GET_BANK_SELECTED_ITEM, selectedData: item });

        const body = createAuthoriseFPXTransactionServiceRequestBody(item);
        callAuthoriseFPXTransactionService(body);
    }

    function onFPXTermsAndConditionsDidTap() {
        console.log("[PremierSelectFPXBank] >> [onFPXTermsAndConditionsDidTap]");

        const props = {
            title: FPX_TNC,
            source: PREMIER_CASA_FPX_TNC_URL,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    const getProductName = (userStatus) => {
        if (userStatus === PM1_NTB_USER || userStatus === PM1_DRAFT_USER) {
            return "MAE_PM1";
        } else if (userStatus === PMA_NTB_USER || userStatus === PMA_DRAFT_USER) {
            return "MAE_PMA";
        } else if (
            userStatus === KAWANKU_SAVINGS_NTB_USER ||
            userStatus === KAWANKU_SAVINGS_DRAFT_USER
        ) {
            return KAWANKU_SAVINGS_PRODUCT_NAME;
        } else if (
            userStatus === KAWANKU_SAVINGSI_NTB_USER ||
            userStatus === KAWANKU_SAVINGSI_DRAFT_USER
        ) {
            return KAWANKU_SAVINGSI_PRODUCT_NAME;
        }
    };

    async function callAuthoriseFPXTransactionService(body) {
        const reducer = isNTBUser(userStatus) ? prePostQualReducer : draftUserAccountInquiryReducer;

        await props.authoriseFPXTransactionPremier(body, (result) => {
            invokeFPXAuthReq(
                dispatch,
                props,
                result,
                { ...reducer, productName: getProductName(userStatus) },
                isZestApplyDebitCardEnable
            );
        });
    }

    const createAuthoriseFPXTransactionServiceRequestBody = (bankItem) => {
        const fpxBuyerEmailAddress = isNTBUser(userStatus)
            ? prePostQualReducer.customerEmail
            : draftUserAccountInquiryReducer.emailAddress;

        return {
            inputType: "fpx",
            msgType: "AR",
            txnCurr: "MYR",
            fpxBuyerEmail: fpxBuyerEmailAddress ?? "",
            txnAmt: accountActivationAmount,
            bankId: bankItem.bankCode,
            accountType: null,
            acctNo: isNTBUser(userStatus)
                ? prePostQualReducer.acctNo
                : draftUserAccountInquiryReducer.acctNo,
            mobileSDKData: getDeviceRSAInformation(getModel("device").deviceInformation),
            challenge: {},
            productName: getProductName(userStatus),
        };
    };

    const bankDetailsModifier = (bankList) => {
        return bankList.map((obj) => {
            const { imageUrl } = obj;
            return {
                ...obj,
                image: {
                    imageName: imageUrl,
                },
            };
        });
    };

    return (
       
            <ScreenContainer backgroundType="color" analyticScreenName="PREMIER_SELECT_FPX_BANK">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        {buildOnlineBankingTab()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                    
                </ScreenLayout>
            </ScreenContainer>
    );

    function buildOnlineBankingTab() {
        const modifiedBankDetails = bankDetailsModifier(getBankListReducer.bankDetails);

        return (
            <View>
                <View style={Style.fpxLogoBlockCls}>
                    <ImageBackground
                        resizeMode="cover"
                        style={Style.fpxIconImgViewCls}
                        imageStyle={Style.defaultProfileImgCls}
                        source={require("@assets/MAE/fpxLogo.png")}
                    />
                    <Typo
                        fontSize={14}
                        style={Style.fpxTextCls}
                        text={FPX_TNC}
                        onPress={onFPXTermsAndConditionsDidTap}
                    />
                </View>
                <View style={Style.listContainer}>
                    <BankList data={modifiedBankDetails} callback={onBankListItemDidTap} />
                </View>
            </View>
        );
    }
};

export const selectFPXBankPropTypes = (PremierSelectFPXBank.propTypes = {
    ...getBankListServicePropTypes,
    ...authoriseFPXTransactionServicePropTypes,
});

const Style = StyleSheet.create({
    contentContainer: {
        marginHorizontal: 24,
    },

    defaultProfileImgCls: {
        height: "100%",
        width: "100%",
    },

    formContainer: {
        marginBottom: 40,
    },

    fpxIconImgViewCls: {
        height: 20,
        overflow: "hidden",
        width: 60,
    },

    fpxLogoBlockCls: {
        alignItems: "center",
        marginBottom: 25,
        marginTop: 25,
        width: "100%",
    },

    fpxTextCls: {
        color: MARINER,
        fontFamily: "montserrat",
        fontSize: 11,
        fontStyle: "normal",
        fontWeight: "bold",
        letterSpacing: 0,
        lineHeight: 16,
        marginTop: 10,
    },

    listContainer: {
        alignItems: "flex-start",
        width: "100%",
    },
});

export default authoriseFPXTransactionServiceProps(
    getBankListServiceProps(selectFPXBankProps(PremierSelectFPXBank))
);
