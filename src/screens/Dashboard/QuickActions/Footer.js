import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import WidgetRow from "@screens/Dashboard/QuickActions/WidgetRow";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { SEPARATOR } from "@constants/colors";

const Footer = ({ list, disabledAdding, handleOnAdd, footerRef }) => {
    return (
        <View ref={footerRef}>
            <SpaceFiller height={24} />
            <SpaceFiller width="100%" height={1} backgroundColor={SEPARATOR} />
            <SpaceFiller height={24} />
            <Typo
                textAlign="left"
                text="Add a different action to your Quick Action list"
                fontWeight="400"
                fontSize={12}
                lineHeight={16}
                style={styles.headerText}
            />
            <View style={styles.container}>
                {list.map((widget, index) => (
                    <WidgetRow
                        key={widget.id}
                        index={index}
                        availableType
                        showDown={false}
                        showUp={false}
                        disabledAdding={disabledAdding}
                        onAdd={handleOnAdd}
                        onLongPress={() => {}}
                        {...widget}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    headerText: {
        paddingHorizontal: 8,
    },
});

Footer.propTypes = {
    list: PropTypes.any,
    disabledAdding: PropTypes.bool,
    footerRef: PropTypes.any,
    handleOnAdd: PropTypes.func,
};

export default React.memo(Footer);
