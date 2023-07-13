import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";

import {
    MEDIUM_GREY,
    GREY,
    YELLOW,
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    SILVER_CHALICE,
} from "@constants/colors";
import { CONTINUE } from "@constants/strings";

function BTPlanPopup({ data, title, onClose, onPlanCallback }) {
    const [loading, setLoading] = useState(false);
    const [isItemSelected, setItemSelected] = useState(true);
    const [rootData, setRootData] = useState(data);
    const [selectedItem, setSelectedItem] = useState({});
    //const [isItemSelected, setItemSelected] = useState(true);

    useEffect(() => {
        try {
            data.forEach((item, index) => {
                if (item.isSelected) {
                    setSelectedItem(item);
                    setItemSelected(false);
                }
            });
        } catch (e) {
            console.log("Exception: ", e);
        }
    }, []);

    const onBackTap = () => {
        console.log("[BTPlanPopup] >> [onBackTap]");
        onClose();
    };

    const onContinueTap = () => {
        console.log("[BTPlanPopup] >> [onContinueTap]");
        onPlanCallback(selectedItem);
    };

    const handleAndroidBack = () => {
        onClose();
    };

    const onItemPress = (item) => {
        const { isSelected = false } = item;
        if (isSelected) {
            const newMValue = rootData.map((value, index) => ({
                ...value,
                isSelected: false,
            }));
            setRootData(newMValue);
            setSelectedItem({});
            setItemSelected(true);
        } else {
            const selectedMValue = [...rootData];
            const newMValue = selectedMValue.map((value, index) => ({
                ...value,
                isSelected: index === item.index,
            }));
            setRootData(newMValue);
            setSelectedItem({ ...item });
            setItemSelected(false);
        }
    };

    const PlanItems = ({ items }) => {
        return (
            <FlatList
                data={items}
                extraData={{}}
                renderItem={({ item, index }) => {
                    return (
                        <View style={styles.containerListItem}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    onItemPress(item, index);
                                }}
                                style={styles.line}
                            >
                                <View
                                    style={[
                                        styles.containerListItem,
                                        styles.containerTrackerListItem,
                                    ]}
                                >
                                    <View style={styles.innerListItem}>
                                        <TouchableOpacity
                                            style={styles.circle}
                                            onPress={() => {
                                                onItemPress(item, index);
                                            }}
                                        >
                                            {item.isSelected && (
                                                <View style={styles.checkedCircle} />
                                            )}
                                        </TouchableOpacity>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={item.Plan}
                                            fontStyle="normal"
                                            textAlign="left"
                                            style={styles.radioBtnText}
                                        />
                                    </View>
                                    <View style={styles.innerListItem}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="normal"
                                            text="Tenure - "
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={item.MBB_Tenure}
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.innerListItem}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="normal"
                                            text="Interest Rate - "
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={item.MBB_Rate}
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.innerListItem}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="normal"
                                            text="Min transfer limit - "
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={`RM ${item.MBB_Limit1}`}
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={styles.innerListItem}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="normal"
                                            text="Max transfer limit - "
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                        <Typography
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={`RM ${item.MBB_Limit2}`}
                                            fontStyle="normal"
                                            textAlign="left"
                                            multiline={true}
                                            numberOfLines={3}
                                            ellipsizeMode="tail"
                                        />
                                    </View>
                                    <View style={styles.innerListFeeItem}>
                                        <Typography
                                            fontSize={14}
                                            lineHeight={20}
                                            fontWeight="normal"
                                            text="Fees & charges"
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                        <Typography
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="normal"
                                            text={item.FeesAndCharges}
                                            fontStyle="normal"
                                            textAlign="left"
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
            />
        );
    };

    return (
        <Modal
            animated
            animationType="slide"
            hardwareAccelerated
            onRequestClose={handleAndroidBack}
        >
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typography
                                    text={title}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onBackTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <ScrollView>
                        <React.Fragment>
                            <View style={styles.containerListItem}>
                                <Typography
                                    fontSize={20}
                                    style={styles.containerTrackerListItem}
                                    lineHeight={28}
                                    fontWeight="300"
                                    text="Please select a plan"
                                    textAlign="left"
                                />
                                <SpaceFiller height={15} />
                                <PlanItems items={rootData} />
                            </View>
                        </React.Fragment>
                    </ScrollView>
                    {/* Bottom docked button container */}
                    <View style={styles.actionContainer}>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isItemSelected}
                                backgroundColor={isItemSelected ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        color={isItemSelected ? DISABLED_TEXT : BLACK}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONTINUE}
                                    />
                                }
                                onPress={onContinueTap}
                            />
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </Modal>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    checkedCircle: {
        backgroundColor: YELLOW,
        borderRadius: 7,
        height: 14,
        width: 14,
    },
    circle: {
        alignItems: "center",
        borderColor: SILVER_CHALICE,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        marginTop: 5,
        width: 20,
    },
    containerListItem: {
        marginBottom: 20,
    },
    containerTrackerListItem: {
        marginHorizontal: 24,
    },
    innerListFeeItem: {
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginBottom: 10,
    },
    innerListItem: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 10,
    },

    line: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        marginBottom: 1,
        marginTop: 1,
    },
    radioBtnText: {
        marginLeft: 10,
        marginTop: 5,
    },
});

BTPlanPopup.propTypes = {
    data: PropTypes.object,
    title: PropTypes.string,
    onClose: PropTypes.func,
    onPlanCallback: PropTypes.func,
};

export default BTPlanPopup;
