import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { EventProvider } from 'react-native-outside-press';
import { GlobalProvider } from '@/GlobalContext.js';
import Theme from '@/assets/styles.js';

const Layout = () => {
  return (
    <EventProvider>
      <GlobalProvider>
        <SafeAreaView style={{ backgroundColor: Theme.colors.secondaryDarker }}>
          <StatusBar barStyle="light-content" backgroundColor={Theme.colors.secondaryDarker} />
        </SafeAreaView>
        {/* expo-router gère automatiquement la navigation */}
        <Tabs />
      </GlobalProvider>
    </EventProvider>
  );
};

export default Layout;
