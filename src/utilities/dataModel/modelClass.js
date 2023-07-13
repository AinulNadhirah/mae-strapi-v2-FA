export var Update_Profile = {};

// ModelClass.COMMON_DATA.m2uAccessToken
// ModelClass.TRANSFER_DATA.m2uToken
// ModelClass.QR_DATA.m2uAccessToken

export var MODULE_NAVIGATION_TYPE = "";
export var FEEDS_PAGENUMBER = "";
export var FCM_TOKEN = "";
// PARTIALS:  only referred in walletstartscreen, use nav params
export var WALLET_TYPE = "";

export var isNetworkConnected = false;
export var authToken = "";
export var authRefreshToken = "";
export var CUST_ICNUMBER = "";
export var USER_EXITS_TYPE = "";
export var ISFRIST_TIME = false;
export var IS_SCROOL_PISTION = 0;

export var navigationType = {};

export var QueryType = {};

export var SIGN_UP = {};

export var RequestSmsOtp = {};

export var USER_DATA = {};

export var PDF_DATA = {};

export var WEBVIEW_DATA = {};

export var FITNESS_CHALLENGES = {};

export var COMMON_DATA = {};

export var TRANSFER_DATA = {};

export var RELOAD_DATA = {};

export var PAY_BILL = {};

export var JOMPAY = {};

export var CAMERA_TYPE = "";

export var WETIX_DATA = {};

export var KLIA_DATA = {};

export var PFM_DATA = {};

export function clearTransferData() {
	TRANSFER_DATA.transferType = null;
	TRANSFER_DATA.transferSubType = null;
	TRANSFER_DATA.twoFAType = null;
	TRANSFER_DATA.mbbbankCode = "";
	TRANSFER_DATA.transactionStatus == false;
	TRANSFER_DATA.secure2uResponseObject = null;
	TRANSFER_DATA.transactionResponseObject = null;
	TRANSFER_DATA.isSecure2uFlow = null;
	COMMON_DATA.transferFlow = "";
	TRANSFER_DATA.recipientNickName = "";
	TRANSFER_DATA.recipientName = "";
	TRANSFER_DATA.transferAmount = "";
	TRANSFER_DATA.recipientReference = "";
	TRANSFER_DATA.recipientReference = "";
	TRANSFER_DATA.tranferTypeName = "";
	TRANSFER_DATA.toAccount = "";
	TRANSFER_DATA.toAccountCode = "";
	TRANSFER_DATA.formatedToAccount = "";
	TRANSFER_DATA.toAccountName = "";
	TRANSFER_DATA.accountName = "";
	TRANSFER_DATA.toAccountBank = "";
	TRANSFER_DATA.validationBit = 0;
	TRANSFER_DATA.transferTacRequired = false;
	TRANSFER_DATA.cardsAcctCode = "";
	TRANSFER_DATA.addingFavouriteFlow = false;
	TRANSFER_DATA.validationBit = "";
	COMMON_DATA.isSplitBillsFlow = false;
	TRANSFER_DATA.isFutureTransfer = false;
	TRANSFER_DATA.isRecurringTransfer = false;
	TRANSFER_DATA.startDateEndDateStr = "";
	TRANSFER_DATA.startDateIntTemp = "";
	TRANSFER_DATA.startDateInt = "";
	TRANSFER_DATA.endDateIntTemp = "";
	TRANSFER_DATA.endDateInt = "";
	TRANSFER_DATA.startDate = "";
	TRANSFER_DATA.endDate = "";
	TRANSFER_DATA.transactionRefNumber = "";
	TRANSFER_DATA.transactionRefNumberFull = "";
	TRANSFER_DATA.transactionDate = "";
	TRANSFER_DATA.customerName = "";
	TRANSFER_DATA.recipientNotes = "";
	TRANSFER_DATA.displayTransferAmount = "";
	TRANSFER_DATA.interbankPaymentType = null;
	TRANSFER_DATA.swiftCode = null;
	TRANSFER_DATA.proxyRefNum = null;

	TRANSFER_DATA.confirmDateStartDate = 0;
	TRANSFER_DATA.confirmDateEndDate = 0;
	TRANSFER_DATA.confirmDateEditFlow = 0;
	TRANSFER_DATA.effectiveDateFormated = "";
	TRANSFER_DATA.effectiveDateObj = {};
	TRANSFER_DATA.effectiveDate = "00000000";
	// TRANSFER_DATA.fromAccount = "";
	// TRANSFER_DATA.formatedFromAccount = "";
	// TRANSFER_DATA.fromAccountCode = "";

	DUITNOW_DATA.isRecurringTransfer = false;
	DUITNOW_DATA.transferOtherBank = false;
	DUITNOW_DATA.transferMaybank = false;
	DUITNOW_DATA.transferFav = false;
	DUITNOW_DATA.transferOtherBank = false;
	TRANSFER_DATA.isSecure2uTransferFlow = false;
	TRANSFER_DATA.transactionResponseError = "";

	KLIA_DATA.selectedDate = "";
	KLIA_DATA.selectedDateFormated = "";

	DUITNOW_DATA.idValue = "";
	DUITNOW_DATA.transferProxyRefNo = null;
	DUITNOW_DATA.transferRetrievalRefNo = "";
	DUITNOW_DATA.transferProxyRefNo = "";
	DUITNOW_DATA.transferRegRefNo = "";
	DUITNOW_DATA.transferAccType = "";
	DUITNOW_DATA.transferBankCode = "";
	DUITNOW_DATA.transferBankName = "";
	DUITNOW_DATA.transferAccHolderName = "";
	DUITNOW_DATA.transferLimitInd = "";
	DUITNOW_DATA.transferAccNumber = "";

	TRANSFER_DATA.isSecure2uRegisterTacCompleted = false;
	TRANSFER_DATA.isTacCAllAgain = false;
}
export function clearSendMoneyData() {
	SEND_MONEY_DATA.sendMoneyFlow = 0;
	SEND_MONEY_DATA.pendingData = [];
	SEND_MONEY_DATA.sentData = [];
	SEND_MONEY_DATA.receivedData = [];
	SEND_MONEY_DATA.detailsSelectedItem = {};
	SEND_MONEY_DATA.isSenderSelectedItem = false;
	SEND_MONEY_DATA.msgIdSelectedItem = 0;
	SEND_MONEY_DATA.userImage = "";
	SEND_MONEY_DATA.detailsTitle = "";
	SEND_MONEY_DATA.detailsImage = "";
	SEND_MONEY_DATA.detailsMobileNumber = "";
	SEND_MONEY_DATA.detailsUserName = "";
	SEND_MONEY_DATA.detailsAmount = "";
	SEND_MONEY_DATA.detailsAmountOnly = "";
	SEND_MONEY_DATA.detailsStatus = "";
	SEND_MONEY_DATA.detailsNotes = "";
	SEND_MONEY_DATA.detailsReferenceID = "";
	SEND_MONEY_DATA.detailsDate = "";
	SEND_MONEY_DATA.detailsFlow = 1;
	SEND_MONEY_DATA.statusDescriptionText = "";
	SEND_MONEY_DATA.acctDetailsObj = {};
	SEND_MONEY_DATA.showShareMenuAcknowledge = false;
	SEND_MONEY_DATA.showDateDetails = false;
	SEND_MONEY_DATA.formatedAccountNumber = "";
	SELECTED_CONTACT = [];
	SEND_MONEY_DATA.callPaid = false;
	SEND_MONEY_DATA.isSendMoneyAsOpen = false;
	DUITNOW_DATA.isSendMoneyFlow = false;
	DUITNOW_DATA.idValue = "";
	TRANSFER_DATA.isSecure2uRegisterTacCompleted = false;
}

export var DUITNOW_DATA = {};

export var SECURE2U_DATA = {};

export var LINK2U_DATA = {};

export var WALLET_DATA = {};

export var QR_DATA = {};

export var GOAL_DATA = {};

export var VIEW_ACCOUNT_DATA = {};

export var VIEW_CARD_DATA = {};

export var M2U_DATA = {};

export var GoalType = {};

export var GoalData = {};

export var ScanImageData = {};

export var BoosterData = {};

export var DPTData = {};

export var FitnessChallengeParticipantsConfig = {};

export var GuiltyPleasurecategoryData = {};

export var RequestUserInfo = {};

export var settings = {};

export var SELECTED_CONTACT = [];
export var SELECTING_CONTACT = [];

export var MAX_PARTICIPANTS = 0;

export var MIN_PARTICIPANTS = 0;

export var acceptChallengeInitiated = false;
export var invitedChallengeData = [];
export var DPTSaved = false;
export var activeNChallengeAcceptable = true;
export var activeBChallengeAcceptable = true;
export var fitnessDashboardScreen = 0;
export var fitnessDashboardChange = false;
export var journalPic = ""; // journal camera/gallery photo in base64 : set at take pic. clear after add journal func
export var journalPicMessage = ""; //photo message set at picture preview. clear after add journal
export var journalPicDetails = []; //height and width of captured base64 :set at take pic
export var journalParentScreen = ""; // screen where journal called : set at journal add media
export var journalParentModule = ""; // module where journal called
export var journalMessageType = ""; // set at preview
export var isjournalGalleryOpen = false;
export var journalLocationCoords = {};
export var journalLocationName = "";
export var journalLocationAddress = "";

// ALL OF THIS SHOULD RESIDE IN STRING CONSTANTS
export var THIRD_PARTY_FUND_TRANSFER = "THIRD_PARTY_FUND_TRANSFER";
export var IBFT_FUND_TRANSFER = "IBFT_FUND_TRANSFER";
export var GIRO_FUND_TRNSFER = "GIRO_FUND_TRNSFER";
export var SEC2U_REGISTRATION_REQ = "SEC2U_REGISTRATION_REQ";
export var SEC2U_REGISTRATION_VERIFY = "SEC2U_REGISTRATION_VERIFY";
export var MOBILE_RELOAD_OTP = "MOBILE_RELOAD_OTP";
export var DUITNOW_RECURRING_TRANSFER_OTP = "DUITNOW_RECURRING_TRANSFER_OTP";
export var DUITNOW_CREDIT_TRANSFER_OTP = "DUITNOW_CREDIT_TRANSFER_OTP";
export var BILL_PAYMENT_OTP = "BILL_PAYMENT_OTP";
export var JOMPAY_OTP = "JOMPAY";
export var GOAL_FUND = "GOAL_FUND";
export var GOAL_WITHDRAW = "GOAL_WITHDRAW";
export var GOAL_REMOVE = "GOAL_REMOVE";
export var DUITNOW_FIRST_TIME_REQ = "DUITNOW_FIRST_TIME_REQ";

export var MBB_BANK_CODE_MAYBANK = "0000";
export var MBB_BANK_SWIFT_CODE = "MBBEMYKL";
export var MBB_BANK_AQUIRER_ID = "000000";
export var MBB_BANK_CODE = "MAYBANK";

export var FUND_TRANSFER_TYPE_OWN_ACCT = "OWN_ACCT";
export var FUND_TRANSFER_TYPE_MAYBANK = "MAYBANK";
export var FUND_TRANSFER_TYPE_INTERBANK = "INTERBANK";
export var FUND_TRANSFER_TYPE_DUITNOW_ON_US = "DUITNOW_ON_US";
export var FUND_TRANSFER_TYPE_DUITNOW_OFF_US = "DUITNOW_OFF_US";
export var FUND_TRANSFER_TYPE_QUICK = "QUICK";

export var SUB_TYPE_OPEN = "OPEN";
export var SUB_TYPE_FAVORITE_FIRST_TIME = "FAVORITE_FIRST_TIME";
export var SUB_TYPE_FAVORITE = "FAVORITE";

export var TWO_FA_TYPE_SECURE2U_PUSH = "SECURE2U_PUSH";
export var TWO_FA_TYPE_SECURE2U_PULL = "SECURE2U_PULL";
export var TWO_FA_TYPE_TAC = "TAC";
export var TWO_FA_TYPE_NONE = "NONE";

export var MOMENTS_DATA = [];
export var ISPROFILEIMAGE = false;

export var SPLIT_BILL_DATA = {};

export var SEND_MONEY_DATA = {};

export var TABUNG_GOALS_DATA = {};

export var COLLECTION_MOVEMENT = {};

export var COLLECTION_RENAME = {};

export var BOOKMARK_MOVEMENT = {};

export var CURRENT_COLLECTION_ID = 0;

export var CURRENT_COLLECTION_DATA = {};

export var CURRENT_CONTENT_DATA = {};

export var HOME_DETAILS_CALLPAGE = "";

export var DPT_BGI = "";

export var CHALLENGE_REMOVE_DATA = {};

// PARTNER_CONTENT = {};

export var PARTNER_APPLICATION = {};

export var MAE_CUSTOMER_DETAILS = {};

export var MAE_FUNDING_DETAILS = {};

export var CARD_ACTIVATION = {};

export var FPX_AR_MSG_DATA = {};

export var BPG_3D_TXN_DATA = {};

export var MAE_CDD_DETAILS = {};

export var MAE_API_DATA = {};

resetGlobalVar();

/**
 * Refactoring
 *
 * USELESS: can and should be removed. unused or unreferred by any module, or irrelevant and useless.
 * PARTIAL: used by some module, but can be pass with navigation params. should be removed after nav params implementation
 * VALID: used inter-module and should be in the app state. should be added into model context and removed from here
 *
 * Several implementation at the moment are tightly coupled with modelClass eg ApiManager,
 * which couldn't use modelContext hook because it will then be in a nested function and hook will not work.
 * It requires the change for API manager to be supplied with the context from the function consumer eg Component.
 * This changes require lots of changes for each services, and from the where the services is made. This is
 * the recommended way and keeping things as functional as much as possible
 *
 * eg:
 *
 * in component:
 *
 * async componentDidMount() {
 *   const { token } = getContext('auth')
 *
 *   const request = await ApiManager.service({ ...params, token })
 * }
 *
 * in apiManager
 * function ApiManager.service(params) {
 *   // where params include token and other that might be needed for api call.
 *   // the function itself should avoid doing param mutation or digging through here and there
 *   return ...
 * }
 *
 * So for the moment, ApiManager will continue to rely on the ModelClass for few specific items, eg tokens
 * until we refactor the whole thing
 *
 */
export function resetGlobalVar() {
	// USELESS: only used in settings.js and doesn't seems to be doing anything or referred by anyone.
	MODULE_NAVIGATION_TYPE = "";

	// USELESS: only initiate in this file and doesn't seems to be doing anything or referred by anyone.
	FEEDS_PAGENUMBER = "";

	// USELESS: only been set in splashscreen.js and doesn't seems to be doing anything or referred by anyone.
	FCM_TOKEN = "";

	// USELESS: only declared in this file and unused.
	isNetworkConnected = false;

	// VALID: set in splashscreen, used by services/index.js. is actually the same with mayaToken.
	// Group in auth, named to mayaToken
	authToken = "";

	// VALID: set in splashscreen, used by services/index.js. Group in auth
	authRefreshToken = "";

	// USELESS: set in DataModel, however, not referred anywhere. in LinkM2UScreen, instead of referred, it
	// is being set and compared with local state. The value should be assign into local state since its not
	// being used inter-module.
	CUST_ICNUMBER = "";

	// USELESS: value was not defined or set anywhere in the code,
	// but was used for comparison  in OnBoardingName.js
	// which will not go through the statement.
	USER_EXITS_TYPE = "";

	// USELESS: value set on OnBoardingOtpVerification and wasn't referred anywhere else.
	ISFRIST_TIME = false;

	// USELESS: not used in anywhere.
	IS_SCROOL_PISTION = 0;

	// PARTIAL: value set in DailyHustleChallengeAccept and DailyHustleChallengeBoard,
	// and use in FitnessLandingPageFour
	acceptChallengeInitiated = false;

	// PARTIAL: value set in DailyHustleChallengeAccept and DailyHustleChallengeBoard,
	// and use in FitnessLandingPageFour
	invitedChallengeData = [];

	// PARTIAL: set in DailyPersonalTarget and only used in FitnessDashboard. Can be passed as params
	// with the `resetAndNavigateToModule` function
	DPTSaved = false;

	// USELESS: set in FitnessChallenges and unused
	activeNChallengeAcceptable = true;

	// VALID: value set in FitnessChallenges and used in BrandedChallenge screen, and
	// no navigational path from fitnessDashboard to brandedChallenge, so no way to use
	// navigation params.
	// Group in fitness
	activeBChallengeAcceptable = true;

	// PARTIAL: value set across screens FitnessAddCard, PartnerApplication, PartnersBoard, PaymentConfirmation,
	// PersonalDetail, PlanConfirmation, SelectPlan, HomeDetails, TransferAcknowledgeScreen, TransferConfirmationScreen,
	// and used for comparison in FitnessDashboard
	// Those in screens are probable for navigation params method
	fitnessDashboardScreen = 0;

	// PARTIAL: value set across screens FitnessAddCard, PartnerApplication, PartnersBoard, PaymentConfirmation,
	// PersonalDetail, PlanConfirmation, SelectPlan, HomeDetails, TransferAcknowledgeScreen, TransferConfirmationScreen,
	// and used for comparison in FitnessDashboard
	// Those in screens are probable for navigation params method
	fitnessDashboardChange = false;

	// PARTIAL : Set and use in Journal, JournalPicPreview (screen), shareLocation (Screen), TakeJournalPicture (screen),
	// UploadMedia1 (should be remove).
	journalPic = ""; // journal camera/gallery photo in base64 : set at take pic. clear after add journal func

	// PARTIAL : Set and use in Journal, JournalPicPreview (screen), shareLocation (Screen), TakeJournalPicture (screen),
	// UploadMedia1 (should be remove).
	journalPicMessage = ""; //photo message set at picture preview. clear after add journal

	// PARTIAL : Set and use in Journal, JournalPicPreview (screen), shareLocation (Screen), TakeJournalPicture (screen),
	// UploadMedia1 (should be remove).
	journalPicDetails = []; //height and width of captured base64 :set at take pic

	// PARTIAL: Value supplied by consumer of Journal Component and set within Journal component. Could well be set with
	// navigation params
	journalParentScreen = ""; // screen where journal called : set at journal add media

	// USELESS: Value supplied by consumer of Journal Component and set in Journal and used by JournalMessages.
	// Doesn't need nav params, instead can be supply to the JournalMessages as a prop.
	journalParentModule = ""; // module where journal called

	// PARTIAL: Value set in Journal, ShareLocation and JournalPicPreview and referred to in Journal. The value
	// can be pass as param when navigating to the parent screen, and supplied by the parent screen to journal
	// as props
	journalMessageType = ""; // set at preview

	// PARTIAL: Value set in Journal and JournalPicPreview and referred to in Journal. The value
	// can be pass as param when navigating to the parent screen and JournalPicPreview
	isjournalGalleryOpen = false;

	// PARTIAL: Value set in ShareLocation and used in Journal. Can be passed as nav params from ShareLocation
	journalLocationCoords = {};

	// PARTIAL: Value set in ShareLocation and used in Journal. Can be passed as nav params from ShareLocation
	journalLocationName = "";

	// PARTIAL: Value set in ShareLocation and used in Journal. Can be passed as nav params from ShareLocation
	journalLocationAddress = "";

	// USELESS: Not use anywhere
	// answersliderValue = 0;

	// USELESS: This is a constant and should be place in constant's configs.
	THIRD_PARTY_FUND_TRANSFER = "THIRD_PARTY_FUND_TRANSFER";

	// USELESS: This is a constant and should be place in constant's configs.
	IBFT_FUND_TRANSFER = "IBFT_FUND_TRANSFER";

	// USELESS: This is a constant and should be place in constant's configs.
	GIRO_FUND_TRNSFER = "GIRO_FUND_TRNSFER";

	// USELESS: This is a constant and should be place in constant's configs.
	SEC2U_REGISTRATION_REQ = "SEC2U_REGISTRATION_REQ";

	// USELESS: This is a constant and should be place in constant's configs.
	SEC2U_REGISTRATION_VERIFY = "SEC2U_REGISTRATION_VERIFY";

	// USELESS: This is a constant and should be place in constant's configs.
	MOBILE_RELOAD_OTP = "MOBILE_RELOAD_OTP";

	// USELESS: This is a constant and should be place in constant's configs.
	DUITNOW_RECURRING_TRANSFER_OTP = "DUITNOW_RECURRING_TRANSFER_OTP";

	// USELESS: not use anywhere
	MOMENTS_DATA = [];

	// USELESS: set in HomeTabScreen and use in BookmarksDashboard. It should be well removed, and instead
	// use the user.profileImage data from context
	ISPROFILEIMAGE = false;

	// USELESS: Set in HomeDetails, but the value referred from navigation params,
	// which was sent by AddnewCollection and AddToCollection, which actually refer to
	// this actual object. It was never use for anything meaningful so safe to remove.
	HOME_DETAILS_CALLPAGE = "";

	// PARTIAL: Set in FitnessDashboard, and used by DailyPersonalTargetBoard. Can be passed in FitnessDashboard
	// through the FitnessChallenges as a props, which then passed into FitnessCardDPT, which can then submit
	// through the nav params
	DPT_BGI = "";

	// USELESS: Not used
	// PARTNER_CONTENT = {};

	// VALID: Used as reference in PersonalDetail, OnBoardingOtpVerification
	// and value set in HomeTabScreen, OnBoardingOtpVerification and OnBoardingEmail.
	// group under "user". naming convention standardization with camelCase
	Update_Profile = {
		Email: "",
		DOB: "",
		Profile_image: "",
		userID: "001",
		Otp: "123",
		Gender: "",
		// only for in dev
		tempOTP: "",
		mobileNumber: "",
		fullName: "",
		isProfileUpdated: false
	};

	// USELESS: Only set in HomeDetails and never use anywhere.
	navigationType = {
		routeName: "",
		moduleName: "",
		routeClass: ""
	};

	// PARTIAL: Used in OnBoarding*, SettingsOtp, updateProfile, QRNumberValidate, Secure2uSetupFailureScreen,
	// Secure2uSetupSuccessScreen and SettingsChangePin screen. Can be passed with nav params.
	// Set and used in PrimaryEmail, SettingQuickAuth, settings which is some of it is useless and should be in
	// their local state
	QueryType = {
		Type: "",
		isExistingPhoneUser: false,
		module: ""
	};

	// USELESS: Set and used in some OnBoarding* screen, but should use the user.mobileNumber instead. while
	// username wasn't even use anywhere
	SIGN_UP = {
		username: "",
		mobileNo: ""
	};

	// USELESS: Not used anywhere
	RequestSmsOtp = {
		mobileNo: ""
	};

	// USELESS: Should merge with user context. The only thing used most is mayaUserId and profilePic.
	USER_DATA = {
		userID: "",
		username: "",
		userStatus: "",
		mayaUserId: 0,
		hpNo: "",
		email: "",
		gender: "",
		profilePic: "",
		deviceName: ""
	};

	// PARTIAL: Value set in PaymentSuccessScreen, Confirmation, PinValidate, Summary, FundingController,
	// MAEOTPConformation, MAETnC, DuitNowNumberValidation, DuitNowSelectAccount, JompayAck, QRAck, QRNumberValidate,
	// QRPayMainScreen, ReloadAck, ReloadNumberValidate, Secure2uNumberValidate, transferAck, and most navigate
	// to PDFViewScreen, which should use the nav params for the most part.
	PDF_DATA = {
		file: "",
		share: false,
		type: "",
		route: "",
		module: "",
		title: "",
		pdfType: "",
		reset: true,
		status: 0,
		message: "",
		amount: ""
	};

	// PARTIAL: Value set in JournalMessages, BookmarksDashboard, FitnessDashboard, HomeDetails, AddCard, FundingController,
	// M2ULoginIntro, PromotionDetailsScreen, Secure2uDemoScreen, Secure2uTacDemoScreen. and navigate to WebViewInAppScreen
	// so should use nav params
	WEBVIEW_DATA = {
		onNavigationStateChange: null,
		onLoad: null,
		onLoadStart: null,
		onLoadEnd: null,
		showBack: true,
		showClose: false,
		isHTML: false,
		url: "",
		share: false,
		type: "",
		route: "",
		module: "",
		title: "",
		pdfType: "",
		reset: true,
		status: 0,
		message: "",
		amount: "",
		noClose: false,
		onClosePress: "",
		callbackHandled: false
	};

	// USELESS: Only set in FitnessChallenges and not use anywhere else
	FITNESS_CHALLENGES = {
		numOfBranded: 0,
		numOfGroup: 0
	};

	// This key can be scrap
	COMMON_DATA = {
		// VALID: Set in PromotionDetailsScreen, QuickAction, LinkM2UScreen, WalletLoginScreen, WalletViewAccount,
		// WalletViewCard,
		// only used in FundingController. Can't see the relationship between those screens with it, so
		// might be usefull with context.
		// Renamed to customerType. Grouped under funding key.
		cus_type: "",

		// PARTIAL: Set it in OnboardingEmail, OnBoardingPhone, OnBoardingUserDetails, PrimaryEmail,
		// Used in MAEOTPValidation, OnboardingOtpVerification, SettingsOtp.
		// Could possibly leverage the nav params, one example in MAEOTPConformation, the usage of `maeRequestOTP`,
		// could also include the value in the function as params
		otpScreen: "1",

		// USELESS: Set on OnboardingOtpVerification, settings, settingsOtp and updateProfile,
		// used in most challenges, fitness, partners, but this should be merged with the user context.
		// Value also set in splitbillstabscreen using value from   which is ridiculous,
		// and should be standardize and centralize
		username: "",

		// PARTIAL: Set in CoinGoalDurationAmount and createEndDate and used in GoalForecastScreen. Could be
		// passed with nav params
		travelTypeSelected: "travel",

		// USELESS
		walletLoginCount: 0,

		// PARTIAL: Should be passed as nav params
		transferFlow: 1,

		// PARTIAL: Set in SplitBillsCollectionProgressScreen, TransferOtherAccounts, TransferOwnAccount, TransferSelectBank,
		// Should use nav params
		isMaybankTransfer: false,

		// USELESS
		userFullAccounts: {},

		// USELESS: Should be in constant declaration
		app_id: "MYA", //"MYA" "M2U"

		// USELESS: Should be in constant
		serverAuth: "bearer ",

		// VALID: valid, and should refactor to only initiated in the root,
		// and to avoid tapping into deviceInfo, should also be stored in the async storage.
		// Grouped under device key
		hardwareId: "",

		// Grouped under device key
		uuid: "",

		// VALID: Grouped under auth key
		mayaToken: "",

		// VALID: Grouped under auth key
		m2uAccessToken: null,

		// VALID: Grouped under auth key
		m2uAccessRefreshToken: "",

		// VALID: Set in M2ULogin. It is valid if the mobileNo for m2u is different from one used across the app
		// Grouped under user key
		m2uMobileNo: "",

		// VALID: Grouped under user key
		mayaUserId: 0,

		// USELESS: Seems to be set but no referred to by anything
		PAN: "",

		// USELESS: Should be a constant
		maybankBankCode: "MAYBANK",

		// USELESS: Should be in constant
		maybankName: "MAYBANK",

		// USELESS: Shouldn't need this, and Should be in constant if needed
		maybankNameLowerCase: "Maybank",

		// USELESS: Should be in constant
		maybankAccountLength: 12,

		// USELESS: Should be in constant
		otherBankAccountLength: 22,

		// VALID: set in m2uloginScreen. Should rename to camelCase icNumber. Grouped under user key
		customer_ic_number: "",

		// USELESS
		API_TIMEOUT: 60000,

		// USELESS: Should be constant
		isEmulator: false,

		// VALID: grouped under user key
		mobileNo: "",

		// VALID: Renamed to rsaKey, place under auth key
		rsa_key: "",

		// VALID: Renamed to deviceId, place under device key
		device_id: "",

		// VALID: Renamed to deviceName, place under device key
		device_name: "",

		// VALID: Rename to deviceModel, place under device key
		device_model: "",

		// VALID: Rename to osVersion, place under device key
		os_version: "",

		// USELESS: Should be in constant
		emulatorDeviceId: "564343222",

		// PARTIAL/USELESS: Could actually stay away from this, as it wasn't used anywhere except LinkM2UScreen.
		// If needed, should be passed as params.
		addToAccount: false,

		// PARTIAL: sent with nav params
		isLoyaltyCard: false,

		// USELESS: Only value set but no reference
		isBankCard: false,

		// USELESS
		lastIdealTimestamp: 0,

		// PARTIAL: Only referred in WalletDashboard, and can be passed along with nav params
		walletScreenIndex: 0,

		// VALID: The value assignation should be made in root since the value saved in storage.
		// Grouped under wallet.
		walletAccountAdded: "",

		// USELESS: Reference only used in WalletDashboard and also can be skip since value can be check using
		// the wallet.walletAccountAdded
		noWalletAccountAddedError: false,

		// VALID: Refactor needed as the setting of the value into storage is everywhere.
		// Grouped under misc
		qrReady: "",

		// PARTIAL: can be sent with nav params
		contactsSelectLimit: 4,

		// PARTIAL: can be sent with nav params
		contactsMultiSelectAllowed: true,

		// PARTIAL: can be sent with nav params
		walletFlow: 1,

		// PARTIAL: can be sent with nav params
		applicant_type: "",

		// PARTIAL: can be sent with nav params
		m2u_indicator: "",

		// PARTIAL: can be sent with nav params
		cdd_ind: "",

		// USELESS
		boosterFlow: 0,

		// PARTIAL: Use nav params
		showTacOtp: true
	};

	// Deprecated this key
	TRANSFER_DATA = {
		// PARTIAL: Can be pass with nav params
		transferType: null,

		// PARTIAL: Can be pass with nav params
		transferSubType: null,

		// PARTIAL: Can be pass with nav params
		twoFAType: null,

		// PARTIAL: Can be pass with nav params
		mbbbankCode: "",

		// PARTIAL: Can be pass with nav params
		tranferTypeName: "",

		// USELESS
		tranferTypeNo: 1,

		// PARTIAL: Can be pass with nav params
		accountName: "",

		// USELESS
		customerName: "",

		// PARTIAL: Can be pass with nav params
		fromAccount: "",

		// PARTIAL: Can be pass with nav params
		formatedFromAccount: "",

		// PARTIAL: Can be pass with nav params
		fromAccountCode: "",

		// PARTIAL: Can be pass with nav params
		fromAccountName: "",

		// PARTIAL: Can be pass with nav params
		acquirerId: "",

		// PARTIAL: Use nav params
		toAccount: "",

		// PARTIAL: Use nav params
		confirmDateEditFlow: 0,

		// PARTIAL: Use nav params
		confirmDateStartDate: 0,

		// PARTIAL: Use nav params
		confirmDateEndDate: 0,

		// PARTIAL: Use nav params
		confirmDateSelectedCalender: 0,

		// PARTIAL: Use nav params
		effectiveDate: "00000000",

		// PARTIAL: Use nav params
		effectiveDateFormated: "00000000",

		// PARTIAL: Use nav params
		effectiveDateObj: "00000000",

		// PARTIAL: Use nav params
		isFutureTransfer: false,

		// USELESS
		isRecurringTransfer: false,

		// PARTIAL: Use nav params
		isSecure2uFlow: false,

		// PARTIAL: Use nav params
		isSecure2uRegisterFlow: false,

		// PARTIAL: Use nav params
		isSecure2uTransferFlow: false,

		// PARTIAL: Use nav params
		isSecure2uRegisterTacCompleted: false,

		// PARTIAL: Use nav params
		isTacCAllAgain: false,

		// PARTIAL: Use nav params
		toAccountCode: "",

		// PARTIAL: Use nav params
		toAccountName: "",

		// PARTIAL: Use nav params
		toAccountBank: "",

		// PARTIAL: Use nav params
		formatedToAccount: "",

		// PARTIAL: Use nav params
		transferAmount: "",

		// PARTIAL: Use nav params
		formatedTransferAmount: "",

		// PARTIAL: Use nav params
		displayTransferAmount: "",

		// USELESS
		transferDate: "",

		// PARTIAL: Use nav params
		recipientReference: "",

		// PARTIAL: Use nav params
		recipientNotes: "",

		// PARTIAL: Use nav params
		recipientNickName: "",

		// PARTIAL: Use nav params
		recipientName: "",

		// PARTIAL: Use nav params
		recipientFullName: "",

		// USELESS
		mbbaccountType: "",

		// PARTIAL: Use nav params
		transactionType: "",

		// PARTIAL: Use nav params
		transactionMode: "",

		// PARTIAL: Use nav params
		transactionModeFlow: "",

		// PARTIAL: Use nav params
		paymentType: "",

		// PARTIAL: Use nav params
		paymentTypeFavorites: "",

		// USELESS: Only set in TransferTypeModeScreen and use in the same file
		selectedPaymentType: "",

		// USELESS: Only set in TransferOtherAccounts and use in the same file
		ibftFavouriteTransfer: false,

		// USELESS: This value are the same with m2uAccessToken. merged in auth.m2uAccessToken
		m2uToken: "",

		// VALID: Merged in auth.m2uAccessRefreshToken
		m2uAccessRefreshToken: "",

		// VALID: Shouldn't consolidate in this object. Most of the response in relate to encryption stuff.
		// stuff stored in SECURE2U_DATA should be in secure2u
		// should merge most of the key related to s2u under secure2u key.
		transactionResponseObject: {},

		// PARTIAL: Use nav params
		transactionResponseError: "",

		// USELESS: Essentially the same as transactionResponseObject
		secure2uResponseObject: {},

		// USELESS: Only set and use in secure2uAuthentication
		secure2uChallengeResponseObject: {},

		// USELESS
		secure2uResponseError: "",

		// PARTIAL: Use nav params
		transactionStatus: true,

		// VALID: value are set multiple times from multiple places, which is read from the AS.
		// Should centralize to root.
		// Group under user key
		m2uUserName: "",

		// USELESS: Set across the app but wasn't referred to do anything
		m2uUserId: "",

		// PARTIAL: Use nav params
		amountFlow: 1,

		// PARTIAL: Use nav params
		userAccountList: [],

		// PARTIAL: Use nav params
		userToAccountList: [],

		// USELESS: value set but not used anywhere
		maybankAvailable: false,

		// USELESS: value set but not used anywhere
		maybankTitle: "",

		// PARTIAL: Use nav params, from TransferReferenceScreen
		bankName: "",

		// PARTIAL: Use nav params
		bankCode: "",

		// PARTIAL: Use nav params
		aquirerId: "",

		// USELESS: can be assign to a local state in TransferReferenceSceen
		favouritesAccountList: [],

		// USELESS
		tagCode: "",

		// PARTIAL: Use nav params
		addingFavouriteStatus: "",

		// PARTIAL: Use nav params
		addingFavouriteFlow: false,

		// PARTIAL: Use nav params
		validationBit: "",

		// PARTIAL: Use nav params
		nric: "",

		// PARTIAL: Use nav params
		transactionRefNumber: "",

		// USELESS
		isSplitBillsFlow: "",

		// PARTIAL: Use nav params
		payCardsAmountType: 0,

		// PARTIAL: Use nav params
		payCardsAmountTypeStr: "",

		// PARTIAL: Use nav params
		payCardsName: "",

		// PARTIAL: Use nav params
		cardsAcctCode: "",

		// USELESS: Value set but no reference made
		payCardsPaymentDueDate: "",

		// USELESS: Value set and used in PayCardsSelectAmount
		cardsDetailsFromServer: {},

		// USELESS
		transferDateDisplay: {},

		// PARTIAL: Use nav params
		startDate: "",

		// PARTIAL: Use nav params
		endDate: "",

		// USELESS
		startDateIntTemp: "",

		// USELESS
		endDateIntTemp: "",

		// PARTIAL: Use nav params
		startDateInt: "",

		// PARTIAL: Use nav params
		endDateInt: "",

		// PARTIAL: Use nav params
		startDateEndDateStr: "",

		// PARTIAL: Use nav params
		transactionDate: "",

		// VALID: Seems this value set at WalletAccountAdd, and shares between multiple context
		// QR_DATA.account, SPLIT_BILL_DATA.billAccount, QR_DATA.primaryAccount
		// So it safe to centralize it to a key.
		// Group under accounts key
		primaryAccount: "",

		// PARTIAL: Use nav params
		transferTacRequired: false,

		// PARTIAL: Use nav params
		interbankPaymentType: null,

		// PARTIAL: Use nav params
		swiftCode: "",

		// PARTIAL: Use nav params
		quickAction: false,

		// USELESS
		proxyRefNum: null,

		// USELESS
		orderNumber: null
	};

	// Deprecated
	RELOAD_DATA = {
		// PARTIAL: Use nav params
		telcoName: "",

		// PARTIAL: Use nav params
		payeeCode: "",

		// PARTIAL: Use nav params
		contactList: [],

		// PARTIAL: Use nav params
		selectedNumber: "",

		// PARTIAL: Use nav params
		selectedFormatedNumber: "",

		// PARTIAL: Use nav params
		selectedAmount: 0.0,

		// PARTIAL: Use nav params
		amounts: [],

		// PARTIAL: Use nav params
		image: "",

		// PARTIAL: Use nav params
		pinlessCode: "",

		// PARTIAL: Use nav params
		creditCard: false,

		// PARTIAL: Use nav params
		accountType: "S",

		// PARTIAL: Use nav params
		m2uLogin: false,

		// PARTIAL: Use nav params
		quickAction: false
	};

	// DEPRECATE THIS
	DUITNOW_DATA = {
		// PARTIAL: Use nav params
		cusName: "",

		// PARTIAL: Use nav params
		registered: false,

		// PARTIAL: Use nav params
		showBack: false,

		// USELESS: unused
		nric: "",

		// USELESS: unused
		mobile: "",

		// PARTIAL: Use nav params
		duitNowData: [],

		// PARTIAL: Use nav params
		nricAccounts: [],

		// PARTIAL: Use nav params
		mobileAccounts: [],

		// PARTIAL: Use nav params
		dynamicProxyNameAdd1: "",

		// PARTIAL: Use nav params
		dynamicProxyNameAdd2: "",

		// PARTIAL: Use nav params
		dynamicProxyName1: "",

		// PARTIAL: Use nav params
		dynamicProxyName2: "",

		// PARTIAL: Use nav params
		dynamicProxyValueAdd1: "",

		// PARTIAL: Use nav params
		dynamicProxyValueAdd2: "",

		// PARTIAL: Use nav params
		dynamicProxyValue1: "",

		// PARTIAL: Use nav params
		dynamicProxyValue2: "",

		// PARTIAL: Use nav params
		dynamicProxyTypeAdd1: "",

		// PARTIAL: Use nav params
		dynamicProxyTypeAdd2: "",

		// PARTIAL: Use nav params
		dynamicProxyType1: "",

		// PARTIAL: Use nav params
		dynamicProxyType2: "",

		// PARTIAL: Use nav params
		dynamicAccountSelection: 0,

		// PARTIAL: Use nav params or as props
		dynamicAccountDisplay: 0,

		// PARTIAL: Use nav params
		otpCondition: 0,

		// PARTIAL: Use nav params and local var in DuitNowSelectAccount if possible
		selectedNricAccoutName: "",

		// PARTIAL: Use nav params
		selectedMobileAccoutName: "",

		// PARTIAL: Use nav params
		selectedNricAccoutType: "",

		// USELESS: Use only in DuitNowSelectAccount. Should be local variable
		selectedMobileAccoutType: "",

		// PARTIAL: Use nav params
		selectedNricAccoutNo: "",

		// PARTIAL: Use nav params
		selectedMobileAccoutNo: "",

		// PARTIAL: Use nav params
		success: false,

		// PARTIAL: Use nav params
		partiallySuccess: false,

		// PARTIAL: Use nav params
		message: "",

		// USELESS: Only set and used in DuitNowTransfer, should be local state/var
		favouritesAccountList: [],

		// PARTIAL: Use nav params
		transfer: false,

		// PARTIAL: Use nav params
		edit: false,

		// USELESS: Put this in a local state
		dropList: [
			{
				no: 1,
				type: "Mobile Number",
				selected: true,
				code: "MBNO",
				name: "Mobile Number",
				const: "MBNO",
				isSelected: false,
				index: 0
			},
			{
				no: 2,
				type: "NRIC Number",
				selected: false,
				code: "NRIC",
				name: "NRIC Number",
				const: "NRIC",
				isSelected: false,
				index: 1
			},
			{
				no: 3,
				type: "Passport Number",
				selected: false,
				code: "PSPT",
				name: "Passport Number",
				const: "PSPT",
				isSelected: false,
				index: 2
			},
			{
				no: 4,
				type: "Army/Police ID",
				selected: false,
				code: "ARMN",
				name: "Army/Police ID",
				const: "ARMN",
				isSelected: false,
				index: 3
			},
			{
				no: 5,
				type: "Business Registration Number",
				selected: false,
				code: "BREG",
				name: "Business Registration Number",
				const: "BREG",
				isSelected: false,
				index: 4
			}
		],

		// PARTIAL: Use nav params
		idValue: "",

		// USELESS
		idValueText: "",

		// PARTIAL: Use nav params
		idTypeName: "",

		// PARTIAL: Use nav params and local var
		idType: "",

		// USELESS: value set but wasn't referred to anywhere.
		regCount: 0,

		// PARTIAL: Use nav params
		nonRegCount: 0,

		// USELESS
		regCall: false,

		// PARTIAL: Use nav params
		showAdd: false,

		// PARTIAL: Use nav params
		secondaryId: "",

		// PARTIAL: Use nav params
		secondaryIdType: "",

		// PARTIAL: Use nav params
		modifyItem: {},

		// USELESS
		phone: "",

		// USELESS
		ic: "",

		// PARTIAL: Use nav params
		routeModule: "",

		// PARTIAL: Use nav params
		routeFrom: "",

		// PARTIAL: Use nav params
		transferRetrievalRefNo: "",

		// PARTIAL: Use nav params
		transferProxyRefNo: null,

		// PARTIAL: Use nav params
		transferRegRefNo: "",

		// USELESS: Value set but wasn't use
		transferAccType: "",

		// PARTIAL: Use nav params
		transferBankCode: "",

		// USELESS: Value set but wasn't use
		transferBankName: "",

		// PARTIAL: Use nav params
		transferAccHolderName: "",

		// USELESS: Value set but wasn't use
		transferLimitInd: "",

		// PARTIAL: Use nav params
		transferMaybank: false,

		// PARTIAL: Use nav params
		transferOtherBank: false,

		// USELESS
		transferRefText: "",

		// USELESS
		transferAccNumber: "",

		// PARTIAL: Use nav params
		transferAmount: "",

		// USELESS
		transferTacRequired: false,

		// PARTIAL: Use nav params
		transferFav: false,

		// PARTIAL: Use nav params
		flashMessage: "",

		// PARTIAL: Use nav params
		flashSuccess: false,

		// PARTIAL: Use nav params
		countryList: [],

		// PARTIAL: Use nav params
		isRecurringTransfer: false,

		// PARTIAL: Use nav params
		isFeutureransfer: false,

		// PARTIAL: Use nav params
		eAmt: "000",

		// PARTIAL: Use nav params
		isSendMoneyFlow: false,

		// PARTIAL: Use nav params
		isSendMoneyFlowFirst: false,

		// PARTIAL: Use nav params
		recipientNameMasked: false,

		// USELESS
		recipientNameMaskedMessage: ""
	};

	// PARTLY USED: renamed to secure2u
	SECURE2U_DATA = {
		// USELESS: Referred to across multiple places, but a value wasn't set.
		USE_SECURE2U: true,

		// USELESS: Seems a dups of isSecure2uEnable, which read from AS.
		SECURE2U_SERVICE_ENABLE: false,

		// PARTIAL: can use nav params. Its basically everything in the response object.
		regCount: {},

		// USELESS: Consolidate into device.deviceName. Shouldn't be setting it in every single api request
		device_name: "",

		// USELESS: Only set but not used
		device_status: "",

		// Valid: grouped under secure2u, renamed to hardwareId
		hardware_id: "",

		// USELESS: Only set but not used
		mdip_id: "",

		// USELESS: Only set but not used
		registration_attempts: "",

		// USELESS: Only set but not used
		updateGCM: "",

		// USELESS: Only set but not used
		updateMutliOTP: "",

		// USELESS: Only set but not used
		updatePublicKey: "",

		// VALID: merged under secure2u renamed to isEnabled. Do not need to read everywhere, only in root.
		isSecure2uEnable: "",

		// USELESS: Seems to be the same value as serverPublicKey
		serverPublicKeyArray: "",

		// USELESS: Seems to be the same value as serverPublicKey
		serverPublicKeyText: "",

		// VALID: Saved in async storage as it might changed.
		// Check if serverPublicKey exists in storage, if exists, assign its value to context
		// Call the getServerPublicKeyAPI, compare the pub key with local, if different,
		// update storage, update context
		// merged into auth key
		serverPublicKey: "",

		// USELESS: Same as serverPublicKey and can use locally in the class
		publickey: "",

		// VALID: Stored in AS after generate in secure2udevicescreen. So we set it in context after that,
		// for subsequent usage of theapp, it should be retrieved from AS from root and set into context,
		// ONCE.
		// Group under auth
		devicePublicKey: "",

		// VALID: Stored in AS after generate in secure2udevicescreen. So we set it in context after that,
		// for subsequent usage of theapp, it should be retrieved from AS from root and set into context,
		// ONCE.
		// Group under auth
		deviceSecretKey: "",

		// VALID: Set in secure2udevice, used in secure2uAuthScreen
		// grouped under secure2u key renamed to hOtp
		hotp: "",

		// VALID: Set in secure2udevice, used in secure2uAuthScreen
		// grouped under secure2u key renamed to tOtp
		totp: "",

		// VALID: Seems s2u have its own device ID. Valid, if this is not the same with device.deviceId.
		// consolidate with hardwareId
		// Grouped under secure2u key renamed to hardwareId
		secure2uDeviceId: "",

		// VALID: It is not set and used, though it is actually valid. Everyone are using it through AS,
		// which is not the right thing to do. instead, we store it in AS, read from it once, and store into
		// context.
		// Grouped under secure2u key, renamed to mdipCounter
		SEC2U_MDIP_COUNTER: 0,

		// USELESS: Set and forgotten
		SEC2U_GEN_HOTP: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		nonce: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		cipherText: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		encryptedChallenge: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		nonceChallenge: "",

		// USELESS: Set and not even used in s2uAuthenticationScreen
		decryptedChallenge: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		decryptedChallengePlainText: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		decryptedChallengeSecureJson: "",

		// USELESS: Set and not used, only in s2uAuthenticationScreen
		signingUserActionStr: "",

		// PARTIAL: use nav params
		userAction: "0",

		// USELESS: Set and not used, only in s2uAuthenticationScreen
		signingChallengeObj: {},

		// USELESS: Set and used only in s2uAuthenticationScreen
		signingDataCipherText: "",

		// USELESS: Set and used only in s2uAuthenticationScreen
		signingDataNonce: "",

		// USELESS
		secure2uAction: 1, //0=Approve ;1=Reject

		// USELESS
		plainText: "",

		// USELESS
		responseObject: {},

		// USELESS
		responseError: "",

		// USELESS
		m2uUserName: "",

		// USELESS
		m2uUserId: "",

		// USELESS
		amountFlow: 1,

		// USELESS
		secure2uProcessFailed: false,

		// USELESS: Unnecessary and not even used
		mobileSDK: {
			HardwareID: "",
			SIM_ID: "",
			PhoneNumber: "",
			GeoLocationInfo: [
				{
					Timestamp: "",
					Status: ""
				}
			],
			DeviceModel: "",
			MultitaskingSupported: true,
			DeviceName: "",
			DeviceSystemName: "",
			DeviceSystemVersion: "",
			Languages: "",
			WiFiMacAddress: "",
			WiFiNetworksData: {
				BBSID: "",
				SignalStrength: "",
				Channel: "",
				SSID: ""
			},
			CellTowerId: "",
			LocationAreaCode: "",
			ScreenSize: "",
			RSA_ApplicationKey: "",
			MCC: "",
			MNC: "",
			OS_ID: "",
			SDK_VERSION: "",
			Compromised: 0,
			Emulator: 0
		}
	};

	// USELESS
	LINK2U_DATA = {
		// USELESS
		updateLinkData: {},

		// USELESS
		link2umobileNumber: ""
	};

	// USELESS
	WALLET_DATA = {
		// USELESS: only set and not used in WalletAccountScreen
		primary_Account: {}
	};

	QR_DATA = {
		// PARTIAL: If this is necessary, can be sort with nav params.
		primary: false,

		// PARTIAL: Use nav params.
		account: "",
		accountType: "",
		accountName: "",
		accountCode: "",

		// USELESS: set in WalletViewCard
		cardName: "",

		// PARTIAL: Use nav params.
		cusName: "",

		// USELESS: use accounts.primaryAccount
		primaryAccount: "",

		// USELESS: This value are the same with m2uAccessToken. merged in auth.m2uAccessToken
		m2uAccessToken: "",

		// PARTIAL: Use nav params.
		limitApproved: false,

		// USELESS
		otp: "",

		// PARTIAL: Use nav params.
		txtAmount: "",

		// USELESS
		payAccount: "",

		// USELESS
		startScreen: false,

		// PARTIAL: Use nav params.
		navigationModule: "",

		// PARTIAL: Use nav params.
		navigationRoute: "",

		// PARTIAL: Use nav params.
		pullRefNo: "",

		// PARTIAL: Use nav params.
		fromWallet: true,

		// PARTIAL: Use nav params.
		qrAmount: 0,

		// PARTIAL: Use nav params.
		amountEntered: false,

		// PARTIAL: Use nav params.
		authenticate: false,

		// PARTIAL: Use nav params.
		authenticated: false,

		// PARTIAL: Use nav params.
		screenType: "S",

		// PARTIAL: Use nav params.
		accountList: [],

		// PARTIAL: Use nav params.
		cardList: [],

		// PARTIAL: Use nav params.
		updated: false,

		// PARTIAL: Use nav params.
		updatedPayData: {},

		// PARTIAL: Use nav params.
		updatedRecData: {},

		// PARTIAL: Use nav params.
		verifyMerchant: false,

		// PARTIAL: Use nav params.
		confirmation: false
	};

	GOAL_DATA = {
		// PARTIAL: Use nav params.
		startFrom: false,

		// PARTIAL: Use nav params.
		type: "",

		// PARTIAL: Use nav params.
		typeCode: 0,

		// PARTIAL: Use nav params.
		typeValue: "",

		// PARTIAL: Use nav params.
		toRoute: "",

		// PARTIAL: Use nav params.
		fromRoute: "",

		// PARTIAL: Use nav params.
		goalName: "",

		// PARTIAL: Use nav params.
		goalUpdatedName: "",

		// PARTIAL: Use nav params.
		goalAmount: 0,

		// PARTIAL: Use nav params.
		goalStart: "",

		// PARTIAL: Use nav params.
		goalStartObj: "",

		// PARTIAL: Use nav params.
		goalEnd: "",

		// PARTIAL: Use nav params.
		goalEndObj: "",

		// PARTIAL: Use nav params.
		daysDiff: 0,

		// PARTIAL: Use nav params.
		accountSlideList: [],

		// PARTIAL: Use nav params.
		accountList: [],

		// PARTIAL: Use nav params.
		accountName: "",

		// USELESS
		accountType: "",

		// PARTIAL: Use nav params.
		accountNo: "",
		accountCode: "",

		// PARTIAL: Use nav params.
		friendList: [],

		// USELESS
		friendListOld: [],

		// PARTIAL: Use nav params.
		fromAccountNo: "",

		// PARTIAL: Use nav params.
		fromAccountCode: "",

		// PARTIAL: Use nav params.
		fromAccountType: "",

		// PARTIAL: Use nav params.
		frequencyType: "",

		// PARTIAL: Use nav params.
		frequencyAmount: "",

		// PARTIAL: Use nav params.
		frequencylastDeduction: "",

		// PARTIAL: Use nav params.
		frequencyNextDeduction: "",

		// PARTIAL: Use nav params.
		frequencyMessage: "",

		// PARTIAL: Use nav params.
		youAmount: 0,

		// USELESS: Seems to be set in entergoalamonut and firendlist but that was it. no reference made
		otherAmount: 0,

		// PARTIAL: Use nav params.
		goalFlow: 1,

		// PARTIAL: Use nav params.
		editSummary: false,

		// PARTIAL: Use nav params.
		editing: false,

		// USELESS
		friends: 0,

		// PARTIAL: Use nav params.
		editAmount: 0,

		// USELESS: Set and used in FriendList
		editNumber: "",

		// USELESS: Set and used in FriendList
		editName: "",

		// PARTIAL: Use nav params.
		addFriends: false,

		// PARTIAL: Use nav params.
		addContacts: false,

		// PARTIAL: Use nav params.
		noChange: false,

		// PARTIAL: Use nav params.
		success: false,

		// PARTIAL: Use nav params.
		created: "",

		// PARTIAL: Use nav params.
		ref: "",

		// PARTIAL: Use nav params.
		message: "",

		// PARTIAL: Use nav params.
		esiActivation: false,

		// PARTIAL: Use nav params.
		esiDiactivation: false,

		// PARTIAL: Use nav params.
		pinValidate: 0,

		// PARTIAL: Use nav params.
		withdrawing: false,

		// PARTIAL: Use nav params.
		fundingTabung: false,

		// PARTIAL: Use nav params.
		withdrawAmount: 0,

		// USELESS
		sharedGoal: false,

		// USELESS: already exists above
		// editing: false,

		// PARTIAL: Use nav params.
		goalImage: "",

		// PARTIAL: Use nav params.
		frequencyList: [],

		// PARTIAL: Use nav params.
		participantId: "",

		// PARTIAL: Use nav params.
		esiEnabled: false,

		// PARTIAL: Use nav params.
		withdrawFlow: false,

		// PARTIAL: Use nav params.
		fromAccountName: "",

		// PARTIAL: Use nav params.
		fundingPasswordFlow: false,

		// PARTIAL: Use nav params.
		goalId: "",

		// PARTIAL: Use nav params.
		joinGoal: false,

		// PARTIAL: Use nav params.
		isOwner: false,

		// PARTIAL: Use nav params.
		removing: false,

		// USELESS: only use in removegoals summary
		goalDuration: "",

		// PARTIAL: Use nav params.
		fromAccountValue: "",

		// PARTIAL: Use nav params.
		removedWithdrawing: false,

		// PARTIAL: Use nav params.
		goalSelectedData: [],

		// PARTIAL: Use nav params.
		goalCompleted: false,

		// PARTIAL: Use nav params.
		ownAccount: false,

		// PARTIAL: Use nav params.
		ownerImage: "",

		// PARTIAL: Use nav params.
		ownerAccount: "",

		// PARTIAL: Use nav params.
		ownerName: "",

		// PARTIAL: Use nav params.
		individualGoal: false
	};

	// USELESS
	VIEW_ACCOUNT_DATA = {
		// PARTIAL: Use nav params.
		value: "",

		// PARTIAL: Use nav params.
		title: "",

		// PARTIAL: Use nav params.
		description: "",

		// PARTIAL: Use nav params.
		acctCode: "",

		// PARTIAL: Use nav params.
		type: ""
	};

	VIEW_CARD_DATA = {
		// USELESS
		account: "",

		// PARTIAL: Use nav params.
		value: "",

		// PARTIAL: Use nav params.
		title: "",

		// PARTIAL: Use nav params.
		description: "",

		// PARTIAL: Use nav params.
		type: "",

		// PARTIAL: Use nav params.
		expDate: ""
	};

	// USELESS
	CHALLENGE_REMOVE_DATA = {
		// USELESS: only need to use local state
		challengeRemoved: false,

		// USELESS: value set and wasn't used
		challengeType: ""
	};

	// USELESS
	M2U_DATA = {
		otp: ""
	};

	// USELESS
	GoalType = {
		// PARTIAL: Use nav params.
		type: "",

		// PARTIAL: Use nav params.
		editType: ""
	};

	// USELESS
	GoalData = {
		// USELESS: set in creategoallocation and never used
		type: "",

		// PARTIAL: Use nav params.
		Place: "",

		// PARTIAL: Use nav params.
		Amount: "",

		// PARTIAL: Use nav params.
		StartDate: "",

		// PARTIAL: Use nav params.
		EndDate: "",

		// PARTIAL: Use nav params.
		targetAmt: "",

		// USELESS: not assigned or used. if any can always use nav params
		duration: "",

		// PARTIAL: Use nav params.
		frequency: "",

		// PARTIAL: Use nav params.
		goalResult: {}
	};

	// USELESS
	ScanImageData = {
		// PARTIAL: Use nav params.
		screenAction: 1,

		// PARTIAL: Use nav params.
		imageDirection: 1,

		// USELESS
		type: "",

		// USELESS: seems useless, value was set but unused. If needed, use nav params
		data: "",

		// USELESS: value set and used only in files. use local variable
		uri: "",

		// USELESS: seems useless, value was set but unused. If needed, use nav params
		resultImageUri: "",

		// USELESS: seems useless, value was set but unused. If needed, use nav params
		resultBackImageUri: "",

		// USELESS: seems useless, value was set but unused. If needed, use nav params
		frontImageData: {},

		// USELESS: seems useless, value was set but unused. If needed, use nav params
		backImageData: {},

		// PARTIAL: Use nav params.
		resultImageBase64: "",

		// PARTIAL: Use nav params.
		resultImageBase64Back: "",

		// USELESS: Value set in multiple places, but wasn't referred to
		barCodeType: "",

		// PARTIAL: Use nav params.
		barCode: "",

		// USELESS: Value set in multiple places, but most are immediately use within the same files.
		// Use local state. If needed to carry the value, use nav params
		cardName: "",

		// PARTIAL: Use nav params.
		expiryDate: "",

		// PARTIAL: If needed, Use nav params.
		id: "",

		// PARTIAL: If needed, Use nav params.
		notes: "",

		// PARTIAL: If needed, Use nav params.
		userId: "",

		// PARTIAL: If needed, Use nav params.
		cardNumber: "",

		// PARTIAL: If needed, Use nav params.
		cardNo: "",

		// USELESS: Use local state
		validationErrorMsg: "",

		// PARTIAL: If needed, Use nav params.
		selfiresultImageBase64: "",

		// PARTIAL: If needed, Use nav params.
		selfieType: 1
	};

	BoosterData = {
		// PARTIAL: If needed, Use nav params.
		type: "",

		// PARTIAL: If needed, Use nav params.
		name: "",

		// PARTIAL: If needed, Use nav params.
		isSpareChange: false,

		// PARTIAL: If needed, Use nav params.
		getFitSteps: 3000,

		// PARTIAL: If needed, Use nav params.
		fitSliderMaximumValue: 15000,

		// PARTIAL: If needed, Use nav params.
		isFitnessFirstTime: false,

		// USELESS: this referred to mayaUserId. use user.mayaUserId from context
		userId: "",

		// USELESS: value set and referred in its own file. better use a local state
		boostType: "",

		// USELESS: Value set in multiple places, but most are immediately use within the same files.
		// Use local state. If needed to carry the value, use nav params
		goal_id: "",

		// USELESS: Value set in multiple places, but most are immediately use within the same files.
		// Use local state. If needed to carry the value, use nav params
		roundUp: "",

		// USELESS
		boosterData_Array: [],

		// PARTIAL: If needed, Use nav params.
		booster_data: [],

		// PARTIAL: If needed, Use nav params.
		steps: "10,000",

		// PARTIAL: If needed, Use nav params.
		amount: "",

		// USELESS
		limit: "",

		// USELESS: Value set and unused
		boosterID: "",

		// PARTIAL: If needed, Use nav params.
		fitnessType: "",

		// USELESS
		Query: "",

		// PARTIAL: If needed, Use nav params.
		isAmountEdited: false,

		// PARTIAL: If needed, Use nav params.
		isStepsEdited: false,

		// USELESS: Dups
		// isFitnessFirstTime: false,

		// PARTIAL: If needed, Use nav params.
		isguiltyEdited: false,

		// PARTIAL: If needed, Use nav params.
		categoryitem: []
	};

	DPTData = {
		// USELESS: value only read once from dailypersonaltarget. if this is fixed, might as
		// well set it in a constant configuration
		getFitSteps: 3000,

		// USELESS: value only read once from dailypersonaltarget. if this is fixed, might as
		// well set it in a constant configuration
		getTextValueOne: "OKAY!",

		// VALID: right now set in AS in splashscreen and onboardingotpverification. should set only in one
		// place. Only used in dailypersonaltarget.
		// merged under fitness key and rename to sliderInterval
		fitSliderInterval: 1000,

		// VALID: right now set in AS in splashscreen and onboardingotpverification. should set only in one
		// place. Only used in dailypersonaltarget.
		// merged under fitness key and rename to sliderMinimumValue
		fitSliderMinimumValue: 3000,

		// VALID: right now set in AS in splashscreen and onboardingotpverification. should set only in one
		// place. Only used in dailypersonaltarget.
		// merged under fitness key and rename to sliderMaximumValue
		fitSliderMaximumValue: 40000,

		// USELESS: Set and forget
		lastSyncData: null
	};

	FitnessChallengeParticipantsConfig = {
		// VALID: right now set in AS in splashscreen and onboardingotpverification. should set only in one
		// place. Only used in dailypersonaltarget.
		// merged under fitness key
		maxParticipants: 5,

		// VALID: right now set in AS in splashscreen and onboardingotpverification. should set only in one
		// place. Only used in dailypersonaltarget.
		// merged under fitness key
		minParticipants: 1
	};

	// USELESS
	GuiltyPleasurecategoryData = {
		// PARTIAL: If needed, Use nav params.
		categoryName: "",

		// PARTIAL: If needed, Use nav params.
		categoryAmount: "",

		// PARTIAL: If needed, Use nav params.
		categoryLimit: "",

		// PARTIAL: If needed, Use nav params. and please, look out for ya spelling and naming conventions
		categorysatartArray: [],

		// USELESS: not used anywhere
		listArray: [],

		// PARTIAL: If needed, Use nav params.
		id: 0
	};

	// USELESS
	RequestUserInfo = {
		mobileNo: ""
	};

	// USELESS
	settings = {
		// PARTIAL: If needed, Use nav params.
		isLoginM2uRoute: "",

		// PARTIAL: If needed, Use nav params.
		moduleName: "",

		// PARTIAL: If needed, Use nav params.
		routeName: ""
	};

	// USELESS
	SPLIT_BILL_DATA = {
		// PARTIAL: If needed, Use nav params.
		splitBillTab: 0,

		// USELESS: value was not set, only referred. should be in constant
		splitBillDisplayImageCount: 4,

		// PARTIAL: If needed, Use nav params.
		billId: "",

		// PARTIAL: If needed, Use nav params.
		splitBillFlow: 1,

		// PARTIAL: If needed, Use nav params.
		splitBillViewFlow: 1,

		// PARTIAL: If needed, Use nav params.
		billType: "",

		// USELESS: should be in constant
		billTypeEQUALLY: "EQUALLY",

		// USELESS: should be in constant
		billTypeUNEQUALLY: "UNEQUALLY",

		// PARTIAL: If needed, Use nav params.
		splitBillFlowTitle: "",

		// PARTIAL: If needed, Use nav params.
		billName: "",

		// PARTIAL: If needed, Use nav params.
		billDetails: "",

		// PARTIAL: If needed, Use nav params.
		selectedContact: [],

		// USELESS: Seems like value set and used in the file right way. in splitbillsequallyscreen value
		// was set but not used
		finalBillContact: [],

		// PARTIAL: If needed, Use nav params.
		selectedNonMayaContact: [],

		// USELESS: set but unused
		selectedMayaContact: [],

		// USELESS: set but unused
		totalBillUser: 0,

		// USELESS: set but unused
		billAmount: "",

		// USELESS: set but unused
		balanceAmount: "",

		// PARTIAL: If needed, Use nav params.
		formatedAmount: "",

		// PARTIAL: Value set and used in same file. If needed use nav params
		totalAmount: 0.0,

		// USELESS: set but unused
		totalAmountDisplay: 0.0,

		// USELESS: should be in constant
		decimals: 2,

		// PARTIAL: If needed, Use nav params.
		formatedAmountUpdated: "",

		// USELESS
		splitAmount: "",

		// USELESS: set but unused
		userSplitAmount: "",

		// USELESS
		selectedBuddies: [],

		// USELESS
		payer: "",

		// USELESS
		notes: "",

		// PARTIAL: If needed, Use nav params.
		billAccount: "",

		// USELESS: its basically the same as receiptImageCurrent
		receiptImage: "",

		// USELESS: Use local state
		collectionMenuTitle: "",

		// USELESS: when it is used, it is also set within the same file. Use local state, if needed
		collectionSelectedUser: {},

		// PARTIAL: If needed, Use nav params.
		collectionSelectedUserIndex: {},

		// USELESS
		billParticipants: [
			{
				amount: 0,
				userId: 0
			}
		],

		// USELESS: use local state
		billDataListFromServer: {},

		// USELESS: use local state
		billInvitedDataListFromServer: {},

		// PARTIAL: If needed, Use nav params.
		billDataSelectedFromServer: {},

		// PARTIAL: If needed, Use nav params.
		currentBillUser: {},

		// USELESS: Set and forget
		billSelectedPaidFromServer: false,

		// USELESS: use local state
		favGroupsFromServer: {},

		// PARTIAL: If needed, Use nav params.
		favGroupsProcessed: [],

		// PARTIAL: If needed, Use nav params.
		favGroupsSelected: {},

		// PARTIAL: If needed, Use nav params.
		favGroupsSelectedID: 0,

		// PARTIAL: If needed, Use nav params.
		groupName: "",

		// PARTIAL: If needed, Use nav params.
		favGroupsID: 0,

		// PARTIAL: If needed, Use nav params.
		favGroupsSelectFlow: false,

		// USELESS: use local state
		ownedBillCount: 0,

		// USELESS: use local state
		invitedBillCount: 0,

		// USELESS: use local state
		selectedContactIndex: 0,

		// USELESS
		selectedContactItem: {},

		// PARTIAL: If needed, Use nav params.
		billNameEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		amountEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		usersEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		payerEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		notesEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		receiptEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		unEqualAmountFlow: false,

		// PARTIAL: If needed, Use nav params.
		oweAmount: 0,

		// USELESS
		oweToText: 0,

		// PARTIAL: If needed, Use nav params.
		status: 0,

		// USELESS
		currentBillPaid: false,

		// USELESS
		ownerName: "",

		// PARTIAL: If needed, Use nav params.
		ownerAccount: "",

		// USELESS: use local state
		invitedBillAction: 1,

		// PARTIAL: If needed, Use nav params.
		acceptState: false,

		// USELESS: set and unused
		transferNowState: false,

		// USELESS
		splitBillsTabIndex: 0,

		// USELESS
		notificationData: {},

		// PARTIAL: If needed, Use nav params.
		receiptImageCurrent: [],

		// USELESS: use local state
		groupImage: "",

		// USELESS: use local state
		groupImageEditFlow: false,

		// PARTIAL: If needed, Use nav params.
		billNameUpdateFlow: false,

		// USELESS: use local state
		billNameUpdatedDone: false,

		// USELESS: use local state
		billBackGroundFlow: false,

		// USELESS: use local state
		billBackGround: "",

		// USELESS: use local state
		billTitle: "",

		// PARTIAL: If needed, Use nav params.
		prevAmt: 0.0,

		// PARTIAL: If needed, Use nav params.
		acceptedClick: false
	};

	// USELESS
	COLLECTION_MOVEMENT = {
		// PARTIAL: if necessary use the nav params
		moveTriggered: false,

		// PARTIAL: if necessary use the nav params
		collectionMoved: false,

		// PARTIAL: if necessary use the nav params
		collectionName: "",

		// PARTIAL: if necessary use the nav params
		collectionId: 0
	};

	// USELESS
	BOOKMARK_MOVEMENT = {
		// PARTIAL: if necessary use the nav params
		bookmarkRemoved: false,

		// PARTIAL: if necessary use the nav params
		bookmarkMoved: false,

		// PARTIAL: if necessary use the nav params
		collectionName: ""
	};

	// USELESS
	COLLECTION_RENAME = {
		// PARTIAL: if necessary use the nav params
		collectionRenamed: false,

		// PARTIAL: if necessary use the nav params
		collectionName: ""
	};

	// USELESS
	PARTNER_APPLICATION = {
		// PARTIAL: if necessary use the nav params
		partnerId: null,

		// PARTIAL: if necessary use the nav params
		isPartnerApplication: false,

		// PARTIAL: if necessary use the nav params
		partnerLogo: "",

		// PARTIAL: if necessary use the nav params
		bckImg: "",

		// USELESS
		firstTime: true,

		// PARTIAL: if necessary use the nav params
		purchaseId: null,

		// PARTIAL: if necessary use the nav params
		partnerName: "",

		// PARTIAL: if necessary use the nav params
		addOnDetails: [],

		// PARTIAL: if necessary use the nav params
		isFresh: true,

		// PARTIAL: if necessary use the nav params
		toEdit: false,

		// USELESS
		loadFresh: true,

		// PARTIAL: if necessary use the nav params
		planName: "",

		// PARTIAL: if necessary use the nav params
		selectedAddOnList: [],

		// PARTIAL: if necessary use the nav params
		selectedClubId: null,

		// PARTIAL: if necessary use the nav params
		selectedPlanId: null,

		// PARTIAL: if necessary use the nav params
		totalPrice: 0,

		// PARTIAL: if necessary use the nav params
		txnRef: null,

		// PARTIAL: if necessary use the nav params
		membershipPrice: 0,

		// PARTIAL: if necessary use the nav params
		personalDetails: {
			dob: null,
			town: null,
			address: null,
			state: null,
			fullName: null,
			icNumber: null,
			hpNumber: null,
			email: null,
			postcode: null,
			gender: null
		}
	};

	// USELESS
	SEND_MONEY_DATA = {
		// PARTIAL: if necessary use the nav params
		sendMoneyFlow: 1,

		// PARTIAL: if necessary use the nav params
		pendingData: [],

		// USELESS
		pendingSelectedData: {},

		// USELESS
		callDetails: true,

		// USELESS
		sentData: [],

		// USELESS
		receivedData: [],

		// USELESS: value set but wasn't used
		detailsSelectedItem: {},

		// PARTIAL: if necessary use the nav params
		isSenderSelectedItem: false,

		// PARTIAL: if necessary use the nav params
		msgIdSelectedItem: 0,

		// PARTIAL: if necessary use the nav params
		userImage: "",

		// PARTIAL: if necessary use the nav params
		detailsTitle: "",

		// PARTIAL: if necessary use the nav params
		detailsImage: "",

		// PARTIAL: if necessary use the nav params
		detailsMobileNumber: "",

		// PARTIAL: if necessary use the nav params
		detailsUserName: "",

		// PARTIAL: if necessary use the nav params
		detailsAmount: "",

		// PARTIAL: if necessary use the nav params
		detailsAmountOnly: "",

		// PARTIAL: if necessary use the nav params
		detailsStatus: "",

		// PARTIAL: if necessary use the nav params
		detailsNotes: "",

		// PARTIAL: if necessary use the nav params
		detailsReferenceID: "",

		// PARTIAL: if necessary use the nav params
		detailsDate: "",

		// USELESS
		detailsFlow: 1,

		// PARTIAL: if necessary use the nav params
		statusDescriptionText: "",

		// PARTIAL: if necessary use the nav params
		acctDetailsObj: {},

		// PARTIAL: if necessary use the nav params
		formatedAccountNumber: "",

		// PARTIAL: if necessary use the nav params
		showShareMenuAcknowledge: false,

		// PARTIAL: if necessary use the nav params
		showDateDetails: false,

		// USELESS
		callPaid: false,

		// PARTIAL: if necessary use the nav params
		acknowledgeReject: false,

		// PARTIAL: if necessary use the nav params
		isFromQuickAction: false,

		// PARTIAL: if necessary use the nav params
		isSendMoneyAsOpen: false,

		// PARTIAL: if necessary use the nav params
		requestResponseError: "",

		// PARTIAL: if necessary use the nav params
		transactionStatus: true,

		// PARTIAL: if necessary use the nav params
		isPasswordFlow: false,

		// USELESS: use local state
		pendingDataCalled: false,

		// USELESS
		goalDetailsCalled: false
	};

	MAE_CUSTOMER_DETAILS = {
		fullName: "",
		mobileNumber: "",
		tempMobileNumber: "",
		selectedIDType: "",
		selectedIDCode: "",
		custDOB: "",
		maeCustEmail: "",
		maeCustInviteCode: "",
		mykadNumber: "",
		mykadEmail: "",
		mykadInviteCode: "",
		passportNumber: "",
		passportDOB: "",
		passportCountry: "",
		passportCountryCode: "",
		passportEmail: "",
		passportInviteCode: "",
		openCamText: "",
		selfieImgData: "",
		idFrontImgData: "",
		idBackImgData: "",
		enteredInviteCode: "",
		userIDNumber: "",
		token: "",
		fatcaCountryList: [],
		pdpa: "",
		uscitizenSelected: "",
		state: "",
		fatcaStateValue: "",
		fatcaUSTaxID: "",
		fatcaTin: "",
		crsCitizenSelected: "",
		crsState: "",
		crsStateValue: "",
		crsTin: "",
		accessNo: "",
		acctNo: "",
		debitCardNo: "",
		expiryDate: "",
		inviteCode: "",
		refNo: "",
		username: "",
		password: "",
		confirmPassword: "",
		securityImgData: "",
		securityPhrase: "",
		m2uLoginUsername: "",
		m2uLoginPassword: "",
		m2uSecPhrase: "",
		m2uSecImgData: "",
		isNTB: "",
		custStatus: "",
		m2uIndicator: "",
		m2uAccessInd: "",
		preOrPostFlag: "",
		etbHasMAE: "",
		hasM2UAccess: "",
		isM2ULinked: "",
		isM2ULoggedIn: "",
		isFDLoan: "",
		isORFlow: "",
		addr1: "",
		addr2: "",
		addr3: "",
		addr4: "",
		postCode: "",
		customerName: "",
		gcif: "",
		isORWebOpen: "",
		onlineRegUrl: "",
		accountType: "",
		pepDeclaration: "",
	};

	// NOT USELESS
	FPX_AR_MSG_DATA = {
		fpx_msgType: "",
		fpx_msgToken: "",
		fpx_sellerExId: "",
		fpx_version: "",
		fpx_sellerId: "",
		fpx_sellerBankCode: "",
		fpx_txnCurrency: "",
		fpx_txnAmount: "",
		fpx_buyerBankId: "",
		fpx_buyerId: "",
		fpx_productDesc: "",
		fpx_sellerExOrderNo: "",
		fpx_sellerTxnTime: "",
		fpx_sellerOrderNo: "",
		fpx_checkSum: ""
	};

	// NOT USELESS
	BPG_3D_TXN_DATA = {
		MERCHANT_ACC_NO: "",
		TXN_PASSWORD: "",
		TRANSACTION_TYPE: "",
		MERCHANT_TRANID: "",
		CARD_NO: "",
		CARD_EXP_MM: "",
		CARD_EXP_YY: "",
		CARD_CVC: "",
		CARD_ISSUER_BANK_COUNTRY_CODE: "",
		CARD_HOLDER_NAME: "",
		CARD_TYPE: "",
		RESPONSE_TYPE: "",
		ACTION_URL: "",
		RETURN_URL: "",
		TXN_DESC: "",
		CUSTOMER_ID: "",
		PYMT_IND: "",
		PYMT_CRITERIA: "",
		TXN_SIGNATURE: "",
		AMOUNT: ""
	};

	// USELESS
	MAE_FUNDING_DETAILS = {
		// from: "", // WALLET | ONBOARD
		// PARTIALS: Use nav params
		fundingType: "", // CASA | FPX | FPXCARD

		// PARTIALS: Use nav params and func args
		fundingSource: "", // CARD | FPX | CASA | ADDCARD

		// USELESS: Set and used in fundingController. stay with func args or local var
		topUpAmount: "",

		// USELESS: value added in addcard with func from fundinController in onAddCardInputChange.
		// Value used in FundingController. Can rely on local state of addCard, and passed as
		// params to fundingController
		cardNumber: "",

		// USELESS: value added in addcard with func from fundinController in onAddCardInputChange.
		// Value used in FundingController. Can rely on local state of addCard, and passed as
		// params to fundingController
		expiryDate: "",

		// USELESS: Use and set in fundingController, stay with func args
		expiryMM: "",

		// USELESS: Use and set in fundingController, stay with func args
		expiryYY: "",

		// USELESS: value added in addcard with func from fundinController in onAddCardInputChange.
		// Value used in FundingController. Can rely on local state of addCard, and passed as
		// params to fundingController
		cvv: "",

		// PARTIALS: use nav params
		service_type: "",

		// PARTIALS: use nav params
		statusPgState: "", // success | failure

		// PARTIALS: use nav params
		statusDetailsArray: [],

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		cardList: [],

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		bankList: [],

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		selectedBank: {},

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		selectedCard: {},

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		selectedAccount: {},

		// USELESS
		applicantType: "",

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		m2uInd: "",

		// USELESS: use local variable
		idType: "",

		// USELESS: use local variable
		sessionExtnInterval: null,

		// USELESS: use and set in FundingController. Use func args. if needed, use nav params
		fpxBuyerEmail: ""
	};

	// USELESS
	MAE_CDD_DETAILS = {
		isPassport: false
	};

	// USELESS
	PAY_BILL = {
		// PARTIALS: use nav params
		requiredFields: [],

		// PARTIALS: use nav params
		isFav: false,

		// PARTIALS: use nav params
		transferTacRequired: "1",

		// PARTIALS: use nav params
		onlinePayment: "1",

		// PARTIALS: use nav params
		payeeCode: "",

		// USELESS
		selectedAmount: "0",

		// USELESS
		billAcctNo: "",

		// USELESS
		billRefNo: "",

		// PARTIALS: use nav params
		typeOfPayment: ""
	};

	// USELESS
	TABUNG_GOALS_DATA = {
		// PARTIALS: use nav params
		tabIndex: 0,

		// USELESS
		sendMoneyFlow: 1,

		// PARTIALS: Seems that the data set in TabungScreen and PendingInvitationScreen and used in it. Outside
		// of this screens, wasn't used and only been set to empty array in HomeTabScreen. Should use local
		// state if there're no need to share across screen. If do need, use nav params
		pendingData: [],

		// PARTIALS: Seems that the data set in TabungScreen and used in it. Outside
		// of this screens, wasn't used and only been set to empty array in HomeTabScreen and others.
		// Should use local state if there're no need to share across screen. If we do need it, use nav params
		goalDataList: [],

		// PARTIALS: use nav params
		goalSelectedData: {},

		// PARTIALS: use nav params
		currentStatus: "",

		// PARTIALS: use nav params
		detailsObj: [],

		// PARTIALS: use nav params
		goalSelectedID: 0,

		// PARTIALS: use nav params
		isOwner: false,

		// USELESS
		sentData: [],

		// USELESS
		receivedData: [],

		// USELESS
		detailsSelectedItem: {},

		// USELESS
		isSenderSelectedItem: false,

		// USELESS
		msgIdSelectedItem: 0,

		// USELESS
		userImage: "",

		// USELESS
		detailsTitle: "",

		// USELESS
		detailsImage: "",

		// USELESS
		detailsMobileNumber: "",

		// USELESS
		detailsUserName: "",

		// USELESS
		detailsAmount: "",

		// USELESS
		detailsAmountOnly: "",

		// USELESS
		detailsStatus: "",

		// USELESS
		detailsNotes: "",

		// USELESS
		detailsReferenceID: "",

		// USELESS
		detailsDate: "",

		// USELESS
		detailsFlow: 1,

		// USELESS
		statusDescriptionText: "",

		// USELESS: value set but wasn't used
		acctDetailsObj: {},

		// USELESS
		formatedAccountNumber: "",

		// USELESS
		showShareMenuAcknowledge: false,

		// USELESS
		showDateDetails: false,

		// USELESS
		callPaid: false,

		// USELESS
		acknowledgeReject: false,

		// USELESS
		isFromQuickAction: false,

		// USELESS
		isSendMoneyAsOpen: false,

		// USELESS
		requestResponseError: "",

		// USELESS
		transactionStatus: true,

		// USELESS
		isPasswordFlow: false,

		// USELESS
		pendingDataCalled: false,

		// PARTIALS: if needed, use nav params
		participantId: 0,

		// PARTIALS: use nav params
		invitedParticipants: [],

		// USELESS: use local variables
		removedData: [],

		boosterList: [],

		selectedBooster: "",

		spareChangeAmount: 0.0,

		selectedBoosterID: "",

		spareChangeAmountMsg: "",

		showTabungSnackbar: false,

		tabungSnackMsg: "",

		transactionLimitAmount: 0.0,

		boosterAmountScreen: 0.0,

		selectedFirstCategoryName: "",

		selectedFirstCategoryImage: "",

		selectedFirstCategoryObj: "",

		addCategoryName: "",

		addCategoryImage: "",

		addCategoryObj: "",

		addBoosterAmountScreen: 0.0,

		addTransactionLimitAmount: 0.0,

		selectedCategoryList: [],

		boosterActiveFlow: false,

		categoriesList: [],

		activeFlow: false,

		activeFlowAddMore: false,

		editAmountFlow: false,

		editCategoryIndex: 0,

		getFitAmount: 0.0,

		getFitSteps: 0
	};

	// USELESS
	JOMPAY = {
		// USELESS
		isFav: false,

		// USELESS
		billRef1: "",

		// USELESS
		billRef2: "",

		// USELESS
		billerCode: ""
	};

	// USELESS
	WETIX_DATA = {
		// PARTIALS: if needed, use nav params
		deepLinkUrlDomin: "maybank2umae",

		// PARTIALS: if needed, use nav params
		deepLinkUrl: "maybank2umae://lifestyle/?txnOrderNo",

		// PARTIALS: if needed, use nav params
		ticketID: "",

		// PARTIALS: if needed, use nav params
		ticketIDNumber: "",

		// PARTIALS: if needed, use nav params
		ticketDetials: "",

		// PARTIALS: if needed, use nav params
		referenceID: "",

		// PARTIALS: if needed, use nav params
		referenceDetails: "",

		// PARTIALS: if needed, use nav params
		failurMessage: "",

		// PARTIALS: if needed, use nav params
		created: "",

		// PARTIALS: if needed, use nav params
		wetixSuccess: "",

		// PARTIALS: if needed, use nav params
		ticketFlow: null,

		// PARTIALS: if needed, use nav params
		transactionRefNumber: ""
	};

	// USELESS
	KLIA_DATA = {
		// PARTIALS: if needed, use nav params
		adultMaxCount: 10,

		// PARTIALS: if needed, use nav params
		childMaxCount: 9,
		// PARTIALS: if needed, use nav params

		// PARTIALS: if needed, use nav params
		maxTotalTicket: 10,

		initKliaData: "",

		// PARTIALS: if needed, use nav params
		stationsList: [],

		// PARTIALS: if needed, use nav params
		failureMessage: "",

		// PARTIALS: if needed, use nav params
		stationsKlSenter: [],

		// PARTIALS: if needed, use nav params
		stationsListKlia: [],

		// PARTIALS: if needed, use nav params
		ticketCodes: "",

		// PARTIALS: if needed, use nav params
		ticketsFaresStation: [],

		// PARTIALS: if needed, use nav params
		klaiAdultReturn: "",

		// PARTIALS: if needed, use nav params
		klaiAdultReturnDetail: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultReturnKliaPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultReturnNetPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultReturnSellingPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultSingle: "",

		// PARTIALS: if needed, use nav params
		klaiAdultSingleDetail: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultSingleKliaPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultSingleNetPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiAdultSingleSellingPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildReturn: "",

		// PARTIALS: if needed, use nav params
		klaiChildReturnDetail: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildReturnKliaPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildReturnNetPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildReturnSellingPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildSingle: "",

		// PARTIALS: if needed, use nav params
		klaiChildSingleDetail: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildSingleKliaPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildSingleNetPrice: 0.0,

		// PARTIALS: if needed, use nav params
		klaiChildSingleSellingPrice: 0.0,

		// PARTIALS: if needed, use nav params
		selectedFromStation: "",

		// PARTIALS: if needed, use nav params
		selectedFromStationCode: "",

		// PARTIALS: if needed, use nav params
		selectedFromStationName: "",

		// PARTIALS: if needed, use nav params
		selectedToStation: "",

		// PARTIALS: if needed, use nav params
		selectedToStationCode: "",

		// PARTIALS: if needed, use nav params
		selectedToStationName: "",

		// PARTIALS: if needed, use nav params
		selectedDate: "",

		// PARTIALS: if needed, use nav params
		selectedDateFormated: "",

		// PARTIALS: if needed, use nav params
		selectedAdultCount: "",

		// PARTIALS: if needed, use nav params
		selectedChildCount: "",

		// PARTIALS: if needed, use nav params
		selectedTrip: true,

		// PARTIALS: if needed, use nav params
		selectedChildTicketCode: "",

		// PARTIALS: if needed, use nav params
		selectedAdultTicketCode: "",

		// PARTIALS: if needed, use nav params
		pnr: "",

		// PARTIALS: if needed, use nav params
		calTicketKLIARequestData: "",

		// PARTIALS: if needed, use nav params
		calTicketKLIAData: "",

		// PARTIALS: if needed, use nav params
		selectedNetAmount: "",

		// PARTIALS: if needed, use nav params
		selectedOfferAmount: "",

		// PARTIALS: if needed, use nav params
		serverDate: "",

		// PARTIALS: if needed, use nav params
		stationKlSentralCode: "XKL",

		// PARTIALS: if needed, use nav params
		kliaActiveList: [],

		// PARTIALS: if needed, use nav params
		kliaPastList: [],

		// PARTIALS: if needed, use nav params
		selectedBooking: "",

		// PARTIALS: if needed, use nav params
		ticketDetails: [],

		// PARTIALS: if needed, use nav params
		fromKlSentral: false,

		// PARTIALS: if needed, use nav params
		ticketFlow: null,

		// PARTIALS: if needed, use nav params
		ticketQRImage: [],

		// PARTIALS: if needed, use nav params
		ticketQRData: [],

		// PARTIALS: if needed, use nav params
		ticketSelected: []
	};

	PFM_DATA = { startFrom: false };
}
