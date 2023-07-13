import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import {
    COMMON_MODULE,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ChallengeQuestion from "@components/RSA/ChallengeQuestion";

function RSAHandler(props) {
    const { errorObj, postCallback, payload, navigation } = props;

    // RSA state
    const [state, setState] = useState({
        showRSALoader: false,
        showRSAChallengeQuestion: false,
        rsaChallengeQuestion: "",
        showRSAError: false,
        challengeRequest: {},
        rsaCount: 0,
    });

    useEffect(() => {
        handleRSAFailure(errorObj);
    }, []);

    function handleRSAFailure(error) {
        if (error.status === 428) {
            // RSA Challenge question(CQ)
            setState({
                challengeRequest: {
                    ...state.challengeRequest,
                    challenge: error.error.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.challenge.questionText,
                rsaCount: state.rsaCount + 1,
                showRSAError: state.rsaCount > 0,
            });
        } else if (error.status === 423) {
            // RSA Account Locked
            setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            // RSA Deny
            setState({
                showRSAChallengeQuestion: false,
            });
            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    }

    async function handleRSAChallengeQuestionAnswered(answer) {
        setState({ showRSAError: false, showRSALoader: true });

        const params = {
            ...payload,
            challenge: { ...state.challengeRequest.challenge, answer },
        };
        postCallback(params);
    }

    function handleRSAChallengeQuestionClosed() {
        setState({ showRSAError: false });
    }

    return (
        <>
            <ChallengeQuestion
                loader={state.showRSALoader}
                display={state.showRSAChallengeQuestion}
                displyError={state.showRSAError}
                questionText={state.rsaChallengeQuestion}
                onSubmitPress={handleRSAChallengeQuestionAnswered}
                onSnackClosePress={handleRSAChallengeQuestionClosed}
            />
        </>
    );
}

RSAHandler.propTypes = {
    errorObj: PropTypes.object,
    postCallback: PropTypes.func,
    payload: PropTypes.object,
    navigation: PropTypes.object,
    setShowLoader: PropTypes.func,
    acknowledgeParams: PropTypes.object,
};

export default RSAHandler;
