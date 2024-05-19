import React from 'react'
import { Pressable, View } from 'react-native'

const PressableOrView = ({ condition, children, ...props }) => {
    const ComponentToRender = condition ? Pressable : View
    return <ComponentToRender {...props}>{children}</ComponentToRender>
}

export default PressableOrView
