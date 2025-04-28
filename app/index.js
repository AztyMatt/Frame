import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Image } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { EventProvider } from 'react-native-outside-press';
import { GlobalProvider } from '@/GlobalContext.js';
import Theme from '@/assets/styles.js';

const Tab = createBottomTabNavigator();

const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Theme.colors.secondaryDarker,
    },
};

const App = () => {
    return (
        <EventProvider>
            <GlobalProvider>
                <SafeAreaView style={{ backgroundColor: Theme.colors.secondaryDarker }}>
                    <StatusBar barStyle="light-content" backgroundColor={Theme.colors.secondaryDarker} />
                </SafeAreaView>
                <NavigationContainer theme={MyTheme}>
                    <Tab.Navigator
                        initialRouteName="HomeTab"
                        screenOptions={{
                            tabBarActiveTintColor: Theme.colors.primary,
                            tabBarStyle: {
                                backgroundColor: Theme.colors.secondaryDarker,
                                borderTopWidth: 1,
                                borderTopColor: Theme.colors.primary,
                            },
                        }}
                    >
                        <Tab.Screen
                            name="HomeTab"
                            component={require('./tabs/HomeTab').default}
                            options={{
                                headerShown: false,
                                tabBarShowLabel: false,
                                tabBarIcon: ({ color, size }) => (
                                    <Image 
                                        source={require('@/assets/icons/home.png')} 
                                        style={{ width: size, height: size, tintColor: color }} 
                                    />
                                ),
                            }}
                        />
                        <Tab.Screen
                            name="ResearchTab"
                            component={require('./tabs/ResearchTab').default}
                            options={{
                                headerShown: false,
                                tabBarShowLabel: false,
                                tabBarIcon: ({ color, size }) => (
                                    <Image 
                                        source={require('@/assets/icons/research.png')} 
                                        style={{ width: size, height: size, tintColor: color }} 
                                    />
                                ),
                            }}
                        />
                        <Tab.Screen 
                            name='AccountTab' 
                            component={require('./tabs/HomeTab').default}
                            options={{ 
                                headerShown: false, 
                                tabBarShowLabel: false, 
                                tabBarIcon: ({ color, size }) => (
                                    <Image
                                        source={require('@/assets/icons/account.png')}
                                        style={{ width: size, height: size, tintColor: color }} // Just a quick test
                                    />
                                ), 
                            }}
                        />
                    </Tab.Navigator>
                </NavigationContainer>
            </GlobalProvider>
        </EventProvider>
    );
};

export default App;
