import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tab.Screen
        name="Connect"
        component={ConnectStackNavigator}
        options={{
          tabBarLabel: "Connect",
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Bid"
        component={BidBrowseScreen}
        options={{
          tabBarLabel: "Bid",
          tabBarIcon: ({ color, size }) => <Gavel color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Ride"
        component={RideListScreen}
        options={{
          tabBarLabel: "Ride",
          tabBarIcon: ({ color, size }) => <Car color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyFeedScreen}
        options={{
          tabBarLabel: "Nearby",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={20} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={20} />
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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
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
    backgroundColor: colors.bgSurfaceSolid,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600"
  }
});
