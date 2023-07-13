import PropTypes from "prop-types";
import React, { Component } from "react";

import { PUSH_STATUS } from "@navigation/navigationConstant";

import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY } from "@constants/colors";
import {
    SUCC_STATUS,
    FAIL_STATUS,
    TRANSACTION_SUCCESS,
    TRANSACTION_UNSUCCESS,
    S2U_AUTHORISATION_HAS_EXPIRED,
} from "@constants/strings";

class PushAuthentication extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "failure", // success | failure
            headerText: "Secure2u authorisation",
            serverError: false,
            transferParams: {},
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            secure2uExtraParams: null,
            detailsArray: [],
            showLoaderModal: false,
            showErrorModal: false,
            seletedAmount: "",
            s2uFlow: "PUSH",
            pushData: {},
            appState: "",
        };
    }

    async componentDidMount() {
        this.showS2uModal();
    }

    /***
     * showS2uModal()
     * show S2u modal to approve the Transaction
     */
    showS2uModal = () => {
        console.log(
            "[PushAuthentication] >> [showS2uModal] PushData : ",
            this.props.route.params?.pushData
        );
        //Show S2U Model update the payload
        this.setState(
            {
                pushData: this.props.route.params?.pushData,
                appState: this.props.route.params?.appState,
                transactionDetails: [],
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    /***
     * onS2uDone()
     * Handle S2U Approval or Rejection Flow
     */
    onS2uDone = (response) => {
        console.log("[PushAuthentication] >> [onS2uDone] response ", response);
        // let { transferParams } = this.state;
        const { transactionStatus, s2uSignRespone, pushData } = response;

        // Close S2u popup
        this.onS2uClose();
        this.setState({ showLoaderModal: false });

        if (response?.isV4) {
            this.handleV4Push(response);
            return;
        }
        const { text, status } = s2uSignRespone;
        const FPXobj = this.getFPXStatus(pushData);
        const pushDataArr = FPXobj?.pushData ?? pushData;
        if (transactionStatus) {
            // Show success page
            const header = FPXobj?.status
                ? "Your Secure2u approval is completed"
                : TRANSACTION_SUCCESS;
            const serverError = FPXobj?.status ? this.processString(FPXobj.value) : null;

            this.props.navigation.navigate("PushStatus", {
                headerText: header,
                status: SUCC_STATUS,
                details: pushDataArr,
                serverError: serverError,
                errorMessge: null,
                appState: this.state.appState,
            });
        } else {
            const serverError = text || "";
            // Show Failure page when timeout
            if (status === "M408") {
                this.props.navigation.navigate("PushStatus", {
                    headerText: TRANSACTION_UNSUCCESS,
                    status: FAIL_STATUS,
                    details: pushDataArr,
                    serverError: null,
                    appState: this.state.appState,
                });

                showErrorToast({
                    message: S2U_AUTHORISATION_HAS_EXPIRED,
                });
            } else {
                // Show Failure page
                this.props.navigation.navigate("PushStatus", {
                    headerText: TRANSACTION_UNSUCCESS,
                    status: FAIL_STATUS,
                    details: pushDataArr,
                    serverError: serverError || "",
                    appState: this.state.appState,
                });
            }
        }
    };

    handleV4Push = (response) => {
        const { transactionStatus, v4Details } = response;
        const { title, description, details } = v4Details;
        this.props.navigation.navigate(PUSH_STATUS, {
            headerText: title || "",
            status: transactionStatus ? SUCC_STATUS : FAIL_STATUS,
            details: details || false,
            serverError: description || "",
            appState: this.state.appState,
        });
    };

    /***
     * onS2uClose()
     * close S2u Auth Model
     */
    onS2uClose = () => {
        // will close tac popup
        console.log("[PushAuthentication] >> [onS2uClose]");
        this.setState({ showS2u: false });
    };

    getFPXStatus = (pushData) => {
        let isFPX = false;
        let msg = "";
        let s2uAckDetails = [];
        const requiredPushData = pushData ?? [];
        console.log(requiredPushData);
        requiredPushData.forEach((k) => {
            if (k.label.indexOf("__") > -1) {
                //start with __ need to omit expect __OBJ__
                isFPX = true;
                msg = k.label.indexOf("__obj__") > -1 ? k?.value?.successMsg : "";
            } else {
                s2uAckDetails.push({
                    label: k.label,
                    value: k.value,
                });
            }
        });
        return { status: isFPX, value: msg, pushData: s2uAckDetails };
    };

    processString = (str) => {
        const msg =
            str && str.split("<br/>").length >= 1
                ? str.split("<br/>")[1].replace(/(<([^>]+)>)/gi, "")
                : "";
        return msg;
    };

    render() {
        const { showErrorModal, showLoaderModal } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showErrorModal={showErrorModal}
                showLoaderModal={showLoaderModal}
            >
                <React.Fragment></React.Fragment>

                {this.state.showS2u && (
                    <Secure2uAuthenticationModal
                        token={this.state.pollingToken}
                        amount={this.state.seletedAmount}
                        pushData={this.state.pushData}
                        onS2UDone={this.onS2uDone}
                        onS2UClose={this.onS2uClose}
                        s2uFlow={this.state.s2uFlow}
                        transactionDetails={this.state.s2uTransactionDetails}
                        extraParams={this.state.secure2uExtraParams}
                    />
                )}
            </ScreenContainer>
        );
    }
}

PushAuthentication.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            pushData: PropTypes.any,
            appState: PropTypes.string,
        }),
    }),
};

export default PushAuthentication;
