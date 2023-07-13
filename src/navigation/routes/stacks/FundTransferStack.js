import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import TabungHajiAcknowledgement from "@screens/Wallet/TabungHaji/TabungHajiAcknowledgement";
import TabungHajiAddToFavourites from "@screens/Wallet/TabungHaji/TabungHajiAddToFavourites";
import TabungHajiConfirmation from "@screens/Wallet/TabungHaji/TabungHajiConfirmation";
import TabungHajiEnterAmount from "@screens/Wallet/TabungHaji/TabungHajiEnterAmount";
import TabungHajiNewTransferOwnTabungHaji from "@screens/Wallet/TabungHaji/TabungHajiNewTransferOwnTabungHaji";
import TabungHajiRecipientReference from "@screens/Wallet/TabungHaji/TabungHajiRecipientReference";
import TabungHajiTransferOtherMaybank from "@screens/Wallet/TabungHaji/TabungHajiTransferOtherMaybank";
import TabungHajiTransferOtherTabungHaji from "@screens/Wallet/TabungHaji/TabungHajiTransferOtherTabungHaji";
import BakongAcknowledgement from "@screens/Wallet/Transfer/Bakong/BakongAcknowledgement";
import BakongAddToFavourites from "@screens/Wallet/Transfer/Bakong/BakongAddToFavourites";
import BakongConfirmation from "@screens/Wallet/Transfer/Bakong/BakongConfirmation";
import BakongEnterAmount from "@screens/Wallet/Transfer/Bakong/BakongEnterAmount";
import BakongEnterMobileNo from "@screens/Wallet/Transfer/Bakong/BakongEnterMobileNo";
import BakongEnterPurpose from "@screens/Wallet/Transfer/Bakong/BakongEnterPurpose";
import BakongEnterRecipientAddress from "@screens/Wallet/Transfer/Bakong/BakongEnterRecipientAddress";
import BakongEnterRecipientID from "@screens/Wallet/Transfer/Bakong/BakongEnterRecipientID";
import BakongSummary from "@screens/Wallet/Transfer/Bakong/BakongSummary";
import BakongDetailsConfirmation from "@screens/Wallet/Transfer/Overseas/Bakong/BakongDetailsConfirmation";
import BakongEnterMobileNumber from "@screens/Wallet/Transfer/Overseas/Bakong/BakongEnterMobileNumber";
import BakongRecipientAddressDetails from "@screens/Wallet/Transfer/Overseas/Bakong/BakongRecipientAddressDetails";
import BakongRecipientIDDetails from "@screens/Wallet/Transfer/Overseas/Bakong/BakongRecipientIDDetails";
import BakongTransferPurposeDetails from "@screens/Wallet/Transfer/Overseas/Bakong/BakongTransferPurposeDetails";
import FTTConfirmation from "@screens/Wallet/Transfer/Overseas/FTT/FTTConfirmation";
import FTTRecipientBankDetails from "@screens/Wallet/Transfer/Overseas/FTT/FTTRecipientBankDetails";
import FTTRecipientDetails from "@screens/Wallet/Transfer/Overseas/FTT/FTTRecipientDetails";
import FTTTransferDetails from "@screens/Wallet/Transfer/Overseas/FTT/FTTTransferDetails";
import MOTConfirmation from "@screens/Wallet/Transfer/Overseas/MOT/MOTConfirmation";
import MOTRecipientBankDetails from "@screens/Wallet/Transfer/Overseas/MOT/MOTRecipientBankDetails";
import MOTRecipientDetails from "@screens/Wallet/Transfer/Overseas/MOT/MOTRecipientDetails";
import MOTTransferDetails from "@screens/Wallet/Transfer/Overseas/MOT/MOTTransferDetails";
import OverseasAccountsListScreen from "@screens/Wallet/Transfer/Overseas/OverseasAccountsListScreen";
import OverseasAcknowledgement from "@screens/Wallet/Transfer/Overseas/OverseasAcknowledgement";
import OverseasAddToFavourites from "@screens/Wallet/Transfer/Overseas/OverseasAddToFavourites";
import OverseasConfirmation from "@screens/Wallet/Transfer/Overseas/OverseasConfirmation";
import OverseasCountryListScreen from "@screens/Wallet/Transfer/Overseas/OverseasCountryListScreen";
import OverseasCountryStateCityList from "@screens/Wallet/Transfer/Overseas/OverseasCountryStateCityList";
import OverseasCountryStateList from "@screens/Wallet/Transfer/Overseas/OverseasCountryStateList";
import OverseasEnterAmount from "@screens/Wallet/Transfer/Overseas/OverseasEnterAmount";
import OverseasNTB from "@screens/Wallet/Transfer/Overseas/OverseasNTB";
import OverseasPrequisites from "@screens/Wallet/Transfer/Overseas/OverseasPrequisites";
import OverseasProductListScreen from "@screens/Wallet/Transfer/Overseas/OverseasProductListScreen";
import OverseasSenderDetails from "@screens/Wallet/Transfer/Overseas/OverseasSenderDetails";
import OverseasTerms from "@screens/Wallet/Transfer/Overseas/OverseasTerms";
import VDConfirmation from "@screens/Wallet/Transfer/Overseas/VD/VDConfirmation";
import VDRecipientDetails from "@screens/Wallet/Transfer/Overseas/VD/VDRecipientDetails";
import VDTransferDetails from "@screens/Wallet/Transfer/Overseas/VD/VDTransferDetails";
import WUConfirmation from "@screens/Wallet/Transfer/Overseas/WU/WUConfirmation";
import WURecipientDetails from "@screens/Wallet/Transfer/Overseas/WU/WURecipientDetails";
import WUSenderDetailsStepOne from "@screens/Wallet/Transfer/Overseas/WU/WUSenderDetailsStepOne";
import WUSenderDetailsStepThree from "@screens/Wallet/Transfer/Overseas/WU/WUSenderDetailsStepThree";
import WUSenderDetailsStepTwo from "@screens/Wallet/Transfer/Overseas/WU/WUSenderDetailsStepTwo";
import WUTransferDetails from "@screens/Wallet/Transfer/Overseas/WU/WUTransferDetails";

import { useModelController } from "@context";

function TransferTabScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferTabScreen").default;
    return <Screen {...props} />;
}

function TransferEnterAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferEnterAmount").default;
    return <Screen {...props} />;
}

function TransferReferenceScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferReferenceScreen").default;
    return <Screen {...props} />;
}

function TransferUserNameScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferUserNameScreen").default;
    return <Screen {...props} />;
}

function TransferConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferConfirmationScreen").default;
    return <Screen {...props} />;
}

function TransferAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferAcknowledgeScreen").default;
    return <Screen {...props} />;
}
function S2UTransferAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/S2UTransferAcknowledgeScreen").default;
    return <Screen {...props} />;
}
function TransferSelectBank(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferSelectBank").default;
    return <Screen {...props} />;
}

function TransferEnterAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferEnterAccount").default;
    return <Screen {...props} />;
}

function AddToFavouritesScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/AddToFavouritesScreen").default;
    return <Screen {...props} />;
}

function TransferTypeModeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferTypeModeScreen").default;
    return <Screen {...props} />;
}

function LoanAmountSelection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/LoanAmountSelection").default;
    return <Screen {...props} />;
}

function LoanConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/LoanConfirmation").default;
    return <Screen {...props} />;
}

function LoanStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/LoanStatusScreen").default;
    return <Screen {...props} />;
}

function PDFViewer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PDFViewer").default;
    return <Screen {...props} />;
}

function AmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/TransferAmount/AmountScreen").default;
    return <Screen {...props} />;
}

function DuitNowEnterIDScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/DuitNow/DuitNowEnterID").default;
    return <Screen {...props} />;
}

function DuitNowReferenceScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/DuitNow/DuitNowReference").default;
    return <Screen {...props} />;
}

function DuitNowEnterAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/DuitNow/DuitNowEnterAmount").default;
    return <Screen {...props} />;
}

function ASNBNewTransferDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBNewTransferDetailsScreen").default;
    return <Screen {...props} />;
}

function ASNBTransferAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBTransferAmountScreen").default;
    return <Screen {...props} />;
}

function ASNBTransferConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBTransferConfirmationScreen").default;
    return <Screen {...props} />;
}

function ASNBTransferAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBTransferAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function ASNBAddFavouriteScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBAddFavouriteScreen").default;
    return <Screen {...props} />;
}

function ASNBFavouriteTransferDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/ASNB/ASNBFavouriteTransferDetailsScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function FundStack() {
    return (
        <Stack.Navigator initialRouteName="TransferTabScreen" headerMode="none">
            <Stack.Screen name="TransferAcknowledgeScreen" component={TransferAcknowledgeScreen} />
            <Stack.Screen
                name="S2UTransferAcknowledgeScreen"
                component={S2UTransferAcknowledgeScreen}
            />
            <Stack.Screen name="TransferTabScreen" component={TransferTabScreen} />
            <Stack.Screen name="TransferEnterAmount" component={TransferEnterAmount} />
            <Stack.Screen name="TransferReferenceScreen" component={TransferReferenceScreen} />
            <Stack.Screen name="TransferUserNameScreen" component={TransferUserNameScreen} />
            <Stack.Screen name="TransferSelectBank" component={TransferSelectBank} />
            <Stack.Screen name="TransferEnterAccount" component={TransferEnterAccount} />
            <Stack.Screen name="AddToFavouritesScreen" component={AddToFavouritesScreen} />
            <Stack.Screen name="TransferTypeModeScreen" component={TransferTypeModeScreen} />
            <Stack.Screen name="LoanAmountSelection" component={LoanAmountSelection} />
            <Stack.Screen name="LoanConfirmation" component={LoanConfirmation} />
            <Stack.Screen name="LoanStatusScreen" component={LoanStatusScreen} />
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
            <Stack.Screen name="AmountScreen" component={AmountScreen} />
            <Stack.Screen name="DuitNowEnterIDScreen" component={DuitNowEnterIDScreen} />
            <Stack.Screen name="DuitNowEnterAmount" component={DuitNowEnterAmount} />
            <Stack.Screen name="DuitNowReferenceScreen" component={DuitNowReferenceScreen} />

            {/* Bakong */}
            <Stack.Screen name="BakongEnterMobileNo" component={BakongEnterMobileNo} />
            <Stack.Screen name="BakongEnterAmount" component={BakongEnterAmount} />
            <Stack.Screen name="BakongEnterRecipientID" component={BakongEnterRecipientID} />
            <Stack.Screen
                name="BakongEnterRecipientAddress"
                component={BakongEnterRecipientAddress}
            />
            <Stack.Screen name="BakongEnterPurpose" component={BakongEnterPurpose} />
            <Stack.Screen name="BakongSummary" component={BakongSummary} />
            <Stack.Screen name="BakongConfirmation" component={BakongConfirmation} />
            <Stack.Screen name="BakongAcknowledgement" component={BakongAcknowledgement} />
            <Stack.Screen name="BakongAddToFavourites" component={BakongAddToFavourites} />
            {/* Bakong */}

            {/* Overseas */}
            <Stack.Screen name="OverseasCountryListScreen" component={OverseasCountryListScreen} />
            <Stack.Screen name="OverseasCountryStateList" component={OverseasCountryStateList} />
            <Stack.Screen
                name="OverseasCountryStateCityList"
                component={OverseasCountryStateCityList}
            />
            <Stack.Screen
                name="OverseasAccountsListScreen"
                component={OverseasAccountsListScreen}
            />
            <Stack.Screen name="OverseasEnterAmount" component={OverseasEnterAmount} />
            <Stack.Screen name="OverseasProductListScreen" component={OverseasProductListScreen} />
            <Stack.Screen name="OverseasPrequisites" component={OverseasPrequisites} />
            <Stack.Screen name="OverseasTerms" component={OverseasTerms} />
            <Stack.Screen name="OverseasConfirmation" component={OverseasConfirmation} />
            <Stack.Screen name="OverseasAcknowledgement" component={OverseasAcknowledgement} />
            <Stack.Screen name="OverseasAddToFavourites" component={OverseasAddToFavourites} />
            <Stack.Screen name="OverseasNTB" component={OverseasNTB} />
            <Stack.Screen name="OverseasSenderDetails" component={OverseasSenderDetails} />

            <Stack.Screen name="BakongEnterMobileNumber" component={BakongEnterMobileNumber} />
            <Stack.Screen name="BakongRecipientIDDetails" component={BakongRecipientIDDetails} />
            <Stack.Screen
                name="BakongTransferPurposeDetails"
                component={BakongTransferPurposeDetails}
            />
            <Stack.Screen
                name="BakongRecipientAddressDetails"
                component={BakongRecipientAddressDetails}
            />
            <Stack.Screen name="BakongDetailsConfirmation" component={BakongDetailsConfirmation} />

            <Stack.Screen name="FTTRecipientDetails" component={FTTRecipientDetails} />
            <Stack.Screen name="FTTRecipientBankDetails" component={FTTRecipientBankDetails} />
            <Stack.Screen name="FTTTransferDetails" component={FTTTransferDetails} />
            <Stack.Screen name="FTTConfirmation" component={FTTConfirmation} />

            <Stack.Screen name="MOTTransferDetails" component={MOTTransferDetails} />
            <Stack.Screen name="MOTRecipientDetails" component={MOTRecipientDetails} />
            <Stack.Screen name="MOTRecipientBankDetails" component={MOTRecipientBankDetails} />
            <Stack.Screen name="MOTConfirmation" component={MOTConfirmation} />

            <Stack.Screen name="VDTransferDetails" component={VDTransferDetails} />
            <Stack.Screen name="VDRecipientDetails" component={VDRecipientDetails} />
            <Stack.Screen name="VDConfirmation" component={VDConfirmation} />
            <Stack.Screen name="WUSenderDetailsStepOne" component={WUSenderDetailsStepOne} />
            <Stack.Screen name="WUSenderDetailsStepTwo" component={WUSenderDetailsStepTwo} />
            <Stack.Screen name="WUSenderDetailsStepThree" component={WUSenderDetailsStepThree} />
            <Stack.Screen name="WURecipientDetails" component={WURecipientDetails} />
            <Stack.Screen name="WUTransferDetails" component={WUTransferDetails} />
            <Stack.Screen name="WUConfirmation" component={WUConfirmation} />

            {/* Tabung Haji */}
            <Stack.Screen
                name="TabungHajiNewTransferOwnTabungHaji"
                component={TabungHajiNewTransferOwnTabungHaji}
            />
            <Stack.Screen
                name="TabungHajiTransferOtherTabungHaji"
                component={TabungHajiTransferOtherTabungHaji}
            />
            <Stack.Screen
                name="TabungHajiTransferOtherMaybank"
                component={TabungHajiTransferOtherMaybank}
            />
            <Stack.Screen name="TabungHajiEnterAmount" component={TabungHajiEnterAmount} />
            <Stack.Screen
                name="TabungHajiRecipientReference"
                component={TabungHajiRecipientReference}
            />
            <Stack.Screen name="TabungHajiConfirmation" component={TabungHajiConfirmation} />
            <Stack.Screen name="TabungHajiAcknowledgement" component={TabungHajiAcknowledgement} />
            <Stack.Screen name="TabungHajiAddToFavourites" component={TabungHajiAddToFavourites} />
            {/* Tabung Haji */}

            <Stack.Screen
                name="TransferConfirmationScreen"
                component={TransferConfirmationScreen}
            />
            <Stack.Screen
                name="ASNBNewTransferDetailsScreen"
                component={ASNBNewTransferDetailsScreen}
            />
            <Stack.Screen name="ASNBTransferAmountScreen" component={ASNBTransferAmountScreen} />
            <Stack.Screen
                name="ASNBTransferConfirmationScreen"
                component={ASNBTransferConfirmationScreen}
            />
            <Stack.Screen
                name="ASNBTransferAcknowledgementScreen"
                component={ASNBTransferAcknowledgementScreen}
            />
            <Stack.Screen name="ASNBAddFavouriteScreen" component={ASNBAddFavouriteScreen} />
            <Stack.Screen
                name="ASNBFavouriteTransferDetailsScreen"
                component={ASNBFavouriteTransferDetailsScreen}
            />
        </Stack.Navigator>
    );
}
