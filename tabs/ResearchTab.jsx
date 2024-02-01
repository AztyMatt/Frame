import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Research from './screens/Research.jsx'
import Movie from './screens/Movie.jsx'

const Stack = createStackNavigator()

const ResearchTab = () => {
    return (
        <Stack.Navigator initialRouteName='Research'>
            <Stack.Screen name='Research' component={Research} options={{ headerShown: false }}/>
            <Stack.Screen name='Movie' component={Movie} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}
export default ResearchTab