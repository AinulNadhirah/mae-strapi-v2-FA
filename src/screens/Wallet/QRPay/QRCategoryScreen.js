import React, { Component } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import styles from "mae/src/styles/Goals/BoostersStyle";
import commonStyle from "mae/src/styles/main";
import { getQRCategories } from "@services/index";

class QRCategoryScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            categoryData: [],
        };
        // Model.GuiltyPleasurecategoryData.categorysatartArray=[]
    }

    categoryPressed = (item, index) => {
        console.log("item pressed", item.title + item.subText);
        this.props.onDonePress(item);
    };

    categoryClose = () => {
        this.props.onClose();
    };

    componentDidMount() {
        this.loadCategories();
    }

    loadCategories = async () => {
        await getQRCategories("/qrpay/categories")
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                //this.state.categoryData = regObject.resultList;
                this.setState({ categoryData: regObject.resultList });
            })
            .catch((err) => {
                console.log("err", err);
            });
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}>
                <View style={{ flexDirection: "column" }}>
                    <Text
                        style={[styles.categorytitleLabel, commonStyle.font, { color: "#ffffff" }]}
                        accessible={true}
                        testID={"txtTabung"}
                        accessibilityLabel={"txtTabung"}
                    >
                        {"Select Category"}
                    </Text>
                    <View
                        style={{
                            justifyContent: "center",
                            marginTop: "10%",
                            height: "75%",
                        }}
                    >
                        <FlatList
                            data={this.state.categoryData}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={styles.collectioncontainer}
                                    onPress={() => {
                                        this.categoryPressed(item, index);
                                    }}
                                >
                                    <View style={styles.collectionView}>
                                        <Image
                                            style={[
                                                styles.categoryImage,
                                                { width: 60, height: 60 },
                                            ]}
                                            source={{
                                                uri: `data:image/gif;base64,${item.path}`,
                                            }}
                                            testID={"CategoryImage"}
                                            accessibilityLabel={"CategoryImage"}
                                        />
                                        <Text
                                            style={[styles.categoryText, { color: "#ffffff" }]}
                                            testID={"txtTitle"}
                                            accessibilityLabel={"txtTitle"}
                                        >
                                            {item.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            //Setting the number of column
                            numColumns={3}
                            // keyExtractor={(item, index) => index}
                        />
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        marginTop: 1,
                        marginBottom: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            this.categoryClose();
                        }}
                    >
                        <Image
                            style={[styles.categoryImage, { width: 60, height: 60 }]}
                            source={require("@assets/icons/closeIcon.png")}
                            testID={"CategoryImageClose"}
                            accessibilityLabel={"CategoryImageClose"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export { QRCategoryScreen };
