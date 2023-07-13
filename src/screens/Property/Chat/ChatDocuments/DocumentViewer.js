import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, PermissionsAndroid, StyleSheet } from "react-native";
import ImageZoomViewer from "react-native-image-zoom-viewer";
import PDFView from "react-native-view-pdf";
import RNFetchBlob from "rn-fetch-blob";

import { CHAT_DOCUMENTS, LETTER_OFFER_LIST } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_OPEN_MENU,
    FA_SCREEN_NAME,
    FA_SELECT_MENU,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

const FILE_TPYE = {
    DOCUMENT: "DOCUMENT",
    IMAGE: "IMAGE",
};

const DocumentViewer = ({ navigation, route }) => {
    const documentObject = route.params?.documentObject;
    const contentType = documentObject?.contentType;
    const fileExtension = (() => {
        const split = contentType.split("/");
        return split[1];
    })();

    const fromScreen = route.params?.from;
    const ga_ScreenName = (() => {
        if (fromScreen) {
            let screenName;
            switch (fromScreen) {
                case LETTER_OFFER_LIST:
                    screenName = "Property_Documents_OfferLetter_View";
                    break;
                case CHAT_DOCUMENTS:
                    screenName = "Property_Documents_ChatDocuments_View";
                    break;
                default:
                    screenName = null;
            }
            return screenName;
        }
    })();

    const [showTopMenu, setShowTopMenu] = useState(false);
    const [menuArray, setMenuArray] = useState([]);
    const [fileType, setFileType] = useState(null);
    const [documentSource, setDocumentSource] = useState();

    useEffect(() => {
        checkFileType();
        setMenuArray([
            {
                menuLabel: "Download Document",
                menuParam: "DOWNLOAD",
            },
        ]);
    }, [checkFileType]);

    useEffect(() => {
        if (ga_ScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: ga_ScreenName,
            });
        }
    }, [ga_ScreenName]);

    const checkFileType = useCallback(() => {
        console.log("[DocumentViewer] >> [checkFileType]");

        if (
            contentType === "image/jpg" ||
            contentType === "image/png" ||
            contentType === "image/jpeg"
        ) {
            setFileType(FILE_TPYE.IMAGE);
            setDocumentSource([
                {
                    url: `data:` + `${contentType}` + `;base64,` + `${documentObject?.content}`,
                },
            ]);
        } else {
            setFileType(FILE_TPYE.DOCUMENT);
            setDocumentSource(documentObject?.content);
        }
    }, [contentType, documentObject.content]);

    function showMenu() {
        console.log("[DocumentViewer] >> [showMenu]");

        setShowTopMenu(true);

        if (ga_ScreenName) {
            logEvent(FA_OPEN_MENU, {
                [FA_SCREEN_NAME]: ga_ScreenName,
            });
        }
    }

    function closeMenu() {
        console.log("[DocumentViewer] >> [closeMenu]");
        setShowTopMenu(false);
    }

    function onBackTap() {
        console.log("[DocumentViewer] >> [onBackTap]");
        navigation.goBack();
    }

    function onTopMenuItemPress(param) {
        console.log("[DocumentViewer] >> [onTopMenuItemPress]");
        if (param === "DOWNLOAD") onPressDownloadDocument();
    }

    const onPressDownloadDocument = async () => {
        console.log("[DocumentViewer] >> [onPressDownloadDocument]");

        closeMenu();

        const permission = await checkStoragePermission();
        if (permission) downloadDocument();

        if (ga_ScreenName) {
            logEvent(FA_SELECT_MENU, {
                [FA_SCREEN_NAME]: ga_ScreenName,
                [FA_ACTION_NAME]: "Download",
            });
        }
    };

    const checkStoragePermission = async () => {
        console.log("[DocumentViewer] >> [checkStoragePermission]");

        if (Platform.OS === "ios") {
            return true;
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    showErrorToast({
                        message: "Please provide storage permission to download the file.",
                    });
                }
            } catch (error) {
                ErrorLogger(error);
                showErrorToast({
                    message: "Please provide storage permission to download the file.",
                });
            }
        }
    };

    const downloadDocument = () => {
        console.log("[DocumentViewer] >> [downloadDocument]");

        const { dirs } = RNFetchBlob.fs;
        const dirToSave = Platform.OS == "ios" ? dirs.DocumentDir : dirs.DownloadDir;
        const fileName = documentObject?.fileName ?? `MAE_Property_Chat.` + `${fileExtension}`;
        const filePath = `${dirToSave}/${fileName}`;
        const base64String = documentObject?.content;

        try {
            if (Platform.OS === "ios") {
                RNFetchBlob.fs.writeFile(filePath, base64String, "base64");
                RNFetchBlob.ios.previewDocument(filePath);
            } else if (Platform.OS == "android") {
                RNFetchBlob.fs.writeFile(filePath, base64String, "base64").then(() => {
                    RNFetchBlob.android
                        .addCompleteDownload({
                            title: fileName,
                            description: "Downloading file..",
                            mime: contentType,
                            path: filePath,
                            showNotification: true,
                            notification: true,
                        })
                        .then(() => {
                            showSuccessToast({ message: "Document downloaded successfully." });
                        })
                        .catch((error) => {
                            console.log("Error downloading image", error);
                            showErrorToast({
                                message: "Failed to download the document. Please try again later.",
                            });
                        });
                });
            }
        } catch (error) {
            ErrorLogger(error);
            showErrorToast({
                message: "Failed to download the document. Please try again later.",
            });
        }
    };

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={false}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderDotDotDotButton onPress={showMenu} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        {/* document type viewer */}
                        {fileType === FILE_TPYE.DOCUMENT && (
                            <PDFView
                                resource={documentSource}
                                resourceType="base64"
                                style={styles.pdfContainer}
                            />
                        )}

                        {/* image type viewer */}
                        {fileType === FILE_TPYE.IMAGE && (
                            <ImageZoomViewer
                                backgroundColor={MEDIUM_GREY}
                                enableImageZoom={true}
                                imageUrls={documentSource}
                                renderIndicator={() => {}}
                            />
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {showTopMenu && (
                <TopMenu
                    showTopMenu={showTopMenu}
                    onClose={closeMenu}
                    navigation={navigation}
                    menuArray={menuArray}
                    onItemPress={onTopMenuItemPress}
                />
            )}
        </>
    );
};

DocumentViewer.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    pdfContainer: {
        flex: 1,
    },
});
export default DocumentViewer;
