import Config from "react-native-config";

// const Config = {
//     API_URL: "https://uat-maya.maybank.com.my",
//     M2U_WEB_URL: "https://m2umobilesit.maybank.com.my/mbb",
// };

/**
 * ENDPOINTS
 */
export const ENDPOINT_BASE = Config.API_URL;
export const ENDPOINT_BASE_V2 = ENDPOINT_BASE + "/v2";
export const STP_ENDPOINT_BASE = Config.STP_API_URL;
export const OAUTH_ENDPOINT_V1 = ENDPOINT_BASE + "/oauth/v1";
export const OAUTH_ENDPOINT_V2 = ENDPOINT_BASE + "/oauth/v2";
export const WALLET_ENDPOINT_V1 = ENDPOINT_BASE + "/wallet/v1";
export const S2U_ENDPOINT_V1 = ENDPOINT_BASE + "/2fa/v1";
export const S2U_ENDPOINT_V2 = ENDPOINT_BASE + "/2fa/v2";
export const S2U_ENDPOINT_V3 = ENDPOINT_BASE + "/2fa/v3/transaction";
export const S2U_ABOUT =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/services/digital_banking/secure2u.page";
export const BILLS_ENDPOINT_V2 = ENDPOINT_BASE + "/bill-service/v2";
export const GOAL_ENDPOINT_V1 = ENDPOINT_BASE + "/goal/v1";
export const TRANSFER_ENDPOINT_V2 = ENDPOINT_BASE + "/transfer/v2";
export const TRANSFER_ENDPOINT_V1 = ENDPOINT_BASE + "/transfer/v1";
export const PFM_ENDPOINT_V1 = ENDPOINT_BASE + "/pfm/v1";
export const BANKING_ENDPOINT_V1 = ENDPOINT_BASE + "/banking/v1";
export const BANKING_ENDPOINT_V2 = ENDPOINT_BASE + "/banking/v2";
export const NOTIFICATIONS_ENDPOINT_V2 = `${ENDPOINT_BASE}/notification/v2/notifications`;
export const NOTIFICATIONS_ENDPOINT_V1 = `${ENDPOINT_BASE}/notification/v1/notifications`;
export const USERS_ENDPOINT = `${ENDPOINT_BASE_V2}/users`;
export const ENROLLMENT_ENDPOINT = `${ENDPOINT_BASE_V2}/enrollment`;
export const USERS_ENDPOINT_V2 = `${ENDPOINT_BASE}/user/v2/users`;
export const CC_TXN_ENDPOINT_V1 = ENDPOINT_BASE + "/bts/v1/api";
export const LOAN_V1_ENDPOINT = Config.API_URL + "/loan/v1";
export const IMG_V1_ENDPOINT = Config.API_URL + "/img/v1";
export const BAKONG_ENDPOINT = ENDPOINT_BASE + "/bakong/v1";
export const OVERSEAS_ENDPOINT_V1 = ENDPOINT_BASE + "/overseas/v1";
export const M2U_WEB_ENDPOINT_BASE = Config.M2U_WEB_URL;
export const M2U_WEB_ENDPOINT = Config.M2U_WEB_URL + "/m2u/common";
export const APPLEPAY_V1_ENDPOINT = Config.API_URL + "/applepay/v1";
export const DIGITAL_WEALTH_ENDPOINT = ENDPOINT_BASE + "/wealth/v1";
export const EXTERNAL_CALL = "https://capi.maybanksandbox.com/ip";
export const MGATE_CALL_UAT = "https://staging.api.maybank.com";
export const MGATE_CALL_PROD = "https://api.maybank.com";
export const FORGOT_LOGIN_ENDPOINT_V2 = `${ENDPOINT_BASE}/resetPwd`;
export const FORGOT_LOGIN_VERIFY_PIN = "/forgotLoginVerifyPin";
export const FORGOT_LOGIN_VERIFY_ACCESS_NUMBER_PIN = "/forgotLoginVerifyAccessNumberPin";
export const RPP_ENDPOINT_V1 = ENDPOINT_BASE + "/rpp/v1";
export const ENGAGE_INT = `${STP_ENDPOINT_BASE}/engage/v1/init`;

//CAMPAIGN S3
export const CAMPAIGN_BASED_ENDPOINT = Config.CAMPAIGN_BASED_ENDPOINT;

// COMMON
export const TAC_RESEND_COUNTDOWN_SECONDS = 180;
export const GLOBAL_FEED_POLLING_RATE = parseInt("60000");
export const APP_REQUEST_TIME_OUT = parseInt("60000");
export const APOLLO_WEB_SOCKET_ENDPOINT = "ws://159.89.207.235:4002/subscriptions";

export const TNC_PDF_URL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/m2u-mobile_tnc-access.pdf";
export const QR_TNC_PDF_URL = "https://www.maybank2u.com.my/WebBank/QRBuyer_TnC.pdf";
export const GOOGLE_VIEW_EMBED_URL = "http://docs.google.com/gview?embedded=true&url=";
export const DUIT_NOW_URL =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/services/digital_banking/duitnow.page";
// LOGIN
export const VERIFY_USERNAME = "/verifyUserName?userName=";
export const VERIFY_USERNAME_URL = "/verifyUserName";

// MAE LINKS
export const MAE_CARD_APPLY_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/mae-card_application.pdf";
export const MAE_CARD_RPM_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/mae-card_replacement.pdf";
export const MAE_ONBOARD_TNC =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/m2u-mobile_tnc-access.pdf";
export const MAE_MASTER_DATA = "/mae/ntb/api/v1/masterData";
export const MAE_CUST_INQ_ETB_V1 = "/mae/api/v1/customerInquiryETB";
export const MAE_CUST_INQ_ETB_V2 = "/mae/api/v2/customerInquiryETB";
export const MAE_OPRN_TIME_API = "/mae/ntb/api/v1/checkOperationTime";
export const GCIF_DETAILS_API = "/mae/api/v1/debitCardAppInquiry";
export const GCIF_DETAILS_API_V2 = "/mae/api/v2/debitCardAppInquiry";
export const MAE_CUST_INFO = "/mae/api/v1/maeCustomerInfo";
export const MAE_CARD_APPLICATION = "/mae/api/v1/debitCardApplication";
export const MAE_CARD_APPLICATION_V2 = "/mae/api/v2/debitCardApplication";
export const MAE_CARD_INFO = "/mae/api/v1/maeDebitCardWalletInfo";
export const MAE_REQ_TAC = "/mae/api/v1/requestTACETB";
export const CHIP_MASTER_DATA = "/mae/api/v1/activate/getChipMasterData";
export const UCODE_SERVICE_REQ = "/mae/api/v1/activate/uCodeServiceReq";
export const FREEZE_UNFREEZE_REQ = "/mae/api/v1/activate/frzUnfrzReq";
export const DEBIT_CARD_DETAILS = "/mae/api/v1/debitCardDetails";
export const OVERSEAS_FLAG_REQ = "/mae/api/v1/activate/ovrSeasFlagReq";
export const SET_PIN_REQ = "/mae/api/v1/activate/setPinReq";
export const DEBIT_CARD_REPLACE = "/mae/api/v1/activate/dbtCrdRpm";
export const MAE_CARD_GCIF_INQUIRY = "mae/api/v2/mae-card/inquiry";
export const MAE_CARD_FEE_INQUIRY = "mae/api/v2/mae-card/fee-inquiry";

export const DATE_PICKER_DATA = "mae/calendar/v1/configurations";

export const MAE_PURCHASE_LIMIT = "mae/api/v1/inquiryDebitPurchaseLimit";
export const MAE_PURCHASE_LIMIT_UPDATE = "mae/api/v1/updateDebitPurchaseLimit";
export const CVV_INQ_REQ = "/mae/api/v1/activate/cvvInqReq";
export const AUTO_TOPUP_INQ = "/mae/api/v1/autoTopup/inquiry";
export const AUTO_TOPUP_REG = "/mae/api/v1/autoTopup/register";
export const AUTO_TOPUP_DEREG = "/mae/api/v1/autoTopup/deregister";
export const SCORE_PARTY = "/mae/api/v2/scoreParty";

// SPLIT BILL URLS
export const OWN_SPLITBILL_LIST = "/bills/toCollect?pageSize={pageSize}&page={page}";
export const INVITED_SPLITBILL_LIST = "v2/bills/invited?pageSize={pageSize}&page={page}";
export const EXPIRED_SPLITBILL_LIST = "/bills/expired?pageSize={pageSize}&page={page}";
export const GROUP_LIST = "/bills/groups?pageSize={pageSize}&page={page}";
export const BILL_PAID_API = "v2/bills/paid";
export const BILL_RECEIPT_API = "v2/bills/editImage";
export const BILL_SENDREMINDER_API = "v2/bills/sendPushNotification";
export const DELETE_GROUP = "bill/v2/bills/groups/";
export const DELETE_USERFROM_GROUP = "bill/v2/bills/groups/deleteUserFromGroup/";
export const ADD_USERTO_GROUP = "bill/v2/bills/groups/addParticipants";
export const SB_INVITE_ACCEPT_API = "v2/bills/participants/accept";
export const SB_INVITE_REJECT_API = "v2/bills/participants/reject";
export const SB_INVITED_BILL_DETAILS = "v2/bills/invited?pageSize=50&page=1&billId=";
export const MARK_BILL_PAID_API = "bill/v2/bills/markAsPaid";

// EZYPAY
export const EZY_PAY_INQ = "/payment/v1/ezypay/transactionList";
export const EZY_PAY_CAL = "/payment/v1/ezypay/calculateMonthlyPaymentEzyPay";
export const EZY_PAY_PAYMENT = "/payment/v1/ezypay/payment";

// BALANCE TRANSFER
export const BT_INQ = "/payment/v1/BT/btAcctSummeryList";
export const BT_CAL = "/payment/v1/BT/calculateMonthlyPmt";
export const BT_PAYMENT = "/payment/v1/BT/insertBT";
// PAY BILL
export const PAY_BILL_API = "/payment/v1/pay/bill";
export const ZAKAT_PAY_BILL_API = "/payment/v1/zakat/pay";

// FUND TRANSFER
export const FUND_TRANSFER_INQUIRY = "/fundTransfer/inquiry";
export const FUND_TRANSFER = "/fundTransfer/monetary";

// EzyQ
export const EZYQ_URL = "https://www.maybank2u.com.my/page/appointment/";

export const FESTIVE_BG_IMAGE = `${ENDPOINT_BASE}/cms/document-view/festival-01.jpg`;

// STP
export const CARD_NTB_URL = `${M2U_WEB_ENDPOINT}/page/apply/cardSTP.do?productType=cardSTP`; // &type=resume
export const PREMIER_NTB_URL = `${M2U_WEB_ENDPOINT}/page/apply/cardSTP.do?productType=trinitycasa`;
export const ASB_NTB_URL = `${M2U_WEB_ENDPOINT}/PreLoginLoan.do?formType=accounts&productType=asbSTPTrinity`; // &isResume=true
export const INS_NTB_URL = `${M2U_WEB_ENDPOINT}/prelogininsurance.do`;
export const CARD_SUPP_URL = `${M2U_WEB_ENDPOINT}/apply/cards`;

export const CARD_ETB_URL = `${M2U_WEB_ENDPOINT}/login.do?module=apply/cards&productType=applyCreditCard&packages=STP0055`;
export const PREMIER_ETB_URL = `${M2U_WEB_ENDPOINT}/login.do?module=apply/accounts&productType=m2uTrinityPremier`;
export const LOAN_ETB_URL = `${M2U_WEB_ENDPOINT}/login.do?module=apply/accounts&productType=personalLoanSTPTrinity`;
export const ASB_ETB_URL = `${M2U_WEB_ENDPOINT}/PreLoginLoan.do?formType=accounts&productType=asbSTPTrinity`;
export const INS_ETB_URL = `${M2U_WEB_ENDPOINT}/prelogininsurance.do`;

export const ASB_URL = `${M2U_WEB_ENDPOINT}/PreLoginLoan.do?formType=accounts&productType=asbSTPTrinity`;
export const ASB_RESUME_URL = `${M2U_WEB_ENDPOINT}/PreLoginLoan.do?formType=accounts&productType=asbSTPTrinity&isResume=true`;
export const ETIQA_URL =
    "https://etiqa.com.my/getonline/BPAQR?BranchCode=H3322&SALESPFNO=00000000&LGPFNO=00000000&PRODCODE=MI";
export const LOAN_URL = `${M2U_WEB_ENDPOINT}/page/apply/plSTP.do?productType=personalLoanTrinity`;
export const CARDS_URL =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/cards_landing.page";

// PLSTP
export const FIND_OUT_MORE =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/loans/personal_loan_listing.page";
export const PROTECTION_PLAN_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PL-PersonalCare_PDSi.pdf";
export const PLSTP_EZYCASH_URL =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/features_services/ezycash.page?gclid=EAIaIQobChMI_qXk66bX8AIVwquWCh1QpgSlEAAYAiAAEgLhz_D_BwE";
export const PLSTP_EZYPAY_URL =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/features_services/ezypay-plus.page?gclid=EAIaIQobChMI3snzg6fX8AIVN51LBR1slgx8EAAYASAAEgKg4PD_BwE";
export const PLSTP_BALTRNS_URL =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/features_services/balance-transfer.page?gclid=EAIaIQobChMIx9KqjafX8AIVSgQrCh3rOwuUEAAYASAAEgK0J_D_BwE";

// PLSTP TNC URL
export const PLSTP_CON_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PLoanSTP_DeclareTnc.pdf";
export const PLSTP_CON_FATCA =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/FATCA_FAQ.pdf";
export const PLSTP_CON_PDS =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/personalloan_pds.pdf";
export const PLSTP_CON_CRS =
    "https://maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/CRS_FAQ-Declaration.pdf";
export const PLSTP_CON_PDPA =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PLoanSTP_PDPA.pdf";

export const PLSTP_ISL_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PLoanSTPi_DeclareTnc.pdf";
export const PLSTP_ISL_FATCA =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/FATCA_FAQ.pdf";
export const PLSTP_ISL_PDS =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PLoanSTP_PDSi.PDF";
export const PLSTP_ISL_CRS =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/CRS_FAQ-Declaration.pdf";
export const PLSTP_ISL_PDPA =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/personal_loan/PLoanSTP_PDPAi.PDF";
export const TAKAFUL_URL =
    "https://etiqa.com.my/getonline/BPAQR?BranchCode=H3322&SALESPFNO=00000000&LGPFNO=00000000&PRODCODE=MT";
export const TRIPTAKAFUL_URL =
    "https://www.etiqa.com.my/getonline/Travel360-Takaful/cyberagent?code=a867efc8-6885-4063-bfb6-e1e85d98c51c";
export const TRIP_URL =
    "https://www.etiqa.com.my/getonline/Travel360-Insurance/cyberagent?code=3f01742b-f3e4-4c05-b3c4-4d345be8ba45";
export const LOAN_NTB_URL = `${M2U_WEB_ENDPOINT}/page/apply/plSTP.do?productType=personalLoanTrinity`;
export const LOAN_RESUME_URL = `${M2U_WEB_ENDPOINT}/PreLoginLoan.do?formType=accounts&productType=personalLoanSTPTrinity&isResume=true`;
// export const LOAN_RESUME_URL =
//     "https://www.maybank2u.com.my/home/m2u/common/PreLoginLoan.do?formType=accounts&productType=personalLoanSTPTrinity&isResume=true";
export const FINANCIAL_LEARN_MORE =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/wealth/digital_wealth/financialgoalsimulator.page?";
export const FINANCIAL_EPF_I_AKAUN = "https://secure.kwsp.gov.my/member/member/login";

// ZEST CASA API ENDPOINTS
export const ZEST_CASA_MASTER_DATA = "mae/openaccount/api/v1/masterData";
export const ZEST_CASA_CHECK_DOWNTIME = "mae/openaccount/api/v1/checkDownTime";
export const ZEST_CASA_PRE_POST = "mae/openaccount/api/v1/customerInquiry";
export const ZEST_CASA_PRE_POST_ETB = "mae/openaccount/api/v1/customerInquiryETB";
export const ZEST_CASA_SCORE_PARTY = "mae/openaccount/api/v1/scoreParty";
export const ZEST_CASA_REQUEST_OTP = "mae/openaccount/api/v1/requestTAC";
export const ZEST_CASA_REQUEST_OTP_ETB = "mae/openaccount/api/v1/requestTACETB";
export const ZEST_CASA_AUTHORISE_FPX_TRANSACTION = "funding/v2/funding/prepareARMessage";
export const ZEST_CASA_CREATE_ACCOUNT = "mae/openaccount/api/v1/createAccount";
export const ZEST_CASA_ACTIVATE_ACCOUNT = "mae/openaccount/api/v1/activateAccount";
export const ZEST_CASA_ACTIVATE_ACCOUNT_VIA_CASA = "mae/openaccount/api/v1/activateCasaAccountETB";
export const ZEST_CASA_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION =
    "mae/openaccount/api/v1/inquireFPXAndActivateAccount";
export const ZEST_CASA_GET_BANK_LIST = "funding/v2/funding/getBankList";
export const ZEST_CASA_GET_ACCOUNT_LIST = "/banking/v1/summary?type=A";
export const ZEST_CASA_RESUME_CUSTOMER_INQUIRY_NTB = "mae/openaccount/api/v1/resumeNTBCustInquiry";
export const ZEST_CASA_RESUME_CUSTOMER_INQUIRY_ETB = "mae/openaccount/api/v1/resumeETBCustInquiry";
export const ZEST_CASA_RESUME_NTB_ACCOUNT_INQUIRY = "mae/openaccount/api/v1/resumeAcctInquiry";
export const ZEST_CASA_GET_DEBIT_CARDS = "mae/debitcard/api/v1/getCards";
export const ZEST_CASA_APPLY_DEBIT_CARDS = "mae/debitcard/api/v1/apply";
export const ZEST_CASA_REQUEST_TAC_DEBIT_CARDS = "mae/debitcard/api/v1/requestTAC";
export const ZEST_CASA_ACTIVATE_DEBIT_CARDS = "mae/debitcard/api/v1/activate";
export const DEBIT_CARD_INQUIRY_URL = "mae/debitcard/api/v1/inquire";
export const ZEST_CASA_ACCOUNT_STATUS_INQUIRY = "/mae/openaccount/api/v1/checkAcctStatus";
export const ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD = "casa/debitcard/api/v1/checkDownTime";

// ZESTC CASA EXTERNAL URLS
export const ZEST_PDS =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/zest-i_PDS.pdf";
export const ZEST_SPECIFIC_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/zest-i_specific-tnc.pdf";
export const CASA_SPECIFIC_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/CASA-STP_tnc.pdf";
export const ZEST_GENERAL_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/IA-General-TnC.pdf";
export const ZEST_PIDM =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/PIDM010615_broc.pdf";
export const ZEST_FATCA =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/FATCA010615.pdf";
export const ZEST_PDPA =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/PDPA010615.pdf";
export const ZEST_FATCA_CRS =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/fatcacrs-self-certification-form.pdf";
export const ZEST_CASA_FPX_TNC = "https://www.mepsfpx.com.my/FPXMain/termsAndConditions.jsp";
export const ZEST_CASA_DEBIT_CARD_FPX_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/debit_cards/debit-card-application-m2u-tnc.pdf";
// ASNB Concent
export const ASNB_CON_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/ASNB/tc-asnb-account-linking.pdf";

// Apple Pay
export const SIT_UAT_CARDIMAGEURL = "https://172.31.11.35";
export const CARDIMAGEURL_PROD = "https://www.maybank2u.com.my";
export const ABOUT_APPLE_PAY =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/tnc/apple-pay.page";
// Sign Up Campaign
export const SignUpCampaign_TermsCondition_PDF =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/promotions/2021/mae-referral-campaign_tnc.pdf";
export const MOT_TNC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/funds_transfer/maybank_overseas_transfer_terms_and_conditions.pdf";
export const FTT_DECLARAION =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/banking_fees/FTT-Declaration.pdf";
export const BNM_FEP = "https://www.bnm.gov.my/fep";
export const BAKONG_TnC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/funds_transfer/mbb-bakong-transfer_tnc.pdf";

// ASB API ENDPOINTS
export const ASB_MASTER_DATA_URL = "/asb/v1/asb/asbMasterData";
export const ASB_PRE_QUAL_URL = "asb/v1/asb/prequal";
export const ASB_UPDATE_CEP_URL = "asb/v1/asb/saveInputDataCEPDB";
export const ASB_SEND_NOTIFICATION_URL = "asb/v1/asb/notifyGuarantor";
export const ASB_ELIGIBILITY_CHECK_URL = "asb/v1/asb/eligibilityCheck";
export const ASB_BECOME_A_GUARATNOR_URL = "asb/v1/asb/creditReport";
export const ASB_DECLINE_BECOME_A_GUARATNOR_URL = "asb/v1/asb/declineToBecomeGuarantor";
export const ASB_CONSENT_URL = "asb/v1/asb/checkconsent";
export const ASB_UPDATE_CONSENT_URL = "asb/v1/asb/updateconsent";
export const ASB_CALCULATE_PREMIUM_URL = "asb/v1/asb/calculatePremium";
export const ASB_DOWNLOAD_DOC_URL = "asb/v1/asb/downloadDoc";
export const ASB_DOWNLOAD_DOC_URL_DOCUMENT_LISTING = "asb/v1/asb/documentListing";
export const ASB_SAVEINPUT_DATA_CEPDB_URL = "asb/v1/asb/saveInputDataCEPDB";
export const ASB_APPLICATION_DETAILS_URL = "asb/v1/asb/applicationDetails";
export const ASB_RESUME_APPLICATION_URL = "asb/v1/asb/resumeApplication";
export const ASB_SCOREPARTY_URL = "asb/v1/asb/scoreParty";
export const ASB_PRODUCT_DESC_URL = "asb/v1/asb/getProductDesc";
export const ASB_SUBMIT_APPLICATION_URL = "asb/v1/asb/submitApplication";
export const ASB_TAC_REQUEST_URL = "asb/v1/asb/TACRequest";
export const ASB_ACCEPTANCE_URL = "asb/v1/asb/acceptance";
export const ASB_CHECK_OPERATION_TIME_URL = "asb/v1/asb/checkOperationTime";
export const TAC = "tac";
export const ASB_APPLICATION_WITH_TAC_URL = "asb/v1/asb/submitApplicationWithTAC";
export const TAC_VALIDATE = "tac/validate";
export const ASB_UPLOAD_URL = "asb/v1/asb/uploadUrl";
export const ASB_CHECK_ELIGIBILITY_URL = "asb/v1/asb/checkEligibility";
export const ASB_UPDATE_APPLICATION_STATUS_URL = "asb/v1/asb/updateApplicationStatus";
export const ASB_CALCULATE_POTENTIAL_EARNING_URL = "asb/v1/asb/calculatePotentialEarning";

export const ASB_GUARANTOR_TNC_ISLAMIC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-tc-islamic_0822_sbr-insurance-up-to-35-years.pdf";

export const ASB_GUARANTOR_TNC_CONVENTIONAL_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-tc-conventional_0822_sbr-insurance-up-to-35-years.pdf";

export const ASB_GUARANTOR_DECLARATION_ISLAMIC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-declaration-islamic_0822.pdf";
export const ASB_GUARANTOR_DECLARATION_CONVENTIONAL_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-declaration-conventional_0822.pdf";
export const FINANCIAL_GOAL_NOTICES =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/wealth/financialgoals_notices.pdf";
export const FINANCIAL_PIDM_BROCHURE =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/investment/wealth-management/third-party-unit-trusts/pidm-leaflet_2011.pdf";
export const FINANCIAL_UNIT_TRUST_GUIDE =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/wealth/unit_trusts/unit_trusts.page?";

// Transaction History Receipt url
export const TXN_HISTORY_RECEIPT = "/casa/transactionHistory/m2u/receipt";

// Fixed Deposit
export const PIDM_BROCHURE_PDF =
    "https://www.maybank2u.com.my/iwov-resources/pdf/PIDM08042011_brochure.pdf";
export const IFD_STATEMEMNT =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/IFD_Statement.pdf";
export const MDA_STATEMENT =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/MDA_Statement.pdf";
export const GOVERN_BANK_ACC =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/tnc/governBankAcc-Isl.pdf";
export const GOVERN_BANK_ACC_CONV =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/tnc/governBankAcc-Conv.pdf";

//S2U V4
export const S2U_ENABLEMENT_API = {
    init: `${S2U_ENDPOINT_V3}/init`,
    initChallenge: `${Config?.S2U_V4_GATEWAY_URL}/gw/v1/mdip/initChallenge`,
    verifyChallenge: `${Config?.S2U_V4_GATEWAY_URL}/gw/v1/mdip/verifyChallenge`,
    execute: `${S2U_ENDPOINT_V3}/execute`,
};

//kill switch
export const LOCATE_US_NOW =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/about_us/locate_maybank.page";

// Tabung Goal Downtime
export const GOAL_DOWNTIME = "goal/checkDownTime";

// MAETNC
export const MAE_ISL_TNC =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/mae-isl_tnc.pdf";
export const PDPA_PERSONAL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/PDPA010615.pdf";
export const S2U_ACTIVATE_READ_MORE =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/services/digital_banking/s2u-m2u-decomm.page";
