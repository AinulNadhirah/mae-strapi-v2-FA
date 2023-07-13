import PropTypes from "prop-types";
import React, { Component } from "react";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ATM_CASHOUT_CONFIRMATION,
    ATM_CASHOUT_STACK,
    ATM_PREFERRED_AMOUNT,
    MAYBANK2U,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import { SECURE2U_IS_DOWN } from "@constants/strings";

import { checks2UFlow } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

class AtmCheckPoint extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }
        // if (isS2UCompleted === false) {
        // this._checkS2UStatus();
        // this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
        //     if (this.props.route.params.isS2URegistrationAttempted)
        //         this._handlePostS2URegistration();
        // });
        // }
        const isOnboardCompleted = true;
        setTimeout(() => {
            if (isOnboardCompleted === true) {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_PREFERRED_AMOUNT,
                    params: { is24HrCompleted: true },
                });
            } else if (isOnboardCompleted === false) {
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_CASHOUT_CONFIRMATION,
                });
            }
        }, 1000);
    }

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _checkS2UStatus = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            46,
            this.props.getModel,
            this.props.updateModel
        );
        this.setState({ secure2uValidateData: secure2uValidateData });
        if (flow === SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
        } else if (flow === S2UFlowEnum.s2uReg) {
            const {
                navigation: { setParams, navigate },
            } = this.props;
            setParams({ isS2URegistrationAttempted: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: MAYBANK2U,
                            screen: "CCAEnterCardExpiryYearScreen",
                        },
                        fail: {
                            stack: MAYBANK2U,
                            screen: "",
                        },
                        params: { ...this.props.route.params },
                    },
                },
            });
        } else if (flow === S2UFlowEnum.tac) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }
    };

    _handlePostS2URegistration = async () => {
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(20, this.props.getModel, this.props.updateModel);
        const {
            route: {
                params: { isS2URegistrationAttempted },
            },
            navigation: { goBack },
        } = this.props;
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
    };
    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                    <ScreenLoader showLoader={true} bgColor="none" />
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

AtmCheckPoint.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

export default withModelContext(AtmCheckPoint);
