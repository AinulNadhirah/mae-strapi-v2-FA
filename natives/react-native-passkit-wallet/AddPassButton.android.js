import PropTypes from "prop-types";
import * as React from "react";
import { View, ViewPropTypes } from "react-native";

/**
 * @flow
 */
("use strict");

export class AddPassButton extends React.Component<*> {
    static propTypes = {
        ...(ViewPropTypes || View.propTypes),
        addPassButtonStyle: PropTypes.number,
        onPress: PropTypes.func,
    };

    componentDidMount(): void {}

    render(): React.Node {
        return null;
    }
}
