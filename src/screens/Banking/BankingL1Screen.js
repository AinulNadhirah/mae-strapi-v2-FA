import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    FlatList,
    Image,
    Dimensions,
    Platform,
    TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";

import {
    fetchCards,
    fetchProvisonedCardsFromWallet,
    getPrompterDetails,
    checkApplePayScheduledPrompter,
} from "@screens/ApplePay/ApplePayController";
import {
    fetchChipMasterData,
    retrieveMAECardData,
    checkServerOperationTime,
    getApplyMAECardNavParams,
} from "@screens/MAE/CardManagement/CardManagementController";
import ZestProductApplyDebitCard from "@screens/ZestCASA/components/ZestProductApplyDebitCard";

import {
    BANKING_L2_SCREEN,
    BANKINGV2_MODULE,
    MAE_CARDDETAILS,
    CARD_UCODE_PIN,
    MAE_MODULE_STACK,
    MAE_INTRODUCTION,
    APPLY_CARD_INTRO,
    FIXED_DEPOSIT_STACK,
    CARDS_LIST,
    MAYBANK2U,
    WEALTH_ERROR_HANDLING_SCREEN,
    WEALTH_CARD_ACCOUNT_LIST_SCREEN,
    TABUNG_HAJI_SUMMARY_SCREEN,
    WEALTH_PRODUCT_DETAILS_SCREEN,
    MFCA_DETAILS_SCREEN,
    ASNB_SUMMARY_SCREEN,
    ZEST_CASA_STACK,
    ZEST_DEBIT_CARD_LAST_8_DIGIT,
    DEBIT_CARD_DETAIL,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ProductApplyItem from "@components/Cards/ProductApplyItem";
import ProductApplyMAECard from "@components/Cards/ProductApplyMAECard";
import ProductCard from "@components/Cards/ProductCard";
import ProductCardLoader from "@components/Cards/ProductCardLoader";
import ProductCreditCard from "@components/Cards/ProductCreditCard";
import ProductDebitCard from "@components/Cards/ProductDebitCard";
import ProductFeatureCard from "@components/Cards/ProductFeatureCard";
import { ErrorMessageV2 } from "@components/Common";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    maeCustomerInfo,
    invokeL3,
    getDigitalWealthModule,
    cardsInquiry,
    getDashboardTabungCount,
    invokeL2,
    invokeL2Challenge,
    getDebitCardListEnquiry,
} from "@services";
import { GABanking, GABankingApplePay } from "@services/analytics/analyticsBanking";
import { getTabungHajiAccounts } from "@services/apiServiceTabungHaji";

import { ASB_PREPOSTQUAL_CLEAR } from "@redux/actions/ASBServices/prePostQualAction";
import debitCardInquiryProps from "@redux/connectors/services/debitCardInquiryConnector";
import downTimeServiceProps from "@redux/connectors/services/downTimeConnector";
import { getMasterData as masterData } from "@redux/services/ASBServices/apiMasterData";

import { ROYAL_BLUE, WHITE, YELLOW } from "@constants/colors";
import {
    APPLY_CREDIT_CARD,
    COMMON_ERROR_MSG,
    FA_ACCOUNTS,
    FA_CARDS,
    FA_FIXED_DEPOSIT,
    FA_LOANS,
    FA_VIEW,
    FA_VIEW_LOAN_ACCOUNT,
    FA_UNIT_TRUST,
    FA_MASTER_FOREIGN_CURRENCY_ACCOUNT,
    TABUNG_HAJI,
    VIEW_MORE,
    TEMPORARILY_SUSPENDED,
    TEMPORARILY_BLOCKED,
    VALID_THRU,
} from "@constants/strings";
import { ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD } from "@constants/url";

import { getExpiryDescription } from "@utils/cardUtils";
import { formateAccountNumber, commaAdder, getShadow } from "@utils/dataModel/utility";
import { filterProvisionedCards } from "@utils/dataModel/utilityApplePay";

import Assets from "@assets";

import { onClickOkay } from "../ASB/Financing/helpers/ASBHelpers";

export const { width, height } = Dimensions.get("window");
const FD_PLACEMENT_BUTTON_WIDTH = 199;

function keyExtractor(item, index) {
    return `${item.name}-${index}`;
}
class BankingL1Screen extends Component {
    static propTypes = {
        activeTabIndex: PropTypes.any,
        getModel: PropTypes.func,
        index: PropTypes.any,
        navigation: PropTypes.object.isRequired,
        openBrowser: PropTypes.func,
        redirectScreen: PropTypes.any,
        resetModel: PropTypes.func,
        resetNavParams: PropTypes.func,
        tabName: PropTypes.any,
        updateModel: PropTypes.func,
        prePostQualReducer: PropTypes.object,
        showPopup: PropTypes.func,

        // State
        debtCardNxtAct: PropTypes.string,
        debitCardNumber: PropTypes.string,
        debitCardName: PropTypes.string,

        // Dispatch
        debitCardInquiry: PropTypes.func,
        debitCardClearAll: PropTypes.func,
        checkDownTimePremier: PropTypes.func,
    };

    state = {
        renderCurrentTab: false,
        data: [],
        refresh: false,
        tabName: this.props.tabName,
        index: this.props.index,
        isLoading: false,
        asnbSummariesData: null,
        showToolTip: false,

        redirectScreen: this.props?.redirectScreen ?? null,

        // MAE Card Related
        maeCustomerInfo: null,
        maeCardExpDateDesc: "",
        maeCardNo: null,
        maeCardsSection: false,
        applyStatus: false,
        maeActivateStatus: false,
        maeCardTitle: null,
        maeApplyCardBanner: false,
        showFDPlacementEntryPoint: false,
        isZestActivateDebitCardEnable: false,

        isApplePayEnable: false,
        isEligibleDevice: false,
        cardsDashboardEntryPoint: false,
        hasEligibleCards: false,
        cardsDashboardWidget: {},
        applePayPrompter: {},
        isPopupVisible: false,
        isScheduled: false,

        asnbConsentFlag: "",
        showPopup: false,
        isRenewAllowed: false,
        maeExpiryDesc: "",
        debitCardList: [],
    };

    componentDidMount() {
        const { activeTabIndex, index } = this.props;
        const { data } = this.state;

        this.focusSubscription = this.props.navigation.addListener("focus", this.onScreenFocus);

        this._controlFDPlacementEntryPointVisibility();
        // Render if first tab
        if (activeTabIndex == index) {
            console.log("Render tab: " + index);
            if (data.length == 0) {
                this.fetchData();
            }
            if (activeTabIndex === 1) {
                this.controlApplePayEntryPointVisibility();
            }
        }
    }

    componentDidUpdate(nextProps, prevState) {
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex != nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex == this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                if (this.state.data.length == 0) {
                    this.fetchData();
                }
            }
        }
        if (prevState.isScheduled !== this.state.isScheduled) {
            this.triggerPopup();
        }
    }

    // Apple Pay
    triggerPopup = () => {
        const { isPopupVisible, applePayPrompter, isScheduled } = this.state;
        if (this.props.tabName === "Cards" && isPopupVisible && applePayPrompter && isScheduled) {
            const showPopUpData = {
                isScheduled: this.state.isScheduled,
                isPopupVisible,
                applePayPrompter,
            };
            this.props.showPopup(showPopUpData);
        }
    };

    _initApplePayPrompter = async () => {
        const response = await fetchCards();
        console.log("fetchCards response ::: ", response);
        if (response?.data?.code === 200) {
            const result = response?.data?.result || {};
            const cards = result?.cards;
            const { updateModel } = this.props;
            updateModel({
                applePay: {
                    customerName: result?.customerName,
                },
                user: {
                    customerName: result?.customerName,
                },
            });
            this._getProvisionedCardsFromPasskit(cards);
            this.storeMBBCards(cards.length > 0 ? cards : []); // TODO, remove dummycards
        }
    };

    storeMBBCards = (cards) => {
        console.log("store in context: ", cards);
        const { updateModel } = this.props;
        updateModel({
            applePay: {
                cards,
            },
        });
    };

    _getProvisionedCardsFromPasskit = async (mbbCards) => {
        // TODO - passkit to get provisioned cards
        const { updateModel } = this.props;
        const res = await fetchProvisonedCardsFromWallet(updateModel);
        this._checkEligibleCards(mbbCards, res);
    };

    _checkEligibleCards = async (mbbCards, provisionedCardsFromPasskit) => {
        const { getModel } = this.props;
        const { isApplePayEnable, isEligibleDevice, prompterEntryPoint } = getModel("applePay");
        const { eligibleProvisionedCards } = await filterProvisionedCards(mbbCards);
        const hasEligibleCards = !!eligibleProvisionedCards.length;
        if (isApplePayEnable && isEligibleDevice && prompterEntryPoint && hasEligibleCards) {
            this._fetchPrompterData();
        }

        this.setState({ hasEligibleCards });
    };

    _fetchPrompterData = async () => {
        const { getModel } = this.props;
        const { prompterJSON } = getModel("applePay");

        if (prompterJSON === null) {
            console.log("get prompter from api");
            const response = await getPrompterDetails();
            console.log("fetchCards response ::: ", response);
            if (response?.data?.code === 200) {
                const result = response?.data?.result;
                console.log("_fetchPrompterData RESPONSE: ", result);
                this.setState({ applePayPrompter: result, isPopupVisible: true });

                this._storePrompterData(result);

                this._checkApplePayScheduledPrompter();
            } else {
                this.setState({ isPopupVisible: false });
            }
        } else {
            console.log("get prompter from context");
            this.setState({ applePayPrompter: prompterJSON, isPopupVisible: true }, () => {
                this._checkApplePayScheduledPrompter();
            });
        }
    };

    _storePrompterData = (data) => {
        const { updateModel } = this.props;
        updateModel({
            applePay: {
                prompterJSON: data,
            },
        });
    };

    _checkApplePayScheduledPrompter = async () => {
        const isScheduled = await checkApplePayScheduledPrompter(this.state.applePayPrompter);
        this.setState({ isScheduled });
    };

    //End Apple Pay

    componentWillUnmount() {
        this.focusSubscription();
    }

    _controlFDPlacementEntryPointVisibility = () => {
        const { showFDPlacementEntryPoint } = this.props.getModel("fixedDeposit");
        this.setState({
            showFDPlacementEntryPoint,
        });
    };

    controlApplePayEntryPointVisibility = () => {
        const {
            isApplePayEnable,
            isEligibleDevice,
            cardsDashboardEntryPoint,
            cardsDashboardWidget,
        } = this.props.getModel("applePay");

        this.setState({
            isApplePayEnable,
            isEligibleDevice,
            cardsDashboardEntryPoint,
            cardsDashboardWidget,
        });
        this._initApplePayPrompter();
    };

    onScreenFocus = () => {
        const { renderCurrentTab } = this.state;
        if (renderCurrentTab) {
            const { getModel } = this.props;
            const { lastRefreshed } = getModel("banking");
            const refreshPeriod = 30000; // how long until initiating refresh again

            console.log(
                "[BankingL1Screen] FOCUSED, renderCurrentTab: ",
                this.state.renderCurrentTab
            );

            if (lastRefreshed) {
                const { asnbConsDeeplink } = this.props.getModel("asnbConsent");
                console.log("[BankingL1Screen] lastRefreshed: ", lastRefreshed);
                // if it has already been longer than refreshPeriod, fetchData again..
                if (new Date().getTime() - lastRefreshed >= refreshPeriod || asnbConsDeeplink) {
                    console.log("refreshPeriod elapsed, refreshing!");
                    this.fetchData();
                    return;
                }

                console.log("[BankingL1Screen] refreshPeriod has not elapsed, not refreshing!");
            } else {
                // in case lastRefreshed timestamp isn't available in context (first timer)
                console.log("[BankingL1Screen] no record of lastRefreshed time!");
                this.fetchData();
            }
        }
    };

    updateLastRefreshed = (reset) => {
        const { updateModel } = this.props;
        updateModel({
            banking: {
                lastRefreshed: reset ? null : new Date().getTime(),
            },
        });
    };

    fetchData = async () => {
        // Reset state
        this.setState({
            data: [],
            refresh: false,
            tabName: this.props.tabName,
            index: this.props.index,
            isLoading: false,
            maeCardsSection: null,
            maeCardTitle: null,
            maeCardNo: null,
            maeCustomerInfo: null,
            maeActivateStatus: null,
            tabungData: null,
            isRenewAllowed: false,
            maeExpiryDesc: "",
        });

        const { tabName } = this.state;

        await this._fetchProductHoldingsDetails(this.state.tabName);

        if (tabName === "Accounts") this._fetchTabungData();
        if (tabName === "Cards") {
            const debitCardInquiryData = {
                Msg: {
                    MsgBody: {},
                },
            };
            const { isZestActivateDebitCardEnable } = this.props.getModel("zestModule");
            this.setState({ isZestActivateDebitCardEnable });
            if (isZestActivateDebitCardEnable) {
                this.props?.debitCardInquiry(debitCardInquiryData);
            }
            this._fetchMAECardDetails();
        }

        this.setState({ renderCurrentTab: true });
        this.updateLastRefreshed();
    };

    _refresh = async () => await this.fetchData();

    _fetchMAECardDetails = async () => {
        console.log("[BankingL1Screen] >> [fetchMAECardDetails]");

        /*
         * DO NOT REMOVE - BELOW INDICATORS USED TO DETERMINE ETB(different types) OR NTB
         *
         * applicantType values
         * 0,5,6,7,8 - ETB
         * 1,2,3,4   - NTB
         *
         *
         * m2uInd values
         * 0 - Loan/FD account only
         * 1 - Card only
         * 2 - Credit card with CASA OR CASA only
         * 3 - Credit card only
         */
        const { cardRenewalReady } = this.props.getModel("misc");

        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, false).catch((error) => {
            console.log("[BankingL1Screen][maeCustomerInfo] >> Exception: ", error);
        });
        console.log("[BankingL1Screen][maeCustomerInfo] >> response: ", httpResp);
        const maeCustomerInfoData = httpResp?.data?.result ?? null;
        if (!maeCustomerInfoData) return;

        const { debitInq, applicantType } = maeCustomerInfoData;
        const maeCardStatus = debitInq?.cardStatus ?? null;
        const maeNextAction = debitInq?.cardNextAction ?? null;

        if (!maeCardStatus || !maeNextAction || !debitInq) return;

        const ntbApplicantTypes = ["1", "2", "3", "4"];
        const isNTB = ntbApplicantTypes.includes(applicantType);

        // Specific check for ETB & 0C01 customer Type
        if (!isNTB && applicantType != "7") {
            // Check for ETB MAE Card Banner
            this.checkForApplyMAECardBanner({
                maeCardStatus,
                maeNextAction,
                maeCustomerInfoData,
            });

            if (maeCardStatus == "000" || maeCardStatus == "024") {
                if (maeNextAction == "001") {
                    return;
                }
            } else {
                return;
            }
        }

        // Apply/Activate Status
        let maeCardsSection = false;
        let activateStatus = false;
        let applyStatus = false;
        let maeCardTitle = "";
        let maeExpiryDesc = "";

        // check if renewal is allowed
        const isRenewAllowed = debitInq?.cardExpiringOrExpired;
        const monthsToExpire = parseInt(debitInq?.cardBalanceMonthExpiry);

        const expiryDateDesc = cardRenewalReady
            ? "Valid Thru " + moment(debitInq?.cardExpiry, "YYMM").format("MM/YY")
            : "";

        if (maeCardStatus == "000" && maeNextAction == "001") {
            // Apply Card
            maeCardsSection = true;
            applyStatus = true;
            maeCardTitle = "MAE Debit Card";
            maeExpiryDesc = getExpiryDescription(isRenewAllowed, monthsToExpire);
        } else if (maeCardStatus == "000" && (maeNextAction == "002" || maeNextAction == "003")) {
            // Activate Card
            maeCardsSection = true;
            activateStatus = true;
            maeCardTitle = "MAE Debit Card";
        } else if (maeCardStatus == "024" || maeCardStatus == "000") {
            // Card Management
            maeCardsSection = true;
            maeCardTitle = debitInq.cardType;
            maeExpiryDesc = getExpiryDescription(isRenewAllowed, monthsToExpire);
        }

        if (!cardRenewalReady) maeExpiryDesc = "";

        this.setState(
            {
                maeCardsSection,
                maeCardTitle,
                applyStatus,
                maeCardNo: debitInq?.cardNo ?? "",
                maeCustomerInfo: maeCustomerInfoData,
                maeActivateStatus: activateStatus,
                isRenewAllowed,
                maeExpiryDesc,
                maeCardExpDateDesc: expiryDateDesc,
            },
            () => {
                console.log("[BankingL1Screen][_fetchMAECardDetails] >> State", this.state);
            }
        );
    };

    checkForApplyMAECardBanner = ({ maeCardStatus, maeNextAction, maeCustomerInfoData }) => {
        console.log("[BankingL1Screen] >> [checkForApplyMAECardBanner]");

        // Check if user has a MAE account
        const userMaeAcct = maeCustomerInfoData?.userMaeAcct ?? false;
        // const maeApplied = maeCustomerInfoData?.maeApplied ?? false;

        this.setState({
            maeApplyCardBanner:
                userMaeAcct &&
                (maeCardStatus === "000" || maeCardStatus === "023") &&
                maeNextAction === "001",
            maeCustomerInfo: maeCustomerInfoData,
        });
    };

    _getASNBSummariesData = async () => {
        try {
            const response = await bankingGetDataMayaM2u(
                `/asnb/getASNBAccountSummaryDetails?accType=ASNB`,
                true,
                false
            );

            if (response?.maintenance) {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: WEALTH_ERROR_HANDLING_SCREEN,
                    params: {
                        error: "ScheduledMaintenance",
                    },
                });
            } else if (response?.status === 200) return response;
            else return null;
        } catch (error) {
            if (error?.network === "nonetwork") {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: WEALTH_ERROR_HANDLING_SCREEN,
                    params: {
                        error: "NoConnection",
                        fromPage: ASNB_SUMMARY_SCREEN,
                    },
                });
            } else {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: WEALTH_ERROR_HANDLING_SCREEN,
                    params: {
                        error: "TechnicalError",
                    },
                });
            }
            return null;
        }
    };

    _fetchProductHoldingsDetails = async (tabName) => {
        console.log("[BankingL1Screen][_fetchProductHoldingsDetails] >> tabName: ", tabName);

        if (tabName === "Wealth") {
            this.setState({ isLoading: true });

            const subUrl = "/getDashboardDetails";

            try {
                const response = await getDigitalWealthModule(subUrl, false);

                const result = response?.data;
                const asnbConsentFlag =
                    result?.asnbConsentEnable === "Y" ? result?.asnbConsentFlag : "11";
                this.setState({ asnbConsentFlag });
                if (result?.maintenance) {
                    this.setState(
                        {
                            isLoading: false,
                        },
                        () => {
                            this.props.navigation.navigate("Dashboard");
                            this.props.navigation.navigate(BANKINGV2_MODULE, {
                                screen: WEALTH_ERROR_HANDLING_SCREEN,
                                params: {
                                    error: "ScheduledMaintenance",
                                },
                            });
                        }
                    );
                }
                //ASNB Consent : If user not accepted TNC then need to remove ASNB Amount from total investments
                let total = 0;
                if (asnbConsentFlag !== "11") {
                    const asnbAccount = result?.accountListings?.filter(
                        (account) => account?.investmentType === "ASNB"
                    );
                    if (result?.total && asnbAccount[0]?.value) {
                        total = parseFloat(result?.total) - parseFloat(asnbAccount[0]?.value);
                    } else if (!asnbAccount[0]?.value) {
                        total = result?.total;
                    }
                } else {
                    //ASNB Consent Start
                    const { asnbConsDeeplink } = this.props.getModel("asnbConsent");
                    if (asnbConsDeeplink) {
                        this._onASNBProductCardPressed();
                        this.props.updateModel({
                            asnbConsent: {
                                asnbConsDeeplink: false,
                            },
                        });
                    }
                    //ASNB Consent END
                }

                this.setState({
                    data: asnbConsentFlag !== "11" ? { ...result, total } : result,
                    isLoading: false,
                });
            } catch (error) {
                this.props.navigation.navigate("Dashboard");

                if (error?.status === "nonetwork") {
                    this.props.navigation.navigate("Dashboard");
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: WEALTH_ERROR_HANDLING_SCREEN,
                        params: {
                            error: "NoConnection",
                            fromPage: MAYBANK2U,
                            fromTab: 4,
                        },
                    });
                } else {
                    this.props.navigation.navigate("Dashboard");
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: WEALTH_ERROR_HANDLING_SCREEN,
                        params: {
                            error: "TechnicalError",
                        },
                    });
                }
                console.log("[ProductL1Screen][_fetchProductHoldingsDetails] ERROR: ", error);
            }
        } else {
            const { getModel } = this.props;
            const showHighlightLocal = JSON.parse(
                (await AsyncStorage.getItem("isHighlightShown")) ?? "true"
            );
            //this one temporary solution because, secure switch prompter will trigger twice stepUp/L2 API
            if (!showHighlightLocal) {
                const isL2ChallengeNeeded = await invokeL2Challenge(getModel);
                if (isL2ChallengeNeeded) {
                    this.props.navigation.goBack();
                    return;
                }
            }

            const subUrl = "/summary";
            const params = "?type=" + tabName.charAt(0) + "&checkMae=true";

            this.setState({ isLoading: true });

            console.log(subUrl, params, "url");
            bankingGetDataMayaM2u(subUrl + params, false)
                .then((response) => {
                    const result = response?.data?.result;
                    console.log(
                        "[ProductL1Screen][_fetchProductHoldingsDetails] /pfm/productHolding/detail with param: " +
                            params +
                            " ==> "
                    );
                    if (result !== null) {
                        const { redirectScreen } = this.state;

                        if (
                            redirectScreen === "BANKING_MAEDETAILS" ||
                            redirectScreen === "BANKING_MAETOPUP"
                        ) {
                            console.log(
                                "[TEST] MAE ACCOUNT REDIRECT!!! redirectScreen: ",
                                redirectScreen
                            );
                            console.log("[TEST] MAE ACCOUNT REDIRECT!!! result: ", result);
                            //check if there's MAE card, then check redirection and redirect accordingly
                            const maeAccount = result?.accountListings?.filter(
                                (acc) =>
                                    acc.type == "D" && (acc.group == "0YD" || acc.group == "CCD")
                            );

                            console.log("[TEST] MAE ACCOUNT REDIRECT!!! maeAccount: ", maeAccount);

                            if (maeAccount.length) {
                                // mae account exists, now to redirect
                                const account = maeAccount[0];

                                // navigate to mae acc details screen
                                this.props.navigation.navigate(BANKINGV2_MODULE, {
                                    screen: "AccountDetailsScreen",
                                    params: {
                                        prevData: account,
                                        redirectScreen:
                                            redirectScreen === "BANKING_MAETOPUP"
                                                ? "MAETOPUP"
                                                : null,
                                        // onGoBack: this._refresh
                                    },
                                });
                                // clear redirect data in nav params
                                this.props.resetNavParams();
                            }
                        }

                        this.setState({
                            data: result,
                            refresh: !this.state.refresh,
                            isRefreshing: false,
                            isLoading: false,
                            redirectScreen: null,
                        });
                    } else {
                        this.setState({
                            data: null,
                            refresh: !this.state.refresh,
                            isRefreshing: false,
                            isLoading: false,
                        });
                    }
                })
                .catch((Error) => {
                    this.props.navigation.navigate("Dashboard");
                    console.log("[ProductL1Screen][_fetchProductHoldingsDetails] ERROR: ", Error);
                });
            if (tabName === FA_CARDS) {
                getDebitCardListEnquiry()
                    .then((response) => {
                        this.setState({
                            debitCardList: response.data.debitCards,
                        });
                    })
                    .catch(() => {});
            }
        }
    };

    _fetchTabungData = async () => {
        try {
            const { getModel } = this.props;
            const isGoalData = getModel("isGoalObjLaunch");
            const response = isGoalData?.data ? isGoalData : await getDashboardTabungCount();

            if (response && response.data) {
                const { result } = response.data;
                this.setState({
                    tabungData: result ? result : null,
                });
            }
        } catch (error) {
            // show locked state on failure
            console.log("[BankingL1Screen][_fetchTabungData] ERROR: ", error);
            this.setState({
                tabungData: null,
            });
        }
    };

    _onProductItemPressed = (data) => {
        const { tabName } = this.state;

        let actionName = `${FA_VIEW}${tabName}`;
        if (tabName === FA_FIXED_DEPOSIT) {
            GABanking.viewScreenFixedDepositItemPress();
        } else if (tabName === FA_ACCOUNTS) {
            actionName = `${FA_VIEW}CASA ${tabName}`;
        } else if (tabName === FA_LOANS) {
            actionName = FA_VIEW_LOAN_ACCOUNT;
        }

        GABanking.selectActionItemPress(tabName, actionName);
        if (tabName === FA_CARDS || tabName === FA_ACCOUNTS) {
            // Redirect to account details

            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen:
                    tabName === "Cards" && data.statusCode === "04"
                        ? "CCAEnterCardExpiryYearScreen"
                        : "AccountDetailsScreen",
                params: {
                    prevData: data,
                    tabName,
                    isAccountSuspended: data.statusCode === "06",
                    isJointAccount: data.jointAccount,
                },
            });
        } else {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: BANKING_L2_SCREEN,
                params: {
                    data,
                    tabName,
                },
            });
        }

        this.updateLastRefreshed(true);
    };

    _onDebitCardPressed = (item) => {
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: DEBIT_CARD_DETAIL,
            params: {
                debitCardDetails: item,
                isAccountSuspended: item.debitCardSt === "B",
            },
        });
        this.updateLastRefreshed(true);
    };

    _setUpMAE = () => {
        console.log("[_setUpMAE]");

        const entryParams = {
            screen: "Maybank2u",
        };
        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: MAE_INTRODUCTION,
            params: {
                entryScreen: "Tab",
                entryStack: "TabNavigator",
                entryParams,
            },
        });
    };

    _onTabungPress = () => {
        // TODO: Need to check if navigating to tabung properly
        console.log("[_onTabungPress]");

        this.props.navigation.navigate("TabungStack", {
            screen: "TabungMain",
        });
    };

    _onApplyCCPress = async () => {
        const {
            navigation: { navigate },
            getModel,
        } = this.props;
        const { isOnboard } = getModel("user");
        const { ccEnable } = this.props.getModel("cardsStp");
        const { tabName } = this.state;

        GABanking.selectActionCCPress(tabName);
        if (!ccEnable) {
            this.props.openBrowser(
                APPLY_CREDIT_CARD,
                "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit_cards_listing.page?"
            );
            return;
        }
        //ETB password Flow L3 call to invoke login page
        if (isOnboard) {
            // L3 call to invoke login page
            const request = await this.requestL3();
            if (!request) return;
        }
        const param = {
            idType: "",
            icNo: "",
            birthDt: "",
            displayIdType: "",
            preOrPostFlag: isOnboard ? "postLogin" : "preLogin",
        };
        const url = isOnboard
            ? "loan/v1/cardStp/stpCustInqInfo"
            : "loan/ntb/v1/cardStp/stpCardMasterData";
        try {
            const httpResp = await cardsInquiry(param, url, isOnboard);
            const result = httpResp?.data?.result ?? null;
            if (result) {
                const { statusCode, statusDesc, staffInd } = result;
                if (statusCode === "0000") {
                    if (isOnboard && staffInd && staffInd !== "N") {
                        showInfoToast({
                            message:
                                "We are sorry this service is not applicable for Maybank employee.",
                        });
                        return;
                    }
                    navigate("STPCardModule", {
                        screen: "CardsLanding",
                        params: {
                            serverData: result,
                            postLogin: isOnboard,
                            isResume: false,
                            entryStack: "TabNavigator",
                            entryScreen: "Tab",
                        },
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    addToAppleWallet = () => {
        GABankingApplePay.setUpApplePay();
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: CARDS_LIST,
            params: {
                entryPoint: "CARDS_DASHBOARD",
            },
        });
    };

    requestL3 = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    initApplyMAECard = async () => {
        console.log("[BankingL1Screen] >> [initApplyMAECard]");

        const { maeCustomerInfo, tabName } = this.state;
        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // Check Operation time
        const operationTime = await checkServerOperationTime("maePhysicalCard");
        const statusCode = operationTime?.statusCode ?? "";
        const statusDesc = operationTime?.statusDesc ?? COMMON_ERROR_MSG;
        const trinityFlag = operationTime?.trinityFlag ?? "";

        GABanking.selectActionApplyMAECard(tabName);
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc,
            });
            return;
        }

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[BankingL1Screen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        const navParams = getApplyMAECardNavParams(maeCustomerInfo, trinityFlag);
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLY_CARD_INTRO,
            params: {
                ...navParams,
                entryPoint: "CARDS_TAB",
            },
        });
    };

    initApplyZestDebitCard = async () => {
        console.log("[BankingL1Screen] >> [initApplyZestDebitCard]");
        this.props?.debitCardClearAll();
        this.props.checkDownTimePremier(ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD, () => {
            this.applyZestDebitCardLoginCheck();
        });
    };

    applyZestDebitCardLoginCheck = async () => {
        const { getModel } = this.props;
        const { isOnboard } = getModel("user");

        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;

            if (code != 0) return;

            this.props.navigation.navigate(ZEST_CASA_STACK, {
                screen: ZEST_DEBIT_CARD_LAST_8_DIGIT,
            });
        }
    };

    _onMAECardPress = () => {
        console.log("[BankingL1Screen] >> [_onMAECardPress]");

        const { maeCustomerInfo } = this.state;
        const debitInq = maeCustomerInfo?.debitInq ?? null;

        if (!debitInq) {
            // TODO: Show appropriate error message
            return;
        }

        const cardStatus = debitInq?.cardStatus ?? "";
        const cardNextAction = debitInq?.cardNextAction ?? "";

        console.log(
            "[BankingL1Screen][_onMAECardPress] >> cardStatus: " +
                cardStatus +
                " | cardNextAction: " +
                cardNextAction
        );

        if (cardStatus == "000" && cardNextAction == "001") {
            console.log(
                "[BankingL1Screen][_onMAECardPress] >> Navigate to Virtual Card Management flow"
            );
            this.navToVirtualCardMgmt();
        } else if (cardStatus == "000" && (cardNextAction == "002" || cardNextAction == "003")) {
            console.log("[BankingL1Screen][_onMAECardPress] >> Navigate to Card Activation flow");
            // Activate Card Flow
            this.navToActivateCard(debitInq);
        } else if (cardStatus == "024" || cardStatus == "000") {
            console.log(
                "[BankingL1Screen][_onMAECardPress] >> Navigate to Physical Card Management flow"
            );
            // Physical Card Management flow
            this.navToPhysicalCardMgmt();
        }
    };

    navToVirtualCardMgmt = async () => {
        console.log("[BankingL1Screen] >> [navToVirtualCardMgmt]");

        const { maeCustomerInfo, isRenewAllowed } = this.state;

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: MAE_CARDDETAILS,
            params: {
                maeCustomerInfo,
                cardDetails: maeCustomerInfo?.debitInq ?? null,
                type: "VIRTUAL_CARD_MGMT",
                isRenewAllowed,
            },
        });
    };

    navToActivateCard = async (cardResult) => {
        console.log("[BankingL1Screen] >> [navToActivateCard]");

        const { cardNo, cardStatus, cardNextAction } = cardResult;
        if (cardStatus == "000") {
            if (cardNextAction == "002") {
                // If 002, then cannot activate card yet

                showErrorToast({
                    message: "Your card application is in progress. Please try again later",
                });
            } else if (cardNextAction == "003") {
                // If 003, card can be activated now

                // L3 call to invoke login page
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code != 0) return;

                const chipMasterData = await fetchChipMasterData(cardNo);
                const { statusCode, statusDesc } = chipMasterData;
                if (statusCode == "0000") {
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: CARD_UCODE_PIN,
                        params: {
                            ...cardResult,
                            flowType: "ACTIVATE",
                            currentScreen: "UCODE",
                            entryPoint: "CARDS_TAB",
                            chipMasterData,
                        },
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            } else {
                // If some other cardNextAction, then error scenario
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    navToPhysicalCardMgmt = async () => {
        const { getModel } = this.props;
        const { isError, errorMsg, maeCustomerInfo, cardDetails, type, data, isCardFrozen } =
            await retrieveMAECardData(getModel);

        // If error, show toast and return
        if (isError) {
            showErrorToast({
                message: errorMsg || COMMON_ERROR_MSG,
            });

            return;
        }

        // Navigate to card details page
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: MAE_CARDDETAILS,
            params: {
                maeCustomerInfo,
                cardDetails,
                type,
                data,
                isCardFrozen,
            },
        });
    };

    _onASNBProductCardPressed = async () => {
        const { asnbConsentFlag, tabName } = this.state;
        const request = await this._getASNBSummariesData();
        if (!request) {
            return;
        }
        const asnbResult = request?.data?.result;
        const asnbDowntime = asnbResult?.downtime;
        const asnbSummaries = asnbResult?.allAccounts?.[0] ?? [];
        const showMinor = asnbSummaries?.minor ?? false;
        const guardianDetail = asnbSummaries?.guardianDetail;
        const minorDetail = asnbSummaries?.minorDetail;

        GABanking.selectActionASNBPress(tabName);
        if (asnbDowntime && asnbDowntime?.code === 9999) {
            showInfoToast({
                message: asnbDowntime?.message,
            });
            return;
        }

        if (!asnbSummaries?.guardian) {
            showInfoToast({ message: "You don't have any ASNB accounts at the moment." });
            return;
        }
        if (!asnbConsentFlag || asnbConsentFlag !== "11") {
            try {
                const l3response = await invokeL2(false);
                if (!l3response) {
                    throw new Error();
                }
                const validAsnbAcc = asnbSummaries?.accountSummary.filter((asnbAcc) => {
                    return asnbAcc?.acctType === "1";
                });
                if (validAsnbAcc?.length) {
                    const asnbAccountData = {
                        payeeName: validAsnbAcc[0]?.beneName, //fullName
                        asnbAccNo: validAsnbAcc[0]?.membNo,
                        guardian: validAsnbAcc,
                        minor: minorDetail,
                        index: this.props.index,
                        activeTabIndex: this.props.activeTabIndex,
                        showMinor,
                        guardianDetail,
                        minorDetail,
                    };
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: "ASNBConsentScreen",
                        params: {
                            origin: BANKINGV2_MODULE,
                            asnbAccountData,
                        },
                    });
                }
            } catch (e) {
                // do nothing
            }
            return;
        }

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: ASNB_SUMMARY_SCREEN,
            params: {
                showMinor,
                guardianDetail,
                minorDetail,
            },
        });
    };

    _onMFCAProductCardPressed = (item) => {
        const { tabName } = this.state;
        GABanking.selectActionNavigateCardList(tabName, FA_MASTER_FOREIGN_CURRENCY_ACCOUNT);

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: MFCA_DETAILS_SCREEN,
            params: {
                accountNumber: item?.accountList?.[0]?.number,
                investmentType: item?.investmentType,
            },
        });
    };

    _onTabungHajiProductCardPressed = async () => {
        try {
            const { tabName } = this.state;
            const response = await getTabungHajiAccounts();

            if (response?.status === 200 && response?.data?.tabungHajiAccounts.length !== 0) {
                const tabunghajiResult = response?.data;
                const totalBalance = tabunghajiResult?.totalBalance;
                const totalBalanceFormatted = tabunghajiResult?.totalBalanceFormatted;
                const tabunghajiSummaries = tabunghajiResult?.tabungHajiAccounts ?? [];
                const guardianDetail = tabunghajiSummaries.filter((item) => {
                    return item?.primary;
                });
                const minorDetail = tabunghajiSummaries.filter((item) => {
                    return !item?.primary;
                });

                GABanking.selectActionNavigateCardList(tabName, TABUNG_HAJI);

                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: TABUNG_HAJI_SUMMARY_SCREEN,
                    params: {
                        guardianDetail,
                        minorDetail,
                        totalBalance,
                        totalBalanceFormatted,
                    },
                });
            } else {
                showErrorToast({
                    message: response?.data?.statusDescription ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? COMMON_ERROR_MSG,
            });
            return null;
        }
    };

    _onUnitTrustProductCardPressed = () => {
        const { tabName } = this.state;
        GABanking.selectActionNavigateCardList(tabName, FA_UNIT_TRUST);

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: "UnitTrustSummaryScreenBAU",
        });
    };

    _onNavigateToCardList = (item) => {
        const { tabName } = this.state;
        const action_name = this.getActionName(item);
        GABanking.selectActionNavigateCardList(tabName, action_name);
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: WEALTH_CARD_ACCOUNT_LIST_SCREEN,
            params: {
                accountList: item?.accountList,
                title: item?.name,
                investmentType: item?.investmentType,
            },
        });
    };

    getActionName = (item) => {
        const { investmentType } = item;
        let action_name = "";
        const R = "Bonds/Sukuk";
        const S = "Shares";
        const U = "Unit Trust Fund";
        const F = "Foreign Currency";
        const SI = "Structured Investment";
        const G_IG = "Gold Investment";
        const SL = "Silver Investment";
        const ASNB = "ASNB Accounts";
        const TH = "Tabung Haji";
        const MMP = "Money Market";
        const D = "Dual Currency Market";
        const CCMD = "Corporate Comodity Mudharah Deposit";
        const CCMDFC = "Corporate Comodity Mudharah Deposit Foreign Currency";
        const FCA = "Multi Foreign Currency Deposit";
        const MMD = "Money Market Deposit";

        switch (investmentType) {
            case "R":
                action_name = R;
                break;
            case "S":
                action_name = S;
                break;
            case "U":
                action_name = U;
                break;
            case "F":
                action_name = F;
                break;
            case "SI":
                action_name = SI;
                break;
            case "G_IG":
                action_name = G_IG;
                break;
            case "SL":
                action_name = SL;
                break;
            case "ASNB":
                action_name = ASNB;
                break;
            case "TH":
                action_name = TH;
                break;
            case "MMP":
                action_name = MMP;
                break;
            case "D":
                action_name = D;
                break;
            case "CCMD":
                action_name = CCMD;
                break;
            case "CCMDFC":
                action_name = CCMDFC;
                break;
            case "FCA":
                action_name = FCA;
                break;
            case "MMD":
                action_name = MMD;
                break;
        }
        return `${FA_VIEW}${action_name}`;
    };

    _onWealthProductsPressed = (item) => {
        const { tabName } = this.state;
        const action_name = this.getActionName(item);
        GABanking.selectActionWealthproductPress(tabName, action_name);

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: WEALTH_PRODUCT_DETAILS_SCREEN,
            params: {
                item: {
                    productType: item?.accountList?.[0]?.productType,
                    number: item?.accountList?.[0]?.number,
                },
            },
        });
    };

    _renderInvestmentCards = (item) => {
        const { name, value, investmentType, accountList } = item;
        const { asnbConsentFlag } = this.state;
        const { soleProp: isSoleProp } = this.props.getModel("user");
        const description = (() => {
            return accountList.length === 1
                ? formateAccountNumber(accountList?.[0]?.number, 16)
                : null;
        })();

        const descriptionSecondary = (() => {
            return accountList.length > 1 ? "No. of accounts: " + accountList.length : null;
        })();

        /*
         * Mapping
         * R = "Bonds/Sukuk"
         * S = "Shares"
         * U = "Unit Trust"
         * F = "Foreign Currency"
         * SI = "Structured Investment"
         * G_IG = "Gold Investment"
         * SL = "Silver Investment"
         * ASNB = "ASNB Accounts"
         * TH = "Tabung Haji"
         * MMP = "Money Market"
         * D = "Dual Currency Market"
         * CCMD = "Corporate Comodity Mudharah Deposit"
         * CCMDFC = "Corporate Comodity Mudharah Deposit Foreign Currency"
         * FCA = "Multi Foreign Currency Deposit"
         * MMD = "Money Market Deposit"
         */

        switch (investmentType) {
            case "S":
            case "R":
            case "D":
            case "SI":
            case "MMP":
            case "G_IG":
            case "SL":
            case "U":
                return (
                    <ProductCard
                        title={name}
                        desc={description}
                        amount={value}
                        showAsterisk={true}
                        image={Assets.investmentCardBackground}
                        descSecondary={descriptionSecondary}
                        item={item}
                        onCardPressed={
                            accountList.length > 1
                                ? this._onNavigateToCardList
                                : this._onWealthProductsPressed
                        }
                        isWhite
                    />
                );
            case "ASNB":
                return (
                    !isSoleProp && (
                        <ProductCard
                            title={name}
                            desc={asnbConsentFlag === "11" && description ? description : VIEW_MORE} // empty asnb show View More text
                            onCardPressed={this._onASNBProductCardPressed}
                            image={Assets.investmentCardBackground}
                            isWhite
                            amount={value}
                            showAsterisk
                            showAmount={asnbConsentFlag === "11" && description}
                            descSecondary={descriptionSecondary}
                        />
                    )
                );
            case "F":
                return (
                    <ProductCard
                        title={name}
                        desc={description}
                        amount={value}
                        onCardPressed={
                            accountList.length > 1
                                ? this._onNavigateToCardList
                                : this._onMFCAProductCardPressed
                        }
                        image={Assets.investmentCardBackground}
                        isWhite
                        item={item}
                        showAsterisk={true}
                        descSecondary={descriptionSecondary}
                    />
                );
            case "TH":
                return (
                    <ProductCard
                        title={name}
                        desc={VIEW_MORE}
                        onCardPressed={this._onTabungHajiProductCardPressed}
                        image={Assets.investmentCardBackground}
                        isWhite
                        showAsterisk={true}
                        descSecondary={descriptionSecondary}
                        amount={value}
                    />
                );
            default:
                return (
                    <ProductCard
                        title={name}
                        desc={description}
                        amount={value}
                        image={Assets.investmentCardBackground}
                        disabled
                        descSecondary={descriptionSecondary}
                        isWhite
                        showAsterisk={true}
                    />
                );
        }
    };

    onClickExplore = () => {
        this.props.navigation.navigate("ExploreFunds");
    };

    onClickFindOutMore = () => {
        this.props.navigation.navigate("ApplyLoans");
    };

    _renderListingItem = ({ item }) => {
        const { tabName } = this.state;

        switch (tabName) {
            case "Cards":
                return (
                    <ProductCreditCard
                        title={item.name}
                        cardNumber={item.number}
                        isBlankMode={
                            !(
                                item.statusCode === "00" ||
                                item.statusCode === "04" ||
                                item.statusCode === "05" ||
                                item.statusCode === "06"
                            )
                        }
                        desc={item.statusMessage}
                        amount={item.value}
                        isSupplementary={item.supplementary}
                        onCardPressed={() => this._onProductItemPressed(item)}
                        image={Assets.cardsFullBackground}
                        disabled={
                            !(
                                item.statusCode === "00" ||
                                item.statusCode === "01" ||
                                item.statusCode === "04" ||
                                item.statusCode === "05" ||
                                item.statusCode === "06"
                            )
                        }
                        showRightDesc={item.statusCode === "04" || item.statusCode === "05"}
                        suspendedText={item.statusCode === "06" ? TEMPORARILY_BLOCKED : null}
                    />
                );
            case "Accounts":
                return (
                    <ProductCard
                        title={item.name}
                        desc={formateAccountNumber(item.number, 12)}
                        amount={item.value}
                        isPrimary={item.primary}
                        onCardPressed={() => this._onProductItemPressed(item)}
                        image={
                            item.type == "D" && (item.group == "0YD" || item.group == "CCD")
                                ? Assets.maeFullBg
                                : Assets.casaFullBg
                        }
                        isMasked={false}
                        isWhite
                        isBlankMode={item.statusCode !== "00" && item.statusCode !== "06"}
                        statusMessage={item.statusMessage}
                        disabled={item.statusCode !== "00" && item.statusCode !== "06"}
                        suspendedText={item.statusCode === "06" ? TEMPORARILY_SUSPENDED : null}
                    />
                );
            case "Fixed Deposits":
                return (
                    <ProductCard
                        title={item.name}
                        desc={formateAccountNumber(item.number, 12)}
                        descSecondary={"No. of certs: " + item.certs}
                        amount={item.value}
                        isPrimary={item.primary}
                        onCardPressed={() => this._onProductItemPressed(item)}
                        image={Assets.fixedDepositsCardBackground}
                        isWhite
                    />
                );
            case "Wealth":
                return this._renderInvestmentCards(item);
            case "Loans":
                return (
                    <ProductCard
                        title={item.name}
                        desc={
                            item.loanType === "H"
                                ? item.regNumber
                                : formateAccountNumber(item.number, 16)
                        }
                        amount={item?.code !== "99" && item.value}
                        isBlankMode={item.code === "99"}
                        statusMessage={item.code === "99" && "Pending Details"}
                        disabled={item.code === "99"}
                        isPrimary={item.primary}
                        foreignCurrency={item?.currencyCode}
                        type={item?.type}
                        onCardPressed={() => this._onProductItemPressed(item)}
                        image={Assets.loansCardBackground}
                        isWhite
                    />
                );
            default:
                return (
                    <ProductCard
                        title={item.name}
                        desc={
                            item.loanType === "H"
                                ? item.regNumber
                                : formateAccountNumber(item.number, 16)
                        }
                        amount={item.value}
                        isPrimary={item.primary}
                        onCardPressed={() => this._onProductItemPressed(item)}
                        image={Assets.loansCardBackground}
                        isWhite
                        foreignCurrency={item?.currencyCode}
                        type={item?.type}
                    />
                );
        }
    };

    _onPressViewWealthPortfolio = () => {
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: "WealthPortfolio",
        });
    };

    _onPressToolTip = () => {
        this.setState({
            showToolTip: true,
        });
    };

    _closeToolTip = () => {
        this.setState({
            showToolTip: false,
        });
    };

    _renderToolTip() {
        const asOfDate = (() => {
            const today = new Date();
            const yesterday = today.setDate(today.getDate() - 1);
            return moment(yesterday).format("DD MMM YYYY");
        })();

        if (this.state.showToolTip) {
            return (
                <ErrorMessageV2
                    title="How is this calculated?"
                    description={`Total Investment value is calculated based on the sum of your Unit Trust, Share, Gold, Silver, Master-Foreign Currency Account (MFCA), Retail Bond, Structured Product, Dual Currency, Money Market, Tabung Haji and ASNB holdings.\n\nInvestments marked with * are updated as of ${asOfDate}.`}
                    onClose={this._closeToolTip}
                />
            );
        } else return null;
    }

    _renderTabungCard() {
        const { tabungData } = this.state;
        if (tabungData) {
            if (tabungData?.exists) {
                return (
                    <ProductFeatureCard
                        title="Tabung"
                        desc={"View your ongoing Tabung here"}
                        image={Assets.iconTabung}
                        onCardPressed={this._onTabungPress}
                    />
                );
            } else {
                return;
            }
        }

        return (
            <ProductFeatureCard
                title="Tabung"
                desc="Your Tabung could not be loaded at this time. Please come back later."
                greyed
            />
        );
    }

    _renderFDPlacementApplyButton = () => {
        const { tabName, data, showFDPlacementEntryPoint } = this.state;

        if (tabName !== "Fixed Deposits" || !showFDPlacementEntryPoint) return null;

        if (!data?.accountListings?.length) return null;
        return (
            <View style={styles.fdPlacementButtonContainer}>
                <View style={styles.fdPlacementNewApplicationButtonShadow}>
                    <ActionButton
                        height={40}
                        width={FD_PLACEMENT_BUTTON_WIDTH}
                        backgroundColor={WHITE}
                        componentCenter={
                            <View style={styles.wrapper}>
                                <Image source={Assets.icon32BlackAdd} style={styles.addImage} />
                                <Typo
                                    text="Make a Placement"
                                    fontWeight="600"
                                    lineHeight={18}
                                    fontSize={14}
                                    textAlign="center"
                                />
                            </View>
                        }
                        onPress={this._handleFDApplication}
                    />
                </View>
            </View>
        );
    };

    _handleFDApplication = () => {
        const { tabName, data } = this.state;
        GABanking.selectActionHandleFDApplication(tabName, data);
        this.props.navigation.navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDEntryPointValidationScreen",
            params: {
                fdEntryPointModule: "TabNavigator",
                fdEntryPointScreen: "Maybank2u",
            },
        });
    };

    _renderDebitCardList = ({ item }) => {
        return (
            <ProductDebitCard
                cardName={item?.cardName}
                cardNo={item?.cardNo}
                onCardPressed={() => this._onDebitCardPressed(item)}
                image={Assets.cardsFullBackground}
                rightDesc={item?.debitCardSt === "B" ? TEMPORARILY_BLOCKED : `${VALID_THRU} ${item?.cardExpDate}`}
            />
        );
    };

    _renderContent() {
        const {
            data,
            refresh,
            tabName,
            maeCardsSection,
            maeActivateStatus,
            applyStatus,
            maeCardTitle,
            maeCardNo,
            isLoading,
            maeApplyCardBanner,
            showFDPlacementEntryPoint,
            isRenewAllowed,
            maeExpiryDesc,
            maeCardExpDateDesc,
            cardsDashboardWidget,
            debitCardList,
        } = this.state;

        if (isLoading)
            return (
                <React.Fragment>
                    <View style={styles.totalBalanceContainer}>
                        <ShimmerPlaceHolder style={styles.loaderBalance} />
                        <ShimmerPlaceHolder style={styles.loaderBalanceTitle} />
                    </View>
                    <View style={styles.productsListContainer}>
                        <ProductCardLoader />
                    </View>
                </React.Fragment>
            );

        if ((tabName === "Fixed Deposits" || tabName === "Loans") && !data?.accountListings?.length)
            return (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateTextArea}>
                        <Typo
                            text={`No ${tabName} Available`}
                            fontSize={18}
                            fontWeight="bold"
                            lineHeight={32}
                        />
                        <SpaceFiller height={8} />
                        <Typo
                            text={`You don't have any ${tabName
                                .toLowerCase()
                                .substring(0, tabName.length - 1)} accounts at the moment.`}
                            fontSize={14}
                            lineHeight={20}
                        />
                    </View>
                    {tabName === "Fixed Deposits" && showFDPlacementEntryPoint && (
                        <View style={styles.fdPlacementNewApplicationButtonContainer}>
                            <ActionButton
                                componentCenter={
                                    <Typo
                                        text="Apply Now"
                                        fontWeight="600"
                                        lineHeight={18}
                                        fontSize={14}
                                        textAlign="center"
                                    />
                                }
                                width={155}
                                height={40}
                                onPress={this._handleFDApplication}
                            />
                        </View>
                    )}
                    <Image
                        style={styles.emptyStateImage}
                        source={Assets.bankingEmptyStateIllustration}
                    />
                </View>
            );

        const totalLabelText = (() => {
            if (tabName === "Loans" || tabName === "Cards") return "Outstanding Balance";
            if (tabName === "Accounts") return "Total Balance";
            if (tabName === "Fixed Deposits") return "Total Deposits";
            if (tabName === "Wealth" || tabName === "Investments") return "Total Investments";
        })();

        function onPopupClose() {
            this.setState({
                showPopup: false,
            });
        }

        async function onClickOkayASB() {
            //resume*
            this.setState({
                showPopup: false,
            });
            onClickOkay(this.props);
        }

        /**
         * TODO:
         * Apparently each of the views for tabs are made with FlatList. a vritualised flatlist should
         * never be Nested inside a scrollview with the same orientation. If its not necessary, remove the scrollview
         * else, use another virtualist as a container
         */
        return (
            <ScrollView>
                <React.Fragment>
                    {/* HEADER - Outstanding/Total Balance */}
                    {data?.accountListings?.length > 0 && (
                        <View style={styles.totalBalanceContainer}>
                            <Typo
                                fontSize={26}
                                fontWeight="bold"
                                lineHeight={32}
                                text={`${Math.sign(data.total) === -1 ? "-" : ""}RM ${commaAdder(
                                    Math.abs(data.total).toFixed(2)
                                )}`}
                            />
                            <View style={styles.titleContainer}>
                                <Typo text={totalLabelText} fontSize={14} lineHeight={18} />
                                {tabName === "Wealth" && (
                                    <TouchableOpacity
                                        style={styles.tooltipContainer}
                                        onPress={this._onPressToolTip}
                                    >
                                        <Image
                                            source={Assets.icInformation}
                                            style={styles.toolTipImage}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* LIST - Cards/Accounts/FDs/Loans/Investments */}
                    <View style={styles.productsListContainer}>
                        {isLoading && <ProductCardLoader />}

                        {/* MAE Virtual/Physical Card */}
                        {tabName == "Cards" && maeCardsSection && (
                            <>
                                <View>
                                    {applyStatus ? (
                                        <ProductCreditCard
                                            title={maeCardTitle}
                                            cardNumber={maeCardNo}
                                            image={Assets.cardMaeFullBg}
                                            onCardPressed={this._onMAECardPress}
                                            hideAmount
                                            blackText
                                            maskAccNumber={false}
                                            showExpiry={isRenewAllowed}
                                            maeExpiryDesc={maeExpiryDesc}
                                        />
                                    ) : (
                                        <View>
                                            {maeActivateStatus ? (
                                                <ProductCreditCard
                                                    title={maeCardTitle}
                                                    desc={"Activate Now"}
                                                    cardNumber={maeCardNo}
                                                    image={Assets.cardMaeFullBg}
                                                    onCardPressed={this._onMAECardPress}
                                                    isBlankMode
                                                    blackText
                                                    maskAccNumber={true}
                                                />
                                            ) : (
                                                <ProductCreditCard
                                                    title={maeCardTitle}
                                                    cardNumber={maeCardNo}
                                                    showRightDesc={isRenewAllowed}
                                                    showExpiryDate={isRenewAllowed}
                                                    expiryDateDesc={maeCardExpDateDesc}
                                                    image={Assets.cardMaeFullBg}
                                                    onCardPressed={this._onMAECardPress}
                                                    hideAmount
                                                    blackText
                                                    maskAccNumber={true}
                                                    showExpiry={isRenewAllowed}
                                                    maeExpiryDesc={maeExpiryDesc}
                                                />
                                            )}
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Banner - Apply MAE Card */}
                        {tabName == "Cards" && maeApplyCardBanner && (
                            <ProductApplyMAECard onCardPressed={this.initApplyMAECard} />
                        )}

                        {/* Banner - Apply Zest Debit Card */}
                        {this.state.isZestActivateDebitCardEnable &&
                            tabName == "Cards" &&
                            this.props?.debtCardNxtAct === "003" && (
                                <ZestProductApplyDebitCard
                                    title={this.props?.debitCardName}
                                    cardNumber={this.props?.debitCardNumber}
                                    image={Assets.cardsFullBackground}
                                    onCardPressed={this.initApplyZestDebitCard}
                                    hideAmount
                                    maskAccNumber
                                    isActivate
                                />
                            )}

                        {tabName === "Wealth" && data?.accountListings?.length > 0 && (
                            <TouchableOpacity
                                onPress={this._onPressViewWealthPortfolio}
                                style={styles.viewAction}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    text="View Wealth Portfolio"
                                />
                            </TouchableOpacity>
                        )}
                        {
                            debitCardList?.length > 0 && (
                                <FlatList
                                    data={debitCardList}
                                    extraData={refresh}
                                    renderItem={this._renderDebitCardList}
                                    keyExtractor={keyExtractor}
                                />
                            )
                        }
                        {/* Other cards/accounts */}
                        {data?.accountListings && data?.accountListings.length != 0 && (
                            <FlatList
                                data={data?.accountListings}
                                extraData={refresh}
                                renderItem={this._renderListingItem}
                                keyExtractor={keyExtractor}
                            />
                        )}

                        {/* MAE onboarding card if user has no mae account */}
                        {tabName == "Accounts" && data?.accountListings && !data.maeAvailable && (
                            <ProductCard
                                title="MAE"
                                desc="Activate for account number"
                                amount={0}
                                onCardPressed={this._setUpMAE}
                                image={Assets.maeFullBg}
                                isWhite
                            />
                        )}

                        {data?.accountListings && data?.accountListings.length == 0 && (
                            <View>
                                {tabName == "Accounts" && !data.maeAvailable && (
                                    <ProductCard
                                        title="MAE"
                                        desc="Activate for account number"
                                        amount={0}
                                        onCardPressed={this._setUpMAE}
                                    />
                                )}

                                {tabName == "Cards" && (
                                    <ProductFeatureCard
                                        title="Apply for Credit Card"
                                        desc="Get the best Maybank Credit Card that benefits you and your lifestyle."
                                        image={Assets.icPayCard}
                                        onCardPressed={this._onApplyCCPress}
                                    />
                                )}
                            </View>
                        )}

                        {tabName === "Cards" &&
                            // (maeCardNo || data.accountListings.length !== 0) &&
                            Platform.OS === "ios" &&
                            this.state.isApplePayEnable &&
                            this.state.isEligibleDevice &&
                            this.state.hasEligibleCards &&
                            this.state.cardsDashboardEntryPoint && (
                                <View>
                                    <ProductApplyItem
                                        productType="Apple"
                                        text={{
                                            header:
                                                this.state.cardsDashboardWidget?.description ??
                                                "Set up your card with\nApple Pay. It’s easy.",
                                            button:
                                                this.state.cardsDashboardWidget?.cta?.title ??
                                                "Set Up Now",
                                            headerWidth: "64%",
                                        }}
                                        bgImage={Assets.applePayWidget2}
                                        bgImageUrl={this.state.cardsDashboardWidget?.imageUrl}
                                        onCardPressed={this.addToAppleWallet}
                                        cardType="MEDIUM"
                                        height={122}
                                        bgColor={YELLOW}
                                    />
                                </View>
                            )}

                        {/* Tabung card if user has tabung */}
                        {tabName == "Accounts" && data?.accountListings && this._renderTabungCard()}
                    </View>
                </React.Fragment>
                <Popup
                    visible={this.state.showPopup}
                    onClose={onPopupClose}
                    title="Welcome Back! 👋"
                    description="Let’s pick up where you have left off!"
                    primaryAction={{
                        text: "Okay",
                        onPress: onClickOkayASB,
                    }}
                />
            </ScrollView>
        );
    }

    inquireASNB = async () => {
        try {
            const response = await bankingGetDataMayaM2u(
                `/asnb/getASNBAccountSummaryDetails?accType=ASNB`,
                true,
                false
            );

            const asnbSummaries = response?.data?.result?.allAccounts?.[0] ?? [];
            console.info("asnbSummaries: ", asnbSummaries);
            // const showMinor = asnbSummaries?.minor ?? false;
            // const guardianDetail = asnbSummaries?.guardianDetail;
            const minorDetail = asnbSummaries?.minorDetail;
            const validAsnbAcc = asnbSummaries?.accountSummary.filter((asnbAcc) => {
                return asnbAcc?.acctType === "1";
            });

            if (validAsnbAcc?.length > 0) {
                const asnbAccountData = {
                    payeeName: validAsnbAcc[0]?.beneName,
                    asnbAccNo: validAsnbAcc[0]?.membNo,
                    guardian: validAsnbAcc,
                    minor: minorDetail,
                };

                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: "ASNBConsentScreen",
                    params: {
                        origin: BANKINGV2_MODULE,
                        asnbAccountData,
                    },
                });
            }
        } catch (e) {
            console.info("[BankingL1Screen] >> [inquireASNB ] ", e);
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: "ASNBConsentScreen",
                params: {
                    origin: BANKINGV2_MODULE,
                    asnbAccountData: {
                        payeeName: "XXXXXXXXXX",
                        asnbAccNo: "000004916291",
                        guardian: null,
                        minor: null,
                    },
                },
            });
        }
    };

    render() {
        const { renderCurrentTab } = this.state;

        return (
            <React.Fragment>
                {renderCurrentTab && this._renderContent()}
                {this._renderFDPlacementApplyButton()}
                {this._renderToolTip()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = function (state) {
    const { prePostQualReducer } = state.asbServicesReducer;

    return {
        prePostQualReducer,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        actionMasterData: () => dispatch(masterData()),
        resumeAction: (stpData, loanInformation) =>
            dispatch({
                type: "RESUME_SUCCESS",
                data: stpData,
                loanInformation,
            }),
        ASB_PREPOSTQUAL_CLEAR: () =>
            dispatch({
                type: ASB_PREPOSTQUAL_CLEAR,
            }),
    };
};
export default withModelContext(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(downTimeServiceProps(debitCardInquiryProps(BankingL1Screen)))
);

const styles = StyleSheet.create({
    addImage: { height: 16, marginRight: 10, width: 16 },
    emptyStateContainer: { flex: 1, justifyContent: "space-between" },
    emptyStateImage: { height: 280, width: "100%" },
    emptyStateTextArea: { marginHorizontal: 36, marginTop: 35 },
    fdPlacementButtonContainer: {
        bottom: 20,
        left: (Dimensions.get("screen").width - FD_PLACEMENT_BUTTON_WIDTH) / 2,
        position: "absolute",
    },
    fdPlacementNewApplicationButtonContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    fdPlacementNewApplicationButtonShadow: {
        ...getShadow({}),
    },

    loaderBalance: { borderRadius: 6, height: 32, width: 186 },
    loaderBalanceTitle: { borderRadius: 6, height: 18, marginTop: 2, width: 150 },
    productsListContainer: {
        marginHorizontal: 24,
        marginTop: 12,
    },
    titleContainer: {
        flexDirection: "row",
    },
    toolTipImage: {
        height: 18,
        width: 18,
    },
    tooltipContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 5,
    },
    totalBalanceContainer: {
        alignItems: "center",
        marginVertical: 24,
    },
    viewAction: {
        paddingBottom: 15,
        top: -5,
    },
    wrapper: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 19,
        paddingRight: 23,
    },
});
