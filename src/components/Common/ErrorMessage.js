import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Button,
    ScrollView,
    ImageBackground,
} from "react-native";
import { Dialog } from "react-native-simple-dialogs";
import { MyView } from "./MyView";
import { ButtonRoundLong } from "./ButtonRoundLong";
import * as Strings from "@constants/strings";

const ErrorMessage = ({
    title,
    description,
    isError = true,
    showDefault,
    showYesNo,
    showOk,
    onClose,
    showClose = true,
    isConfirm = false,
    onOkPress,
    onYesPress,
    onNoPress,
    showCustome,
    customParam1,
    customParam2,
    showyesText,
    showNoText,
    showInfo,
    callBank,
    deleteCollection,
    buttonsError,
    onParam1Press,
    onParam2Press,
    customParam,
    onParamPress,
    okText = "OK",
    paramText,
    showMore = false,
    onMorePress,
    showButton = false,
    okIcon,
    showRemove = false,
    showRemoveText = "",
    showInfoView = false,
    isHTML = false,
}) => {
    console.log(showClose, customParam, onParamPress, showOk);
    return (
        <View style={styles.fullView}>
            {showDefault === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.title : styles.titleNormal}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showInfoView === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.title : styles.titleNormal}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showYesNo === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.yesornoContainer}>
                            <Text style={isError ? styles.yesornotext : styles.yesornotextNormal}>
                                {title}
                            </Text>
                        </View>
                        <View style={styles.yesornoDescription}>
                            <Text style={styles.yesornodescription}>{description}</Text>
                        </View>

                        <View style={styles.setup}></View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showOk === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.titleNormal : styles.title}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                marginTop: 10,
                                alignItems: "center",
                                alignContent: "center",
                                backgroundColor: "red",
                            }}
                        />
                        <View style={styles.setup}></View>

                        <View style={{ width: "100%" }}>
                            {showRemove === true &&
                            showRemoveText != undefined &&
                            showRemoveText.length >= 1 ? (
                                <View
                                    style={{
                                        alignItems: "center",
                                        alignSelf: "center",
                                        marginTop: 20,
                                    }}
                                >
                                    <TouchableOpacity onPress={onMorePress}>
                                        <Text style={[styles.titleMore, { color: "#4a91e2" }]}>
                                            {showRemoveText}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>

                        <View style={{ width: "100%" }}>
                            {showMore === true ? (
                                <View
                                    style={{
                                        alignItems: "center",
                                        alignSelf: "center",
                                        marginTop: 20,
                                    }}
                                >
                                    <Text style={styles.titleMore}>
                                        {Strings.DONT_HAVE_MAYBANK_ACCOUNT}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={{ width: "100%" }}>
                            {showMore === true ? (
                                <View
                                    style={{
                                        alignItems: "center",
                                        alignSelf: "center",
                                        marginTop: 20,
                                    }}
                                >
                                    <TouchableOpacity onPress={onMorePress}>
                                        <Text style={[styles.titleMore, { color: "#4a91e2" }]}>
                                            Create a MAE Account
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showOk === false ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.titleNormal : styles.title}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showCustome === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                    contentStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.titleContainer}>
                            <Text style={isError ? styles.titleNormal : styles.title}>{title}</Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <View
                                style={{
                                    alignItems: "center",
                                    marginRight: "10%",
                                    marginLeft: "10%",
                                }}
                            >
                                <TouchableOpacity onPress={onYesPress}>
                                    <View style={{ width: 80, height: 30, alignItems: "center" }}>
                                        <Text style={styles.customText}>
                                            {customParam1 ? customParam1 : "RETRY"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View
                                style={{
                                    alignItems: "center",
                                    marginRight: "10%",
                                    marginLeft: "10%",
                                }}
                            >
                                <TouchableOpacity onPress={onNoPress}>
                                    <View style={{ width: 80, height: 30, alignItems: "center" }}>
                                        <Text style={styles.customText}>
                                            {customParam2 ? customParam2 : "EXIT"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {showInfo === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                    contentStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.titleNormal : styles.infoTitle}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={{ marginTop: 30, width: "100%", height: "80%" }}>
                            {/* <Image
                            style={{ width: "100%", height: "100%" }}
                            source={require("@assets/images/im_info.png")}
                        /> */}
                            <ImageBackground
                                resizeMode={"contain"}
                                style={{ flex: 1 }}
                                source={require("@assets/images/im_info.png")}
                            />
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {callBank === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.titleNormal : styles.title}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <View style={styles.setup}></View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {deleteCollection === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                    contentStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={isError ? styles.title : styles.titleNormal}>
                                    {title}
                                </Text>
                            </View>
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        {description ? (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.description}>{description}</Text>
                            </View>
                        ) : null}
                        <View style={styles.deleteCollectionButtonContainer}>
                            <TouchableOpacity
                                style={styles.deleteCollectionButton}
                                onPress={onYesPress}
                            >
                                <Image
                                    style={styles.deleteCollectionButtonImage}
                                    source={require("@assets/icons/yellowTick.png")}
                                />
                                <Text
                                    style={[styles.deleteCollectionButtonText, { marginTop: 12 }]}
                                >
                                    {customParam1}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteCollectionButton}
                                onPress={onNoPress}
                            >
                                <Image
                                    style={styles.deleteCollectionButtonImage}
                                    source={require("@assets/icons/closeIcon.png")}
                                />
                                <Text
                                    style={[styles.deleteCollectionButtonText, { marginTop: 27 }]}
                                >
                                    {customParam2}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}

            {buttonsError === true ? (
                <Dialog
                    visible={true}
                    onTouchOutside={onClose}
                    animationType="fade"
                    onRequestClose={onClose}
                    dialogStyle={{ borderRadius: 10 }}
                    overlayStyle={{}}
                    contentStyle={{}}
                >
                    <View>
                        <View style={styles.block}>
                            <View style={styles.titleContainer} />
                            <View style={styles.imageContainer}>
                                <MyView hide={!showClose}>
                                    <TouchableOpacity onPress={onClose}>
                                        <Image
                                            style={styles.button}
                                            source={require("@assets/icons/ic_close.png")}
                                        />
                                    </TouchableOpacity>
                                </MyView>
                            </View>
                        </View>
                        <Text style={styles.titleText}>{title}</Text>
                        {description ? (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionText}>{description}</Text>
                            </View>
                        ) : null}
                        <View style={styles.deleteCollectionButtonContainer}>
                            <TouchableOpacity style={styles.primaryButton} onPress={onParam1Press}>
                                <Text style={[styles.primaryButtonText]}>{customParam1}</Text>
                            </TouchableOpacity>
                            {customParam2 && (
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={onParam2Press}
                                >
                                    <Text style={[styles.secondaryButtonText]}>{customParam2}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Dialog>
            ) : (
                <View />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fullView: { flexDirection: "row", flex: 1, position: "absolute", backgroundColor: "#000" },
    block: { flexDirection: "row", alignItems: "center" },
    image: {
        width: "100%",
        height: 90,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    imageContainer: { alignItems: "flex-end", flex: 1 },
    titleContainer: { alignItems: "flex-start", flex: 4 },
    yesornoContainer: { marginTop: "2%", marginLeft: "8%" },
    yesornoDescription: { marginTop: "3%", marginLeft: "8%", flexDirection: "row", flexShrink: 1 },
    yesornotext: { color: "#d0021b", fontWeight: "500", fontSize: 20, fontFamily: "montserrat" },
    yesornotextNormal: {
        color: "#000000",
        fontWeight: "500",
        fontSize: 20,
        fontFamily: "montserrat",
    },
    yesornodescription: { color: "#000000", fontSize: 16 },
    infoTitle: { color: "#000000", fontWeight: "300", fontSize: 20 },
    title: { color: "#d0021b", fontWeight: "500", fontSize: 16, fontFamily: "montserrat" },
    titleNormal: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    titleMore: { color: "#000000", fontWeight: "700", fontSize: 18, fontFamily: "montserrat" },
    descriptionContainer: { marginTop: 10 },
    description: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    button: {
        height: 40,
        width: 40,
    },
    setup: { marginTop: 20 },
    buttonContainer: { height: 40, marginTop: 20, flexDirection: "row", alignItems: "center" },
    customText: {
        color: "black",
        fontSize: 20,
        // marginTop: -10,
        fontWeight: "600",
        // height: 23,
        fontFamily: "montserrat",
        fontStyle: "normal",
        // lineHeight: 23,
        // letterSpacing: 0
    },
    deleteCollectionButtonContainer: {
        marginTop: 20,
    },
    deleteCollectionButton: {
        width: 250,
        height: 60,
        flexDirection: "row",
    },
    deleteCollectionButtonImage: {
        height: 80,
        width: 80,
        marginTop: 0,
    },
    deleteCollectionButtonText: {
        fontFamily: "montserrat",
        // fontWeight:'600',
        fontSize: 17,
        lineHeight: 23,
        color: "#000000",
    },
    primaryButton: {
        width: "100%",
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffde00",
        alignSelf: "center",
        borderRadius: 30,
        marginTop: 15,
    },
    secondaryButton: {
        width: 150,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        alignSelf: "center",
        borderRadius: 30,
        marginTop: 5,
    },
    primaryButtonText: {
        fontFamily: "montserrat",
        // fontWeight:'600',
        fontSize: 16,
        lineHeight: 24,
        color: "#171717",
    },
    secondaryButtonText: {
        fontFamily: "montserrat",
        // fontWeight:'600',
        fontSize: 16,
        lineHeight: 24,
        color: "#bcbcbc",
    },
    titleText: {
        fontFamily: "montserrat",
        fontSize: 20,
        lineHeight: 26,
        color: "#171717",
    },
    descriptionText: {
        color: "#171717",
        fontSize: 16,
        // height: 23,
        fontFamily: "montserrat",
        lineHeight: 23,
        paddingRight: 15,
        marginTop: 5,
        // letterSpacing: 0
    },
});

export { ErrorMessage };
