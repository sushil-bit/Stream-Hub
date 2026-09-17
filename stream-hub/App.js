import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";

function ScreenPlaceholder({ title }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#101014", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>{title}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#22C55E",
          tabBarInactiveTintColor: "#6E6E7C",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", paddingBottom: 4 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
          }}
        />
        <Tab.Screen
          name="Explore"
          children={() => <ScreenPlaceholder title="Explore Feed" />}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={21} color={color} />,
          }}
        />
        <Tab.Screen
          name="SearchCenter"
          children={() => <ScreenPlaceholder title="Search Everything" />}
          options={{
            tabBarLabel: "",
            tabBarIcon: () => (
              <View style={styles.centerSearchGlow}>
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Downloads"
          children={() => <ScreenPlaceholder title="Downloaded Content" />}
          options={{
            tabBarBadge: 2,
            tabBarBadgeStyle: { backgroundColor: "#22C55E", fontSize: 8, height: 14, minWidth: 14 },
            tabBarIcon: ({ color }) => <Ionicons name="download-outline" size={20} color={color} />,
          }}
        />
        <Tab.Screen
          name="Me"
          children={() => <ScreenPlaceholder title="Profile & Preferences" />}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#121217",
    borderTopColor: "#1A1A22",
    height: 58,
    paddingTop: 6,
  },
  centerSearchGlow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#4ADE80",
  },
});
