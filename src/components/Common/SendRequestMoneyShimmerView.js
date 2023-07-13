import React from "react";
import { View } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";

import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const SendRequestMoneyShimmerView = () => {
    return (
        <View style={Styles.mainOuterView}>
            <View style={Styles.mainContainer}>
                <View style={Styles.mainContainerView}>
                    <View style={Styles.innerView}>
                        <View style={Styles.statusView}>
                            <View style={Styles.statusTextView}>
                                <ShimmerPlaceHolder
                                    autoRun
                                    visible={false}
                                    style={[Styles.statusTextView, Styles.fullWidth]}
                                />
                            </View>

                            <View style={Styles.circleCoverView}>
                                <ShimmerPlaceHolder
                                    autoRun
                                    visible={false}
                                    style={[Styles.circleView, Styles.fullWidth]}
                                />
                            </View>
                        </View>
                        <View style={Styles.titleView}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={[Styles.titleView, Styles.fullWidthSeventy]}
                            />
                        </View>
                        <View style={Styles.dateView}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={[Styles.titleView, Styles.fullWidthSeventy]}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};
const Styles = {
    fullWidth: { width: "100%" },
    fullWidthSeventy: { width: "70%" },
    statusView: {
        width: "100%",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusTextView: {
        width: 68,
        height: 21,
        borderRadius: 10.5,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        ...getShadow({
            elevation: 4, // android
        }),
    },
    circleView: {
        width: 42,
        height: 42,
        borderRadius: 42 / 2,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        backgroundColor: WHITE,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    circleCoverView: {
        width: 42,
        height: 42,
        borderRadius: 42 / 2,
        backgroundColor: WHITE,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainContainer: {
        width: "94%",
        height: 130,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 14,
        marginTop: 2,
        marginLeft: 24,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainContainerLast: {
        width: "94%",
        minHeight: 130,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 14,
        marginTop: 2,
        marginLeft: 24,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainOuterView: {
        marginRight: 24,
        marginTop: 16,
    },
    mainContainerView: {
        flex: 1,
    },
    innerView: {
        flex: 1,
        borderRadius: 12,
        marginLeft: 23,
        marginRight: 21,
    },

    titleText: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },

    dateText: {
        fontFamily: "montserrat",
        fontSize: 9,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },
    titleView: {
        marginTop: 5,
        width: "100%",
    },
    dateView: {
        marginTop: 3,
        width: "100%",
    },
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
};

export { SendRequestMoneyShimmerView };
