
import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet
} from 'react-native';

const BlurView = (props) => {
  const { children, hide, style } = props;
  if (hide) {
    return null;
  }
  return (
    <View {...this.props} style={styles.container}
    opacity={0.8}>
      { children }
    </View>
  );
};

BlurView.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.element,
    ])),
  ]).isRequired,
  
  hide: PropTypes.bool,
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      position: "absolute",
      justifyContent: "center",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      opacity:0.5,
     // backgroundColor: "rgba(0, 0, 0, 0.5)"
      backgroundColor: "#000000"

    },

});

export {BlurView};