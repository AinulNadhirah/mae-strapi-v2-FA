import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import PropTypes from "prop-types";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { YELLOW } from "@constants/colors";

const ListFooter = ({ onActionButtonsPressed, actions }) => {
    const _renderActions = () =>
        actions.map((action, index) => (
            <React.Fragment key={`action-${index}`}>
                <ActionButton
                    componentCenter={
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="center"
                            lineHeight={22}
                        >
                            <Text>{action.title}</Text>
                        </Typo>
                    }
                    // eslint-disable-next-line react/jsx-no-bind
                    onPress={() => onActionButtonsPressed(action)}
                    backgroundColor={index > 0 ? "#fff" : YELLOW}
                    fullWidth
                />
                {index < actions.length - 1 && (
                    <SpaceFiller backgroundColor="transparent" width={1} height={21} />
                )}
            </React.Fragment>
        ));

    return (
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <Image source={require("@assets/icons/group10.png")} style={styles.image} />
                <Typo
                    fontSize={14}
                    fontWeight="bold"
                    letterSpacing={0}
                    textAlign="center"
                    color="#9a9a9a"
                    lineHeight={14}
                >
                    <Text>{`You're all set for now.`}</Text>
                </Typo>
            </View>
            {actions && <View style={styles.actionArea}>{_renderActions()}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    actionArea: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        width: "100%",
    },
    container: {
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 98,
        paddingHorizontal: 24,
        paddingTop: 63,
        width: "100%",
    },
    image: {
        height: 50,
        width: 50,
    },
    messageContainer: {
        alignItems: "center",
        height: 78,
        justifyContent: "space-between",
    },
});

ListFooter.propTypes = {
    onActionButtonsPressed: PropTypes.func,
    actions: PropTypes.array,
};

ListFooter.defaultProps = {
    onActionButtonsPressed: () => {},
    actions: null,
};

const Memoiz = React.memo(ListFooter);

export default Memoiz;
