import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";

import { LOYALTY_ADD_CARD } from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LoyaltyColorFL } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { getColourCodes } from "@services";

import { YELLOW, DISABLED, WHITE } from "@constants/colors";

let colourDetails = {};

class LoyaltyColours extends Component {
    constructor(props) {
        super(props);
        colourDetails = {};
        this.state = {
            ...colourDetails,
            selectedColor: "",
            selectedColorId: "",
            isDoneDisabled: true,
            data: [],
            selected_item: null,
        };
    }

    componentDidMount = () => {
        console.log("[LoyaltyColours] >> [componentDidMount]");
        this.getColors();
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    getColors = () => {
        getColourCodes()
            .then((response) => {
                console.log("[LoyaltyColours][loadCards] >> Success", response);
                if (response.status == "200") {
                    this.setState({ data: response.data.result });
                }
            })
            .catch((error) => {
                console.log("[LoyaltyColours][loadCards] >> Failure", error);
            });
    };

    onScreenFocus = () => {
        console.log("[LoyaltyColours] >> [onScreenFocus]");
    };

    onBackTap = () => {
        console.log("[LoyaltyColours] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[LoyaltyColours] >> [onCloseTap]");
        this.props.navigation.navigate("Dashboard", {
            screen: "Loyalty",
            params: {
                loadCards: false,
            },
        });
    };

    onColourChange = (item) => {
        console.log("[LoyaltyColours] >> [onColourChange]");
        this.setState({
            selectedColor: item.colorCode,
            selectedColorId: item.colorId,
            isDoneDisabled: false,
            selected_item: item.colorId,
        });
    };

    onConfirmTap = () => {
        console.log("[LoyaltyColours] >> [onConfirmTap]");
        this.colourDetails = this.preparecolourDetails();
        this.setState({ selectedColor: "", selectedColorId: "", isDoneDisabled: true });
        this.props.navigation.navigate(LOYALTY_ADD_CARD, {
            colourDetails: this.colourDetails,
        });
    };

    preparecolourDetails = () => {
        this.colourDetails = { ...this.state };
        console.log("LoyaltyColours >> colourDetails >> ", this.colourDetails);
        return this.colourDetails;
    };

    render() {
        console.log("[LoyaltyColours] >> [render]");
        const { data, isDoneDisabled, selected_item } = this.state;
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Select Colour"
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                >
                    <ScrollView style={styles.container}>
                        <View style={styles.fieldContainer}>
                            <View style={styles.flatList}>
                                {data && (
                                    <LoyaltyColorFL
                                        items={data}
                                        onItemPressed={this.onColourChange}
                                        selected_item={selected_item}
                                    />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                    {/* Card Confirm Button */}
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={this.onConfirmTap}
                            disabled={isDoneDisabled}
                            backgroundColor={isDoneDisabled ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Done" />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    confirmButton: {
        marginTop: 40,
    },
    container: {
        flex: 1,
    },
    flatList: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    colorBackground: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 50,
        height: 48,
        justifyContent: "center",
        width: 48,
        marginTop: 15,
        marginBottom: 15,
        shadowColor: "rgba(0, 0, 0, 0.27)",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 4,
        shadowOpacity: 1,
    },
    colorCircle: {
        alignItems: "center",
        borderRadius: 50,
        height: 42,
        justifyContent: "center",
        width: 42,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    gridboxes: {
        width: "23%",
        marginLeft: "1%",
        marginRight: "1%",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default LoyaltyColours;
