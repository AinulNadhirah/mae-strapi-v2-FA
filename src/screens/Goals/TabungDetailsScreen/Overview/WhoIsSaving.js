import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import ProgressBar from "react-native-progress/Bar";

import Avatar from "@components/Avatars/BorderedAvatar";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

const WhoIsSaving = ({ participants, status: tabungStatus }) => {
    if (participants && participants.length < 2) return null;
    return (
        <View style={[styles.container, styles.shadow]}>
            <View style={styles.titleContainer}>
                <Typo text="Who’s Saving" fontSize={16} fontWeight="600" lineHeight={18} />
            </View>
            {participants.map((participant, index) => {
                const {
                    name,
                    imageUrl,
                    hasImage,
                    status,
                    formattedContributionAmount,
                    formattedTotalAmount,
                    percentage: { boosterPercentage, contribPercentage },
                    withdrawFull,
                } = participant;

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
                    <React.Fragment key={`${imageUrl}-${index}`}>
                        <View style={styles.participantContainer}>
                            <View>
                                <Avatar
                                    width={48}
                                    height={48}
                                    borderRadius={24}
                                    backgroundColor="#cfcfcf"
                                >
                                    {hasImage ? (
                                        <Image
                                            source={{ uri: imageUrl }}
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
                                </Avatar>
                                {withdrawFull && tabungStatus === "COMPLETED" && (
                                    <Image
                                        source={Assets.icRoundedGreenTick}
                                        style={styles.avatarTickImage}
                                    />
                                )}
                            </View>
                            <View style={styles.participantDetailsContainer}>
                                <Typo
                                    text={index ? name : "You"}
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBar}>
                                        <ProgressBar
                                            progress={1}
                                            color="#ececee"
                                            borderWidth={0}
                                            height={8}
                                            width={null}
                                        />
                                    </View>
                                    <View style={styles.progressBar}>
                                        <ProgressBar
                                            progress={boosterPercentage}
                                            color="#67cc89"
                                            borderWidth={0}
                                            height={8}
                                            width={null}
                                        />
                                    </View>
                                    <View style={styles.progressBar}>
                                        <ProgressBar
                                            progress={contribPercentage}
                                            color="#469561"
                                            borderWidth={0}
                                            height={8}
                                            width={null}
                                        />
                                    </View>
                                </View>
                                <Typo
                                    text={
                                        status !== "PENDING"
                                            ? `RM ${formattedTotalAmount} of RM ${formattedContributionAmount}`
                                            : "Pending invite"
                                    }
                                    fontSize={12}
                                    lineHeight={18}
                                />
                            </View>
                        </View>
                        {index < participants.length - 1 && <SpaceFiller height={20} />}
                    </React.Fragment>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    avatarImage: {
        borderRadius: 22,
        height: 44,
        width: 44,
    },
    avatarTickImage: {
        bottom: 0,
        elevation: 5,
        height: 22,
        position: "absolute",
        right: 0,
        width: 22,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 20,
        padding: 32,
        width: "100%",
    },
    participantContainer: {
        flexDirection: "row",
        height: 48,
        width: "100%",
    },
    participantDetailsContainer: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "space-evenly",
        marginLeft: 16,
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
    shadow: {
        ...getShadow({}),
    },
    titleContainer: {
        alignItems: "flex-start",
        marginBottom: 24,
    },
});

WhoIsSaving.propTypes = {
    participants: PropTypes.array,
    status: PropTypes.string.isRequired,
};

WhoIsSaving.defaultProps = {
    participants: [],
};

export default React.memo(WhoIsSaving);
