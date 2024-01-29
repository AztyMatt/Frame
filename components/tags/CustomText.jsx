import React from 'react'
import { Text as DefaultText } from 'react-native'

const baseTextStyles = {
    color: 'white'
}

const CustomText = (props) => {
    const mergedStyles = [baseTextStyles, props.style]
    return <DefaultText {...props} style={mergedStyles} />
}
CustomText.defaultProps = DefaultText.defaultProps

export default CustomText