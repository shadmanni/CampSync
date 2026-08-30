import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from "react-native";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Plus
} from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { CategoryPill } from "../../components/common/CategoryPill";
import { PrimaryButton } from "../../components/common/PrimaryButton";

const RIDE_TABS = ["All Rides", "To Metro", "To Airport", "City Center", "Events"];

const SAMPLE_RIDES = [
  {
    id: "ride-1",
    driverName: "Vikram Mehta",
    department: "Electrical Engg",
    origin: "North Campus Gate 2",
    destination: "Indira Gandhi Airport (DEL)",
    departureTime: "Today, 6:30 PM",
    availableSeats: 3,
    totalSeats: 4,
    farePerSeat: 220,
    vehicle: "Swift Dzire (White)"
  },
  {
    id: "ride-2",
    driverName: "Sneha Kapoor",
    department: "Management Studies",
    origin: "Hostel Block C",
    destination: "Hauz Khas Metro Station",
    departureTime: "Tomorrow, 8:15 AM",
    availableSeats: 2,
    totalSeats: 3,
    farePerSeat: 80,
    vehicle: "Hyundai i20 (Blue)"
  },
  {
    id: "ride-3",
    driverName: "Arjun Reddy",
    department: "Computer Science",
    origin: "Main Admin Block",
    destination: "Cyber Hub Gurugram",
    departureTime: "Tomorrow, 5:00 PM",
    availableSeats: 1,
    totalSeats: 4,
    farePerSeat: 150,
    vehicle: "Honda City (Silver)"
  }
];

export const RideListScreen = () => {
  const [selectedTab, setSelectedTab] = useState("All Rides");
  const [rides, setRides] = useState(SAMPLE_RIDES);

  const renderRideCard = ({ item }) => {
    return (
      <GlassCard style={styles.card}>
        {/* Driver Header */}
        <View style={styles.driverRow}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarLetter}>
              {item.driverName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.driverMeta}>
            <Text style={styles.driverName}>{item.driverName}</Text>
            <View style={styles.verifiedTag}>
              <ShieldCheck size={12} color={colors.accentEmerald} />
              <Text style={styles.verifiedText}>{item.department}</Text>
            </View>
          </View>
          <View style={styles.fareBadge}>
            <Text style={styles.fareText}>₹{item.farePerSeat}</Text>
            <Text style={styles.fareSub}>/ seat</Text>
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.routeContainer}>
          <View style={styles.routeTimeline}>
            <View style={styles.dotOrigin} />
            <View style={styles.line} />
            <View style={styles.dotDest} />
          </View>
          <View style={styles.routeLocations}>
            <Text style={styles.originText}>{item.origin}</Text>
            <Text style={styles.destText}>{item.destination}</Text>
          </View>
        </View>

        {/* Timing & Seats Left */}
        <View style={styles.rideMetaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.primary} />
            <Text style={styles.metaText}>{item.departureTime}</Text>
          </View>
          <View style={styles.seatsPill}>
            <Users size={13} color={colors.secondary} />
            <Text style={styles.seatsText}>{item.availableSeats} seats left</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Footer CTA */}
        <View style={styles.cardFooter}>
          <Text style={styles.vehicleText}>{item.vehicle}</Text>
          <PrimaryButton
            title="Join Ride"
            onPress={() => {}}
            style={styles.joinBtn}
            textStyle={{ fontSize: 13 }}
          />
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="CampusRide" subtitle="Verified Peer Carpooling & Events" />

      {/* Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RIDE_TABS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryPill
              label={item}
              active={selectedTab === item}
              onPress={() => setSelectedTab(item)}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Rides List */}
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderRideCard}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  categoryContainer: {
    paddingVertical: spacing.md
  },
  categoriesList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 100
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md
  },
  driverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  driverAvatarLetter: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15
  },
  driverMeta: {
    flex: 1
  },
  driverName: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.accentEmerald,
    fontSize: 11,
    fontWeight: "600"
  },
  fareBadge: {
    alignItems: "flex-end"
  },
  fareText: {
    ...typography.h2,
    fontSize: 19,
    color: colors.primary
  },
  fareSub: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 10
  },
  routeContainer: {
    flexDirection: "row",
    backgroundColor: colors.bgSubtle,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md
  },
  routeTimeline: {
    width: 16,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginRight: spacing.sm
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.outline,
    marginVertical: 2
  },
  dotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary
  },
  routeLocations: {
    flex: 1,
    justifyContent: "space-between",
    gap: 12
  },
  originText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  destText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: "700"
  },
  rideMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metaText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  seatsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accentOrangeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  seatsText: {
    ...typography.bodySm,
    color: colors.secondary,
    fontWeight: "700",
    fontSize: 11
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.sm
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  vehicleText: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  joinBtn: {
    paddingVertical: 9,
    paddingHorizontal: 20
  }
});
