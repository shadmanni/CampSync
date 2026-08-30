import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import {
  Car,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Plus,
  Calendar,
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { rideService } from "../../services/rideService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SeatPips } from "../../components/common/SeatPips";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { CreateRideModal } from "./CreateRideModal";

const RIDE_DESTINATIONS = ["All Rides", "Metro", "Airport", "City Center", "Events"];

export const RideListScreen = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("All Rides");
  const [rides, setRides] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      if (activeTab === "Events") {
        const eventsData = await rideService.getEvents();
        setEvents(eventsData || []);
      } else {
        const destinationParam = activeTab === "All Rides" ? "" : activeTab;
        const ridesData = await rideService.getRides(destinationParam);
        setRides(ridesData || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load rides.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time seat updates
  useEffect(() => {
    const handleSeatUpdate = (update) => {
      setRides((prev) =>
        prev.map((r) =>
          r.id === update.rideId
            ? { ...r, availableSeats: update.availableSeats }
            : r
        )
      );
    };

    socketService.on("ride:seat_updated", handleSeatUpdate);
    return () => {
      socketService.off("ride:seat_updated", handleSeatUpdate);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleBookSeat = async (ride) => {
    if (ride.availableSeats <= 0) {
      Alert.alert("Fully Booked", "This ride has no seats remaining.");
      return;
    }

    try {
      await rideService.bookSeat(ride.id, 1, user?.name || "Verified Student");
      // Optimistically update
      setRides((prev) =>
        prev.map((r) => (r.id === ride.id ? { ...r, availableSeats: r.availableSeats - 1 } : r))
      );
      Alert.alert("Seat Reserved!", `You've joined ${ride.driverName}'s ride to ${ride.destination}.`);
    } catch (err) {
      Alert.alert("Booking Failed", err.message || "Could not reserve seat.");
    }
  };

  const handleRsvpEvent = async (event) => {
    try {
      await rideService.rsvpEvent(event.id);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id ? { ...ev, attendeesCount: (ev.attendeesCount || 0) + 1, isRsvpd: true } : ev
        )
      );
      Alert.alert("RSVP Confirmed!", `You're marked as going to ${event.title}!`);
    } catch (err) {
      Alert.alert("RSVP Failed", err.message || "Could not confirm RSVP.");
    }
  };

  const renderRideCard = ({ item }) => {
    const isFull = item.availableSeats <= 0;

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.driverRow}>
            <PopAvatar name={item.driverName || "Driver"} size={36} />
            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>{item.driverName || "Verified Student"}</Text>
              <Text style={styles.driverDept}>{item.department || "Hostel Resident"}</Text>
            </View>
          </View>

          <View style={styles.fareContainer}>
            <Text style={styles.farePrice}>₹{item.farePerSeat || 0}</Text>
            <Text style={styles.fareLabel}>/ seat</Text>
          </View>
        </View>

        {/* Route Details */}
        <PopCard style={styles.routeBox} variant="inset">
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: colors.mint }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: colors.coral }]} />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.originText}>{item.origin}</Text>
            <Text style={styles.destinationText}>{item.destination}</Text>
          </View>
        </PopCard>

        {/* Meta details & Seat Pips */}
        <View style={styles.metaRow}>
          <View style={styles.timeBadge}>
            <Clock size={13} color={colors.ink} />
            <Text style={styles.timeText}>{item.departureTime}</Text>
          </View>

          <View style={styles.seatPipsRow}>
            <SeatPips total={item.totalSeats || 4} available={item.availableSeats} accentColor={colors.mint} />
            <Text style={[styles.seatsCount, isFull && { color: colors.rose }]}>
              {isFull ? "FULL" : `${item.availableSeats} left`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.vehicleText}>{item.vehicle || "Verified Car"}</Text>
          <PopButton
            title={isFull ? "Fully Booked" : "Join Ride"}
            onPress={() => handleBookSeat(item)}
            disabled={isFull}
            variant="mint"
            size="sm"
          />
        </View>
      </PopCard>
    );
  };

  const renderEventCard = ({ item }) => {
    return (
      <PopCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.eventTag, { backgroundColor: colors.mintSoft }]}>
            <Calendar size={13} color={colors.mint} />
            <Text style={styles.eventTagText}>CAMPUS EVENT</Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventVenue}>📍 {item.venue}</Text>
        <Text style={styles.eventDesc}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.attendeesText}>
            👥 <Text style={{ fontWeight: "800", color: colors.ink }}>{item.attendeesCount || 0}</Text> students going
          </Text>
          <PopButton
            title={item.isRsvpd ? "Going ✓" : "I'm Going"}
            onPress={() => handleRsvpEvent(item)}
            disabled={item.isRsvpd}
            variant="mint"
            size="sm"
          />
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusRide"
        subtitle="Peer Carpools & Campus Gatherings"
        accentColor={colors.mint}
        onNotificationPress={() => {}}
      />

      {/* Destination Tabs */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RIDE_DESTINATIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={activeTab === item}
              accentColor={colors.mint}
              accentSoftColor={colors.mintSoft}
              onPress={() => setActiveTab(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Content Feed */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load carpools"
          message={error}
          onRetry={() => loadData()}
        />
      ) : (
        <FlatList
          data={activeTab === "Events" ? events : rides}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === "Events" ? renderEventCard : renderRideCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.mint}
              colors={[colors.mint]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Car size={32} color={colors.mint} />}
              title={activeTab === "Events" ? "No events scheduled" : "No carpools found"}
              description="Be the first student to post a ride route or campus event!"
              actionTitle={activeTab === "Events" ? "Create Event" : "Post a Ride"}
              onAction={() => setCreateModalVisible(true)}
              accentVariant="mint"
            />
          }
        />
      )}

      {/* Floating Action Button */}
      {activeTab !== "Events" && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setCreateModalVisible(true)}
        >
          <Plus size={24} color={colors.surface} />
        </TouchableOpacity>
      )}

      <CreateRideModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(newRide) => {
          setRides((prev) => [newRide, ...prev]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  categoryRow: {
    paddingVertical: spacing.md
  },
  categoryList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90
  },
  card: {
    marginBottom: spacing.md
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  driverMeta: {
    marginLeft: spacing.sm
  },
  driverName: {
    ...typography.badge,
    fontSize: 13,
    color: colors.ink
  },
  driverDept: {
    ...typography.bodySm,
    fontSize: 11
  },
  fareContainer: {
    alignItems: "flex-end"
  },
  farePrice: {
    ...typography.title,
    fontSize: 19,
    color: colors.mint
  },
  fareLabel: {
    ...typography.caption,
    fontSize: 10
  },
  routeBox: {
    flexDirection: "row",
    padding: spacing.md,
    marginBottom: spacing.md
  },
  timeline: {
    width: 14,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
    marginRight: spacing.sm
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.line,
    marginVertical: 2
  },
  routeTextCol: {
    flex: 1,
    justifyContent: "space-between",
    gap: 8
  },
  originText: {
    ...typography.bodySm,
    fontWeight: "600",
    color: colors.ink
  },
  destinationText: {
    ...typography.heading,
    fontSize: 14.5,
    color: colors.ink
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  timeText: {
    ...typography.bodySm,
    fontWeight: "600",
    color: colors.ink
  },
  seatPipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  seatsCount: {
    ...typography.badge,
    fontSize: 11,
    color: colors.mint
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: spacing.sm
  },
  vehicleText: {
    ...typography.bodySm,
    fontSize: 11.5,
    color: colors.inkFaint
  },
  eventTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderInk
  },
  eventTagText: {
    ...typography.badge,
    fontSize: 10.5,
    color: colors.mint
  },
  eventTitle: {
    ...typography.heading,
    fontSize: 17,
    marginBottom: 2
  },
  eventVenue: {
    ...typography.bodySm,
    fontWeight: "700",
    color: colors.inkSoft,
    marginBottom: 6
  },
  eventDesc: {
    ...typography.body,
    marginBottom: spacing.md
  },
  attendeesText: {
    ...typography.bodySm,
    color: colors.inkSoft
  },
  fab: {
    position: "absolute",
    bottom: 22,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hard
  }
});
