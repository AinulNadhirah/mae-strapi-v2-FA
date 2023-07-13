import React from "react";
import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import Typography from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { FADE_GREY } from "@constants/colors";

const NoteRow = ({ spacing, children }) => (
    <View style={spacing ? [styles.noteItem, styles.spacing] : styles.noteItem}>{children}</View>
);

NoteRow.propTypes = {
    spacing: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
};

const NoteNumberingColumn = ({ number }) => (
    <View style={styles.noteItemPointColumn}>
        <Typography text={`${number}.`} fontSize={12} lineHeight={18} color={FADE_GREY} />
    </View>
);

NoteNumberingColumn.propTypes = {
    number: PropTypes.number.isRequired,
};

const TransactionConfirmationNotes = ({ noteItems, noteCustomTextComponents }) => {
    return (
        <View style={styles.container}>
            <Typography
                text="Note:"
                fontSize={12}
                lineHeight={18}
                fontWeight="600"
                color={FADE_GREY}
            />
            <SpaceFiller height={4} />
            {noteItems.length
                ? noteItems.map((item, index) => (
                      <NoteRow key={index} spacing={index + 1 !== noteItems.length}>
                          <>
                              <NoteNumberingColumn number={index + 1} />
                              <View style={styles.noteItemDescriptionsColumn}>
                                  <Typography
                                      text={item}
                                      fontSize={12}
                                      lineHeight={18}
                                      color={FADE_GREY}
                                      textAlign="left"
                                  />
                              </View>
                          </>
                      </NoteRow>
                  ))
                : noteCustomTextComponents.map((component, index) => (
                      <NoteRow key={index} spacing={index + 1 !== noteCustomTextComponents.length}>
                          <>
                              <NoteNumberingColumn number={index + 1} />
                              <View style={styles.noteItemDescriptionsColumn}>{component}</View>
                          </>
                      </NoteRow>
                  ))}
        </View>
    );
};

TransactionConfirmationNotes.propTypes = {
    noteItems: PropTypes.arrayOf(PropTypes.string),
    noteCustomTextComponents: PropTypes.arrayOf(PropTypes.element),
};

TransactionConfirmationNotes.defaultProps = {
    noteItems: [],
    noteCustomTextComponents: [],
};

const FLEX_START = "flex-start";

const styles = StyleSheet.create({
    container: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        width: "100%",
    },
    noteItem: {
        flexDirection: "row",
        width: "100%",
    },
    noteItemDescriptionsColumn: {
        flex: 1,
    },
    noteItemPointColumn: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        width: 20,
    },
    spacing: {
        marginBottom: 12,
    },
});

export default React.memo(TransactionConfirmationNotes);
