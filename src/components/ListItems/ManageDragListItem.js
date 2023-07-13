import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { BLACK, SPANISH_GRAY, WHITE } from "@constants/colors";

import Assets from "@assets";

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
    disabledUp,
    disabledDown,
    compact,
    disabled,
    onLongPress,
    isActive,
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                compact && styles.compact,
                !availableType && styles.paddingHorizontalForListedIcon,
                !disabled && !availableType && styles.backgroundContainer,
                styles.activeShadow(isActive),
            ]}
            onLongPress={onLongPress}
            disabled={disabled}
            activeOpacity={1}
        >
            <View style={styles.contentContainer}>
                {!availableType && onRemove && !disabled && (
                    <TouchableOpacity
                        onPress={onRemove}
                        disabled={disabled}
                        style={styles.removeIcon}
                    >
                        <Image
                            resizeMode="contain"
                            style={styles.iconImg}
                            source={Assets.dashboard.icons.remove}
                        />
                    </TouchableOpacity>
                )}

                {!availableType && props.iconImage && (
                    <>
                        <SpaceFiller width={8} />
                        <Image source={props.iconImage} style={styles.image} />
                        <SpaceFiller width={12} />
                    </>
                )}

                <View style={styles.titleContainer}>
                    <Typo
                        fontWeight="600"
                        textAlign="left"
                        fontSize={14}
                        lineHeight={20}
                        text={title}
                        color={disabled ? SPANISH_GRAY : BLACK}
                    />
                </View>
                {
                    availableType && (
                        <TouchableOpacity
                            onPress={onAdd}
                            disabled={disabledAdding}
                            style={{
                                opacity: disabledAdding ? 0.2 : 1,
                            }}
                        >
                            <Image
                                resizeMode="contain"
                                style={styles.iconImg}
                                source={require("@assets/icons/Tracker/iconAdd.png")}
                            />
                        </TouchableOpacity>
                    )
                    //     : (
                    //     !disabled && (
                    //         <>
                    //             {showUp && (
                    //                 <TouchableOpacity onPress={onMoveUp} disabled={disabledUp}>
                    //                     <Image
                    //                         resizeMode="contain"
                    //                         style={[
                    //                             styles.iconImg,
                    //                             { tintColor: disabledUp ? SPANISH_GRAY : BLACK },
                    //                         ]}
                    //                         source={require("@assets/icons/Tracker/iconMoveUp.png")}
                    //                     />
                    //                 </TouchableOpacity>
                    //             )}
                    //
                    //             <SpaceFiller width={12} />
                    //             {showDown && (
                    //                 <TouchableOpacity onPress={onMoveDown} disabled={disabledDown}>
                    //                     <Image
                    //                         resizeMode={"contain"}
                    //                         style={[
                    //                             styles.iconImg,
                    //                             { tintColor: disabledDown ? SPANISH_GRAY : BLACK },
                    //                         ]}
                    //                         source={require("@assets/icons/Tracker/iconMoveDown.png")}
                    //                     />
                    //                 </TouchableOpacity>
                    //             )}
                    //         </>
                    //     )
                    // )
                }
                {!availableType && (
                    <Image
                        resizeMode="contain"
                        style={[styles.iconImg, disabled && { tintColor: SPANISH_GRAY }]}
                        source={disabled ? Assets.lock : Assets.dashboard.icons.hamburgerIcon}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

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
    disabledUp: PropTypes.bool,
    disabledDown: PropTypes.bool,
    disabled: PropTypes.bool,
    compact: PropTypes.bool,
    onLongPress: PropTypes.func,
    isActive: PropTypes.bool,
    iconImage: PropTypes.any,
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
    disabledUp: false,
    disabledDown: false,
    disabled: false,
    compact: false,
    onLongPress: () => {},
    isActive: false,
    iconImage: "",
};

const Memoiz = React.memo(ManageListItem);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        borderRadius: 8,
        marginBottom: 8,
        marginHorizontal: 8,
    },
    backgroundContainer: {
        backgroundColor: WHITE,
    },
    compact: {
        paddingVertical: 10,
    },
    paddingHorizontalForListedIcon: {
        paddingHorizontal: 16,
    },
    image: {
        width: 36,
        height: 36,
    },
    removeIcon: {
        position: "absolute",
        marginLeft: -26,
    },
    contentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    iconImg: {
        width: 24,
        height: 24,
    },
    titleContainer: {
        flex: 1,
    },
    activeShadow: (isActive) => ({
        elevation: isActive ? 8 : 0,
        shadowRadius: isActive ? 5 : 0,
        shadowColor: isActive ? "black" : "transparent",
        shadowOpacity: isActive ? 0.2 : 0,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    }),
});
