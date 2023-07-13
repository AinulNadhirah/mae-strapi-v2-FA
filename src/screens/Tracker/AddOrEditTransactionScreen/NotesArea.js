import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Image, TextInput, Platform } from "react-native";

import Assets from "@assets";

const NotesArea = ({ onSubmit, initialText, ...props }) => {
    const [note, setNote] = useState("");
    const [initialRenderDone, setInitialRenderDone] = useState(false);
    const onChangeText = useCallback((text) => {
        setNote(text);
    }, []);
    const onSubmitEditing = useCallback(() => onSubmit(note), [note, onSubmit]);

    useEffect(() => {
        if (!initialRenderDone) {
            setNote(initialText);
            setInitialRenderDone(true);
        }
    }, [initialRenderDone, initialText]);

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={Assets.icPaper24Black} />
            <TextInput
                style={styles.notesArea}
                value={note}
                onChangeText={onChangeText}
                multiline
                maxLength={100}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={onSubmitEditing}
                onBlur={onSubmitEditing}
                placeholder="Add Notes"
                placeholderTextColor="#000000"
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        height: 44,
        justifyContent: "flex-start",
        marginVertical: 11,
        width: "100%",
    },
    image: {
        height: 24,
        width: 24,
    },
    notesArea: {
        flex: 1,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 12,
        fontStyle: "normal",
        letterSpacing: 0,
        lineHeight: 12,
        marginLeft: 16,
        ...(Platform.OS === "android" && { fontWeight: "normal" }),
    },
});

NotesArea.propTypes = {
    onSubmit: PropTypes.func,
    initialText: PropTypes.string,
};

NotesArea.defaultProps = {
    onSubmit: () => {},
    initialText: "",
};

export default React.memo(NotesArea);
