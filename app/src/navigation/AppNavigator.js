import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MessageSquare, Gavel, Car, Compass, Sparkles, CheckSquare, User
} from "lucide-react-native";

import { colors, borders, radii, spacing } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

// Auth Screens
import { EmailVerifyScreen } from "../screens/auth/EmailVerifyScreen";
import { OtpVerifyScreen } from "../screens/auth/OtpVerifyScreen";
import { VerifiedDoneScreen } from "../screens/auth/VerifiedDoneScreen";

// Module Screens
import { ConnectFeedScreen } from "../screens/connect/ConnectFeedScreen";
import { PostDetailScreen } from "../screens/connect/PostDetailScreen";
import { BidBrowseScreen } from "../screens/bid/BidBrowseScreen";
import { RideListScreen } from "../screens/ride/RideListScreen";
import { NearbyFeedScreen } from "../screens/nearby/NearbyFeedScreen";
import { SkillsFeedScreen } from "../screens/skills/SkillsFeedScreen";
import { TasksFeedScreen } from "../screens/tasks/TasksFeedScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ConnectStack = createNativeStackNavigator();

function ConnectStackNavigator() {
  return (
    <ConnectStack.Navigator screenOptions={{ headerShown: false }}>
      <ConnectStack.Screen name="ConnectFeed" component={ConnectFeedScreen} />
      <ConnectStack.Screen name="PostDetail" component={PostDetailScreen} />
    </ConnectStack.Navigator>
  );
}

/**
 * Module accent map — each tab has its own colour that lights up
 * when active, matching the website's per-module identity system.
 */
const MODULE_ACCENTS = {
  Connect: colors.violet,
  Bid: colors.coral,
  Ride: colors.mint,
  Nearby: colors.sky,
  Skills: colors.rose,
  Tasks: colors.sun,
};

function TabIcon({ Icon, routeName, focused }) {
  const accent = MODULE_ACCENTS[routeName] || colors.violet;
  const iconColor = focused ? accent : colors.inkFaint;

  return (
    <View style={styles.tabIconWrapper}>
      <Icon color={iconColor} size={22} strokeWidth={focused ? 2.4 : 1.8} />
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: accent }]} />
      )}
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: MODULE_ACCENTS[route.name] || colors.violet,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen
        name="Connect"
        component={ConnectStackNavigator}
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageSquare} routeName="Connect" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bid"
        component={BidBrowseScreen}
        options={{
          tabBarLabel: "Bid",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Gavel} routeName="Bid" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Ride"
        component={RideListScreen}
        options={{
          tabBarLabel: "Ride",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Car} routeName="Ride" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyFeedScreen}
        options={{
          tabBarLabel: "Nearby",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Compass} routeName="Nearby" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Skills"
        component={SkillsFeedScreen}
        options={{
          tabBarLabel: "Skills",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Sparkles} routeName="Skills" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksFeedScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={CheckSquare} routeName="Tasks" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="VerifiedDone" component={VerifiedDoneScreen} />
    </Stack.Navigator>
  );
}

export const AppNavigator = () => {
  const { isAuthenticated, onboarded, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.violet} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && onboarded ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    backgroundColor: colors.canvas,
    borderTopWidth: 1.5,
    borderTopColor: colors.lineStrong,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
