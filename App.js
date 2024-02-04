import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Image } from 'react-native'
import HomeTab from './tabs/HomeTab.jsx'
import ResearchTab from './tabs/ResearchTab.jsx'
import Theme from './assets/styles.js'

const Tab = createBottomTabNavigator()

const App = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator 
                initialRouteName="HomeTab"
                screenOptions={{
                    tabBarActiveTintColor: Theme.colors.primary,
                    // tabBarInactiveTintColor: 'black',
                    tabBarStyle: {
                        backgroundColor: Theme.colors.secondary,
                        borderTopWidth: 1,
                        borderTopColor: Theme.colors.primary
                    },
                }}>
                <Tab.Screen name='HomeTab' component={HomeTab} options={{ headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('./assets/icons/home.png')}
                        style={{ width: size, height: size, tintColor: color }} // Just a quick test
                    />
                ), }}/>
                <Tab.Screen name='ResearchTab' component={ResearchTab} options={{ headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('./assets/icons/research.png')}
                        style={{ width: size, height: size, tintColor: color }} // Just a quick test
                    />
                ), }}/>
                <Tab.Screen name='AccountTab' component={HomeTab} options={{ headerShown: false, tabBarShowLabel: false, tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('./assets/icons/account.png')}
                        style={{ width: size, height: size, tintColor: color }} // Just a quick test
                    />
                ), }}/>
            </Tab.Navigator>
        </NavigationContainer>
    )
}
export default App