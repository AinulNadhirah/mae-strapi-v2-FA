import React from "react";

import Dashboard from "@screens/Dashboard";

//*** Currently we are using Home.js, please check on TabNavigator.js as well ***//
function DashboardScreen(props) {
    return <Dashboard {...props} />;
}

export default React.memo(DashboardScreen);
