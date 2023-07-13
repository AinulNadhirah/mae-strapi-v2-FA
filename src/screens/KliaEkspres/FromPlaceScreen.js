import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";

import {
    MEDIUM_GREY,
    YELLOW,
    WHITE,
    GREY,
    LIGHT_YELLOW,
    BLACK,
    LIGHT_BLACK,
} from "@constants/colors";
import {
    CANCEL,
    CONTINUE,
    DONE,
    FA_PARTNER_KLIA_DESTINATION,
    FROM,
    KLIA_EKSPRES,
    PLEASE_SELECT,
    TO,
    WHERE_WOULD_YOU_LIKE_TO_GO_TO,
} from "@constants/strings";

import Assets from "@assets";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

const DropDown = ({ selectionText, onPress }) => {
    return (
        <ActionButton
            fullWidth
            height={48}
            borderWidth={1}
            borderStyle="solid"
            borderRadius={24}
            backgroundColor={WHITE}
            borderColor={GREY}
            componentLeft={
                <View style={{ marginLeft: 24 }}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={selectionText}
                        textAlign="left"
                    />
                </View>
            }
            componentRight={<Image source={Assets.downArrow} style={Styles.dropDownArrowImage} />}
            onPress={onPress}
        />
    );
};

const DropDownAndLabel = ({ label, selectionText, onPress }) => {
    return (
        <>
            <Typo fontSize={14} fontStyle="normal" letterSpacing={0} lineHeight={18} text={label} />
            <View style={Styles.dropDownContainer}>
                <DropDown selectionText={selectionText} onPress={onPress} />
            </View>
        </>
    );
};

class FromPlaceScreen extends Component {
    constructor(props) {
        super(props);
        console.log("FromPlaceScreen:", props);
        this.state = {
            isShowOverlay: false,
            fromSelectedIndex: -1,
            toSelectedIndex: -1,
        };

        const stationsList = props.route.params?.kliaInitData?.stationsList;

        this.locationList = stationsList.map((item, index) => {
            item.index = index;
            return item;
        });
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            // do something here or remove it later
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {
            // do something here or remove it later
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onDonePress = () => {
        const nextParamToPass = this.prepareNavParams();
        console.log("onDonePress", nextParamToPass);

        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: "SelectTravelDateScreen",
            params: nextParamToPass,
        });
    };

    onFromLocationPress = () => {
        console.log("onFromLocationPress");
        this.selection = "from";
        this.setState({
            isShowOverlay: true,
        });
    };
    onToLocationPress = () => {
        console.log("onToLocationPress");
        this.selection = "to";
        this.setState({
            isShowOverlay: true,
        });
    };

    onPickerSelect = (val, index) => {
        if (this.selection == "from") {
            // if same with prev selection, done change anything.
            if (this.state.fromSelectedIndex == val.index) {
                this.setState({
                    isShowOverlay: false,
                });
                return;
            }

            // reset "to"
            let toSelectedIndex = -1;

            // if "from" is select other than klsentral, set "to" -> klsentral
            if (val.index != 0) {
                toSelectedIndex = 0;
            }
            this.setState({
                isShowOverlay: false,
                fromSelectedIndex: val.index,
                toSelectedIndex: toSelectedIndex,
            });
        } else {
            this.setState({ isShowOverlay: false, toSelectedIndex: val.index });
        }
    };

    onPickerCancel = () => {
        console.log("onPickerCancel");
        this.setState({ isShowOverlay: false });
    };

    // -----------------------
    // API CALL
    // -----------------------

    // -----------------------
    // OTHER PROCESS
    // -----------------------
    getValidation = () => {
        let returnVal = true;
        if (this.state.toSelectedIndex == -1 || this.state.fromSelectedIndex == -1) {
            returnVal = false;
        }

        return returnVal;
    };

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        const fromLocation = this.locationList[this.state.fromSelectedIndex];
        const toLocation = this.locationList[this.state.toSelectedIndex];

        navParam.fromLocation = fromLocation;
        navParam.toLocation = toLocation;
        return navParam;
    };

    render() {
        const { isShowOverlay, fromSelectedIndex, toSelectedIndex } = this.state;
        const fromLabel = this.locationList[fromSelectedIndex]?.name ?? PLEASE_SELECT;
        const toLabel = this.locationList[toSelectedIndex]?.name ?? PLEASE_SELECT;

        // set array to show in picker list
        // by default just show all
        let tempListData = this.locationList;

        if (this.selection == "to") {
            if (fromSelectedIndex == 0) {
                tempListData = this.locationList.filter((item) => item.index != 0);
            } else if (fromSelectedIndex == 1 || fromSelectedIndex == 2) {
                tempListData = [this.locationList[0]];
            }
        }

        // set selected index
        let tempSelectedIndex = tempListData.indexOf(
            tempListData.find((item) => {
                if (this.selection == "to") {
                    return item.index == toSelectedIndex;
                } else {
                    return item.index == fromSelectedIndex;
                }
            })
        );

        // default delected index for array is "0"
        if (tempSelectedIndex == -1) {
            tempSelectedIndex = 0;
        }

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                // showOverlay={isShowOverlay}
                overlayType="gradient"
                analyticScreenName={FA_PARTNER_KLIA_DESTINATION}
            >
                <ScreenLayout
                    scrollable={true}
                    header={<Header onBackPress={this.onBackPress} headerTitle={KLIA_EKSPRES} />}
                >
                    <>
                        <View style={Styles.mainContainer}>
                            <View style={Styles.titleContainer}>
                                <Typo
                                    fontSize={20}
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={40}
                                    textAlign="left"
                                    text={WHERE_WOULD_YOU_LIKE_TO_GO_TO}
                                />
                            </View>
                            <View style={Styles.locationSelectionContainer}>
                                <View style={Styles.dropDownAndLabelContainer}>
                                    <DropDownAndLabel
                                        label={FROM}
                                        selectionText={fromLabel}
                                        onPress={this.onFromLocationPress}
                                    />
                                </View>
                                <View style={Styles.dropDownAndLabelContainer}>
                                    <DropDownAndLabel
                                        label={TO}
                                        selectionText={toLabel}
                                        onPress={this.onToLocationPress}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={[Styles.footerContainer]}>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={this.getValidation() ? YELLOW : LIGHT_YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={CONTINUE}
                                        color={this.getValidation() ? BLACK : LIGHT_BLACK}
                                    />
                                }
                                onPress={this.onDonePress}
                                disabled={!this.getValidation()}
                            />
                        </View>
                    </>
                </ScreenLayout>
                {isShowOverlay && (
                    <ScrollPickerView
                        showMenu={isShowOverlay}
                        list={tempListData}
                        selectedIndex={tempSelectedIndex}
                        onRightButtonPress={this.onPickerSelect}
                        onLeftButtonPress={this.onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
            </ScreenContainer>
        );
    }
}

FromPlaceScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

FromPlaceScreen.defaultProps = {
    navigation: {},
};

export default FromPlaceScreen;

const Styles = {
    mainContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    titleContainer: {
        paddingTop: 38,
        alignItems: "flex-start",
    },
    locationSelectionContainer: {
        // paddingTop: 24,
        // alignItems: "flex-start",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    dropDownArrowImage: {
        width: 15,
        height: 8,
        marginRight: 20,
        resizeMode: "contain",
    },
    dropDownContainer: {
        width: "100%",
        paddingTop: 12,
    },
    dropDownAndLabelContainer: {
        paddingTop: 24,
        alignItems: "flex-start",
    },
};
