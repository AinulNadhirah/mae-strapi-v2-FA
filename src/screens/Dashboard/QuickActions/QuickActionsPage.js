import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import WidgetRow from "@screens/Dashboard/QuickActions/WidgetRow";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { MEDIUM_GREY, SILVER, WHITE } from "@constants/colors";

const QuickActionsPage = ({
    list,
    pageName,
    maxItems,
    handleMoveUp,
    handleMoveDown,
    handleOnRemove,
    disabledUpActionId,
    disabledDownActionId,
}) => {
    const totalItems = Array(maxItems)
        .fill(null)
        .map((_, i) => i);
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Typo
                    textAlign="left"
                    text={pageName}
                    fontWeight="600"
                    fontSize={16}
                    lineHeight={16}
                />
                <Typo
                    textAlign="left"
                    text={`${list?.length}/${maxItems}`}
                    fontWeight="600"
                    fontSize={16}
                    lineHeight={16}
                />
            </View>
            <SpaceFiller height={16} />
            <View style={styles.listContainer}>
                {totalItems.map((number) => {
                    const widget = list[number];
                    if (widget) {
                        return (
                            <WidgetRow
                                key={widget.id}
                                index={number}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                onRemove={handleOnRemove}
                                disabledUp={disabledUpActionId === widget.id}
                                disabledDown={disabledDownActionId === widget.id}
                                {...widget}
                            />
                        );
                    } else {
                        return (
                            <View style={styles.emptyContainer}>
                                <Typo
                                    text="+"
                                    color={SILVER}
                                    fontSize={14}
                                    lineHeight={0}
                                    fontWeight="600"
                                />
                            </View>
                        );
                    }
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    listContainer: {
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emptyContainer: {
        backgroundColor: MEDIUM_GREY,
        borderRadius: 4,
        paddingVertical: 5,
        borderWidth: 1.5,
        borderColor: SILVER,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
    },
});

QuickActionsPage.propTypes = {
    list: PropTypes.any,
    pageName: PropTypes.string,
    maxItems: PropTypes.number,
    handleMoveUp: PropTypes.func,
    handleMoveDown: PropTypes.func,
    handleOnRemove: PropTypes.func,
    disabledUpActionId: PropTypes.string,
    disabledDownActionId: PropTypes.string,
};

export default React.memo(QuickActionsPage);
