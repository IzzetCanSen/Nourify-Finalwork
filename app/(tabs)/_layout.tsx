import { Tabs, router } from "expo-router";
import React, { useState, useEffect } from "react";

import { TabBarIcon, TabBarIcon2 } from "@/components/navigation/TabBarIcon";
import { Text } from "react-native";
import { getAuth } from "firebase/auth";

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoading(false);
      if (!user) {
        router.replace("/signin");
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3FA1CA",
        tabBarInactiveTintColor: "#FFF",
        tabBarStyle: {
          backgroundColor: "#1F2831",
          height: 70,
          borderBlockColor: "#1F2831",
          borderWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "MealMap",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon2
              name={focused ? "calendar-month" : "calendar-month-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "bar-chart" : "bar-chart-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon2
              name={focused ? "account-circle" : "account-circle-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
