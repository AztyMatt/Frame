import React from 'react'
import { Text as DefaultText, StyleSheet } from 'react-native'

const baseTextStyles = {
    color: 'white'
}

export default CustomText = (props) => {
    const mergedStyles = StyleSheet.compose(baseTextStyles, props.style)
    return <DefaultText {...props} style={mergedStyles} />
}
CustomText.defaultProps = DefaultText.defaultProps