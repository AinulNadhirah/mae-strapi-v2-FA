import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";

import { PDF_VIEWER, COMMON_MODULE, MAYBANK2U } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";

import { GREY, WHITE } from "@constants/colors";
import { RECEIPT_NOTE } from "@constants/strings";

function BTStatus({ navigation, route }) {
    const [showLoader] = useState(false);
    const [isSuccess, setStatus] = useState(false);
    const [headerTxt, setHeaderTxt] = useState("");
    const [detailsData, setDetailsData] = useState([]);
    const [setServerError] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [reciptData, setReciptData] = useState([]);

    useEffect(() => {
        if (route?.params && route.params) {
            const { isSuccess, headerTxt, detailsData, serverError, errorMessage, reciptData } =
                route?.params;
            console.log(route?.params);
            init(isSuccess, headerTxt, detailsData, serverError, errorMessage, reciptData);
        }
    }, [route, init]);

    const onBTShareReceiptTap = useCallback(async () => {
        // Call custom method to generate PDF
        const file = await CustomPdfGenerator.generateReceipt(
            true,
            "Balance Transfer",
            true,
            RECEIPT_NOTE,
            reciptData,
            true,
            "success",
            "Successful"
        );
        if (file === null) {
            Alert.alert("Please allow permission");
            return;
        }

        const navParams = {
            file,
            share: true,
            type: "file",
            pdfType: "shareReceipt",
        };

        // Navigate to PDF viewer to display PDF
        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEWER,
            params: navParams,
        });
    }, [navigation, reciptData]);

    const init = useCallback(
        (isSuccess, headerTxt, detailsData, serverError, errorMessage, reciptData) => {
            console.log("[EZYPayStatus] >> [init]", isSuccess);

            if (isSuccess) setStatus(isSuccess);
            if (headerTxt) setHeaderTxt(headerTxt);
            if (detailsData) setDetailsData(detailsData);
            if (serverError) setServerError(serverError);
            if (errorMessage) setErrorMessage(errorMessage);
            if (reciptData) setReciptData(reciptData);
        },
        [setServerError]
    );

    const onContinueTap = useCallback(() => {
        console.log("[EZYPayStatus] >> [onContinueTap]");
        navigation.navigate(MAYBANK2U, {
            screen: "",
            params: {
                refresh: true,
            },
        });
    }, [navigation]);

    const onShowDetails = useCallback(() => {
        console.log("[EZYPayStatus] >> [onContinueTap]");
        onBTShareReceiptTap();
        //navigation.goBack();
    }, [onBTShareReceiptTap]);

    return (
        <AcknowledgementScreenTemplate
            isSuccessful={isSuccess}
            isSubMessage
            message={headerTxt}
            detailsData={detailsData}
            showLoader={showLoader}
            errorMessage={errorMessage}
            ctaComponents={[
                isSuccess && (
                    <ActionButton
                        key="2"
                        fullWidth
                        onPress={onShowDetails}
                        borderColor={GREY}
                        borderWidth={1}
                        borderStyle="solid"
                        backgroundColor={WHITE}
                        componentCenter={
                            <Typography
                                text="View Details"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                ),
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onContinueTap}
                    componentCenter={
                        <Typography text="Done" fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]}
        />
    );
}

BTStatus.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default BTStatus;
