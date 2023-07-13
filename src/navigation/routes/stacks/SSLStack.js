import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function SSLTabScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MainTabScreens/SSLTabScreen").default;
    return <Screen {...props} />;
}

function SSLStart(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/StartingFlow/SSLStart").default;
    return <Screen {...props} />;
}

function SSLOnboarding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/StartingFlow/SSLOnboarding").default;
    return <Screen {...props} />;
}

function SSLShopTab(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MainTabScreens/SSLShopTab").default;
    return <Screen {...props} />;
}

function SSLMerchantListing(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLMerchantListing").default;
    return <Screen {...props} />;
}

function SSLMerchantListingV2(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLMerchantListingV2").default;
    return <Screen {...props} />;
}

function SSLMerchantSearchListing(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/SearchFlow/SSLMerchantSearchListing").default;
    return <Screen {...props} />;
}
function SSLMerchantListingSimple(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLMerchantListingSimple").default;
    return <Screen {...props} />;
}

function SSLPromotionsViewAllListing(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLPromotionsViewAllListing").default;
    return <Screen {...props} />;
}

function SSLSearchScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/SearchFlow/SSLSearchScreen").default;
    return <Screen {...props} />;
}

function SSLSearchInStore(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/SearchFlow/SSLSearchInStore").default;
    return <Screen {...props} />;
}

function SSLFilterScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLFilterScreen").default;
    return <Screen {...props} />;
}

function SSLFilterScreenV2(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLFilterScreenV2").default;
    return <Screen {...props} />;
}

function SSLFilterScreenL3(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLFilterScreenL3").default;
    return <Screen {...props} />;
}

function SSLMerchantDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLMerchantDetails").default;
    return <Screen {...props} />;
}

function SSLAddressNLocationSearch(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/AddressesFlow/SSLAddressNLocationSearch").default;
    return <Screen {...props} />;
}

function SSLLocationMain(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/AddressesFlow/SSLLocationMain").default;
    return <Screen {...props} />;
}

function SSLAddressList(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/AddressesFlow/SSLAddressList").default;
    return <Screen {...props} />;
}

function SSLAddressView(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/AddressesFlow/SSLAddressView").default;
    return <Screen {...props} />;
}

function SSLAddressAddEdit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/AddressesFlow/SSLAddressAddEdit").default;
    return <Screen {...props} />;
}

function SSLProductDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/MerchantProductFlow/SSLProductDetails").default;
    return <Screen {...props} />;
}

function SSLCartScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/CheckoutFlow/SSLCartScreen").default;
    return <Screen {...props} />;
}

function SSLOrderDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/OrderDetailsFlow/SSLOrderDetails").default;
    return <Screen {...props} />;
}

function SSLCheckoutStart(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/CheckoutFlow/SSLCheckoutStart").default;
    return <Screen {...props} />;
}
function SSLCheckoutConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/CheckoutFlow/SSLCheckoutConfirmation").default;
    return <Screen {...props} />;
}
function SSLCheckoutStatus(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/CheckoutFlow/SSLCheckoutStatus").default;
    return <Screen {...props} />;
}
function PDFViewer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PDFViewer").default;
    return <Screen {...props} />;
}
function SSLRating(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SSL/OrderDetailsFlow/SSLRating").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

const forFade = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

export default function SSLStack() {
    return (
        <Stack.Navigator initialRouteName="SSLStart" headerMode="none">
            <Stack.Screen name="SSLStart" component={SSLStart} />
            <Stack.Screen name="SSLOnboarding" component={SSLOnboarding} />

            <Stack.Screen name="SSLTabScreen" component={SSLTabScreen} />

            <Stack.Screen name="SSLShopTab" component={SSLShopTab} />

            <Stack.Screen name="SSLMerchantListing" component={SSLMerchantListing} />
            <Stack.Screen name="SSLMerchantListingV2" component={SSLMerchantListingV2} />

            {/** Overlay on top of SSLMerchantListing */}
            <Stack.Screen
                name="SSLMerchantSearchListing"
                component={SSLMerchantSearchListing}
                options={{ cardStyleInterpolator: forFade }}
            />

            <Stack.Screen
                name="SSLPromotionsViewAllListing"
                component={SSLPromotionsViewAllListing}
            />

            <Stack.Screen name="SSLMerchantListingSimple" component={SSLMerchantListingSimple} />
            <Stack.Screen name="SSLSearchScreen" component={SSLSearchScreen} />
            <Stack.Screen name="SSLSearchInStore" component={SSLSearchInStore} />
            <Stack.Screen name="SSLFilterScreen" component={SSLFilterScreen} />
            <Stack.Screen name="SSLFilterScreenV2" component={SSLFilterScreenV2} />
            <Stack.Screen name="SSLFilterScreenL3" component={SSLFilterScreenL3} />

            <Stack.Screen name="SSLMerchantDetails" component={SSLMerchantDetails} />

            {/** Overlay on top of existing screen */}
            <Stack.Screen
                name="SSLAddressNLocationSearch"
                component={SSLAddressNLocationSearch}
                options={{ cardStyleInterpolator: forFade }}
            />
            <Stack.Screen name="SSLAddressAddEdit" component={SSLAddressAddEdit} />
            <Stack.Screen name="SSLAddressView" component={SSLAddressView} />
            <Stack.Screen name="SSLAddressList" component={SSLAddressList} />
            <Stack.Screen name="SSLLocationMain" component={SSLLocationMain} />
            <Stack.Screen name="SSLProductDetails" component={SSLProductDetails} />
            <Stack.Screen name="SSLCartScreen" component={SSLCartScreen} />
            <Stack.Screen name="SSLOrderDetails" component={SSLOrderDetails} />
            <Stack.Screen name="SSLCheckoutStart" component={SSLCheckoutStart} />
            <Stack.Screen name="SSLCheckoutConfirmation" component={SSLCheckoutConfirmation} />
            <Stack.Screen name="SSLCheckoutStatus" component={SSLCheckoutStatus} />
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
            <Stack.Screen name="SSLRating" component={SSLRating} />
        </Stack.Navigator>
    );
}
