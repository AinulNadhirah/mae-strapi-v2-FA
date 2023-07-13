import PropTypes from "prop-types";
import React from "react";

import { useModelController } from "@context";

import BankingDashboardScreen from "../Banking/BankingDashboardScreen";

function BankingScreen({ navigation, route }) {
    const { getModel, updateModel } = useModelController();
    return (
        <BankingDashboardScreen
            navigation={navigation}
            route={route}
            getModel={getModel}
            updateModel={updateModel}
        />
    );
}

BankingScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default React.memo(BankingScreen);
