import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import Typo from "@components/Text";

import Boosters from "./Boosters";
import Progress from "./Progress";
import Summary from "./Summary";
import WhoIsSaving from "./WhoIsSaving";

const Overview = ({
    onBoosterItemTogglePressed,
    onBoosterTooltipPressed,
    onEsiTogglePressed,
    onManageBoosterButtonPressed,
    ...props
}) => {
    const tabungStatus = props.status ?? "";
    const didUserAlreadyWithdrawn = props.userDetails?.withdrawFull;

    return (
        <View style={styles.container}>
            {!props.isLoading && !!tabungStatus && (
                <React.Fragment>
                    <View style={styles.titleContainer}>
                        <Typo
                            text={props.name || ""}
                            fontSize={20}
                            fontWeight="600"
                            lineHeight={32}
                        />
                    </View>
                    {tabungStatus.toLowerCase() === "cancelled" || didUserAlreadyWithdrawn ? (
                        <React.Fragment>
                            <Summary {...props} />
                            <WhoIsSaving {...props} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Progress {...props} onEsiTogglePressed={onEsiTogglePressed} />
                            <WhoIsSaving {...props} />
                            <Boosters
                                {...props}
                                onBoosterItemTogglePressed={onBoosterItemTogglePressed}
                                onBoosterTooltipPressed={onBoosterTooltipPressed}
                                onManageBoosterButtonPressed={onManageBoosterButtonPressed}
                            />
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 36,
        paddingTop: 10,
    },
    titleContainer: {
        alignItems: "center",
        paddingHorizontal: 51,
        width: "100%",
    },
});

Overview.propTypes = {
    name: PropTypes.string,
    status: PropTypes.string,
    onBoosterItemTogglePressed: PropTypes.func,
    onBoosterTooltipPressed: PropTypes.func,
    onEsiTogglePressed: PropTypes.func,
    isLoading: PropTypes.bool,
    onManageBoosterButtonPressed: PropTypes.func,
    userDetails: PropTypes.object,
};

Overview.defaultProps = {
    name: "",
    status: "",
    userDetails: {},
    onBoosterItemTogglePressed: () => {},
    onBoosterTooltipPressed: () => {},
    onEsiTogglePressed: () => {},
    onManageBoosterButtonPressed: () => {},
    isLoading: true,
};

export default React.memo(Overview);
