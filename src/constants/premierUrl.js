// PREMIER API Endpoints

export const PREMIER_MASTER_DATA = "casa/openaccount/api/v1/masterData";
export const PREMIER_CHECK_DOWNTIME = "casa/openaccount/api/v1/checkDownTime";
export const PREMIER_PRE_POST = "casa/openaccount/api/v1/customerInquiry";
export const PREMIER_PRE_POST_ETB = "casa/openaccount/api/v1/customerInquiryETB";
export const PREMIER_SCORE_PARTY = "casa/openaccount/api/v1/scoreParty";
export const PREMIER_REQUEST_OTP = "casa/openaccount/api/v1/requestTAC";
export const PREMIER_REQUEST_OTP_ETB = "casa/openaccount/api/v1/requestTACETB";
export const PREMIER_AUTHORISE_FPX_TRANSACTION = "casa/openaccount/api/v1/prepareARMessage";
export const PREMIER_CREATE_ACCOUNT = "casa/openaccount/api/v1/createAccount";
export const PREMIER_ACTIVATE_ACCOUNT = "casa/openaccount/api/v1/activateAccount";
export const PREMIER_ACTIVATE_ACCOUNT_VIA_CASA = "casa/openaccount/api/v1/activateCasaAccountETB";
export const PREMIER_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION =
    "casa/openaccount/api/v1/inquireFPXAndActivateCasa";
export const PREMIER_GET_BANK_LIST = "casa/openaccount/api/v1/getBankList";
export const PREMIER_GET_ACCOUNT_LIST = "banking/v1/summary?type=A";
export const PREMIER_RESUME_CUSTOMER_INQUIRY_NTB = "casa/openaccount/api/v1/resumeNTBCustInquiry";
export const PREMIER_RESUME_CUSTOMER_INQUIRY_ETB = "casa/openaccount/api/v1/resumeETBCustInquiry";
export const PREMIER_RESUME_NTB_ACCOUNT_INQUIRY = "casa/openaccount/api/v1/resumeAcctInquiry";
export const PREMIER_GET_DEBIT_CARDS = "casa/debitcard/api/v1/getCards";
export const PREMIER_APPLY_DEBIT_CARDS = "casa/debitcard/api/v1/apply";
export const PREMIER_REQUEST_TAC_DEBIT_CARDS = "casa/debitcard/api/v1/requestTAC";
export const PREMIER_ACTIVATE_DEBIT_CARDS = "casa/debitcard/api/v1/activate";
export const PREMIER_DEBIT_CARD_INQUIRY_URL = "casa/debitcard/api/v1/inquire";
export const PREMIER_CHECK_DOWNTIME_DEBIT_CARD = "casa/debitcard/api/v1/checkDownTime";
export const PREMIER_ACCOUNT_STATUS_INQUIRY = "casa/openaccount/api/v1/checkAcctStatus";
export const PREMIER_GET_TOKEN = "users/v1/mdip/generate";
export const PREMIER_GET_REFRESH_TOKEN = "v1/mdip/refresh";
export const PREMIER_UPDATE_SEURITY_QUESTIONS_FLAG =
    "casa/openaccount/api/v1/updateSecurityQuestionFlag";

// PM1 External Urls
export const PM1_TNC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/tc-premier1.pdf";
// PREMIER EXTERNAL URLS
export const PMA_PDS_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/PBAi-GSAi-PMAi_PDS.pdf";
export const PMA_SPECIFIC_TNC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/tc-pma-i.pdf";
export const PMA_GENERAL_TNC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/IA-General-TnC.pdf";
export const PREMIER_PIDM_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/PIDM010615_broc.pdf";
export const PREMIER_FATCA_URL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/FATCA010615.pdf";
export const PREMIER_PDPA_URL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/PDPA010615.pdf";
export const PREMIER_FATCA_CRS_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/fatcacrs-self-certification-form.pdf";
export const PREMIER_CASA_FPX_TNC_URL = "https://www.mepsfpx.com.my/FPXMain/termsAndConditions.jsp";
export const PREMIER_DEBIT_CARD_FPX_TNC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/debit_cards/debit-card-application-m2u-tnc.pdf";
 
// Kawanku External Urls
export const KAWANKU_SAVINGS_TNC_URL =
"https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/tc-kawanku-savings-account.pdf";
export const KAWANKU_SAVINGS_FATCA_URL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/FATCA010615.pdf";
export const KAWANKU_SAVINGS_PIDM_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/PIDM010615_broc.pdf";
export const KAWANKU_SAVINGS_FATCA_CRS_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/fatcacrs-self-certification-form.pdf";
export const KAWANKU_SAVINGS_PDPA_URL =
    "https://www.maybank2u.com.my/iwov-resources/maybank/document/my/en/personal/PDPA010615.pdf";

// Savings-I External Urls 
export const KAWANKU_SAVINGSI_SPECIFIC_TNC_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/tc-savings-account-i.pdf";
export const KAWANKU_SAVINGSI_PDS_URL =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/accounts/apendix3a_pds_cm_sa_en.pdf";
export const PREMIER_M2U_REGISTRATION_PROD_URL = "https://www.maybank2u.com.my/home/m2u/common/signup.do";
export const LOCATE_NEAREST_BRANCH = "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/about_us/locate_maybank.page";

export const TNC_ZAKAT_DECLARATION =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/zakat-auto-debit-tnc.pdf";
export const PDS_ZAKAT_DECLARATION =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/zakat-auto-debit-pds.pdf";
export const PRIVACY_NOTICE_ZAKAT_DECLARATION =
    "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/security_privacy/privacy_notice.page";
