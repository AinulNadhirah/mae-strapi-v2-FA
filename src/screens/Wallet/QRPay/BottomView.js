import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import { useSafeArea } from "react-native-safe-area-context";
import { ROYAL_BLUE } from "@constants/colors";
export const { width, height } = Dimensions.get("window");

const BottomView = ({ getTacPressed, notMinePress }) => {
    const safeArea = useSafeArea();
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                position: "absolute",
                height: 100,
                bottom: safeArea.bottom === 0 ? 110 : 150,
            }}
        >
            <View>
                <TouchableOpacity
                    style={{
                        width: width - 48,
                        height: 48,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#ffdd00",
                        borderRadius: 48,
                    }}
                    onPress={getTacPressed}
                >
                    <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Confirm" />
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={{ marginTop: 16 }} onPress={notMinePress}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        color={ROYAL_BLUE}
                        lineHeight={18}
                        text={`Not Mine`}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

BottomView.propTypes = {
    notMinePress: PropTypes.func.isRequired,
    getTacPressed: PropTypes.func.isRequired,
};

const Memoiz = React.memo(BottomView);

export default Memoiz;
