import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { X, Plus, Car } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { rideService } from "../../services/rideService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";

export const CreateRideModal = ({ visible, onClose, onCreated }) => {
  const { user } = useAuth();

  const [origin, setOrigin] = useState("North Campus Gate");
  const [destination, setDestination] = useState("Metro Station");
  const [departureTime, setDepartureTime] = useState("Today, 6:00 PM");
  const [availableSeats, setAvailableSeats] = useState("3");
  const [farePerSeat, setFarePerSeat] = useState("50");
  const [vehicle, setVehicle] = useState("Swift (White)");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!origin.trim() || !destination.trim()) {
      setErrorMsg("Please provide both pickup location and destination.");
      return;
    }
    const seats = Number(availableSeats);
    const fare = Number(farePerSeat);
    if (isNaN(seats) || seats <= 0) {
      setErrorMsg("Please enter valid available seats.");
      return;
    }

    setSubmitting(true);
    try {
      const newRide = await rideService.createRide({
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime: departureTime.trim(),
        availableSeats: seats,
        totalSeats: seats,
        farePerSeat: fare,
        vehicle: vehicle.trim(),
        driverName: user?.name || "Verified Student",
        department: user?.department || "Computer Science"
      });

      setSubmitting(false);
      onCreated(newRide);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "Failed to post ride.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Post a Campus Ride</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>PICKUP LOCATION</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. North Campus Gate 2"
              placeholderTextColor={colors.inkFaint}
              value={origin}
              onChangeText={setOrigin}
            />

            <Text style={styles.fieldLabel}>DESTINATION</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Airport / Hauz Khas Metro"
              placeholderTextColor={colors.inkFaint}
              value={destination}
              onChangeText={setDestination}
            />

            <Text style={styles.fieldLabel}>DEPARTURE TIME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Today, 6:30 PM"
              placeholderTextColor={colors.inkFaint}
              value={departureTime}
              onChangeText={setDepartureTime}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>AVAILABLE SEATS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor={colors.inkFaint}
                  value={availableSeats}
                  onChangeText={setAvailableSeats}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>FARE / SEAT (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  placeholderTextColor={colors.inkFaint}
                  value={farePerSeat}
                  onChangeText={setFarePerSeat}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>VEHICLE MODEL / COLOR</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Swift Dzire (White)"
              placeholderTextColor={colors.inkFaint}
              value={vehicle}
              onChangeText={setVehicle}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title="Publish Carpool Route"
              onPress={handleCreate}
              loading={submitting}
              variant="mint"
              size="lg"
              icon={<Car size={18} color={colors.surface} />}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 21, 15, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.borderInk,
    paddingBottom: spacing.xl,
    maxHeight: "88%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.line
  },
  headerTitle: {
    ...typography.title,
    fontSize: 20
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  body: {
    padding: spacing.containerPadding
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 11,
    marginBottom: 6
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
    marginBottom: spacing.md,
    ...shadows.hardSm
  },
  errorText: {
    ...typography.bodySm,
    color: colors.rose,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  submitBtn: {
    marginBottom: spacing.xl
  }
});
