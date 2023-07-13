import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { BLACK } from "@constants/colors";

import Assets from "@assets";

const AcknowledgementScreenTemplate = ({
    detailsData,
    message,
    isSuccessful,
    isSubMessage,
    ctaComponents,
    showLoader,
    errorMessage,
    img,
    ContentComponent,
    onCloseBtnPress,
    showCloseBtn,
    amount,
}) => {
    const { updateModel } = useModelController();
    const [statusImg, setStatusImg] = useState("");

    const onClosePress = useCallback(() => onCloseBtnPress());

    useEffect(() => {
        getImage();
        if (isSuccessful)
            updateModel({
                dashboard: {
                    refresh: true,
                },
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccessful]);

    const getImage = () => {
        if (img) setStatusImg(img);
        else setStatusImg(isSuccessful ? Assets.icTickNew : Assets.icFailedIcon);
    };

    return (
        <ScreenContainer backgroundType="color" showLoaderModal={showLoader}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={
                            showCloseBtn ? <HeaderCloseButton onPress={onClosePress} /> : null
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <Image source={statusImg} style={styles.image} />
                        <Typo
                            text={message}
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                        />
                        {isSuccessful && amount && (
                            <Typo
                                text={amount}
                                fontWeight="bold"
                                fontSize={30}
                                style={styles.amountToDisplay}
                                lineHeight={30}
                                textAlign="left"
                                color={BLACK}
                            />
                        )}
                        {(!isSuccessful || isSubMessage) && (
                            <React.Fragment>
                                <SpaceFiller height={8} />
                                {ContentComponent && React.isValidElement(<ContentComponent />) ? (
                                    <ContentComponent />
                                ) : (
                                    <Typo
                                        text={errorMessage}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        color="#787878"
                                    />
                                )}
                            </React.Fragment>
                        )}
                        <View
                            style={
                                !isSuccessful
                                    ? [styles.detailsContainer, { marginTop: 31 }]
                                    : styles.detailsContainer
                            }
                        >
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
                                                style={styles.detailsRowText}
                                            />
                                            <Typo
                                                text={value}
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="right"
                                                style={styles.detailsRowText}
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
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.ctaContainer}>
                        {ctaComponents.map((ctaComponent, index) => (
                            <React.Fragment key={`${index}`}>
                                {ctaComponent}
                                {index + 1 < ctaComponents.length && <SpaceFiller height={17} />}
                            </React.Fragment>
                        ))}
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    amountToDisplay: { marginVertical: 15 },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        paddingBottom: 24,
    },
    ctaContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    detailsContainer: {
        marginTop: 41,
        width: "100%",
    },
    detailsRowContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    detailsRowText: {
        width: "50%",
    },
    image: {
        height: 64,
        marginBottom: 24,
        marginTop: 56,
        width: 64,
    },
});

AcknowledgementScreenTemplate.propTypes = {
    detailsData: PropTypes.array,
    message: PropTypes.string,
    isSuccessful: PropTypes.bool,
    isSubMessage: PropTypes.bool,
    ctaComponents: PropTypes.array,
    showLoader: PropTypes.bool,
    errorMessage: PropTypes.string,
    img: PropTypes.string,
    ContentComponent: PropTypes.node,
    onCloseBtnPress: PropTypes.func,
    showCloseBtn: PropTypes.bool,
    amount: PropTypes.string,
};

AcknowledgementScreenTemplate.defaultProps = {
    detailsData: [],
    message: "",
    isSuccessful: false,
    isSubMessage: false,
    ctaComponents: [],
    showLoader: false,
    errorMessage: "",
    img: "",
    ContentComponent: null,
    showCloseBtn: false,
    amount: null,
};

export default React.memo(AcknowledgementScreenTemplate);
