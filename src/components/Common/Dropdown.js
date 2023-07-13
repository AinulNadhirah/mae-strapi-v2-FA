/* eslint-disable react-native/sort-styles */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-color-literals */
/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Image,
} from "react-native";
import { MyView } from "./MyView";
import PropTypes, { any } from "prop-types";

class Dropdown extends Component {
    static propTypes = {
        displayLoader: PropTypes.bool,
        keyName: PropTypes.string.isRequired,
        onDonePress: PropTypes.func.isRequired,
        data: PropTypes.array,
        showTick: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedItem: any,
        };
    }
    componentDidMount() {
        console.log("Compoment didmount called");
    }

    render() {
        return (
            <MyView hide={!this.props.displayLoader} style={styles.container}>
                <View style={styles.dropdownView}>
                    {/* <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent : 'center', alignItems:"center"}}> */}
                    <FlatList
                        onPress={() => console.log("on pressed")}
                        initialScrollIndex={
                            this.props.index && this.props.showTick ? this.props.index : 0
                        }
                        // getItemLayout={(data, index) => ({ length: 55, offset: 55 * index, index })}
                        onScrollToIndexFailed={() => {}}
                        ref={(ref) => {
                            this.flatlist = ref;
                        }}
                        data={this.props.data}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    this.onDonePress(item, index);
                                }}
                            >
                                <View style={this.textStyle(index)}>
                                    <Text
                                        style={
                                            this.state.selectedItem == index
                                                ? styles.textItem
                                                : styles.item
                                        }
                                    >
                                        {item[this.props.keyName]}
                                    </Text>
                                    {this.state.selectedItem == index ? (
                                        <Image
                                            source={require("@assets/icons/yellowTick.png")}
                                            style={styles.tickimage}
                                        />
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    {/* </ScrollView> */}
                </View>
            </MyView>
        );
    }

    onDonePress(val, index) {
        this.setState({
            selectedItem: index,
        });

        setTimeout(() => {
            this.setState({
                selectedItem: any,
            });
            this.props.onDonePress(val, index);
        }, 200);
    }

    textStyle(index) {
        return this.state.selectedItem == index ? styles.selectedview : styles.defaulitem;
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        bottom: 0,
        flex: 1,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        paddingTop: "10%",
        top: 0, // 0.5 is opacity
    },
    defaulitem: {
        alignItems: "center",
        backgroundColor: "transparent",
        flexDirection: "row",
        height: 55,
        marginLeft: "15%",
        width: "90%",
    },

    dropdownScorelView: {
        alignItems: "center",
        backgroundColor: "transparent",
    },
    dropdownView: {
        // position: "absolute",
        //flex: 1,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "transparent",
        marginBottom: 8,
    },

    item: {
        color: "white",
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: "15%",
        width: "60%",
    },
    selectedview: {
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        borderWidth: 0.1,
        flexDirection: "row",
        height: 55,
        marginLeft: "15%",
        shadowColor: "transparent",
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 2,
        width: "75%",
    },

    textItem: {
        color: "#000",
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: "15%",
        width: "60%",
    },
    tickimage: {
        height: 35,
        marginTop: 3,
        width: 35,
    },
});

export { Dropdown };
