import PropTypes from "prop-types";
import React from "react";

import GameStatus from "@screens/Dashboard/Festives/GameStatus";

export default function Chances({ navigation, route }) {
    const { booster, campaign_status, amount } = route?.params.data;
    return (
        <GameStatus
            navigation={navigation}
            totalEarned={amount}
            isGrandPrize={campaign_status === "grand_entries"}
            isCompleted={campaign_status === "completed_entries"}
            isConsolationWeekly={booster === "true"}

            // totalEarned={amount}
            // isGrandPrize={campaign_status === "grand_entries"}
            // isCompleted={campaign_status === "completed_entries"}
            // isConsolationWeekly={booster === "true"}

            // booster
            // totalEarned={amount}
            // isGrandPrize={campaign_status === "grand_entries"}
            // isCompleted={campaign_status === "completed_entries"}
            // isConsolationWeekly={true}

            //grand
            // totalEarned={amount}
            // isGrandPrize={true}
            // isCompleted={campaign_status === "completed_entries"}
            // isConsolationWeekly={booster === "true"}

            //special
            // totalEarned={amount}
            // isGrandPrize={campaign_status === "grand_entries"}
            // isCompleted={campaign_status === "completed_entries"}
            // isConsolationWeekly={booster === "true"}

            //completed
            // totalEarned={amount}
            // isGrandPrize={campaign_status === "grand_entries"}
            // isCompleted={true}
            // isConsolationWeekly={booster === "true"}
        />
    );
}

Chances.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};
