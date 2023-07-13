import React, { Component } from "react";
import { Text, View, TouchableOpacity, ImageBackground, Alert, FlatList } from "react-native";
import PropTypes from "prop-types";

class QRAccountDetailList extends Component {
    static propTypes = {
        handleViewableItemsChanged: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            amount: "000",
            lengthError: false,
        };
        this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(this);
        this.viewabilityConfig = { viewAreaCoveragePercentThreshold: 50, minimumViewTime: 1 };
        this.renderItem = this.renderItem.bind(this);
        this.onItemClick = this._onItemClick.bind(this);
    }

    _onItemClick(index) {
        console.log("navigating to " + index);
        Alert.alert("navigating to " + JSON.stringify(index));
    }

    handleViewableItemsChanged(viewableItems) {
        console.log(viewableItems);
        if (viewableItems !== null && viewableItems[0] !== null) {
            console.log("item issss", viewableItems[0].item.description.substring(0, 12));
            // this.props.itemChange(viewableItems[0].item.description.substring(0, 12));
            this.props.handleViewableItemsChanged(
                viewableItems[0].item.description.substring(0, 12)
            );
        }
    }
    // onViewableItemsChanged = ({ viewableItems, changed }) => {
    //   //Alert.alert(JSON.stringify(viewableItems))
    //   //console.log("Visible items are", viewableItems);
    //   //console.log("Changed in this iteration", changed);
    //   //console.log("---------", viewableItems[0].item.description);
    //   itemChange(viewableItems[0].item.description);
    // }

    renderItem(item) {
        return (
            <TouchableOpacity onPress={() => this.onItemClick(item)}>
                <View style={[Styles.accHorMainView]}>
                    <View style={Styles.accFirstView}>
                        <ImageBackground
                            resizeMode={"cover"}
                            style={[Styles.accountItemImage]}
                            source={require("@assets/icons/ic_maybank_casa_small.png")}
                        >
                            <Text style={[Styles.accountNumberSmall, Styles.font]}>
                                {item.description.substring(0, 12)}
                            </Text>
                        </ImageBackground>
                    </View>
                    <View style={Styles.accSecondView}>
                        <Text style={[Styles.accountFromLabel, Styles.font]}>From</Text>

                        <Text style={[Styles.accountNameLabel, Styles.font]}>{item.title}</Text>

                        <Text style={[Styles.accountBalanceLabel, Styles.font]}>
                            {"RM " + item.value}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View>
                <FlatList
                    style={Styles.accountsFlatlist}
                    data={this.props.data}
                    horizontal={true}
                    scrollToIndex={this.props.scrollToIndex}
                    showsHorizontalScrollIndicator={false}
                    showIndicator={false}
                    keyExtractor={(item, index) => `${item.contentId}-${index}`}
                    //renderItem={({ item, index }) => renderItem(item)}
                    renderItem={({ item }) => (
                        <View style={[Styles.accHorMainView]}>
                            <View style={Styles.accFirstView}>
                                <ImageBackground
                                    resizeMode={"cover"}
                                    style={[Styles.accountItemImage]}
                                    source={require("@assets/icons/ic_maybank_casa_small.png")}
                                >
                                    <Text style={[Styles.accountNumberSmall, Styles.font]}>
                                        {item.description.substring(0, 12)}
                                    </Text>
                                </ImageBackground>
                            </View>
                            <View style={Styles.accSecondView}>
                                <Text style={[Styles.accountFromLabel, Styles.font]}>From</Text>

                                <Text style={[Styles.accountNameLabel, Styles.font]}>
                                    {item.title}
                                </Text>

                                <Text style={[Styles.accountBalanceLabel, Styles.font]}>
                                    {"RM " + item.value}
                                </Text>
                            </View>
                        </View>
                    )}
                    testID={"accountsList"}
                    accessibilityLabel={"accountsList"}
                    // onViewableItemsChanged={this.handleViewableItemsChanged}
                    viewabilityConfig={this.viewabilityConfig}
                />
            </View>
        );
    }
}

const Styles = {
    accHorMainView: {
        height: 115,
        width: 330,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 10,
    },
    accountItemImage: {
        width: 149,
        height: 120,
        marginTop: 2,
    },
    accountNumberSmall: {
        color: "#000000",
        fontWeight: "900",
        fontSize: 10,
        marginLeft: 12,
        marginTop: 34,
    },
    accountFromLabel: {
        color: "gray",
        fontWeight: "500",
        fontSize: 14,
        marginLeft: 20,
        marginTop: 10,
    },
    accountNameLabel: {
        color: "#000000",
        fontWeight: "900",
        fontSize: 13,
        marginLeft: 20,
        marginTop: 5,
    },
    accountBalanceLabel: {
        color: "#000000",
        fontWeight: "900",
        fontSize: 13,
        marginLeft: 20,
        marginTop: 8,
    },
    accFirstView: {
        flex: 1,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    accSecondView: {
        flex: 1,
        justifyContent: "flex-start",
        flexDirection: "column",
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    accountsFlatlist: {
        marginTop: 0,
    },
    font: {
        fontFamily: "montserrat",
    },
};
export default QRAccountDetailList;
