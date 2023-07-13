import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, ImageBackground, Image } from "react-native";
import ProgressBar from "react-native-progress/Bar";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import Badge from "@components/Badges/Badge";
import Spring from "@components/Animations/Spring";
import { WHITE, GREY_300, BLACK } from "@constants/colors";

export const statusEnum = Object.freeze({
    onGoing: "ACTIVE",
    completed: "COMPLETED",
    pending: "PENDING",
    cancelled: "CANCELLED",
    cancelledPending: "CANCELLED_PENDING",
});

const TabungCard = ({
    imageUrl,
    title,
    avatarsData,
    timeLeft,
    boosterCount,
    totalAmountString,
    contributedAmountString,
    contributedAmountPercentage,
    boosterAmountPercentage,
    status,
    onTabungCardPressed,
    id,
    isDeleted,
    imageUrlToken,
}) => {
    const avatars = useMemo(() => {
        if (!avatarsData || avatarsData.length < 2) return null;

        return avatarsData.map((data, index) => {
            const { imageUrl: participantImage, name, hasImage } = data;

            let style = null;
            switch (index) {
                case 0:
                    style = styles.avatarContainerOne;
                    break;
                case 1:
                    style = styles.avatarContainerTwo;
                    break;
                case 2:
                    style = styles.avatarContainerThree;
                    break;
                case 3:
                    style = styles.avatarContainerFour;
                    break;
                default:
                    style = styles.avatarContainerFive;
            }

            const generateCredential = (str) => {
                const nameArray = str.split(" ");

                if (nameArray.length > 1) {
                    return `${nameArray[0].substring(0, 1).toUpperCase()}${nameArray[1]
                        .substring(0, 1)
                        .toUpperCase()}`;
                } else {
                    return nameArray[0].substring(0, 2).toUpperCase();
                }
            };

            return (
                <View style={style} key={`${name}-${index}`}>
                    <BorderedAvatar>
                        {hasImage ? (
                            <Image
                                source={{
                                    uri: participantImage,
                                }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Typo
                                text={generateCredential(name)}
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="300"
                                color="#7c7c7d"
                            />
                        )}
                    </BorderedAvatar>
                </View>
            );
        });
    }, [avatarsData]);

    const onPress = useCallback(() => onTabungCardPressed({ id, status, isDeleted }), [
        id,
        status,
        isDeleted,
        onTabungCardPressed,
    ]);

    const statusComponent = useMemo(() => {
        if (status === statusEnum.cancelled || status === statusEnum.cancelledPending)
            return <Badge title="Cancelled" color="#e35d5d" />;
        else if (status === statusEnum.completed)
            return <Badge title="Completed" color="#67cc89" />;
        else if (status === statusEnum.pending) return <Badge title="Pending" color="#ffa227" />;
        else return <Typo text="Saved so far" fontSize={12} lineHeight={16} color={WHITE} />;
    }, [status]);

    return (
        <Spring style={styles.container} activeOpacity={0.9} onPress={onPress}>
            <ImageBackground
                style={styles.imageBackground}
                source={{
                    uri: imageUrl,
                    headers: {
                        Authorization: imageUrlToken,
                    },
                }}
            >
                <View style={styles.overlay} />
                <View style={styles.anchorOne}>
                    <View style={styles.titleContainer}>
                        <Typo
                            text={title}
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                            color={WHITE}
                            numberOfLines={2}
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.contributorContainer}>{avatars}</View>
                </View>
                <View style={styles.anchorTwo}>
                    {statusComponent}
                    <Typo
                        text={`RM ${contributedAmountString} of RM ${totalAmountString}`}
                        fontSize={12}
                        lineHeight={16}
                        fontWeight="600"
                        color={WHITE}
                    />
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <ProgressBar
                                progress={1}
                                color="#ffffff"
                                borderWidth={0}
                                height={8}
                                width={null}
                            />
                        </View>
                        <View style={styles.progressBar}>
                            <ProgressBar
                                progress={boosterAmountPercentage}
                                color="#67cc89"
                                borderWidth={0}
                                height={8}
                                width={null}
                            />
                        </View>
                        <View style={styles.progressBar}>
                            <ProgressBar
                                progress={contributedAmountPercentage}
                                color="#469561"
                                borderWidth={0}
                                height={8}
                                width={null}
                            />
                        </View>
                    </View>
                    <View style={styles.extraInformationContainer}>
                        <Typo text={timeLeft} fontSize={10} lineHeight={16} color={WHITE} />
                        <Typo
                            text={`${boosterCount} active booster(s)`}
                            fontSize={10}
                            lineHeight={18}
                            fontWeight="600"
                            color={WHITE}
                        />
                    </View>
                </View>
            </ImageBackground>
        </Spring>
    );
};

const styles = StyleSheet.create({
    anchorOne: {
        flexDirection: "row",
        height: 36,
        justifyContent: "space-between",
        width: "100%",
    },
    anchorTwo: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-end",
        paddingTop: 23,
        width: "100%",
    },
    avatarContainerFive: {
        position: "absolute",
        right: 116,
    },
    avatarContainerFour: {
        position: "absolute",
        right: 87,
    },
    avatarContainerOne: {
        position: "absolute",
        right: 0,
    },
    avatarContainerThree: {
        position: "absolute",
        right: 58,
    },
    avatarContainerTwo: {
        position: "absolute",
        right: 29,
    },
    avatarImage: {
        borderRadius: 16,
        height: 32,
        width: 32,
    },
    container: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 174,
        overflow: "hidden",
        width: "100%",
    },
    contributorContainer: {
        height: 36,
        marginLeft: 36,
        width: 152,
    },
    extraInformationContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 18,
        justifyContent: "space-between",
        width: "100%",
    },
    imageBackground: {
        alignItems: "flex-start",
        flex: 1,
        padding: 20,
    },
    overlay: {
        backgroundColor: BLACK,
        bottom: 0,
        left: 0,
        opacity: 0.4,
        position: "absolute",
        right: 0,
        top: 0,
    },
    progressBar: {
        position: "absolute",
        top: 0,
        width: "100%",
    },
    progressBarContainer: {
        height: 8,
        marginVertical: 8,
        width: "100%",
    },
    titleContainer: {
        flex: 1,
    },
});

TabungCard.propTypes = {
    imageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    avatarsData: PropTypes.array,
    timeLeft: PropTypes.string.isRequired,
    boosterCount: PropTypes.string,
    totalAmountString: PropTypes.string.isRequired,
    contributedAmountString: PropTypes.string.isRequired,
    contributedAmountPercentage: PropTypes.number,
    boosterAmountPercentage: PropTypes.number,
    status: PropTypes.string.isRequired,
    onTabungCardPressed: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    imageUrlToken: PropTypes.string,
};

TabungCard.defaultProps = {
    imageUrl: "",
    avatarsData: [],
    boosterCount: "0",
    contributedAmountPercentage: 0,
    boosterAmountPercentage: 0,
    imageUrlToken: "",
};

export default React.memo(TabungCard);
