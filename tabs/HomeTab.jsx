import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Home from './screens/Home.jsx'
import Movie from './screens/Movie.jsx'

const Stack = createStackNavigator()

const HomeTab = () => {
    return (
        <Stack.Navigator initialRouteName='Home'>
            <Stack.Screen name='Home' component={Home} options={{ headerShown: false }}/>
            <Stack.Screen name='Movie' component={Movie} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}
export default HomeTab