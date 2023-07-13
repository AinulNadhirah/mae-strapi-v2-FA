import React, { Component } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";
import { BLACK, BLUE, YELLOW, WHITE, MEDIUM_GREY } from "@constants/colors";
import assets from "@assets";

export default class RadioButtons extends Component {
    state = {
        value: this.props.select,
    };

    _onItemPress = (key) => (e) => {
        this.setState({ value: key });
        this.props.onPressSortBy(key);
    };

    render() {
        const { options, windowWidth } = this.props;
        const { value } = this.state;

        return (
            <View>
                {options.map((item) => {
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={styles.container}
                            onPress={this._onItemPress(item.key)}
                        >
                            <View style={styles.rowContainer}>
                                <Image
                                    source={
                                        value === item.key
                                            ? assets.icRadioChecked
                                            : assets.icRadioUnchecked
                                    }
                                    style={styles.radioImage}
                                    resizeMode="contain"
                                />
                                <Typo
                                    fontSize={17}
                                    fontWeight="600"
                                    lineHeight={23}
                                    text={item.text}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        justifyContent: "center",
        //backgroundColor: 'yellow',
        height: 45,
    },
    radioImage: { width: 20, height: 20, marginRight: 10, marginLeft: 12 },
    rowContainer: { flexDirection: "row", alignItems: "center" },
});
