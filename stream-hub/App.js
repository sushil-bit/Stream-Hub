import MeScreen from "./src/screens/MeScreen";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthScreen from "./src/screens/AuthScreen";
import { Ionicons } from '@expo/vector-icons';
import DownloadsScreen from './src/screens/DownloadsScreen';
import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import FloatingTabBar from "./src/components/Navigation/FloatingTabBar";
import HomeScreen from "./src/screens/HomeScreen";
import DetailsScreen from "./src/screens/DetailsScreen";
import PlayerScreen from "./src/screens/PlayerScreen";
import SearchScreen from "./src/screens/SearchScreen";
import WatchlistScreen from "./src/screens/WatchlistScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={SearchScreen} />
      <Tab.Screen name="Details" component={WatchlistScreen} />
          <Tab.Screen 
        name="Downloads" 
        component={DownloadsScreen} 
        options={{
          tabBarLabel: 'Downloads',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="download-outline" size={size || 22} color={color} />
        <Tab.Screen name="Me" component={MeScreen} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {

  const [userSession, setUserSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await AsyncStorage.getItem("@user_session");
        if (session) setUserSession(JSON.parse(session));
      } catch (e) {
        console.warn("Session retrieval failed", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0D0C13", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF334B" />
      </View>
    );
  }

  if (!userSession) {
    return <AuthScreen onLoginSuccess={(session) => setUserSession(session)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
