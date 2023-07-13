import PropTypes from "prop-types";
import React from "react";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import { MAYBANK2U } from "@navigation/navigationConstant";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";

import Assets from "@assets";

import ScreenContainer from "../../components/Containers/ScreenContainer";

const WealthErrorHandlingScreen = ({ navigation, route }) => {
    const error = route.params?.error;

    function onNavigateBack() {
        navigation.goBack();
    }

    const emptyStateObject = (() => {
        if (error === "NoConnection") {
            return {
                image: Assets.noInternetBg,
                title: "No Internet Connection",
                subtitle:
                    "It looks like you've lost your Internet connection. Check your settings or try again.",
                buttonText: "Try Again",
                onButtonPressed: onTryAgainPressed,
            };
        } else if (error === "ScheduledMaintenance") {
            return {
                image: Assets.underMaintenanceBg,
                title: "Be Right Back!",
                subtitle:
                    "We’re currently undergoing a scheduled maintenance to improve your experience and will be back up shortly. Sorry for the inconvenience.",
            };
        } else {
            return {
                image: Assets.technicalErrorBg,
                title: "We’ll be back soon",
                subtitle:
                    "Hang in there, we're facing some technical issues processing your request. Try again later.",
            };
        }
    })();

    function onButtonPressed() {
        if (error === "NoConnection") {
            return onTryAgainPressed();
        } else {
            return;
        }
    }

    function onTryAgainPressed() {
        // special handling for maybank2u screen since it navigated to Dashboard when error
        if (route?.params?.fromPage === MAYBANK2U) {
            navigation.navigate({
                name: MAYBANK2U,
                params: {
                    index: route.params?.fromTab,
                },
            });
            return;
        }

        if (route.params?.fromPage) {
            navigation.replace(route.params?.fromPage, {
                refreshRequired: true,
                ...route?.params,
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onNavigateBack} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <EmptyStateScreen
                    imageSrc={emptyStateObject.image}
                    headerText={emptyStateObject.title}
                    subText={emptyStateObject.subtitle}
                    btnText={emptyStateObject?.buttonText}
                    showBtn={!!emptyStateObject?.buttonText}
                    onBtnPress={onButtonPressed}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

WealthErrorHandlingScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default WealthErrorHandlingScreen;
