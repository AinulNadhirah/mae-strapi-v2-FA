'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, Platform } from 'react-native';
//  import Modal from "react-native-modal";
import {
    Text,
    View,
} from 'react-native';

class PopupModel extends Component {
    static propTypes = {
      
    }
    constructor(props) {
        super(props);
       
    }

    render() {
        return (
            <View>
            {/* <Modal isVisible={true}>
              <View style={{ flex: 1 }}>
                <Text>I am the modal content!</Text>
              </View>
            </Modal> */}
          </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        backgroundColor: '#ffde00',
        height: '40%',
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        bottom: 0,
        left: 0,
        right: 0,
    },

 
});

//make this component available to the app
export { PopupModel };
