import React from "react";
import { View, StyleSheet, Image, Text, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";
import Assets from "@assets";
import { GREY, BLACK } from "@constants/colors";

const DropDownInput = ({ label, title, isLoading, ...props }) => {
    return (
        <View style={styles.container}>
            <Typo fontSize={14} lineHeight={18} text={label} />
            <ActionButton
                componentLeft={
                    <View style={styles.leftIcon}>
                        <Typo fontSize={14} lineHeight={18} fontWeight="600">
                            <Text>{title}</Text>
                        </Typo>
                    </View>
                }
                componentRight={
                    isLoading ? (
                        <View style={styles.rightIcon}>
                            <ActivityIndicator size="small" color={BLACK} />
                        </View>
                    ) : (
                        <View style={styles.rightIcon}>
                            <Image style={styles.image} source={Assets.icChevronDown24Black} />
                        </View>
                    )
                }
                backgroundColor={WHITE}
                borderWidth={1}
                borderColor={GREY}
                fullWidth
                {...props}
            />
        </View>
    );
};

const WHITE = "#ffffff";

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        height: 74,
        justifyContent: "space-between",
        width: "100%",
    },
    image: {
        height: 24,
        width: 24,
    },
    leftIcon: {
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: 24,
    },
    rightIcon: {
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 24,
    },
});

DropDownInput.propTypes = {
    label: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
};

DropDownInput.defaultProps = {
    isLoading: false,
};

const Memoiz = React.memo(DropDownInput);

export default Memoiz;
