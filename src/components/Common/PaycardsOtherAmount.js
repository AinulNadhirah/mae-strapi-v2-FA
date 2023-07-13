import React from 'react'
import {Text, TouchableOpacity, View, ImageBackground, Image} from 'react-native'

const PaycardsOtherAmount = ({onPress, text, rightText, icon}) => {
    function callbackEvent(item) {
        onPress(item)
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={Styles.newTransferView}>
                <View style={Styles.newTransferViewInner1}>
                    <Text
                        style={[Styles.nameLabelBlack]}
                        accessible={true}
                        testID={'txtByClickingNext'}
                        accessibilityLabel={'txtByClickingNext'}>
                        {text}
                    </Text>
                </View>
                <View style={Styles.newTransferViewInner2}>
                <View style={Styles.newTransferViewInner3}>
                    <Image style={Styles.icon} source={icon}  resizeMode="center"/>
                </View>
                   
                </View>
            </View>
        </TouchableOpacity>
    )
}

const Styles = {
    newTransferView: {
        width: '100%',
        height: 80,
        borderRadius: 50,
        marginLeft: 0,
        marginBottom: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
    },
    newTransferViewInner1: {
        flex: 3,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: 'column',
        justifyContent: 'center',
        //backgroundColor: 'gray',
    },
    newTransferViewInner2: {
        flex: 1,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: 'center',
        flexDirection: 'column',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
    },
    newTransferViewInner3: {
        flex: 1,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: 'center',
        flexDirection: 'column',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
    },
    newTranfLabelBlack: {
        fontFamily: 'montserrat',
        fontSize: 15,
        fontWeight: 'bold',
        fontStyle: 'normal',
        marginLeft: 15,
        lineHeight: 33,
        color: '#000',
    },

    nameLabelBlack: {
        fontFamily: 'montserrat',
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0,
        color: '#000000',
        marginTop: 0,
        marginLeft: 30,
    },
    rightTextBlue: {
        fontFamily: 'montserrat',
        fontSize: 15,
        fontWeight: '600',
        fontStyle: 'normal',
        lineHeight: 19,
        letterSpacing: 0,
        textAlign: 'right',
        color: '#4190b7',
        marginRight: 30,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 30,
    },
}
export {PaycardsOtherAmount}
