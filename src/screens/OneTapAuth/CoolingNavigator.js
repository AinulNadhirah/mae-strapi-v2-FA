import { ACTIVATE, ONE_TAP_AUTH_MODULE, SECURE2U_COOLING } from "@navigation/navigationConstant";

import { invokeL3 } from "@services";

export const navigateToS2UCooling = (navigate, isTransaction = true, showMessage = true) => {
    const params = {
        showMessage,
        isTransaction,
    };
    navigate(ONE_TAP_AUTH_MODULE, {
        screen: SECURE2U_COOLING,
        params,
    });
};

//S2U V4
export const navigateToS2UReg = async (
    navigate,
    routeParams,
    redirect,
    getModel,
    disableBackCloseButton = false
) => {
    //Check whether user loged in before navigating to s2u register flow
    if (getModel) {
        const userDetails = getModel("user");
        const { isOnboard } = userDetails;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code !== 0) return;
        }
    }

    const params = {
        flowParams: {
            success: {
                stack: redirect?.succStack,
                screen: redirect?.succScreen,
            },
            fail: {
                stack: redirect?.failStack ? redirect?.failStack : redirect?.succStack,
                screen: redirect?.failScreen ? redirect?.failScreen : redirect?.succScreen,
            },
            params: routeParams,
        },
        disableBackCloseButton,
    };
    navigate(ONE_TAP_AUTH_MODULE, {
        screen: ACTIVATE,
        params,
    });
};
