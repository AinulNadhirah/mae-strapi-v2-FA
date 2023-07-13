import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from "react-native";
import SwitchToggle from "react-native-switch-toggle";

import Typo from "@components/Text";
import { BLACK, WHITE, YELLOW } from "@constants/colors";
import PropTypes from "prop-types";

const TrackerWidgetCard = ({
    onInfoPressed,
    title,
    children,
    showSwitch,
    onToggleSwitch,
    switchValue,
    ...props
}) => {
    const [toggleSwitch, setToggleSwitch] = useState(switchValue);

    return (
        <View style={styles.container}>
            <View>
                <React.Fragment>
                    <View style={styles.headerContainer}>
                        <View>
                            <Typo fontWeight={"600"} textAlign={"left"}>
                                <Text>{title}</Text>
                            </Typo>
                        </View>
                        {showSwitch && (
                            <SwitchToggle
                                switchOn={toggleSwitch}
                                duration={200}
                                onPress={() => {
                                    setToggleSwitch(!toggleSwitch);
                                    onToggleSwitch(toggleSwitch);
                                }}
                                containerStyle={{
                                    marginTop: 0,
                                    width: 40,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: "#cccccc",
                                    padding: 1,
                                }}
                                circleStyle={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: "#ffffff",
                                }}
                                backgroundColorOn="#67CC89"
                                backgroundColorOff="#cccccc"
                                circleColorOff="#ffffff"
                                circleColorOn="#ffffff"
                                type={0}
                            />
                        )}

                        {/* Info icon (removed) */}
                        {/* <TouchableOpacity activeOpacity={0.5} onPress={onInfoPressed}>
								<Image
									style={{ width: 24, height: 24 }}
									source={require("@assets/icons/Tracker/iconBlackInfo.png")}
								/>
							</TouchableOpacity> */}
                    </View>
                    <View style={styles.content}>{children}</View>
                </React.Fragment>
            </View>
        </View>
    );
};

TrackerWidgetCard.propTypes = {
    onInfoPressed: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    showSwitch: PropTypes.bool.isRequired,
    onToggleSwitch: PropTypes.func.isRequired,
    switchValue: PropTypes.bool.isRequired,
};

TrackerWidgetCard.defaultProps = {
    onInfoPressed: () => {},
    imageUrl: "",
    text: "",
    showSwitch: false,
    onToggleSwitch: () => {},
    switchValue: false,
};

const Memoiz = React.memo(TrackerWidgetCard);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        marginTop: 2,
        marginBottom: 22,
        marginHorizontal: 24,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    headerContainer: {
        flexDirection: "row",
        height: 24,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 24,
    },
    cover: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 120,
        overflow: "hidden",
        width: "100%",
    },
    image: {
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
    },
});
