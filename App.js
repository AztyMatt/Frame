import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeTab from './tabs/HomeTab.jsx'

const Tab = createBottomTabNavigator()

const App = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="HomeTab" component={HomeTab} options={{ headerShown: false }}/>
                {/* <Tab.Screen name="ResearchTab" component={HomeTab} options={{ headerShown: false }}/> */}
            </Tab.Navigator>
        </NavigationContainer>
    )
}
export default App

/**
 * NavigationContainer --> react-navigation/native
 * create... --> xxx/bottom-tabs (idem stack)
 */

// const Tab = createBottomTabNavigator(); //Importer de react navigation 

// const Test = () => {
//     <NavigationContainer>
//         <Tab.Navigator>
//             <Tab.Screen> 1/2</Tab.Screen>
//         </Tab.Navigator>
//     </NavigationContainer>
// }