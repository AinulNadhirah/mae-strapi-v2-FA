import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ASNBConsentAcknowledgementScreen from "@screens/Banking/ASNBConsent/ASNBConsentAcknowledgementScreen";
import ASNBConsentScreen from "@screens/Banking/ASNBConsent/ASNBConsentScreen";
import AccountDetailsScreen from "@screens/Banking/AccountDetailsScreen";
import BTConfirmation from "@screens/Banking/BalanceTransfer/BTConfirmation";
import BTLanding from "@screens/Banking/BalanceTransfer/BTLanding";
import BTSelectPlan from "@screens/Banking/BalanceTransfer/BTSelectPlan";
import BTStatus from "@screens/Banking/BalanceTransfer/BTStatus";
import BankingL2Screen from "@screens/Banking/BankingL2Screen";
import CCAAcknowledgementScreen from "@screens/Banking/CreditCardActivation/AcknowledgementScreen";
import CCAEnterCardExpiryYearScreen from "@screens/Banking/CreditCardActivation/EnterCardExpiryYearScreen";
import CCSetPinAcknowledgementScreen from "@screens/Banking/CreditCardSetPin/AcknowledgementScreen";
import CCConfirmPinScreen from "@screens/Banking/CreditCardSetPin/ConfirmPinScreen";
import CCSetPinScreen from "@screens/Banking/CreditCardSetPin/SetPinScreen";
import EZYPayConfirmation from "@screens/Banking/EZYPay/EZYPayConfirmation";
import EZYPayLanding from "@screens/Banking/EZYPay/EZYPayLanding";
import EZYPaySelectPlan from "@screens/Banking/EZYPay/EZYPaySelectPlan";
import EZYPaySelectTransaction from "@screens/Banking/EZYPay/EZYPaySelectTransaction";
import EZYPayStatus from "@screens/Banking/EZYPay/EZYPayStatus";
import TransactionHistoryScreen from "@screens/Banking/TransactionHistoryScreen";
import TransactionStatus from "@screens/Banking/TransactionStatus";
import WealthCardAccountListScreen from "@screens/Banking/WealthCardAccountListScreen";
import WealthPortfolio from "@screens/Banking/WealthPortfolio";
import ZeroAssetliabilitiesScreen from "@screens/Banking/WealthPortfolio/ZeroAssetliabilitiesScreen";
import WealthProductDetailsScreen from "@screens/Banking/WealthProductDetailsScreen";
import WealthViewTransaction from "@screens/Banking/WealthViewTransaction";
import CustomPortfolio from "@screens/FinancialGoals/CustomPortfolio";
import FinancialEducationChildInfo from "@screens/FinancialGoals/EducationGoal/EducationChildInfo";
import FinancialEducationCommitUpfront from "@screens/FinancialGoals/EducationGoal/EducationCommitUpfront";
import FinancialEducationFor from "@screens/FinancialGoals/EducationGoal/EducationFor";
import FinancialEducationFundYear from "@screens/FinancialGoals/EducationGoal/EducationFundYear";
import FinancialEducationLevel from "@screens/FinancialGoals/EducationGoal/EducationLevel";
import FinancialTermsAndConditions from "@screens/FinancialGoals/FinancialTermsAndConditions";
import FundAllocation from "@screens/FinancialGoals/FundAllocation";
import GoalOverview from "@screens/FinancialGoals/GoalOverview";
import TransactionDetails from "@screens/FinancialGoals/GoalOverview/TransactionDetails";
import TransactionHistory from "@screens/FinancialGoals/GoalOverview/TransactionHistory";
import FinancialGoalSelection from "@screens/FinancialGoals/GoalSelection";
import GoalSimulation from "@screens/FinancialGoals/GoalSimulation";
import RiskLevelEdit from "@screens/FinancialGoals/GoalSimulation/RiskLevelEdit";
import GrowWealthAccumulateAmount from "@screens/FinancialGoals/GrowWealth/GrowWealthAccumulateAmount";
import GrowWealthUpfrontAmount from "@screens/FinancialGoals/GrowWealth/GrowWealthUpfrontAmount";
import GrowWealthWithdrawAge from "@screens/FinancialGoals/GrowWealth/GrowWealthWithdrawAge";
import CurrentEPFMonthlyContribute from "@screens/FinancialGoals/IncludeEPF/CurrentEPFMonthlyContribute";
import CurrentEPFSaving from "@screens/FinancialGoals/IncludeEPF/CurrentEPFSaving";
import EPFCustomisePlan from "@screens/FinancialGoals/IncludeEPF/EPFCustomisePlan";
import EPFSavingsEntry from "@screens/FinancialGoals/IncludeEPF/EPFSavingsEntry";
import ExistingInvestmentSavingsEntry from "@screens/FinancialGoals/IncludeOtherSources/ExistingInvestmentSavingsEntry";
import InvestmentSavingsContribution from "@screens/FinancialGoals/IncludeOtherSources/InvestmentSavingsContribution";
import OtherSourcesCustomizePlan from "@screens/FinancialGoals/IncludeOtherSources/OtherSourcesCustomizePlan";
import KickStartAcknowledgement from "@screens/FinancialGoals/KickStart/KickStartAcknowledgement";
import KickStartConfirmation from "@screens/FinancialGoals/KickStart/KickStartConfirmation";
import KickStartDeposit from "@screens/FinancialGoals/KickStart/KickStartDeposit";
import KickStartEmail from "@screens/FinancialGoals/KickStart/KickStartEmail";
import KickStartMonthlyInvestment from "@screens/FinancialGoals/KickStart/KickStartMonthlyInvestment";
import KickStartPromo from "@screens/FinancialGoals/KickStart/KickStartPromo";
import KickStartSelection from "@screens/FinancialGoals/KickStart/KickStartSelection";
import LeaveContact from "@screens/FinancialGoals/LeaveContact";
import LeaveContactComplete from "@screens/FinancialGoals/LeaveContact/LeaveContactComplete";
import MADConfirmation from "@screens/FinancialGoals/MAD/MADConfirmation";
import MADInput from "@screens/FinancialGoals/MAD/MADInput";
import RemoveGoal from "@screens/FinancialGoals/RemoveGoal";
import RemoveGoalAcknowledgement from "@screens/FinancialGoals/RemoveGoal/RemoveGoalAcknowledgement";
import RemoveGoalConfirmation from "@screens/FinancialGoals/RemoveGoal/RemoveGoalConfirmation";
import RetirementAge from "@screens/FinancialGoals/RetirementGoalCreation/RetirementAge";
import RetirementExpenses from "@screens/FinancialGoals/RetirementGoalCreation/RetirementExpenses";
import RetirementUpfront from "@screens/FinancialGoals/RetirementGoalCreation/RetirementUpfront";
import RetirementYearRange from "@screens/FinancialGoals/RetirementGoalCreation/RetirementYearRange";
import RiskProfileQuestion from "@screens/FinancialGoals/RiskProfile/RiskProfileQuestion";
import RiskProfileResult from "@screens/FinancialGoals/RiskProfile/RiskProfileResult";
import RiskProfileTestEntry from "@screens/FinancialGoals/RiskProfile/RiskProfileTestEntry";
import StepUpDepositSchedule from "@screens/FinancialGoals/StepUpInvestment/StepupDepositSchedule";
import StepupIncreaseMonthlyPayment from "@screens/FinancialGoals/StepUpInvestment/StepupIncreaseMonthlyPayment";
import StepupIncrementYearly from "@screens/FinancialGoals/StepUpInvestment/StepupIncrementYearly";
import StepUpInvestmentDetails from "@screens/FinancialGoals/StepUpInvestment/StepupInvestmentDetails";
import TopupComplete from "@screens/FinancialGoals/TopupGoal/TopupComplete";
import TopupConfirmation from "@screens/FinancialGoals/TopupGoal/TopupConfirmation";
import TopupGoalAmount from "@screens/FinancialGoals/TopupGoal/TopupGoalAmount";
import TopupLanding from "@screens/FinancialGoals/TopupGoal/TopupLanding";
import TopupPromo from "@screens/FinancialGoals/TopupGoal/TopupPromo";
import UnitTrustEditEmploymentDetails from "@screens/FinancialGoals/UnitTrustOpening/UnitTrustEditEmploymentDetails";
import UnitTrustEditPersonalDetails from "@screens/FinancialGoals/UnitTrustOpening/UnitTrustEditPersonalDetails";
import UnitTrustOpeningAcknowledgement from "@screens/FinancialGoals/UnitTrustOpening/UnitTrustOpeningAcknowledgement";
import UnitTrustOpeningConfirmation from "@screens/FinancialGoals/UnitTrustOpening/UnitTrustOpeningConfirmation";
import UnitTrustOpeningDeclaration from "@screens/FinancialGoals/UnitTrustOpening/UnitTrustOpeningDeclaration";
import FinancialGoalWelcome from "@screens/FinancialGoals/Welcome";
import FinancialWithdrawAcknowledgement from "@screens/FinancialGoals/WithdrawFund/WithdrawAcknowledgement";
import FinancialWithdrawAmt from "@screens/FinancialGoals/WithdrawFund/WithdrawAmt";
import FinancialWithdrawFund from "@screens/FinancialGoals/WithdrawFund/WithdrawFundConfirmation";
import FinancialWithdrawReason from "@screens/FinancialGoals/WithdrawFund/WithdrawReason";
import ApplicationDocument from "@screens/Property/Application/ApplicationDocument";
import LetterOfferList from "@screens/Property/Application/ApplicationDocument/LetterOfferList";
import DocumentViewer from "@screens/Property/Chat/ChatDocuments/DocumentViewer";
import JAEmploymentDetails from "@screens/Property/JointApplicant/JAEmploymentDetails";
import JAIncomeCommitment from "@screens/Property/JointApplicant/JAIncomeCommitment";
import JAPersonalInfo from "@screens/Property/JointApplicant/JAPersonalInfo";

import { useModelController } from "@context";

import { DEBIT_CARD_DETAIL } from "@navigation/navigationConstant";
import WealthErrorHandlingScreen from "../../../screens/Banking/WealthErrorHandlingScreen";
import AssetsClassificationItemScreen from "../../../screens/Banking/WealthPortfolio/AssetsClassificationItemScreen";

function ASNBSummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/ASNBSummaryScreen").default;
    return <Screen {...props} />;
}

function ASNBTransactionHistoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/ASNBTransactionHistoryScreen").default;
    return <Screen {...props} />;
}

function SBLanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBLanding").default;
    return <Screen {...props} />;
}

function SBDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBDashboard").default;
    return <Screen {...props} />;
}

function SBName(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBName").default;
    return <Screen {...props} />;
}

function CalcAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/CalcAmountScreen").default;
    return <Screen {...props} />;
}

function SBFriendsGroupsTab(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBFriendsGroupsTab").default;
    return <Screen {...props} />;
}

function SBFriendsConfirm(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBFriendsConfirm").default;
    return <Screen {...props} />;
}

function SBConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBConfirmation").default;
    return <Screen {...props} />;
}

function SBReceipt(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBReceipt").default;
    return <Screen {...props} />;
}

function SBDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBDetails").default;
    return <Screen {...props} />;
}

function SBStatus(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBStatus").default;
    return <Screen {...props} />;
}

function SBAcceptReject(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBAcceptReject").default;
    return <Screen {...props} />;
}

function SBPayConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SplitBill/SBPayConfirmation").default;
    return <Screen {...props} />;
}

function ApplyCardIntro(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/ApplyCardIntro").default;
    return <Screen {...props} />;
}
function MAERenewVirtualCard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAERenewVirtualCard").default;
    return <Screen {...props} />;
}

function MAEVirtualCardStatus(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAEVirtualCardStatus").default;
    return <Screen {...props} />;
}

function MAECardAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardAddress").default;
    return <Screen {...props} />;
}

function CardDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/CardDetails").default;
    return <Screen {...props} />;
}

function CardUCodePIN(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/CardUCodePIN").default;
    return <Screen {...props} />;
}

function MAECardStatus(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardStatus").default;
    return <Screen {...props} />;
}

function MAECardPurchaseLimit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardPurchaseLimit").default;
    return <Screen {...props} />;
}

function MAECardOverseasDates(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardOverseasDates").default;
    return <Screen {...props} />;
}

function MAECardPEP(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardPEP").default;
    return <Screen {...props} />;
}

function MAECardHighRisk(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardHighRisk").default;
    return <Screen {...props} />;
}

function MAECardEmployment(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/MAECardEmployment").default;
    return <Screen {...props} />;
}

function PDFViewer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PDFViewer").default;
    return <Screen {...props} />;
}

function GatewayScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@components/Overlays/GatewayScreen").default;
    return <Screen {...props} />;
}

function TopUpIntro(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopUpIntro").default;
    return <Screen {...props} />;
}

function TopupCardBankListScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopupCardBankListScreen").default;
    return <Screen {...props} />;
}

function TopupAddCardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopupAddCardScreen").default;
    return <Screen {...props} />;
}

function TopupEnterAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopupEnterAmountScreen").default;
    return <Screen {...props} />;
}

function TopupConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopupConfirmationScreen").default;
    return <Screen {...props} />;
}

function TopupStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Topup/TopupStatusScreen").default;
    return <Screen {...props} />;
}

function StepUpBenefits(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepUpBenefits").default;
    return <Screen {...props} />;
}

function StepUpAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepUpAddress").default;
    return <Screen {...props} />;
}

function StepUpEmployment(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepUpEmployment").default;
    return <Screen {...props} />;
}

function StepUpRaceScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepUpRaceScreen").default;
    return <Screen {...props} />;
}

function StepUpBranchScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepUpBranchScreen").default;
    return <Screen {...props} />;
}

function StepupStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/StepUp/StepupStatusScreen").default;
    return <Screen {...props} />;
}

function SwitchMAEAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Islamic/SwitchMAEAccount").default;
    return <Screen {...props} />;
}

function SwitchMAEStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Islamic/SwitchMAEStatusScreen").default;
    return <Screen {...props} />;
}

function MFCASummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/MFCASummaryScreen").default;
    return <Screen {...props} />;
}

function MFCADetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/MFCADetailsScreen").default;
    return <Screen {...props} />;
}

function TabungHajiSummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/TabungHajiSummaryScreen").default;
    return <Screen {...props} />;
}

function TabungHajiTransactionHistoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/TabungHajiTransactionHistoryScreen").default;
    return <Screen {...props} />;
}

function EzyQ(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/EzyQ/EzyQ").default;
    return <Screen {...props} />;
}

function AutoTopupLimit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/AutoTopupLimit").default;
    return <Screen {...props} />;
}

function AutoTopupEdit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/AutoTopupEdit").default;
    return <Screen {...props} />;
}

function AutoTopupConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/AutoTopupConfirmation").default;
    return <Screen {...props} />;
}

function AutoTopupCard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CardManagement/AutoTopupCard").default;
    return <Screen {...props} />;
}

function ViewStatements(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/ViewStatements").default;
    return <Screen {...props} />;
}

function ProductApplySTPScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ProductApplySTPScreen/ProductApplySTPScreen").default;
    return <Screen {...props} />;
}

function PLSTPLandingPage(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPLandingPage").default;
    return <Screen {...props} />;
}

function PLSTPIncomeDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPIncomeDetails").default;
    return <Screen {...props} />;
}

function PLSTPCreditCheck(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPCreditCheck").default;
    return <Screen {...props} />;
}

function PLSTPLoanApplication(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPLoanApplication").default;
    return <Screen {...props} />;
}

function PLSTPRepaymentDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPRepaymentDetails").default;
    return <Screen {...props} />;
}

function PLSTPPersonalDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPPersonalDetails").default;
    return <Screen {...props} />;
}

function PLSTPEmploymentDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPEmploymentDetails").default;
    return <Screen {...props} />;
}

function PLSTPEmploymentAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPEmploymentAddress").default;
    return <Screen {...props} />;
}

function PLSTPOtherDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPOtherDetails").default;
    return <Screen {...props} />;
}

function PLSTPTNC(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPTNC").default;
    return <Screen {...props} />;
}

function PLSTPConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPConfirmation").default;
    return <Screen {...props} />;
}

function PLSTPPrequal2Fail(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPPrequal2Fail").default;
    return <Screen {...props} />;
}

function PLSTPExploreOptions(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPExploreOptions").default;
    return <Screen {...props} />;
}

function PLSTPSuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPSuccess").default;
    return <Screen {...props} />;
}

function PLSTPCounterOffer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPCounterOffer").default;
    return <Screen {...props} />;
}

function PLSTPCounterDecline(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPCounterDecline").default;
    return <Screen {...props} />;
}

function PLSTPUploadDocs(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPUploadDocs").default;
    return <Screen {...props} />;
}

function PLSTPUploadDocNote(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPUploadDocNote").default;
    return <Screen {...props} />;
}

function PLSTPUploadDocVerification(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPUploadDocVerification").default;
    return <Screen {...props} />;
}

function PLSTPCamera(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/PLSTP/PLSTPCamera").default;
    return <Screen {...props} />;
}

function PropertyDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/PropertyDashboard").default;
    return <Screen {...props} />;
}

function PropertyIntroScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/PropertyIntroScreen").default;
    return <Screen {...props} />;
}

function PropertyList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/PropertyList").default;
    return <Screen {...props} />;
}

function PropertyDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/PropertyDetails").default;
    return <Screen {...props} />;
}

function PropertyNotificationLanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/PropertyNotificationLanding").default;
    return <Screen {...props} />;
}

function ConnectSalesRep(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/ConnectSalesRep").default;
    return <Screen {...props} />;
}

function LCIncome(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/LoanCalculator/LCIncome").default;
    return <Screen {...props} />;
}

function LCCommitments(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/LoanCalculator/LCCommitments").default;
    return <Screen {...props} />;
}

function LCTenure(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/LoanCalculator/LCTenure").default;
    return <Screen {...props} />;
}

function LCResult(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/LoanCalculator/LCResult").default;
    return <Screen {...props} />;
}

function ScanPropertyQRScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Scan/ScanPropertyQRScreen").default;
    return <Screen {...props} />;
}

function PropertyFilterScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Filter/PropertyFilterScreen").default;
    return <Screen {...props} />;
}

function PropertySelectAreaScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Filter/PropertySelectAreaScreen").default;
    return <Screen {...props} />;
}

function CEPersonal(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPersonal").default;
    return <Screen {...props} />;
}

function CEResult(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEResult").default;
    return <Screen {...props} />;
}

function CEPropertyList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPropertyList").default;
    return <Screen {...props} />;
}

function ApplicationDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/ApplicationDetails").default;
    return <Screen {...props} />;
}

function CEDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEDeclaration").default;
    return <Screen {...props} />;
}

function CEPFNumber(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPFNumber").default;
    return <Screen {...props} />;
}

function CEPFNumberConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPFNumberConfirmation").default;
    return <Screen {...props} />;
}

function CEUnitSelection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEUnitSelection").default;
    return <Screen {...props} />;
}

function CEPropertyAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPropertyAddress").default;
    return <Screen {...props} />;
}

function CEPropertySearchList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPropertySearchList").default;
    return <Screen {...props} />;
}

function CEPurchaseDownpayment(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPurchaseDownpayment").default;
    return <Screen {...props} />;
}

function CETenure(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CETenure").default;
    return <Screen {...props} />;
}

function CECommitments(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CECommitments").default;
    return <Screen {...props} />;
}

function CEPropertyName(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEPropertyName").default;
    return <Screen {...props} />;
}

function CEFinDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEFinDeclaration").default;
    return <Screen {...props} />;
}

function LAEligibilityConfirm(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAEligibilityConfirm").default;
    return <Screen {...props} />;
}

function LAAdditional(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAAdditional").default;
    return <Screen {...props} />;
}

function LAConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAConfirmation").default;
    return <Screen {...props} />;
}

function LAUnitNumber(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAUnitNumber").default;
    return <Screen {...props} />;
}

function LAUnitConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAUnitConfirmation").default;
    return <Screen {...props} />;
}

function LAUnitOwnerConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAUnitOwnerConfirmation").default;
    return <Screen {...props} />;
}

function LAUnitNumberEdit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAUnitNumberEdit").default;
    return <Screen {...props} />;
}

function LAFinancingType(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAFinancingType").default;
    return <Screen {...props} />;
}

function LAEmpDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAEmpDetails").default;
    return <Screen {...props} />;
}

function LAEmpAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAEmpAddress").default;
    return <Screen {...props} />;
}

function LACustAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LACustAddress").default;
    return <Screen {...props} />;
}

function LAProductPlans(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAProductPlans").default;
    return <Screen {...props} />;
}

function LATnC(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LATnC").default;
    return <Screen {...props} />;
}

function LACancel(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LACancel").default;
    return <Screen {...props} />;
}

function LAResult(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Application/LAResult").default;
    return <Screen {...props} />;
}

function ChatWindow(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Chat/ChatWindow").default;
    return <Screen {...props} />;
}

function ChatList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Chat/ChatList").default;
    return <Screen {...props} />;
}

function ChatDocuments(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Chat/ChatDocuments").default;
    return <Screen {...props} />;
}

function CEAddJADetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEAddJADetails").default;
    return <Screen {...props} />;
}

function CEAddJAETB(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEAddJAETB").default;
    return <Screen {...props} />;
}

function CEAddJANTB(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEAddJANTB").default;
    return <Screen {...props} />;
}

function CEAddJACommitments(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEAddJACommitments").default;
    return <Screen {...props} />;
}

function CEAddJANotifyResult(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/Eligibility/CEAddJANotifyResult").default;
    return <Screen {...props} />;
}

function JAPropertyDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAPropertyDetails").default;
    return <Screen {...props} />;
}
function JAPropertyList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAPropertyList").default;
    return <Screen {...props} />;
}
function JAAcceptance(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAAcceptance").default;
    return <Screen {...props} />;
}

function JAResult(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAResult").default;
    return <Screen {...props} />;
}
function JAOwnerConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAOwnerConfirmation").default;
    return <Screen {...props} />;
}
function JACEFinDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JACEFinDeclaration").default;
    return <Screen {...props} />;
}
function JATnC(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JATnC").default;
    return <Screen {...props} />;
}
function JAConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAConfirmation").default;
    return <Screen {...props} />;
}

function JAEmployementAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAEmployementAddress").default;
    return <Screen {...props} />;
}

function JAAdditional(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Property/JointApplicant/JAAdditional").default;
    return <Screen {...props} />;
}
function JACustAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Property/JointApplicant/JACustAddress").default;
    return <Screen {...props} />;
}

function CardsList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ApplePay/CardsList").default;
    return <Screen {...props} />;
}

function ApplePayAck(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ApplePay/ApplePayAck").default;
    return <Screen {...props} />;
}

function ApplePayFailureScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ApplePay/ApplePayFailureScreen").default;
    return <Screen {...props} />;
}

function DebitCardDetail(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Banking/DebitCardDetailScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function BankingStack() {
    return (
        <Stack.Navigator headerMode="none" screenOptions={{ gestureEnabled: false }}>
            <Stack.Screen name="BankingL2Screen" component={BankingL2Screen} />
            <Stack.Screen name="AccountDetailsScreen" component={AccountDetailsScreen} />
            <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
            <Stack.Screen name="TransactionStatus" component={TransactionStatus} />

            {/* Digital Wealth */}

            <Stack.Screen name="ASNBConsentScreen" component={ASNBConsentScreen} />
            <Stack.Screen
                name="ASNBConsentAcknowledgementScreen"
                component={ASNBConsentAcknowledgementScreen}
            />

            <Stack.Screen name="ASNBSummaryScreen" component={ASNBSummaryScreen} />
            <Stack.Screen
                name="ASNBTransactionHistoryScreen"
                component={ASNBTransactionHistoryScreen}
            />
            <Stack.Screen name="MFCASummaryScreen" component={MFCASummaryScreen} />
            <Stack.Screen name="MFCADetailsScreen" component={MFCADetailsScreen} />
            <Stack.Screen name="TabungHajiSummaryScreen" component={TabungHajiSummaryScreen} />
            <Stack.Screen
                name="TabungHajiTransactionHistoryScreen"
                component={TabungHajiTransactionHistoryScreen}
            />
            <Stack.Screen
                name="WealthCardAccountListScreen"
                component={WealthCardAccountListScreen}
            />
            <Stack.Screen
                name="WealthProductDetailsScreen"
                component={WealthProductDetailsScreen}
            />
            <Stack.Screen name="WealthViewTransaction" component={WealthViewTransaction} />
            <Stack.Screen name="WealthPortfolio" component={WealthPortfolio} />
            <Stack.Screen
                name="ZeroAssetliabilitiesScreen"
                component={ZeroAssetliabilitiesScreen}
            />
            <Stack.Screen
                name="AssetsClassificationItemScreen"
                component={AssetsClassificationItemScreen}
            />
            <Stack.Screen name="WealthErrorHandlingScreen" component={WealthErrorHandlingScreen} />

            {/* Common Module - Start */}
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
            <Stack.Screen name="GatewayScreen" component={GatewayScreen} />
            {/* Common Module - End */}

            {/* SplitBill Module - Start */}
            <Stack.Screen name="SBLanding" component={SBLanding} />
            <Stack.Screen name="SBDashboard" component={SBDashboard} />
            <Stack.Screen name="SBName" component={SBName} />
            <Stack.Screen name="CalcAmountScreen" component={CalcAmountScreen} />
            <Stack.Screen name="SBFriendsGroupsTab" component={SBFriendsGroupsTab} />
            <Stack.Screen name="SBFriendsConfirm" component={SBFriendsConfirm} />
            <Stack.Screen name="SBConfirmation" component={SBConfirmation} />
            <Stack.Screen name="SBReceipt" component={SBReceipt} />
            <Stack.Screen name="SBStatus" component={SBStatus} />
            <Stack.Screen name="SBDetails" component={SBDetails} />
            <Stack.Screen name="SBAcceptReject" component={SBAcceptReject} />
            <Stack.Screen name="SBPayConfirmation" component={SBPayConfirmation} />
            {/* SplitBill Module - End */}

            {/* MAE Card Management Module - Start */}
            <Stack.Screen name="CardDetails" component={CardDetails} />
            <Stack.Screen name="ApplyCardIntro" component={ApplyCardIntro} />
            <Stack.Screen name="MAERenewVirtualCard" component={MAERenewVirtualCard} />
            <Stack.Screen name="MAEVirtualCardStatus" component={MAEVirtualCardStatus} />
            <Stack.Screen name="MAECardAddress" component={MAECardAddress} />
            <Stack.Screen name="CardUCodePIN" component={CardUCodePIN} />
            <Stack.Screen name="MAECardStatus" component={MAECardStatus} />
            <Stack.Screen name="MAECardPurchaseLimit" component={MAECardPurchaseLimit} />
            <Stack.Screen name="MAECardOverseasDates" component={MAECardOverseasDates} />
            <Stack.Screen name="MAECardPEP" component={MAECardPEP} />
            <Stack.Screen name="MAECardHighRisk" component={MAECardHighRisk} />
            <Stack.Screen name="MAECardEmployment" component={MAECardEmployment} />
            <Stack.Screen name="AutoTopupLimit" component={AutoTopupLimit} />
            <Stack.Screen name="AutoTopupEdit" component={AutoTopupEdit} />
            <Stack.Screen name="AutoTopupConfirmation" component={AutoTopupConfirmation} />
            <Stack.Screen name="AutoTopupCard" component={AutoTopupCard} />
            <Stack.Screen name="ViewStatements" component={ViewStatements} />
            {/* MAE Card Management Module - End */}

            {/* MAE Topup Module - Start */}
            <Stack.Screen name="TopUpIntro" component={TopUpIntro} />
            <Stack.Screen name="TopupCardBankListScreen" component={TopupCardBankListScreen} />
            <Stack.Screen name="TopupAddCardScreen" component={TopupAddCardScreen} />
            <Stack.Screen name="TopupEnterAmountScreen" component={TopupEnterAmountScreen} />
            <Stack.Screen name="TopupConfirmationScreen" component={TopupConfirmationScreen} />
            <Stack.Screen name="TopupStatusScreen" component={TopupStatusScreen} />
            {/* MAE Topup Module - End */}

            {/* MAE Stepup Module - Start */}
            <Stack.Screen name="StepUpBenefits" component={StepUpBenefits} />
            <Stack.Screen name="StepUpAddress" component={StepUpAddress} />
            <Stack.Screen name="StepUpEmployment" component={StepUpEmployment} />
            <Stack.Screen name="StepUpRaceScreen" component={StepUpRaceScreen} />
            <Stack.Screen name="StepUpBranchScreen" component={StepUpBranchScreen} />
            <Stack.Screen name="StepupStatusScreen" component={StepupStatusScreen} />
            {/* MAE Stepup Module - End */}

            {/* MAE Switch Account - Start */}
            <Stack.Screen name="SwitchMAEAccount" component={SwitchMAEAccount} />
            <Stack.Screen name="SwitchMAEStatusScreen" component={SwitchMAEStatusScreen} />
            {/* MAE Switch Account - End */}

            {/* EzyPayment and Balance Transfer*/}
            <Stack.Screen name="EZYPayLanding" component={EZYPayLanding} />
            <Stack.Screen name="EZYPaySelectTransaction" component={EZYPaySelectTransaction} />
            <Stack.Screen name="EZYPaySelectPlan" component={EZYPaySelectPlan} />
            <Stack.Screen name="EZYPayConfirmation" component={EZYPayConfirmation} />
            <Stack.Screen name="EZYPayStatus" component={EZYPayStatus} />
            <Stack.Screen name="BTLanding" component={BTLanding} />
            <Stack.Screen name="BTSelectPlan" component={BTSelectPlan} />
            <Stack.Screen name="BTConfirmation" component={BTConfirmation} />
            <Stack.Screen name="BTStatus" component={BTStatus} />

            {/* EzyQ */}
            <Stack.Screen name="EzyQ" component={EzyQ} />

            {/* PLSTP */}
            <Stack.Screen name="PLSTPLandingPage" component={PLSTPLandingPage} />
            <Stack.Screen name="PLSTPIncomeDetails" component={PLSTPIncomeDetails} />
            <Stack.Screen name="PLSTPCreditCheck" component={PLSTPCreditCheck} />
            <Stack.Screen name="PLSTPLoanApplication" component={PLSTPLoanApplication} />
            <Stack.Screen name="PLSTPRepaymentDetails" component={PLSTPRepaymentDetails} />
            <Stack.Screen name="PLSTPPersonalDetails" component={PLSTPPersonalDetails} />
            <Stack.Screen name="PLSTPEmploymentDetails" component={PLSTPEmploymentDetails} />
            <Stack.Screen name="PLSTPEmploymentAddress" component={PLSTPEmploymentAddress} />
            <Stack.Screen name="PLSTPOtherDetails" component={PLSTPOtherDetails} />
            <Stack.Screen name="PLSTPTNC" component={PLSTPTNC} />
            <Stack.Screen name="PLSTPConfirmation" component={PLSTPConfirmation} />
            <Stack.Screen name="PLSTPPrequal2Fail" component={PLSTPPrequal2Fail} />
            <Stack.Screen name="PLSTPExploreOptions" component={PLSTPExploreOptions} />
            <Stack.Screen name="PLSTPSuccess" component={PLSTPSuccess} />
            <Stack.Screen name="PLSTPCounterOffer" component={PLSTPCounterOffer} />
            <Stack.Screen name="PLSTPCounterDecline" component={PLSTPCounterDecline} />
            <Stack.Screen name="PLSTPUploadDocs" component={PLSTPUploadDocs} />
            <Stack.Screen name="PLSTPUploadDocNote" component={PLSTPUploadDocNote} />
            <Stack.Screen
                name="PLSTPUploadDocVerification"
                component={PLSTPUploadDocVerification}
            />
            <Stack.Screen name="PLSTPCamera" component={PLSTPCamera} />
            {/* ProductApplySTPScreen - Loan/Card/ASB/Insurance */}
            <Stack.Screen name="ProductApplySTPScreen" component={ProductApplySTPScreen} />

            {/* Credit Card Activation & Set PIN  */}
            <Stack.Screen
                name="CCAEnterCardExpiryYearScreen"
                component={CCAEnterCardExpiryYearScreen}
            />
            <Stack.Screen name="CCAAcknowledgementScreen" component={CCAAcknowledgementScreen} />
            <Stack.Screen name="CCSetPinScreen" component={CCSetPinScreen} />
            <Stack.Screen name="CCConfirmPinScreen" component={CCConfirmPinScreen} />
            <Stack.Screen
                name="CCSetPinAcknowledgementScreen"
                component={CCSetPinAcknowledgementScreen}
            />

            <Stack.Screen name="CardsList" component={CardsList} />
            <Stack.Screen name="ApplePayAck" component={ApplePayAck} />
            <Stack.Screen name="ApplePayFailureScreen" component={ApplePayFailureScreen} />
            {/* Property - Start */}
            <Stack.Screen name="PropertyIntroScreen" component={PropertyIntroScreen} />
            <Stack.Screen name="PropertyDashboard" component={PropertyDashboard} />
            <Stack.Screen name="PropertyList" component={PropertyList} />
            <Stack.Screen name="PropertyDetails" component={PropertyDetails} />
            <Stack.Screen name="ConnectSalesRep" component={ConnectSalesRep} />
            <Stack.Screen
                name="PropertyNotificationLanding"
                component={PropertyNotificationLanding}
            />

            <Stack.Screen name="LCIncome" component={LCIncome} />
            <Stack.Screen name="LCCommitments" component={LCCommitments} />
            <Stack.Screen name="LCTenure" component={LCTenure} />
            <Stack.Screen name="LCResult" component={LCResult} />

            <Stack.Screen name="ScanPropertyQRScreen" component={ScanPropertyQRScreen} />

            <Stack.Screen name="PropertyFilterScreen" component={PropertyFilterScreen} />
            <Stack.Screen name="PropertySelectAreaScreen" component={PropertySelectAreaScreen} />

            <Stack.Screen name="CEPersonal" component={CEPersonal} />
            <Stack.Screen name="CEResult" component={CEResult} />
            <Stack.Screen name="CEPropertyList" component={CEPropertyList} />
            <Stack.Screen name="CEDeclaration" component={CEDeclaration} />
            <Stack.Screen name="CEPFNumber" component={CEPFNumber} />
            <Stack.Screen name="CEPFNumberConfirmation" component={CEPFNumberConfirmation} />
            <Stack.Screen name="CEUnitSelection" component={CEUnitSelection} />
            <Stack.Screen name="CEPropertyAddress" component={CEPropertyAddress} />
            <Stack.Screen name="CEPropertySearchList" component={CEPropertySearchList} />
            <Stack.Screen name="CEPurchaseDownpayment" component={CEPurchaseDownpayment} />
            <Stack.Screen name="CETenure" component={CETenure} />
            <Stack.Screen name="CECommitments" component={CECommitments} />
            <Stack.Screen name="CEPropertyName" component={CEPropertyName} />
            <Stack.Screen name="CEFinDeclaration" component={CEFinDeclaration} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="ChatWindow" component={ChatWindow} />
            <Stack.Screen name="ChatDocuments" component={ChatDocuments} />
            <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
            <Stack.Screen name="LetterOfferList" component={LetterOfferList} />

            <Stack.Screen name="ApplicationDetails" component={ApplicationDetails} />
            <Stack.Screen name="ApplicationDocument" component={ApplicationDocument} />
            <Stack.Screen name="LAEligibilityConfirm" component={LAEligibilityConfirm} />
            <Stack.Screen name="LAAdditional" component={LAAdditional} />
            <Stack.Screen name="LAConfirmation" component={LAConfirmation} />
            <Stack.Screen name="LAUnitNumber" component={LAUnitNumber} />
            <Stack.Screen name="LAUnitConfirmation" component={LAUnitConfirmation} />
            <Stack.Screen name="LAUnitNumberEdit" component={LAUnitNumberEdit} />
            <Stack.Screen name="LAUnitOwnerConfirmation" component={LAUnitOwnerConfirmation} />
            <Stack.Screen name="LAFinancingType" component={LAFinancingType} />
            <Stack.Screen name="LAEmpDetails" component={LAEmpDetails} />
            <Stack.Screen name="LAEmpAddress" component={LAEmpAddress} />
            <Stack.Screen name="LACustAddress" component={LACustAddress} />
            <Stack.Screen name="LAProductPlans" component={LAProductPlans} />
            <Stack.Screen name="LATnC" component={LATnC} />
            <Stack.Screen name="LACancel" component={LACancel} />
            <Stack.Screen name="LAResult" component={LAResult} />

            <Stack.Screen name="CEAddJADetails" component={CEAddJADetails} />
            <Stack.Screen name="CEAddJAETB" component={CEAddJAETB} />
            <Stack.Screen name="CEAddJANTB" component={CEAddJANTB} />
            <Stack.Screen name="CEAddJACommitments" component={CEAddJACommitments} />
            <Stack.Screen name="CEAddJANotifyResult" component={CEAddJANotifyResult} />

            <Stack.Screen name="JAPropertyDetails" component={JAPropertyDetails} />
            <Stack.Screen name="JAPropertyList" component={JAPropertyList} />
            <Stack.Screen name="JAAcceptance" component={JAAcceptance} />
            <Stack.Screen name="JAPersonalInfo" component={JAPersonalInfo} />
            <Stack.Screen name="JAEmploymentDetails" component={JAEmploymentDetails} />
            <Stack.Screen name="JAEmployementAddress" component={JAEmployementAddress} />
            <Stack.Screen name="JAIncomeCommitment" component={JAIncomeCommitment} />
            <Stack.Screen name="JACEFinDeclaration" component={JACEFinDeclaration} />
            <Stack.Screen name="JATnC" component={JATnC} />
            <Stack.Screen name="JAConfirmation" component={JAConfirmation} />
            <Stack.Screen name="JAResult" component={JAResult} />
            <Stack.Screen name="JAOwnerConfirmation" component={JAOwnerConfirmation} />
            <Stack.Screen name="JAAdditional" component={JAAdditional} />
            <Stack.Screen name="JACustAddress" component={JACustAddress} />
            {/* Property - End */}

            {/* Financial Goals */}
            <Stack.Screen name="FinancialGoalWelcome" component={FinancialGoalWelcome} />
            <Stack.Screen name="FinancialGoalSelection" component={FinancialGoalSelection} />
            <Stack.Screen name="RetirementAge" component={RetirementAge} />
            <Stack.Screen name="RetirementExpenses" component={RetirementExpenses} />
            <Stack.Screen name="RetirementYearRange" component={RetirementYearRange} />
            <Stack.Screen name="RetirementUpfront" component={RetirementUpfront} />
            <Stack.Screen name="FinancialEducationFor" component={FinancialEducationFor} />
            <Stack.Screen
                name="FinancialEducationChildInfo"
                component={FinancialEducationChildInfo}
            />
            <Stack.Screen
                name="FinancialEducationFundYear"
                component={FinancialEducationFundYear}
            />
            <Stack.Screen name="FinancialEducationLevel" component={FinancialEducationLevel} />
            <Stack.Screen
                name="FinancialEducationCommitUpfront"
                component={FinancialEducationCommitUpfront}
            />
            <Stack.Screen name="RiskProfileTestEntry" component={RiskProfileTestEntry} />
            <Stack.Screen name="RiskProfileQuestion" component={RiskProfileQuestion} />
            <Stack.Screen name="RiskProfileResult" component={RiskProfileResult} />
            <Stack.Screen name="FinancialGoalOverview" component={GoalOverview} />
            <Stack.Screen name="GrowthWealthUpfrontAmount" component={GrowWealthUpfrontAmount} />
            <Stack.Screen
                name="GrowthWealthAccumulateAmount"
                component={GrowWealthAccumulateAmount}
            />
            <Stack.Screen name="GrowthWealthWithdrawAge" component={GrowWealthWithdrawAge} />
            <Stack.Screen name="GoalSimulation" component={GoalSimulation} />
            <Stack.Screen name="StepUpDepositSchedule" component={StepUpDepositSchedule} />
            <Stack.Screen
                name="StepUpIncreaseMonthlyPayment"
                component={StepupIncreaseMonthlyPayment}
            />
            <Stack.Screen name="StepUpIncrementYearly" component={StepupIncrementYearly} />
            <Stack.Screen name="StepUpInvestmentDetails" component={StepUpInvestmentDetails} />
            <Stack.Screen name="RiskLevelEdit" component={RiskLevelEdit} />
            <Stack.Screen name="FundAllocation" component={FundAllocation} />
            <Stack.Screen name="FinancialCustomPortfolio" component={CustomPortfolio} />
            <Stack.Screen name="EPFSavingEntry" component={EPFSavingsEntry} />
            <Stack.Screen name="CurrentEPFSaving" component={CurrentEPFSaving} />
            <Stack.Screen
                name="CurrentEPFMonthlyContribute"
                component={CurrentEPFMonthlyContribute}
            />
            <Stack.Screen name="EPFCustomizePlan" component={EPFCustomisePlan} />
            <Stack.Screen name="KickStartEmail" component={KickStartEmail} />
            <Stack.Screen name="KickStartDeposit" component={KickStartDeposit} />
            <Stack.Screen name="KickStartSelection" component={KickStartSelection} />
            <Stack.Screen name="KickStartPromo" component={KickStartPromo} />
            <Stack.Screen name="KickStartConfirmation" component={KickStartConfirmation} />
            <Stack.Screen
                name="KickStartMonthlyInvestment"
                component={KickStartMonthlyInvestment}
            />
            <Stack.Screen name="FinancialTransactionHistory" component={TransactionHistory} />
            <Stack.Screen name="FinancialTransactionDetails" component={TransactionDetails} />
            <Stack.Screen name="OtherSourcesCustomizePlan" component={OtherSourcesCustomizePlan} />
            <Stack.Screen
                name="ExistingInvestmentSavingsEntry"
                component={ExistingInvestmentSavingsEntry}
            />
            <Stack.Screen
                name="InvestmentSavingsContribution"
                component={InvestmentSavingsContribution}
            />
            <Stack.Screen name="TopupLanding" component={TopupLanding} />
            <Stack.Screen name="TopupGoalAmount" component={TopupGoalAmount} />
            <Stack.Screen name="TopupPromo" component={TopupPromo} />
            <Stack.Screen name="TopupConfirmation" component={TopupConfirmation} />
            <Stack.Screen name="TopupComplete" component={TopupComplete} />
            <Stack.Screen name="LeaveContact" component={LeaveContact} />
            <Stack.Screen name="LeaveContactComplete" component={LeaveContactComplete} />
            <Stack.Screen name="RemoveGoal" component={RemoveGoal} />
            <Stack.Screen name="RemoveGoalConfirmation" component={RemoveGoalConfirmation} />
            <Stack.Screen name="FinancialWithdrawAmt" component={FinancialWithdrawAmt} />
            <Stack.Screen name="FinancialWithdrawReason" component={FinancialWithdrawReason} />
            <Stack.Screen name="FinancialWithdrawFund" component={FinancialWithdrawFund} />
            <Stack.Screen
                name="FinancialWithdrawAcknowledgement"
                component={FinancialWithdrawAcknowledgement}
            />
            <Stack.Screen name="MADInput" component={MADInput} />
            <Stack.Screen name="MADConfirmation" component={MADConfirmation} />
            <Stack.Screen
                name="FinancialTermsAndConditions"
                component={FinancialTermsAndConditions}
            />
            <Stack.Screen name="RemoveGoalAcknowledgement" component={RemoveGoalAcknowledgement} />
            <Stack.Screen
                name="UnitTrustOpeningConfirmation"
                component={UnitTrustOpeningConfirmation}
            />
            <Stack.Screen
                name="UnitTrustEditPersonalDetails"
                component={UnitTrustEditPersonalDetails}
            />
            <Stack.Screen
                name="UnitTrustEditEmploymentDetails"
                component={UnitTrustEditEmploymentDetails}
            />
            <Stack.Screen
                name="UnitTrustOpeningDeclaration"
                component={UnitTrustOpeningDeclaration}
            />
            <Stack.Screen
                name="UnitTrustOpeningAcknowledgement"
                component={UnitTrustOpeningAcknowledgement}
            />
            <Stack.Screen name="KickStartAcknowledgement" component={KickStartAcknowledgement} />
            <Stack.Screen name={DEBIT_CARD_DETAIL} component={DebitCardDetail} />
        </Stack.Navigator>
    );
}
