import {
    ARMY_POLICE_ID2,
    BUSINESS_REGISTRATION_NUMBER,
    CANCEL_REQUEST,
    ENTER_ARMY_POLICE_ID2,
    ENTER_BUSINESS_REG_NO,
    ENTER_PASSPORT_NUMBER,
    FORWARD_REQUEST,
    MARK_AS_PAID,
    PASSPORTID_LBL2,
    REJECT_REQUEST,
    PASSPORTID_LBL,
    ARMY_POLICE_ID,
    ENTER_ARMY_POLICE_ID,
    NRIC_NUMBER,
    MOBNUM_LBL,
    BANK_ACCT_NO,
} from "@constants/strings";

export const frequencyList = [
    {
        code: "01",
        name: "Anytime",
        index: 0,
    },
    {
        code: "02",
        name: "Daily",
        index: 1,
    },
    {
        code: "03",
        name: "Weekly",
        index: 2,
    },
    {
        code: "04",
        name: "Monthly",
        index: 3,
    },
    {
        code: "05",
        name: "Quarterly",
        index: 4,
    },
    {
        code: "06",
        name: "Yearly",
        index: 5,
    },
];

export const idMapProxy = [
    {
        code: "01",
        name: "NWIC",
    },
    {
        code: "02",
        name: "AMIC" || "PLIC",
    },
    {
        code: "03",
        name: "PASS",
    },
    {
        code: "04",
        name: "BRNO",
    },
];

export const mapProxy = {
    "01": "NRIC",
    "02": "ARMN",
    "03": "PSPT",
    "04": "BREG",
    "05": "MBNO",
};

export const indexProxy = {
    indexAccount: 0,
    indexMBNO: 1,
    indexNRIC: 2,
    indexPassport: 3,
    indexArmyPolice: 4,
    indexBRN: 5,
};

export const proxyList = [
    {
        no: 0,
        selected: true,
        code: "CASA",
        name: BANK_ACCT_NO,
        const: "CASA",
        isSelected: false,
        index: 0,
        maxLength: 99,
        minLength: 5,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "", //"Please enter valid transfer details.",
        maxErrorMessage: "", //"Account number cannot be greater than 20.",
        idLabel: BANK_ACCT_NO,
        idPlaceHolder: BANK_ACCT_NO,
    },
    {
        no: 1,
        selected: true,
        code: "MBNO",
        name: MOBNUM_LBL,
        const: "MBNO",
        isSelected: false,
        index: 1,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid mobile number.",
        maxErrorMessage: "Mobile number cannot be greater than 20.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 2,
        selected: false,
        code: "NRIC",
        name: NRIC_NUMBER,
        const: "NRIC",
        isSelected: false,
        index: 2,
        minLength: 8,
        maxLength: 12,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid NRIC Number.",
        maxErrorMessage: "NRIC number cannot be greater than 12.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 3,
        selected: false,
        code: "PSPT",
        name: PASSPORTID_LBL,
        const: "PSPT",
        isSelected: false,
        index: 3,
        minLength: 6,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Passport number.",
        maxErrorMessage: "Passport number cannot be greater than 20.",
        idLabel: PASSPORTID_LBL2,
        idPlaceHolder: ENTER_PASSPORT_NUMBER,
    },
    {
        no: 4,
        selected: false,
        code: "ARMN",
        name: ARMY_POLICE_ID2,
        const: "ARMN",
        isSelected: false,
        index: 4,
        minLength: 5,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Army/Police Number.",
        maxErrorMessage: "Army/Police number cannot be greater than 20.",
        idLabel: ARMY_POLICE_ID2,
        idPlaceHolder: ENTER_ARMY_POLICE_ID2,
    },
    {
        no: 5,
        selected: false,
        code: "BREG",
        name: BUSINESS_REGISTRATION_NUMBER,
        const: "BREG",
        isSelected: false,
        index: 5,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Business Registration Number.",
        maxErrorMessage: "Business Registration number cannot be greater than 20.",
        idLabel: BUSINESS_REGISTRATION_NUMBER,
        idPlaceHolder: ENTER_BUSINESS_REG_NO,
    },
];

export const VALID_ACC_NUMBER = "Please input valid account number.";
export const serviceCodeList = ["801", "802", "821", "803", "804", "822"]; //recheck after pull

export const menuArray = [
    {
        menuLabel: CANCEL_REQUEST,
        menuParam: "CANCEL_REQUEST",
    },
    {
        menuLabel: MARK_AS_PAID,
        menuParam: "MARK_AS_PAID",
    },
];

export const menuArrayReceiver = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: FORWARD_REQUEST,
        menuParam: "FORWARD_REQUEST",
    },
    {
        menuLabel: "Block Requestor",
        menuParam: "BLOCK_REQUEST",
    },
];

export const menuArrayReceiverSoleProp = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: "Block Requestor",
        menuParam: "BLOCK_REQUEST",
    },
];
export const menuArrayAutoDebit = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
    {
        menuLabel: "Block Request",
        menuParam: "BLOCK_REQUEST",
    },
];
export const menuArrayReceiverSolePropAD = [
    {
        menuLabel: REJECT_REQUEST,
        menuParam: "REJECT_REQUEST",
    },
];

export const getAllAccountSubUrl = "/summary?type=A";
export const duitNowPasspostCodeSubUrl = "/duitnow/passportcodes";
export const fundTransferInquirySubUrl = "/fundTransfer/inquiry";

export const modelType = {
    user: "user",
    misc: "misc",
};

export const proxyIdType = {
    ACCT: "ACCT",
};

export const transactionType = {
    TRANSFER: "TRANSFER",
};

export const paymentMethodsList = [
    { key: "01", title: "Saving & current account", isSelected: true },
    { key: "02", title: "Credit card", isSelected: true },
    { key: "03", title: "E-Wallet", isSelected: true },
];

export const termsAndConditionUrl =
    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/duitnow-request_tnc.pdf";

export const duitnowProxyList = [
    {
        no: 0,
        selected: true,
        code: "CASA",
        name: "Account Number",
        const: "CASA",
        isSelected: false,
        index: 0,
        maxLength: 99,
        minLength: 5,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "",
        maxErrorMessage: "",
        idLabel: "Account number",
        idPlaceHolder: "Enter account number",
    },
    {
        no: 1,
        selected: true,
        code: "MBNO",
        name: MOBNUM_LBL,
        const: "MBNO",
        isSelected: false,
        index: 1,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid mobile number.",
        maxErrorMessage: "Mobile number cannot be greater than 20.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 2,
        selected: false,
        code: "NRIC",
        name: NRIC_NUMBER,
        const: "NRIC",
        isSelected: false,
        index: 2,
        minLength: 8,
        maxLength: 12,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid NRIC Number.",
        maxErrorMessage: "NRIC number cannot be greater than 12.",
        idLabel: "",
        idPlaceHolder: "",
    },
    {
        no: 3,
        selected: false,
        code: "PSPT",
        name: PASSPORTID_LBL,
        const: "PSPT",
        isSelected: false,
        index: 3,
        minLength: 6,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Passport Number.",
        maxErrorMessage: "Passport number cannot be greater than 20.",
        idLabel: PASSPORTID_LBL,
        idPlaceHolder: ENTER_PASSPORT_NUMBER,
    },
    {
        no: 4,
        selected: false,
        code: "ARMN",
        name: ARMY_POLICE_ID2,
        const: "ARMN",
        isSelected: false,
        index: 4,
        minLength: 5,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Army/Police Number.",
        maxErrorMessage: "Army/Police number cannot be greater than 20.",
        idLabel: ARMY_POLICE_ID,
        idPlaceHolder: ENTER_ARMY_POLICE_ID,
    },
    {
        no: 5,
        selected: false,
        code: "BREG",
        name: BUSINESS_REGISTRATION_NUMBER,
        const: "BREG",
        isSelected: false,
        index: 5,
        minLength: 8,
        maxLength: 20,
        isDisableSubmitBtnOnMin: true,
        minErrorMessage: "Please input a valid Business Registration Number.",
        maxErrorMessage: "Business Registration number cannot be greater than 20.",
        idLabel: BUSINESS_REGISTRATION_NUMBER,
        idPlaceHolder: ENTER_BUSINESS_REG_NO,
    },
];
