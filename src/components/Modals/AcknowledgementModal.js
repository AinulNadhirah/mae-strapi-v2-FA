import React from "react";
import { View, Modal, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Assets from "@assets";

const AcknowledgementModal = ({ detailsData, message, isSuccessful, ctaComponents, showModal }) => {
    return (
        <Modal visible={showModal} animated animationType="slide" hardwareAccelerated transparent>
            <ScreenContainer backgroundType="color">
                <ScreenLayout header={<HeaderLayout />} useSafeArea neverForceInset={["bottom"]}>
                    <View style={styles.container}>
                        <Image
                            source={isSuccessful ? Assets.icTickNew : Assets.icFailedIcon}
                            style={styles.image}
                        />
                        <Typo
                            text={message}
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        <View style={styles.detailsContainer}>
                            {detailsData.map((detailData, index) => {
                                const { title, value } = detailData;
                                return (
                                    <React.Fragment key={`${title}-${index}`}>
                                        <View style={styles.detailsRowContainer}>
                                            <Typo
                                                text={title}
                                                fontSize={12}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                            <Typo
                                                text={value}
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="right"
                                            />
                                        </View>
                                        {index + 1 < detailsData.length && (
                                            <SpaceFiller height={17} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    </View>
                    {ctaComponents.map((ctaComponent) => ctaComponent)}
                </ScreenLayout>
            </ScreenContainer>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 12,
    },
    detailsContainer: {
        marginTop: 41,
        width: "100%",
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    image: {
        height: 64,
        marginBottom: 24,
        marginTop: 56,
        width: 64,
    },
});

AcknowledgementModal.propTypes = {
    detailsData: PropTypes.array,
    message: PropTypes.string,
    isSuccessful: PropTypes.bool,
    ctaComponents: PropTypes.array,
    showModal: PropTypes.bool,
};

AcknowledgementModal.defaultProps = {
    detailsData: [],
    message: "",
    isSuccessful: false,
    ctaComponents: [],
    showModal: false,
};

export default React.memo(AcknowledgementModal);
