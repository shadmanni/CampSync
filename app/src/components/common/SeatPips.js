import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../theme/theme";

export const SeatPips = ({ total = 4, available = 2, accentColor = colors.mint }) => {
  const taken = Math.max(0, total - available);

  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const isTaken = i < taken;
        return (
          <View
            key={i}
            style={[
              styles.pip,
              {
                backgroundColor: isTaken ? colors.inkFaint : accentColor,
                opacity: isTaken ? 0.3 : 1
              }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  pip: {
    width: 9,
    height: 9,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.lineStrong
  }
});
