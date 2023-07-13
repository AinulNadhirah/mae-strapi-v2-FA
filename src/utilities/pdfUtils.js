import { Platform } from "react-native";
import RNSafetyNet from "react-native-safety-net";
import RNFetchBlob from "rn-fetch-blob";

import { showErrorToast, showSuccessToast } from "@components/Toast";

import {
    FAILED_TO_DOWNLOAD_BROCHURE,
    DOWNLOADING_FILE,
    BROCHURE_DOWNLOADED_SUCESSFULLY,
    DOWNLOAD_FAILED,
    DOWNLOAD,
} from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

async function downloadBrochurePDF(propertyDetails, propertyID) {
    console.log("[PropertyDetails] >> [downloadBrochurePDF]");

    const { dirs } = RNFetchBlob.fs;
    const dirToSave = Platform.OS === "ios" ? dirs.DocumentDir : dirs.DownloadDir;
    const fileName = propertyDetails?.brochureName ?? `MAE_Property_${propertyID}.pdf`;

    const filePath = `${dirToSave}/${fileName}`;
    const pdfUrl = propertyDetails?.brochureUrl ?? null;

    // Mandatory value checking
    if (!pdfUrl) {
        showErrorToast({
            message: FAILED_TO_DOWNLOAD_BROCHURE,
        });
        return;
    }

    const configfb = {
        fileCache: true,
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: filePath,
    };
    const configOptions = Platform.select({
        ios: {
            fileCache: configfb.fileCache,
            title: configfb.title,
            path: configfb.path,
            appendExt: "pdf",
        },
        android: configfb,
    });
    if (Platform.OS === "ios") {
        try {
            RNFetchBlob.config(configOptions)
                .fetch("GET", pdfUrl, {})
                .then((res) => {
                    RNFetchBlob.fs.writeFile(filePath, res.data, "base64");
                    RNFetchBlob.ios.previewDocument(filePath);
                })
                .catch((error) => {
                    ErrorLogger(error);
                    showErrorToast({
                        message: FAILED_TO_DOWNLOAD_BROCHURE,
                    });
                });
        } catch (error) {
            console.warn(error);
            ErrorLogger(error);
            showErrorToast({
                message: FAILED_TO_DOWNLOAD_BROCHURE,
            });
        }
    } else if (Platform.OS === "android") {
        try {
            showSuccessToast({ message: "Downloading file..." });
            const requestObj = {
                url: pdfUrl,
                downloadTitle: fileName,
                downloadDescription: DOWNLOADING_FILE,
                downloadSuccessMsg: BROCHURE_DOWNLOADED_SUCESSFULLY,
                downloadFailedMsg: DOWNLOAD_FAILED,
                filename: fileName,
                directory: DOWNLOAD,
                folderName: "",
                showInDownloads: true,
            };
            const result = await RNSafetyNet.downloadManagerFromURL(requestObj);
            console.log("[PropertyDetails][downloadBrochurePDF] >> download result: ", result);
        } catch (error) {
            ErrorLogger(error);
            showErrorToast({
                message: FAILED_TO_DOWNLOAD_BROCHURE,
            });
        }
    }
}
export { downloadBrochurePDF };
