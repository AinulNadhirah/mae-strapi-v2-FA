"use strict";

import React, { Component } from "react";
import ScreenContainer from "@components/Containers/ScreenContainer";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import { withModelContext } from "@context";
import { MEDIUM_GREY } from "@constants/colors";
import TransferEnterAmount from "@components/Transfers/TransferEnterAmount";
import { maskCard } from "@utils/dataModel/utility";
import { showErrorToast } from "@components/Toast";

class PayCardsEnterAmount extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        console.log("PayCardsEnterAmount", props.route.params);
        super(props);

        this.state = {
            logoTitle: props.route.params.selectedCard.name,
            logoSubtitle: maskCard(props.route.params.selectedCard.number),
            logoDescription: null,
            logoImage: props.route.params.selectedCard.image,
            maxPaymentAmount: 999999,
            minPaymentAmount: 0.01,
        };
    }

    async componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onDoneClick = async (val) => {
        console.log("onDoneClick", val);

        // if (val < 0) {
        //     showErrorToast({ message: "" });
        // }
        let params = this.prepareNavParams();
        params.extraInfo.amount = val;

        this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
            screen: navigationConstant.PAYCARDS_CONFIRMATION_SCREEN,
            params: params,
        });
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    // -----------------------
    // OTHERS
    // -----------------------

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        return navParam;
    };

    render() {
        const { logoTitle, logoSubtitle, logoDescription, logoImage } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <TransferEnterAmount
                    headerTitle={"Pay Card"}
                    logoTitle={logoTitle}
                    logoSubtitle={logoSubtitle}
                    logoDescription={logoDescription}
                    logoImage={{ type: "local", source: logoImage }}
                    instructionLabel={Strings.ENTER_AMOUNT}
                    amount={0}
                    amountPrefix={Strings.CURRENCY_CODE}
                    onDoneClick={this.onDoneClick}
                    onBackPress={this.onBackPress}
                />
            </ScreenContainer>
        );
    }
}

export default withModelContext(PayCardsEnterAmount);
