/* eslint-disable react/jsx-no-bind */
import React, { Component } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
} from "react-native";
const { width, height } = Dimensions.get("window");
// import {UPLOAD_ACTION} from '@constants/data'
import * as ModelClass from "@utils/dataModel/modelClass";
import ImagePicker from "react-native-image-crop-picker";
import { MyView } from "./MyView";
import PropTypes from "prop-types";

//props:
// entityId
// onDataReceived
// journalParentScreen: string of parent screen name (navigation constant)

class UploadMedia extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onDataReceived: PropTypes.func.isRequired,
        displayMenu: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            showMenu: true,
        };

        this.onActionItemClick = this._onActionItemClick.bind(this);
    }
    UPLOAD_ACTION = [
        {
            id: 1,
            title: "Take Photo",
            path: require("@assets/icons/phone.png"),
        },
        {
            id: 2,
            title: "Upload Photo",
            path: require("@assets/icons/upload.png"),
        },
        // {
        //     id: 3,
        //     title: 'Share\nLocation',
        //     path: require('@assets/icons/share.png'),
        // },
    ];
    _onTextChange = (text) => {};

    componentDidMount() {
        console.log("Image loader start");
    }

    componentWillUnmount() {}

    _onActionItemClick = async (item) => {
        this.props.onClose();
        let index = item.id - 1;
        switch (index) {
            case 0:
                this.takePicture();
                break;
            case 1:
                this.PickPicture();
                break;
            case 3:
                this.shareLocation();
                break;
        }
    };

    takePicture() {
        console.log(" takePicture ");
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            includeBase64: true,
            cropping: false,
        })
            .then((image) => {
                console.log(" image ", image);
                ModelClass.COMMON_DATA.selectedImage = image.data;

                ImagePicker.clean()
                    .then(() => {
                        console.log("removed all tmp images from tmp directory");
                    })
                    .catch((e) => {
                        console.log("Error removed all tmp images from tmp directory", e);
                    });

                this.props.onDataReceived();
            })
            .catch((e) => {
                console.log("Error openPicker", e);
            });
    }

    PickPicture() {
        ImagePicker.openPicker({
            // cropping: true,
            includeBase64: true,
            compressImageQuality: 1,
            includeExif: true,
            // freeStyleCropEnabled: true,
            mediaType: "photo",
            compressImageQuality: 0.2,
        })
            .then((image) => {
                console.log(" image ", image);
                ModelClass.COMMON_DATA.selectedImage = image.data;

                ImagePicker.clean()
                    .then(() => {
                        console.log("removed all tmp images from tmp directory");
                    })
                    .catch((e) => {
                        console.log("Error removed all tmp images from tmp directory", e);
                    });

                this.props.onDataReceived();
            })
            .catch((e) => {
                console.log("Error openPicker", e);
            });
    }

    shareLocation() {}

    render() {
        return (
            <MyView hide={!this.props.displayMenu} style={Styles.menuContainer}>
                <View style={Styles.menuFullContainer}>
                    <View style={Styles.menuTopContainer} />
                    <View style={Styles.menuBottomContainer}>
                        <Text
                            style={[Styles.menuTitleText, Styles.fontLight]}
                            accessible={true}
                            testID={"txtCARD_NO"}
                            accessibilityLabel={"txtCARD_NO"}
                        >
                            {"Select Media"}
                        </Text>

                        <View style={Styles.actionContainer}>
                            <FlatList
                                data={this.UPLOAD_ACTION}
                                style={Styles.actionContainerList}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                showIndicator={false}
                                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => this.onActionItemClick(item)}
                                    >
                                        <View
                                            style={
                                                index === 0
                                                    ? Styles.actionItemFirst
                                                    : index === this.UPLOAD_ACTION.length - 1
                                                    ? Styles.actionItemLast
                                                    : Styles.actionItem
                                            }
                                        >
                                            <Image
                                                source={item.path}
                                                style={Styles.actionItemImage}
                                                resizeMode="contain"
                                            />
                                            <Text style={[Styles.actionItemTitle]}>
                                                {item.title}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                testID={"walletActionList"}
                                accessibilityLabel={"walletActionList"}
                            />
                        </View>
                    </View>
                </View>
                <View style={[Styles.footerCenterNoView]}>
                    <View style={Styles.nextButtonContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={Styles.nextButtonBottom}
                            onPress={() => this.props.onClose()}
                            accessibilityLabel={"moveToNext"}
                        >
                            <View>
                                <Image
                                    style={Styles.nextButtonBottomImage}
                                    source={require("@assets/icons/ic_close_white_circle.png")}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </MyView>
        );
    }
}

const Styles = StyleSheet.create({
    font: {
        fontFamily: "montserrat",
    },
    fontLight: {
        // fontFamily: 'montserrat_light',
        fontFamily: "montserrat",
    },
    menuContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        bottom: 0,
        flex: 1,
        flexDirection: "row",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0, // 0.5 is opacity
    },
    menuFullContainer: {
        flex: 2,
        elevation: 1,
        flexDirection: "column",
    },
    menuTopContainer: {
        // backgroundColor: '#c0e4f2',
        flex: 2.5,
    },
    menuBottomContainer: {
        //backgroundColor: '#fff',
        flex: 3.5,
    },
    menuTitleText: {
        color: "#f8f5f3",
        fontSize: 24,
        marginLeft: 35,
        marginRight: 35,
        fontWeight: "200",
        fontFamily: "montserrat",
        lineHeight: 30,
    },
    actionContainer: {
        height: 200,
        marginTop: 30,
        elevation: 1,
        flexDirection: "row",
    },
    actionContainerList: {
        elevation: 1,
    },
    actionItem: {
        backgroundColor: "#fff",
        borderRadius: 15,
        flexDirection: "row",
        flexDirection: "column",
        height: 191,
        marginLeft: 10,
        marginRight: 3,
        width: 138,
    },
    actionItemFirst: {
        backgroundColor: "#fff",
        borderRadius: 15,
        elevation: 1,
        flexDirection: "row",
        flexDirection: "column",
        height: 191,
        marginLeft: 50,
        marginRight: 3,
        width: 138,
    },

    actionItemLast: {
        width: 138,
        height: 191,
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 15,
        marginLeft: 8,
        marginRight: 50,
        flexDirection: "column",
    },
    actionItemImage: {
        marginTop: 51,
        marginLeft: 16,
        width: 77,
        height: 77,
    },
    actionItemImageSmall: {
        marginTop: 51,
        marginLeft: 16,
        width: 55,
        height: 55,
    },

    actionItemTitle: {
        color: "#000000",
        marginTop: 18,
        fontWeight: "bold",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 16,
    },

    footerCenterNoView: {
        width: "100%",
        height: 90,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 1,
        bottom: 0,
        position: "absolute",
        flexDirection: "column",
    },

    nextButtonContainer: {
        flex: 1,
        height: 50,
        marginBottom: "15%",
        marginRight: "10%",
    },
    nextButtonMarginContainer: {
        flex: 1,
        height: 50,
        marginBottom: "15%",
    },
    nextButtonBottom: {
        justifyContent: "center",
        marginLeft: 37,
    },
    nextButtonBottomImage: {
        width: 90,
        height: 90,
        borderRadius: 90 / 2,
    },
});

export { UploadMedia };
