import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

const ManageListItem = ({
    title,
    onMoveUp,
    onMoveDown,
    onAdd,
    onRemove,
    availableType,
    fixed,
    showUp,
    showDown,
    disabledAdding,
    compact,
    ...props
}) => (
    <View style={[styles.container, compact && styles.compact]}>
        <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
                <Typo
                    fontWeight="600"
                    textAlign="left"
                    fontSize={14}
                    lineHeight={20}
                    text={title}
                />
            </View>
            {availableType ? (
                <TouchableOpacity
                    onPress={onAdd}
                    disabled={disabledAdding}
                    style={{
                        opacity: disabledAdding ? 0.2 : 1,
                    }}
                >
                    <Image
                        resizeMode={"contain"}
                        style={styles.iconImg}
                        source={require("@assets/icons/Tracker/iconAdd.png")}
                    />
                </TouchableOpacity>
            ) : (
                <>
                    {showUp && (
                        <TouchableOpacity onPress={onMoveUp}>
                            <Image
                                resizeMode="contain"
                                style={styles.iconImg}
                                source={require("@assets/icons/Tracker/iconMoveUp.png")}
                            />
                        </TouchableOpacity>
                    )}

                    {showDown && (
                        <TouchableOpacity onPress={onMoveDown}>
                            <Image
                                resizeMode="contain"
                                style={styles.iconImg}
                                source={require("@assets/icons/Tracker/iconMoveDown.png")}
                            />
                        </TouchableOpacity>
                    )}

                    {!fixed && (
                        <TouchableOpacity onPress={onRemove}>
                            <Image
                                resizeMode="contain"
                                style={styles.iconImg}
                                source={require("@assets/icons/Tracker/iconRemove.png")}
                            />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    </View>
);

ManageListItem.propTypes = {
    title: PropTypes.string.isRequired,
    onMoveUp: PropTypes.func.isRequired,
    onMoveDown: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    availableType: PropTypes.bool.isRequired,
    fixed: PropTypes.bool.isRequired,
    showUp: PropTypes.bool,
    showDown: PropTypes.bool,
    disabledAdding: PropTypes.bool,
    compact: PropTypes.bool,
};

ManageListItem.defaultProps = {
    title: "",
    onMoveUp: () => {},
    onMoveDown: () => {},
    onRemove: () => {},
    onAdd: () => {},
    availableType: false,
    fixed: false,
    showUp: true,
    showDown: true,
    disabledAdding: false,
    compact: false,
};

const Memoiz = React.memo(ManageListItem);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 20,
    },
    compact: {
        paddingVertical: 10,
    },
    contentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    iconImg: { width: 28, height: 28, marginLeft: 8 },
    titleContainer: { flex: 1 },
});
