import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Home from './screens/Home.jsx'
import MovieTab from './MovieTab.jsx'

const Stack = createStackNavigator()

const HomeTab = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Home' component={Home} options={{ headerShown: false }}/>
            <Stack.Screen name='MovieTab' component={MovieTab} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}
export default HomeTab