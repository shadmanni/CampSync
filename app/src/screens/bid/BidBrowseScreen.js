import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gavel, Sparkles } from "lucide-react-native";
import { colors, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { EmptyState } from "../../components/common/EmptyState";

export const BidBrowseScreen = () => {
  return (
    <View style={styles.container}>
      <HeaderBar title="CampusBid" subtitle="Student Marketplace" />
      <View style={styles.content}>
        <EmptyState
          icon={<Gavel size={32} color={colors.accentAmber} />}
          title="CampusBid Marketplace"
          description="Live student marketplace with real-time bidding will activate in Milestone 2."
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
