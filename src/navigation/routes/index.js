import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Logout from "@screens/Logout";
import SplashScreen from "@screens/OnBoarding/SplashScreen";
import ExternalPnsPromotionScreen from "@screens/Promotions/ExternalPnsPromotion";

import {
    ONE_TAP_AUTH_MODULE,
    BOOSTER_MODULE,
    ZEST_CASA_STACK,
    ASB_STACK,
    SECURE_SWITCH_STACK,
    PREMIER_MODULE_STACK,
    ZAKAT_SERVICES_STACK,
} from "@navigation/navigationConstant";
import HomeStack from "@navigation/routes/stacks/HomeStack";

import ASBStack from "./stacks/ASBStack";
import ATMCashoutStack from "./stacks/ATMCashoutStack";
import AmountStack from "./stacks/AmountStack";
import ArticleStack from "./stacks/ArticleStack";
import AutoBillingStack from "./stacks/AutoBillingStack";
import BankingV2Stack from "./stacks/BankingV2Stack";
import BoostersStack from "./stacks/BoostersStack";
import CommonStack from "./stacks/CommonStack";
import ContactStack from "./stacks/ContactStack";
import DashboardStack from "./stacks/DashboardStack";
import FixedDepositStack from "./stacks/FixedDepositStack";
import FnBStack from "./stacks/FnBStack";
import ForgotPasswordStack from "./stacks/ForgotPasswordStack";
import FundTransferStack from "./stacks/FundTransferStack";
import GameStack from "./stacks/GameStack";
import GoalsStack from "./stacks/GoalsStack";
import JomPayStack from "./stacks/JomPayStack";
import KliaEkspressStack from "./stacks/KliaEkspressStack";
import LoyaltyStack from "./stacks/LoyaltyStack";
import MAEStack from "./stacks/MAEStack";
import MerdekaStack from "./stacks/Merdeka";
import MobileReloadStack from "./stacks/MobileReloadStack";
import OnBoardingStack, { OnBoardingIntro } from "./stacks/OnBoardingStack";
import OneTapAuthStack from "./stacks/OneTapAuthStack";
import PayBillStack from "./stacks/PayBillStack";
import PayCardStack from "./stacks/PayCardStack";
import PremierModuleStack from "./stacks/PremierModuleStack";
import PromotionStack from "./stacks/PromotionStack";
import QrStack from "./stacks/QrStack";
import RequestToPayStack from "./stacks/RequestToPayStack";
import SSLStack from "./stacks/SSLStack";
import STPCardStack from "./stacks/STPCardStack";
import STPSuppCCStack from "./stacks/STPSuppCCStack";
import SavedStack from "./stacks/SavedStack";
import Secure2uPushStack from "./stacks/Secure2uPushStack";
import SecureSwitchStack from "./stacks/SecureSwitchStack";
import SendRequestMoneyStack from "./stacks/SendRequestMoneyStack";
import SettingsStack from "./stacks/SettingsStack";
import TabNavigator from "./stacks/TabNavigator";
import TabungStack from "./stacks/TabungStack";
import TicketStack from "./stacks/TicketStack";
import TrackerStack from "./stacks/TrackerStack";
import VirtualReceiptStack from "./stacks/VirtualReceiptStack";
import ZakatServicesStack from "./stacks/ZakatServicesStack";
import ZestCASAStack from "./stacks/ZestCASAStack";

const Stack = createStackNavigator();

export default function RootStack() {
    return (
        <Stack.Navigator
            initialRouteName="Splashscreen"
            headerMode="none"
            screenOptions={{ gestureEnabled: false }}
        >
            <Stack.Screen
                name="Splashscreen"
                component={SplashScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="TabNavigator"
                component={TabNavigator}
                options={{
                    gestureEnabled: false,
                    animationEnabled: false,
                }}
            />
            <Stack.Screen
                name="OnboardingIntro"
                options={{
                    gestureEnabled: false,
                    animationEnabled: false,
                }}
                component={OnBoardingIntro}
            />
            {/* Added new stack for Marketing notification */}
            <Stack.Screen
                name="ExternalPnsPromotion"
                options={{
                    gestureEnabled: false,
                    animationEnabled: false,
                }}
                component={ExternalPnsPromotionScreen}
            />
            <Stack.Screen name="Onboarding" component={OnBoardingStack} />
            <Stack.Screen name="goalsModule" component={GoalsStack} />
            <Stack.Screen name={BOOSTER_MODULE} component={BoostersStack} />
            <Stack.Screen name="promosModule" component={PromotionStack} />
            <Stack.Screen name="BankingV2Module" component={BankingV2Stack} />
            <Stack.Screen name="loyaltyModuleStack" component={LoyaltyStack} />
            <Stack.Screen name="contactModule" component={ContactStack} />
            <Stack.Screen name="fundTransferModule" component={FundTransferStack} />
            <Stack.Screen name={ONE_TAP_AUTH_MODULE} component={OneTapAuthStack} />
            <Stack.Screen name="TabungStack" component={TabungStack} />
            <Stack.Screen name="VirtualReceiptStack" component={VirtualReceiptStack} />
            <Stack.Screen name="SettingsModule" component={SettingsStack} />
            <Stack.Screen name="commonModule" component={CommonStack} />
            <Stack.Screen name="mobileReloadModule" component={MobileReloadStack} />
            <Stack.Screen name="payCardsModule" component={PayCardStack} />
            <Stack.Screen name="payBillsModule" component={PayBillStack} />
            <Stack.Screen name="FnBStack" component={FnBStack} />
            <Stack.Screen name="sendRequestMoneyStack" component={SendRequestMoneyStack} />
            <Stack.Screen name="jompayModule" component={JomPayStack} />
            <Stack.Screen name="MAEModuleStack" component={MAEStack} />
            <Stack.Screen name="trackerModule" component={TrackerStack} />
            <Stack.Screen name="KliaEkspressStack" component={KliaEkspressStack} />
            <Stack.Screen name="TicketStack" component={TicketStack} />
            <Stack.Screen name="SavedStack" component={SavedStack} />
            <Stack.Screen name="ArticleStack" component={ArticleStack} />
            <Stack.Screen name="AmountStack" component={AmountStack} />
            <Stack.Screen name="DashboardStack" component={DashboardStack} />
            <Stack.Screen name="HomeStack" component={HomeStack} />
            <Stack.Screen name="QrStack" component={QrStack} />
            <Stack.Screen name="ForgotPasswordStack" component={ForgotPasswordStack} />
            <Stack.Screen name="Secure2uPushStack" component={Secure2uPushStack} />
            <Stack.Screen name="GameStack" component={GameStack} />
            <Stack.Screen name="STPCardModule" component={STPCardStack} />
            <Stack.Screen name="RequestToPayStack" component={RequestToPayStack} />
            <Stack.Screen name="STPSuppModule" component={STPSuppCCStack} />
            <Stack.Screen name="FixedDepositStack" component={FixedDepositStack} />
            <Stack.Screen name="SSLStack" component={SSLStack} />
            <Stack.Screen name={ZEST_CASA_STACK} component={ZestCASAStack} />
            <Stack.Screen name={PREMIER_MODULE_STACK} component={PremierModuleStack} />
            <Stack.Screen name="ATMCashoutStack" component={ATMCashoutStack} />
            <Stack.Screen name="MerdekaStack" component={MerdekaStack} />
            <Stack.Screen name="AutoBillingStack" component={AutoBillingStack} />
            <Stack.Screen name={SECURE_SWITCH_STACK} component={SecureSwitchStack} />
            <Stack.Screen name={ASB_STACK} component={ASBStack} />
            <Stack.Screen name={ZAKAT_SERVICES_STACK} component={ZakatServicesStack} />
            <Stack.Screen
                name="Logout"
                options={{
                    animationEnabled: false,
                }}
                component={Logout}
            />
        </Stack.Navigator>
    );
}
