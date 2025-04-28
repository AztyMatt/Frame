import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Movie from './screens/Movie.jsx'
import Posters from './screens/Posters.jsx'
import Providers from './screens/Providers.jsx'

const Stack = createStackNavigator()

const MovieTab = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name='Movie' component={Movie} options={{ headerShown: false }}/>
            <Stack.Screen name='Posters' component={Posters} options={{ headerShown: false }}/>
            <Stack.Screen name='Providers' component={Providers} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}
export default MovieTab