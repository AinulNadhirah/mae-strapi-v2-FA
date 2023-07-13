import PropTypes from "prop-types";
import React from "react";
import { Text, View, Image } from "react-native";
import TouchableDebounce from "./TouchableDebounce";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderLabel from "@components/Label/HeaderLabel";
import { MyView } from "./MyView";
import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

const HeaderPageIndicator = ({
    showBack,
    showClose,
    showMenu,
    showMore,
    showRightShare = false,
    showShare = false,
    showRefresh = false,
    showSearch,
    showIndicator,
    showTitle,
    pageTitle,
    showTitleCenter = false,
    showBackIndicator,
    showLeftFill = false,
    isWhiteIcon = false,
    numberOfPages = 0,
    currentPage = 0,
    routeName,
    navigation,
    onBackPress,
    onMorePress,
    onClosePress,
    noPop,
    noClose,
    moduleName,
    reSet = false,
    titleFontSize = undefined,
    titleFontColor = undefined,
    showReload = false,
    onReloadPress,
}) => {
    // /////////////////////

    const getShowBackUI = () => {
        return (
            <MyView hide={!showBack}>
                <MyView hide={!showBack}>
                    <TouchableDebounce
                        style={Styles.buttonView}
                        // onPress={onBackPress}
                        onPress={() => {
                            if (!noPop) {
                                // console.log(' pop isss')
                                navigation.pop();
                            } else {
                                console.log("back pop");
                                onBackPress();
                            }
                        }}
                        accessibilityLabel={"backButton"}
                    >
                        <Image
                            style={Styles.button}
                            source={
                                isWhiteIcon
                                    ? require("@assets/icons/ic_back_white.png")
                                    : require("@assets/icons/ic_back_black.png")
                            }
                        />
                    </TouchableDebounce>
                </MyView>
            </MyView>
        );
    };

    const getShowLeftFillUI = () => {
        return <MyView hide={!showLeftFill} />;
    };

    const getShowMenuUI = () => {
        return (
            <MyView hide={!showMenu}>
                <MyView hide={!showMenu}>
                    <TouchableDebounce
                        style={Styles.buttonView}
                        // onPress={onBackPress}
                        onPress={() => {
                            if (!noPop) {
                                navigation.pop();
                            } else {
                                onBackPress();
                            }
                        }}
                        accessibilityLabel={"menuIcon"}
                    >
                        <Image
                            style={Styles.button}
                            source={require("@assets/icons/menuBlack3x.png")}
                        />
                    </TouchableDebounce>
                </MyView>
            </MyView>
        );
    };

    const getShowShareUI = () => {
        return (
            <MyView hide={!showShare}>
                <MyView hide={!showShare}>
                    <TouchableDebounce
                        style={Styles.buttonView}
                        onPress={onMorePress}
                        accessibilityLabel={"btnShare"}
                    >
                        <Image
                            style={Styles.button}
                            source={require("@assets/icons/ic_share_black.png")}
                        />
                    </TouchableDebounce>
                </MyView>
            </MyView>
        );
    };

    const getShowRefreshUI = () => {
        return (
            <MyView hide={!showRefresh}>
                <MyView hide={!showRefresh}>
                    <TouchableDebounce
                        style={Styles.buttonView}
                        onPress={onMorePress}
                        accessibilityLabel={"btnShare"}
                    >
                        <Image
                            style={Styles.button}
                            source={require("@assets/icons/ic_refresh_black.png")}
                        />
                    </TouchableDebounce>
                </MyView>
            </MyView>
        );
    };

    const getShowTitle = () => {
        return (
            <MyView
                hide={!showTitle}
                style={showTitleCenter ? Styles.titleViewCenter : Styles.titleView}
            >
                {/* <Text
					style={[
						isWhiteIcon ? Styles.titleLabelWhite : Styles.titleLabel,
						{
							color: titleFontColor != undefined ? titleFontColor : isWhiteIcon ? "#fff" : "#000000",
							fontSize: titleFontSize != undefined ? titleFontSize : 20
						}
					]}
					accessible={true}
					testID={"txtPageTitle"}
					accessibilityLabel={"txtPageTitle"}
				>
					{pageTitle}
				</Text> */}
                <HeaderLabel>
                    <Text style={{ color: isWhiteIcon ? "#ffffff" : "#000000" }}>{pageTitle}</Text>
                </HeaderLabel>
            </MyView>
        );
    };

    const getShowIndicatorUI = () => {
        return (
            <MyView style={Styles.centerView} hide={!showIndicator}>
                <MyView hide={!showIndicator} style={Styles.centerViewContainer}></MyView>
            </MyView>
        );
    };

    const getLeftView = () => {
        return (
            <View style={Styles.leftView}>
                {getShowBackUI()}
                {getShowLeftFillUI()}
                {getShowMenuUI()}
                {getShowShareUI()}
                {getShowRefreshUI()}
            </View>
        );
    };

    const getMiddleView = () => {
        return (
            <React.Fragment>
                {getShowTitle()}
                {getShowIndicatorUI()}
            </React.Fragment>
        );
    };

    const getRightView = () => {
        return (
            <View style={Styles.rightView}>
                <MyView hide={!showClose}>
                    <TouchableDebounce
                        onPress={
                            noClose == true
                                ? () => {
                                      onClosePress();
                                  }
                                : () => {
                                      /**
                                       * TODO: need to refactor.
                                       * If the intention is to go back to dashboard, navigate to TAB_NAVIGATOR
                                       * with screen 'Dashboard' as params
                                       *
                                       * If to go to specific screen, do the same as above but use moduleName as route name
                                       * and the route name as the screen in params
                                       */
                                      console.log("moduleName Name is", moduleName);
                                      console.log("Route Name is", routeName);
                                      if (reSet) {
                                          onClosePress();
                                      }

                                      navigation.navigate(TAB_NAVIGATOR, {
                                          screen: "Dashboard",
                                      });

                                      // const navigationAction = CommonActions.reset({
                                      // 	index: 0,
                                      // 	routes: [
                                      // 		{
                                      // 			name: moduleName,
                                      // 			state: {
                                      // 				routes: [
                                      // 					{
                                      // 						name: routeName
                                      // 					}
                                      // 				]
                                      // 			}
                                      // 		}
                                      // 	]
                                      // });

                                      // navigation.dispatch(navigationAction);
                                  }
                            // navigation.popToTop(routeName)
                        }
                        style={Styles.buttonViewClose}
                        accessibilityLabel={"backClose"}
                    >
                        <Image
                            style={Styles.button}
                            source={
                                isWhiteIcon
                                    ? require("@assets/icons/ic_close_white.png")
                                    : require("@assets/icons/ic_close.png")
                            }
                        />
                    </TouchableDebounce>
                </MyView>

                <MyView hide={!(showMore ? showMore : false)}>
                    <TouchableDebounce
                        onPress={onMorePress}
                        style={Styles.buttonView}
                        accessibilityLabel={"moreButton"}
                    >
                        <Image
                            style={Styles.button}
                            source={
                                isWhiteIcon
                                    ? require("@assets/icons/ic_more_white.png")
                                    : require("@assets/icons/ic_more_black.png")
                            }
                        />
                    </TouchableDebounce>
                </MyView>

                <MyView hide={!(showReload ? showReload : false)}>
                    <TouchableDebounce
                        onPress={onReloadPress}
                        style={Styles.buttonView}
                        accessibilityLabel={"moreButton"}
                    >
                        <Image
                            style={Styles.button2}
                            source={require("@assets/icons/refresh.png")}
                        />
                    </TouchableDebounce>
                </MyView>

                <MyView hide={!(showRightShare ? showRightShare : false)}>
                    <TouchableDebounce
                        onPress={onMorePress}
                        style={Styles.buttonView}
                        accessibilityLabel={"showRightShare"}
                    >
                        <Image
                            style={Styles.button}
                            source={require("@assets/icons/ic_share_black.png")}
                        />
                    </TouchableDebounce>
                </MyView>

                <MyView hide={!(showSearch ? showSearch : false)}>
                    <TouchableDebounce
                        onPress={onMorePress}
                        style={Styles.buttonView}
                        accessibilityLabel={"searchButton"}
                    >
                        <Image
                            resizeMode="contain"
                            style={Styles.button1}
                            source={require("@assets/icons/ic_search.png")}
                        />
                    </TouchableDebounce>
                </MyView>
            </View>
        );
    };
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={12}
            horizontalPaddingCustomRightValue={12}
            headerLeftElement={getLeftView()}
            headerCenterElement={getMiddleView()}
            headerRightElement={getRightView()}
        />
    );
    //
    /*

	*/
    // //////////////////
};

HeaderPageIndicator.propTypes = {
    currentPage: PropTypes.number,
    isWhiteIcon: PropTypes.bool,
    moduleName: PropTypes.any,
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
        pop: PropTypes.func,
    }),
    noClose: PropTypes.bool,
    noPop: PropTypes.any,
    numberOfPages: PropTypes.number,
    onBackPress: PropTypes.func,
    onClosePress: PropTypes.func,
    onMorePress: PropTypes.any,
    onReloadPress: PropTypes.any,
    pageTitle: PropTypes.any,
    reSet: PropTypes.bool,
    routeName: PropTypes.any,
    showBack: PropTypes.any,
    showBackIndicator: PropTypes.any,
    showClose: PropTypes.any,
    showIndicator: PropTypes.any,
    showLeftFill: PropTypes.bool,
    showMenu: PropTypes.any,
    showMore: PropTypes.any,
    showRefresh: PropTypes.bool,
    showReload: PropTypes.bool,
    showRightShare: PropTypes.bool,
    showSearch: PropTypes.any,
    showShare: PropTypes.bool,
    showTitle: PropTypes.any,
    showTitleCenter: PropTypes.bool,
    titleFontColor: PropTypes.any,
    titleFontSize: PropTypes.any,
};

const Styles = {
    container: {
        // flexDirection: "row",
        // position: "relative",
        // // backgroundColor: "green",
        // height: 50,
        // width: "100%",
        // marginLeft: 20,
        // marginTop: 30
    },
    leftView: {
        // flexDirection: "row",
        // flex: 1,
        // alignItems: "center",
        // justifyContent: "flex-start",
        // elevation: 1,
        //   backgroundColor: "green",
        // marginTop: 10
        // borderWidth: 1,
        // borderColor: "green"
    },

    centerViewContainer: {
        // flexDirection: "row",
        // flex: 1,
        // backgroundColor: "blue",
        // alignItems: "center",
        // justifyContent: "flex-start"
        // borderWidth: 1,
        // borderColor: "yellow"
    },
    titleView: {
        // flexDirection: "row",
        // flex: 5,
        // marginLeft: 30,
        // // backgroundColor: "green",
        // alignItems: "center",
        // justifyContent: "flex-start"
    },

    titleViewCenter: {
        // flexDirection: "row",
        // marginLeft: 5,
        // // backgroundColor: "yellow",
        // alignItems: "center",
        // justifyContent: "center",
        // borderWidth: 1,
        // borderColor: "blue"
    },
    centerView: {
        // flexDirection: "row",
        // flex: 5,
        // // backgroundColor: "yellow",
        // alignItems: "center",
        // justifyContent: "center"
    },
    rightView: {
        // flexDirection: "row",
        // justifyContent: "flex-end",
        // flex: 1,
        // marginRight: 20,
        // // backgroundColor: "yellow",
        // marginTop: 10
        // borderWidth: 1,
        // borderColor: "red"
    },
    button: {
        height: 44,
        width: 44,
    },

    button1: {
        height: 26,
        width: 26,
    },
    button2: {
        height: 26,
        width: 26,
        marginTop: 10,
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
    },
    buttonView: {
        height: 44,
        width: 44,
        // alignItems: "center",
        // // backgroundColor: "yellow",
        // justifyContent: "center"
    },
    buttonViewClose: {
        height: 44,
        width: 44,
        // alignItems: "center",
        // // backgroundColor: "yellow",
        // justifyContent: "center",
        // marginTop: -2
    },
    titleLabel: {
        // color: "#000000",
        // // fontFamily: "montserrat_semibold",
        // fontFamily: "montserrat",
        // fontSize: 20,
        // fontWeight: "600",
        // fontStyle: "normal",
        // lineHeight: 19,
        // letterSpacing: 0,
        // textAlign: "left"
    },
    titleLabelWhite: {
        // color: "#fff",
        // // fontFamily: "montserrat_semibold",
        // fontFamily: "montserrat",
        // fontSize: 20,
        // fontWeight: "600",
        // fontStyle: "normal",
        // lineHeight: 20,
        // letterSpacing: 0,
        // textAlign: "center",
        // // textAlign: "left",
        // marginLeft: 0,
        // marginTop: 1
    },
};

export { HeaderPageIndicator };
