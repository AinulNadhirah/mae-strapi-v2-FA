import React, {PureComponent} from 'react'
import {ViewPropTypes, TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'

class TouchableDebounce extends PureComponent {
    constructor(props) {
        super(props)
        this.handlePress = _.debounce(this.handlePress, 500, {
            leading: true,
            trailing: false,
        })
    }

    handlePress = () => {
        const {onPress} = this.props
        onPress()
    }

    render() {
        return (
            <TouchableOpacity {...this.props} onPress={this.handlePress}>
                {this.props.children}
            </TouchableOpacity>
        )
    }
}

TouchableDebounce.propTypes = {
    onPress: PropTypes.func.isRequired,
    style: ViewPropTypes.style,
}

TouchableDebounce.defaultProps = {
    style: {},
    onPress: () => console.log('default press action'),
}
export default TouchableDebounce
