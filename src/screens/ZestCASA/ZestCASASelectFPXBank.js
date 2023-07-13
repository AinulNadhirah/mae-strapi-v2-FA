import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

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
import { FPX_TNC } from "@constants/strings";
import { ZEST_CASA_FPX_TNC } from "@constants/url";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";

import { entryPropTypes } from "./ZestCASAEntry";
import { invokeFPXAuthReq } from "./helpers/ZestHelpers";

const ZestCASASelectFPXBank = (props) => {
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
    const zestActivationAmount = masterDataReducer?.zestActivationAmountNTB ?? "10.00";
    const m2uPremierActivationAmount = masterDataReducer?.m2uPremierActivationAmountNTB ?? "10.00";
    const accountActivationAmount = prePostQualReducer.isZestI
        ? zestActivationAmount
        : m2uPremierActivationAmount;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASASelectFPXBank] >> [init]");
        console.log(getBankListReducer.bankDetails);
    };

    function onBackTap() {
        console.log("[ZestCASASelectFPXBank] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASASelectFPXBank] >> [onCloseTap]");
        navigation.popToTop();
        navigation.goBack();
    }

    function onBankListItemDidTap(item) {
        console.log("[ZestCASASelectFPXBank] >> [onBankListItemPress]", item);
        dispatch({ type: GET_BANK_SELECTED_ITEM, selectedData: item });

        var body = createAuthoriseFPXTransactionServiceRequestBody(item);
        callAuthoriseFPXTransactionService(body);
    }

    function onFPXTermsAndConditionsDidTap() {
        console.log("[ZestCASASelectFPXBank] >> [onFPXTermsAndConditionsDidTap]");

        const props = {
            title: FPX_TNC,
            source: ZEST_CASA_FPX_TNC,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    async function callAuthoriseFPXTransactionService(body) {
        const reducer =
            userStatus === ZEST_NTB_USER ? prePostQualReducer : draftUserAccountInquiryReducer;

        await props.authoriseFPXTransaction(body, (result) => {
            console.log(result);
            invokeFPXAuthReq(dispatch, props, result, reducer, isZestApplyDebitCardEnable);
        });
    }

    const createAuthoriseFPXTransactionServiceRequestBody = (bankItem) => {
        const fpxBuyerEmailAddress =
            userStatus === ZEST_NTB_USER
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
            acctNo:
                userStatus === ZEST_NTB_USER
                    ? prePostQualReducer.acctNo
                    : draftUserAccountInquiryReducer.acctNo,
            mobileSDKData: getDeviceRSAInformation(getModel("device").deviceInformation),
            challenge: {},
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
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Zest_CASA_Select_FPX_Bank">
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
                    <React.Fragment>
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
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildOnlineBankingTab() {
        var modifiedBankDetails = bankDetailsModifier(getBankListReducer.bankDetails);

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

export const selectFPXBankPropTypes = (ZestCASASelectFPXBank.propTypes = {
    ...entryPropTypes,
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
    getBankListServiceProps(selectFPXBankProps(ZestCASASelectFPXBank))
);
