import PropTypes from "prop-types";
import React from "react";
import { TouchableWithoutFeedback, View, Modal, StyleSheet, Dimensions } from "react-native";
import DocumentPicker from "react-native-document-picker";
import ImagePicker from "react-native-image-crop-picker";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { TRANSPARENT_DARK_BLACK, DODGER_BLUE, WHITE } from "@constants/colors";

export const screenWidth = Dimensions.get("window").width;

const handleFilename = (Generatingfilename) => {
    const Output = Generatingfilename.split("/");
    return Output[Output.length - 1];
};

const date = new Date();
const FileUploaderCamera = (props) => {
    const visible = props.visible;
    const onTap = props.onTap;
    const handleImage = props.handleImage;
    const max = props.max;
    const images = props.images;
    const setVisible = props.setVisible;

    function imageUpload() {
        try {
            ImagePicker.openPicker({
                width: 3,
                height: 4,
                cropping: false,
                includeBase64: true,
                compressImageQuality: 1,
                mediaType: "photo",
            })
                .then((image) => {
                    const Generatingfilename = image.path;

                    handleImage(
                        image,
                        `${
                            date.getDate() +
                            "/" +
                            (date.getMonth() + 1) +
                            "/" +
                            date.getFullYear() +
                            "," +
                            date.getHours() +
                            ":" +
                            date.getMinutes() +
                            ":" +
                            date.getSeconds()
                        }`,
                        "png",
                        handleFilename(Generatingfilename),
                        image.size
                    );
                    setVisible(false);
                })
                .catch(() => {
                    setVisible(false);
                    handleImage("", "", "unsupported", "", 213);
                });
        } catch (error) {
            console.log(error);
        }
    }

    function takePhoto() {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: false,
            includeBase64: true,
            compressImageQuality: 0.5,
        }).then((image) => {
            const Generatingfilename = image.path;

            handleImage(
                image,
                `${
                    new Date().getDate() +
                    "/" +
                    (new Date().getMonth() + 1) +
                    "/" +
                    new Date().getFullYear() +
                    "," +
                    new Date().getHours() +
                    ":" +
                    new Date().getMinutes() +
                    ":" +
                    new Date().getSeconds()
                }`,
                "png",
                handleFilename(Generatingfilename),
                image.size
            );
            setVisible(false);
        });
    }

    async function selectOneFile() {
        try {
            const results = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
            });
            for (const res of results) {
                handleImage(
                    res.uri,
                    `${
                        new Date().getDate() +
                        "/" +
                        (new Date().getMonth() + 1) +
                        "/" +
                        new Date().getFullYear() +
                        "," +
                        new Date().getHours() +
                        ":" +
                        new Date().getMinutes() +
                        ":" +
                        new Date().getSeconds()
                    }`,
                    "pdf",
                    res.name,
                    res.size
                );
                setVisible(false);
            }
        } catch (err) {
            //Handling any exception (If any)
            if (DocumentPicker.isCancel(err)) {
                showErrorToast({
                    message: "Canceled from multiple doc picker",
                });
            } else {
                showErrorToast({
                    message: "Unknown Error",
                });
                throw err;
            }
        }
    }

    const handleCount = (customview) => {
        if (images < max) {
            return customview;
        } else {
            return null;
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} style={styles.modalStyle}>
            <View style={styles.modalContainer}>
                <View style={styles.modalSection}>
                    <View>
                        {handleCount(
                            <View style={styles.menuList}>
                                <TouchableWithoutFeedback onPress={imageUpload}>
                                    <View style={styles.menuListCol}>
                                        <View style={styles.uploadBtn}>
                                            <Typo
                                                text="Photo Library"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={20}
                                                color={DODGER_BLUE}
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        )}
                        {handleCount(
                            <View style={styles.menuList}>
                                <TouchableWithoutFeedback onPress={selectOneFile}>
                                    <View style={styles.menuListCol}>
                                        <View style={styles.uploadBtn}>
                                            <Typo
                                                text="Document"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={20}
                                                color={DODGER_BLUE}
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        )}
                        {handleCount(
                            <View style={styles.menuList}>
                                <TouchableWithoutFeedback onPress={takePhoto}>
                                    <View style={styles.menuListCol}>
                                        <View style={styles.uploadBtn}>
                                            <Typo
                                                text="Camera"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={20}
                                                color={DODGER_BLUE}
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        )}
                        <View style={styles.menuList}>
                            <TouchableWithoutFeedback onPress={onTap}>
                                <View style={styles.menuListCol}>
                                    <View style={styles.uploadBtn}>
                                        <Typo
                                            text="Cancel"
                                            fontWeight="400"
                                            fontSize={14}
                                            lineHeight={20}
                                            color={DODGER_BLUE}
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

FileUploaderCamera.propTypes = {
    visible: PropTypes.any,
    onTap: PropTypes.func,
    handleImage: PropTypes.func,
    max: PropTypes.any,
    images: PropTypes.any,
    setVisible: PropTypes.bool,
};
const styles = StyleSheet.create({
    menuList: {
        marginBottom: "1%",
    },
    menuListCol: {
        marginHorizontal: "5%",
    },
    modalContainer: {
        backgroundColor: TRANSPARENT_DARK_BLACK,
        height: "100%",
    },
    modalSection: {
        height: "100%",
        justifyContent: "flex-end",
    },
    modalStyle: { padding: 20 },
    uploadBtn: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "column",
        height: 50,
        justifyContent: "center",
    },
});

export default FileUploaderCamera;
