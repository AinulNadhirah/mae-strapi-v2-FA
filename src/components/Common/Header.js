import React from "react";
import { Text, View, Image } from "react-native";
import { MyView } from "@components/Common";

//Component
const Header = (probs) => {
    const {
        textStyle,
        viewStyle,
        headerIcon,
        headerIconContainer,
        headerMenuIcon,
        headerIconBackContainer,
        transparent,
        headerClose,
        headerIconContainerF,
        yellow,
    } = styles;

    return (
        <View
            style={[
                viewStyle,
                probs.headerType === 1 || probs.headerType === 2 ? yellow : transparent,
            ]}
        >
            <View style={viewStyle}>
                <MyView style={headerIconContainerF} hide={!probs.goal}>
                    <MyView style={headerIconContainerF} hide={!probs.goal}>
                        <Image
                            style={headerIcon}
                            source={require("@assets/icons/ic_goal_image_104_black.png")}
                        />
                        <Text style={textStyle}>{probs.headerText}</Text>
                    </MyView>
                    <MyView style={headerIconContainerF} hide={!probs.goal} />
                    <View style={{ flex: 0.2 }} />
                    <Image
                        style={headerClose}
                        source={require("@assets/icons/icon_close_round_80.png")}
                    />
                </MyView>

                <MyView
                    style={headerIconContainerF}
                    hide={!probs.headerType === 3 || probs.goal || probs.walet}
                >
                    <MyView style={{ flex: 0.9, left: 20 }} hide={!probs.back}>
                        <Image
                            style={headerIcon}
                            source={require("@assets/icons/ic_arrow_left_104.png")}
                        />
                    </MyView>
                    <MyView style={{ flex: 0.9, left: 20 }} hide={probs.back} />
                    <Image
                        style={headerClose}
                        source={require("@assets/icons/icon_close_round_white_80.png")}
                    />
                </MyView>

                <MyView style={headerIconContainerF} hide={probs.goal || !probs.walet}>
                    <MyView style={headerIconBackContainer} hide={!probs.back}>
                        <Image
                            style={headerIcon}
                            source={require("@assets/icons/ic_arrow_left_104.png")}
                        />
                    </MyView>

                    <MyView style={headerIconContainer} hide={probs.headerType !== 1}>
                        <Image
                            style={headerIcon}
                            source={require("@assets/icons/ic_walet_black_104.png")}
                        />
                        <Text style={textStyle}>{probs.headerText}</Text>
                    </MyView>

                    <MyView style={headerIconContainer} hide={probs.headerType !== 1}>
                        <Image style={headerIcon} source={require("@assets/icons/ic_mp_104.png")} />
                        <Text style={textStyle}>{probs.headerText2}</Text>
                    </MyView>

                    <View style={{ flex: 0.2 }} />
                    <Image
                        style={headerMenuIcon}
                        source={require("@assets/icons/ic_menu_104.png")}
                    />
                </MyView>
            </View>
        </View>
    );
};

const styles = {
    viewStyle: {
        justifyContent: "space-around",
        alignItems: "center",
        height: 60,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        flexDirection: "row",
        width: "100%",
    },
    transparent: {
        backgroundColor: "transparent",
        shadowColor: "transparent",
    },
    yellow: {
        backgroundColor: "#fdd835",
        shadowColor: "#fdd835",
    },
    textStyle: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
    },
    headerIcon: {
        width: 25,
        height: 25,
        padding: 15,
        marginRight: 10,
    },
    headerMenuIcon: {
        width: 25,
        height: 25,
        margin: 15,
    },
    headerClose: {
        width: 17,
        height: 17,
        margin: 15,
    },
    headerIconContainer: {
        flex: 1,
        marginLeft: 25,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    headerIconContainerF: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    headerIconBackContainer: {
        flex: 1,
        marginLeft: 25,
        alignItems: "flex-star",
        justifyContent: "flex-start",
        flexDirection: "row",
    },
};

//make the Component availble to other part of the app
export { Header };
