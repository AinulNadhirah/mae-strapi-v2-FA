import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import ActionButton from "@components/Buttons/ActionButton";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

const { width } = Dimensions.get("window");

function CartCheckoutBtn({ onPressViewCart, amount }) {
    return (
        <Animatable.View
            animation="fadeInUp"
            duration={300}
            useNativeDriver
            style={dissolveStyle.imageBackground}
        >
            <BottomDissolveCover>
                <View style={styles.centerContainer}>
                    <ActionButton
                        style={{ width: width - 50 }}
                        borderRadius={25}
                        onPress={onPressViewCart}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo
                                text={`View Cart • ${amount}`}
                                fontSize={14}
                                fontWeight="semi-bold"
                                lineHeight={18}
                            />
                        }
                    />
                </View>
            </BottomDissolveCover>
        </Animatable.View>
    );
}

export const styles = StyleSheet.create({
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
});

CartCheckoutBtn.propTypes = {
    onPressViewCart: PropTypes.func,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default React.memo(CartCheckoutBtn);
