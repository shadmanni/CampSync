import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Car, Sparkles } from "lucide-react-native";
import { colors, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { EmptyState } from "../../components/common/EmptyState";

export const RideListScreen = () => {
  return (
    <View style={styles.container}>
      <HeaderBar title="CampusRide & Events" subtitle="Carpools & Gatherings" />
      <View style={styles.content}>
        <EmptyState
          icon={<Car size={32} color={colors.accentEmerald} />}
          title="CampusRide Carpools"
          description="Carpool sharing with atomic seat reservations will activate in Milestone 3."
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
