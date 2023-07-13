import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import PDFView from "react-native-view-pdf";
import { useDispatch, useSelector } from "react-redux";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY } from "@constants/colors";

import Assets from "@assets";

import {
    singleApplicantbookingDeletereducer,
    nricFrontApplicantbookingDeletereducer,
} from "../../../../redux/reducers/ASBFinance/SingleApplicantbookingform";

const Documentviewer = ({ navigation, route }) => {
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState(0);

    const { name, Data, Id, From } = route.params;
    const dispatch = useDispatch();

    const { Data: Singleapplicantbooking } = useSelector(
        (state) => state.SingleApplicantbookingform
    );
    function handleDelete() {
        setShowModal(false);
        navigation.goBack();
        if (From === "Applicantsingle") {
            dispatch(nricFrontApplicantbookingDeletereducer(id));
            showErrorToast({
                message: "Document deleted",
            });
        } else if (From === "OtherApplicantSingle") {
            dispatch(singleApplicantbookingDeletereducer(id));
            showErrorToast({
                message: "Document deleted",
            });
        } else {
            dispatch(singleApplicantbookingDeletereducer(id));
            showErrorToast({
                message: "Document deleted",
            });
        }
    }

    function grabbingIdfordeleting() {
        setShowModal(true);
        setId(Id);
    }

    function getPdfURL() {
        let Filteredata;

        if (From === "Applicantsingle") {
            Filteredata = Singleapplicantbooking.nricFrontImages.filter((data) => data.id === Id);
        } else if (From === "OtherApplicantSingle") {
            Filteredata = Singleapplicantbooking.images.filter((data) => data.id === Id);
        } else {
            Filteredata = Singleapplicantbooking.images.filter((data) => data.id === Id);
        }

        if (
            Filteredata &&
            Filteredata.length > 0 &&
            Filteredata[0] &&
            Filteredata[0].Filetype === "pdf"
        ) {
            return Filteredata[0].dataRes;
        }
    }

    function onBackTap() {
        navigation.goBack();
    }
    function handleClose() {
        setShowModal(false);
    }

    return (
        <ScreenContainer backgroundType="color" style={styles.container}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                text="Upload Documents"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerRightElement={
                            <TouchableOpacity onPress={grabbingIdfordeleting}>
                                <Image source={Assets.Delete} />
                            </TouchableOpacity>
                        }
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                {name.split(".")[1] === "pdf" ? (
                    <View style={styles.viewSyle}>
                        <PDFView
                            fadeInDuration={250.0}
                            style={styles.viewSyle}
                            resource={getPdfURL()}
                            resourceType="url"
                        />
                    </View>
                ) : (
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${Data}` }}
                        style={styles.imageSyle}
                    />
                )}

                <Popup
                    visible={showModal}
                    onClose={handleClose}
                    title="Delete Document?"
                    description="You will not be able to recover the deleted document. Are you sure you want to delete?"
                    primaryAction={{
                        text: "Delete",
                        onPress: handleDelete,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: handleClose,
                    }}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

Documentviewer.propTypes = {
    navigation: PropTypes.any,
    route: PropTypes.any,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: MEDIUM_GREY,
    },
    imageSyle: {
        height: "100%",
        width: "100%",
    },
    viewSyle: {
        flex: 1,
    },
});

export default Documentviewer;
