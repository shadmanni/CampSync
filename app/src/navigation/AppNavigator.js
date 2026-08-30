import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MessageSquare,
  Gavel,
  Car,
  Compass,
  Sparkles,
  CheckSquare
} from "lucide-react-native";

import { colors, radii, shadows, spacing, typography } from "../theme/theme";
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
      <ConnectStack.Screen name="Profile" component={ProfileScreen} />
    </ConnectStack.Navigator>
  );
}

function TabIcon({ Icon, color, focused, activeColor }) {
  return (
    <View style={styles.tabIconWrapper}>
      <Icon color={focused ? activeColor : colors.inkFaint} size={20} strokeWidth={focused ? 2.6 : 2} />
      {focused && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tab.Screen
        name="Connect"
        component={ConnectStackNavigator}
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageSquare} focused={focused} activeColor={colors.violet} />
          )
        }}
      />
      <Tab.Screen
        name="Bid"
        component={BidBrowseScreen}
        options={{
          tabBarLabel: "Bid",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Gavel} focused={focused} activeColor={colors.coral} />
          )
        }}
      />
      <Tab.Screen
        name="Ride"
        component={RideListScreen}
        options={{
          tabBarLabel: "Ride",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Car} focused={focused} activeColor={colors.mint} />
          )
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyFeedScreen}
        options={{
          tabBarLabel: "Nearby",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Compass} focused={focused} activeColor={colors.sky} />
          )
        }}
      />
      <Tab.Screen
        name="Skills"
        component={SkillsFeedScreen}
        options={{
          tabBarLabel: "Skills",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Sparkles} focused={focused} activeColor={colors.rose} />
          )
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksFeedScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={CheckSquare} focused={focused} activeColor={colors.sun} />
          )
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
    justifyContent: "center"
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.lineStrong,
    height: Platform.OS === "ios" ? 86 : 68,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 6,
    ...shadows.hardLg
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 26
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 5,
    height: 5,
    borderRadius: 2.5
  }
});
