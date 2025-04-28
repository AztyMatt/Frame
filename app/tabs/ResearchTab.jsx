import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Research from './screens/Research.jsx'
import MovieTab from './MovieTab.jsx'

const Stack = createStackNavigator()

const ResearchTab = () => {
    return (
        <Stack.Navigator initialRouteName='Research'>
            <Stack.Screen name='Research' component={Research} options={{ headerShown: false }}/>
            <Stack.Screen name='MovieTab' component={MovieTab} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}
export default ResearchTab