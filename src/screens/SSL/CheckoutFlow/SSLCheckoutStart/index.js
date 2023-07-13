import { useNavigation } from "@react-navigation/core";
import { useRoute } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    ACTIVATE,
    SSL_STACK,
    SSL_CART_SCREEN,
    SSL_CHECKOUT_CONFIRMATION,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import ScreenLoader from "@components/Loaders/ScreenLoader";

import { withModelContext, useModelController } from "@context";

import { invokeL3 } from "@services";

import { MEDIUM_GREY } from "@constants/colors";

import { checks2UFlow } from "@utils/dataModel/utility";
import { useIsFocusedIncludingMount } from "@utils/hooks";

function SSLCheckoutStart() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel, updateModel } = useModelController();

    const [isServerError, setIsServerError] = useState(false);
    const isCurrentScreenDismiss = useRef(false);

    useIsFocusedIncludingMount(() => {
        if (isCurrentScreenDismiss.current) {
            navigation.goBack();
        }
    });

    const init = useCallback(async () => {
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                console.log("invokeL3");
                const httpResp = await invokeL3(true);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    throw new Error();
                }
            } catch (e) {
                console.log("invokeL3 fail");
                navigation.goBack();
                return;
            }
        }

        console.log("SSLCheckoutSelectAcc init");
        setIsServerError(false);
        try {
            const response = await checks2UFlow(44, getModel, updateModel); // 44 - unique code for SSL S2U. fundConstants.js
            console.log("checks2UFlow", response);
            const { flow, secure2uValidateData } = response;

            /** Normal flow */
            const params = { flow, secure2uValidateData, ...route?.params };
            /** Uncomment below to test for TAC flow */
            // const params = { secure2uValidateData, ...route?.params };
            // params.flow = "TAC";

            const { push } = navigation;
            isCurrentScreenDismiss.current = true;
            if (params?.flow === SECURE2U_COOLING) {
                navigateToS2UCooling(push);
            } else if (params?.flow === "S2UReg") {
                params.flowType = flow;
                push(ONE_TAP_AUTH_MODULE, {
                    screen: ACTIVATE,
                    params: {
                        flowParams: {
                            success: { stack: SSL_STACK, screen: SSL_CHECKOUT_CONFIRMATION },
                            fail: {
                                stack: SSL_STACK,
                                screen: SSL_CART_SCREEN,
                            },
                            params,
                        },
                    },
                });
            } else {
                push(SSL_CHECKOUT_CONFIRMATION, params);
            }
        } catch (e) {
            setIsServerError(true);
            console.log("SSLCheckoutSelectAcc getAcc e", e);
        }
    }, [getModel, navigation, route?.params, updateModel]);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onCloseTap() {
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            {isServerError ? (
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                backgroundColor={MEDIUM_GREY}
                                headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                        paddingTop={12}
                    >
                        <ServerError onActionBtnClick={init} />
                    </ScreenLayout>
                </ScreenContainer>
            ) : (
                <View style={styles.loaderContainer}>
                    <ScreenLoader showLoader />
                </View>
            )}
        </View>
    );
}

function ServerError({ onActionBtnClick }) {
    return (
        <View style={styles.container}>
            <EmptyState
                title="Server is busy"
                subTitle="Sorry for the inconvenience, please try again later"
                buttonLabel="Try Again"
                onActionBtnClick={onActionBtnClick}
            />
        </View>
    );
}
ServerError.propTypes = {
    onActionBtnClick: PropTypes.func,
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
});

export default withModelContext(SSLCheckoutStart);
