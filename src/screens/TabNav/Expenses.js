import React from "react";
import PropTypes from "prop-types";
import ExpensesDashboardScreen from "../Tracker/ExpensesDashboardScreen";

function ExpensesScreen({ navigation, route }) {
    return <ExpensesDashboardScreen navigation={navigation} route={route} hideBackButton />;
}

ExpensesScreen.propTypes = {
    navigation: PropTypes.object,
};

export default React.memo(ExpensesScreen);
