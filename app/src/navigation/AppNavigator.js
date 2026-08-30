import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MessageSquare, Gavel, Car, Compass, User } from "lucide-react-native";

import { colors, radii, spacing, typography } from "../theme/theme";
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

function TabIcon({ Icon, color, focused }) {
  return (
    <View style={styles.tabIconWrapper}>
      <Icon color={color} size={22} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary, // Deep Indigo
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tab.Screen
        name="Connect"
        component={ConnectStackNavigator}
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={MessageSquare} color={color} focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Bid"
        component={BidBrowseScreen}
        options={{
          tabBarLabel: "Bid",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Gavel} color={color} focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Ride"
        component={RideListScreen}
        options={{
          tabBarLabel: "Ride",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Car} color={color} focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyFeedScreen}
        options={{
          tabBarLabel: "Nearby",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Compass} color={color} focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} />
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
        <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center"
  },
  tabBar: {
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    height: Platform.OS === "ios" ? 84 : 66,
    paddingBottom: Platform.OS === "ios" ? 22 : 8,
    paddingTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 28
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary // Warm Orange #FF6F3C
  }
});
