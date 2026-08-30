import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Compass, Sparkles } from "lucide-react-native";
import { colors, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { EmptyState } from "../../components/common/EmptyState";

export const NearbyFeedScreen = () => {
  return (
    <View style={styles.container}>
      <HeaderBar title="CampusNearby" subtitle="Local Discovery & Partner Deals" />
      <View style={styles.content}>
        <EmptyState
          icon={<Compass size={32} color={colors.accentCyan} />}
          title="CampusNearby Discovery"
          description="Local discounts and student perks will activate in Milestone 4."
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  content: {
    flex: 1,
    justifyContent: "center"
  }
});
