/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Platform } from "react-native";
import * as DataModel from "@utils/dataModel";
import { MyView } from "./MyView";
import PropTypes, { any } from "prop-types";
import * as Utility from "@utils/dataModel/utility";
class DropdownSelection extends Component {
    static propTypes = {
        displayLoader: PropTypes.bool,
        keyName: PropTypes.string.isRequired,
        onItemPress: PropTypes.func.isRequired,
        data: PropTypes.array,
        qrScreen: PropTypes.bool,
        unmask: PropTypes.bool,
        hideDesc: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedItem: any,
            list: [],
            rand: 100,
        };
    }
    componentDidMount() {
        console.log("componentDidMount");
        this._updateScreenData();
    }

    componentWillMount() {
        console.log("componentWillMount");
        this._updateScreenData();
    }

    componentWillUnmount() {
        console.log("componentWillMount");
    }

    _updateScreenData = () => {
        try {
            this.setState({ list: this.props.data, rand: Math.random() + 2500 });
        } catch (e) {
            //console.log(e)
        }
    };

    resetData(data) {
        try {
            this.setState({ list: [...data] });
        } catch (e) {
            //console.log(e)
        }
    }

    onItemPress = (val, index) => {
        let tempArray = this.state.list;
        for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i].id === index) {
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }

        this.setState({
            selectedItem: index,
            list: tempArray,
        });
        //this.props.onItemClick(val, index);
        setTimeout(() => {
            this.props.onItemClick(val, index);
        }, 200);
    };

    render() {
        return (
            <MyView hide={!this.props.displayLoader} style={styles.container}>
                {this.props.qrScreen ? (
                    <View style={styles.dropdownView}>
                        <FlatList
                            style={styles.flatListView}
                            onPress={() => console.log("on pressed")}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            data={this.state.list}
                            extraData={this.state.list}
                            renderItem={({ item, index }) => (
                                <View
                                    style={
                                        item.primary ? styles.itemView : styles.itemViewNotSelected
                                    }
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.onItemPress(item, index);
                                        }}
                                        style={styles.clickableItem}
                                    >
                                        <View style={styles.defaulitem}>
                                            <Text
                                                style={
                                                    item.primary
                                                        ? styles.text
                                                        : styles.textNotSelected
                                                }
                                            >
                                                {item.title}
                                            </Text>
                                            <MyView hide={!item.description}>
                                                <Text
                                                    style={
                                                        item.primary
                                                            ? styles.textDec
                                                            : styles.textDecNotSelected
                                                    }
                                                >
                                                    {this.props.unmask === true
                                                        ? Utility.getFormatedAccountNumber(
                                                              item.description.substring(0, 12)
                                                          )
                                                        : item.card === true
                                                        ? DataModel.maskCard(item.description)
                                                        : item.debitCard === true
                                                        ? DataModel.maskDCard(item.description)
                                                        : DataModel.maskAccount(
                                                              item.description.substring(0, 12)
                                                          )}
                                                </Text>
                                            </MyView>
                                        </View>
                                        <View style={styles.iconView}>
                                            <MyView hide={!item.primary}>
                                                <Image
                                                    style={styles.icon}
                                                    source={require("@assets/icons/ic_tick_black_small.png")}
                                                />
                                            </MyView>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                ) : (
                    <View style={styles.dropdownView}>
                        <FlatList
                            style={styles.flatListView}
                            onPress={() => console.log("on pressed")}
                            data={this.state.list}
                            extraData={this.state.list}
                            renderItem={({ item, index }) => (
                                <View
                                    style={
                                        item.selected ? styles.itemView : styles.itemViewNotSelected
                                    }
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.onItemPress(item, index);
                                        }}
                                        style={styles.clickableItem}
                                    >
                                        <View style={styles.defaulitem}>
                                            <Text
                                                style={
                                                    item.selected
                                                        ? styles.text
                                                        : styles.textNotSelected
                                                }
                                            >
                                                {item.type}
                                            </Text>
                                            {this.props.hideDesc === true ? null : (
                                                <MyView hide={!item.desc}>
                                                    <Text
                                                        style={
                                                            item.selected
                                                                ? styles.textDec
                                                                : styles.textDecNotSelected
                                                        }
                                                    >
                                                        {item.desc}
                                                    </Text>
                                                </MyView>
                                            )}
                                        </View>
                                        <View style={styles.iconView}>
                                            <MyView hide={!item.selected}>
                                                <Image
                                                    style={styles.icon}
                                                    source={require("@assets/icons/ic_tick_black_small.png")}
                                                />
                                            </MyView>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                )}
            </MyView>
        );
    }
}

const styles = StyleSheet.create({
    clickableItem: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        backgroundColor: "grey",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.8,
        position: "absolute",
        backgroundColor: "#000000",
    },

    defaulitem: {
        flex: 5,
        marginLeft: "2%",
    },

    dropdownView: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        width: "80%",
    },

    flatListView: {
        flexDirection: "column",
    },
    icon: {
        height: 20,
        width: 20,
    },

    iconView: {
        alignContent: "center",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    itemView: {
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        flexDirection: "row",
        height: 55,
        justifyContent: "flex-start",
        marginBottom: 2,
    },
    itemViewNotSelected: {
        alignItems: "center",
        backgroundColor: "transparent",
        borderRadius: 25,
        flexDirection: "row",
        height: 55,
        justifyContent: "flex-start",
        marginBottom: 2,
    },

    selectedview: {
        marginLeft: "2%",
    },
    text: {
        color: "black",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 24,
        marginLeft: "8%",
    },
    textDec: {
        color: "black",
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 19,
        marginLeft: "8%",
    },

    textDecNotSelected: {
        color: "white",
        color: "#ffffff",
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 19,
        marginLeft: "8%",
    },
    textNotSelected: {
        color: "white",
        color: "#ffffff",
        fontFamily: "montserrat",
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 24,
        marginLeft: "8%",
    },
});

export { DropdownSelection };
