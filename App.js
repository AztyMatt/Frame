import '@expo/metro-runtime'

import React from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaView, StatusBar, Image } from 'react-native'
import HomeTab from './tabs/HomeTab.jsx'
import ResearchTab from './tabs/ResearchTab.jsx'
import Theme from './assets/styles.js'
import { EventProvider } from 'react-native-outside-press'
import { getAsyncStorage, clearAsyncStorage } from './utils.js'

getAsyncStorage()

const Tab = createBottomTabNavigator()

const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Theme.colors.secondaryDarker
    },
  };

const App = () => {
    return (
        <EventProvider>
            <SafeAreaView style={{ backgroundColor: Theme.colors.secondaryDarker }}>
                <StatusBar
                    barStyle="light-content" // Can be set to "default", "light-content" or "dark-content"
                    backgroundColor={Theme.colors.secondaryDarker}
                />
            </SafeAreaView>

            <NavigationContainer theme={MyTheme}>
                <Tab.Navigator 
                    initialRouteName="HomeTab"
                    screenOptions={{
                        tabBarActiveTintColor: Theme.colors.primary,
                        // tabBarInactiveTintColor: 'black',
                        tabBarStyle: {
                            backgroundColor: Theme.colors.secondaryDarker,
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
        </EventProvider>
    )
}
export default App