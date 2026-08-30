import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert
} from "react-native";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { rideService } from "../../services/rideService";
import { socketService } from "../../services/socketService";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SeatPips } from "../../components/common/SeatPips";

const TABS = ["All Rides", "Events"];

export const RideListScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("All Rides");
  const [rides, setRides] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      if (selectedTab === "All Rides") {
        const data = await rideService.getRides();
        setRides(data || []);
      } else {
        const data = await rideService.getEvents();
        setEvents(data || []);
      }
    } catch (err) {
      console.warn("Failed to load rides/events:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time seat updates
  useEffect(() => {
    const handleSeatUpdate = (payload) => {
      setRides((prev) =>
        prev.map((r) => (r.id === payload.rideId ? { ...r, availableSeats: payload.availableSeats } : r))
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

  const handleBookRide = async (rideId) => {
    setBookingId(rideId);
    try {
      const res = await rideService.bookRide(rideId, 1);
      setRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, availableSeats: res.ride.availableSeats } : r))
      );
      Alert.alert("Seat Reserved! 🚗", "Your carpool seat has been successfully booked.");
    } catch (err) {
      Alert.alert("Booking Notice", err.message || "Failed to book seat.");
    } finally {
      setBookingId(null);
    }
  };

  const handleRsvpEvent = async (eventId) => {
    try {
      const res = await rideService.rsvpEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, attendeesCount: res.event.attendeesCount } : e))
      );
      Alert.alert("RSVP Confirmed! 🎉", "You are marked as attending this campus event.");
    } catch (err) {
      Alert.alert("RSVP Notice", err.message || "Failed to RSVP.");
    }
  };

  const renderRideCard = ({ item }) => {
    const isFull = item.availableSeats <= 0;
    const isBooking = bookingId === item.id;

    return (
      <PopCard style={styles.card}>
        {/* Driver Row */}
        <View style={styles.driverRow}>
          <PopAvatar name={item.driverName || "Driver"} size={38} accentColor={colors.mint} />
          <View style={styles.driverMeta}>
            <Text style={styles.driverName}>{item.driverName || "Verified Driver"}</Text>
            <View style={styles.verifiedTag}>
              <ShieldCheck size={12} color={colors.mint} />
              <Text style={styles.verifiedText}>{item.vehicle || "College Student"}</Text>
            </View>
          </View>
          <View style={styles.fareBlock}>
            <Text style={styles.fareValue}>₹{item.farePerSeat || item.price || 50}</Text>
            <Text style={styles.fareSub}>/ seat</Text>
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.routeContainer}>
          <View style={styles.timeline}>
            <View style={styles.dotOrigin} />
            <View style={styles.timelineLine} />
            <View style={styles.dotDest} />
          </View>
          <View style={styles.routeNames}>
            <Text style={styles.originText}>{item.origin}</Text>
            <Text style={styles.destText}>{item.destination}</Text>
          </View>
        </View>

        {/* Timing & Seats */}
        <View style={styles.metaRow}>
          <View style={styles.timingPill}>
            <Clock size={13} color={colors.inkFaint} />
            <Text style={styles.timingText}>{item.departureTime || "Today, 6:00 PM"}</Text>
          </View>
          <View style={styles.seatsMeter}>
            <SeatPips total={item.totalSeats || 4} available={item.availableSeats} accentColor={colors.mint} />
            <Text style={styles.seatsText}>{item.availableSeats} seats left</Text>
          </View>
        </View>

        {/* Booking CTA */}
        <View style={styles.cardFooter}>
          <PopButton
            title={isFull ? "Ride Full" : "Book 1 Seat"}
            onPress={() => handleBookRide(item.id)}
            disabled={isFull}
            loading={isBooking}
            variant="mint"
            size="sm"
            style={{ width: "100%" }}
          />
        </View>
      </PopCard>
    );
  };

  const renderEventCard = ({ item }) => {
    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.eventCategoryTag}>
            <Text style={styles.eventCategoryText}>{item.category || "Campus Event"}</Text>
          </View>
          <View style={styles.attendeesPill}>
            <Users size={12} color={colors.mint} />
            <Text style={styles.attendeesText}>{item.attendeesCount || 0} Attending</Text>
          </View>
        </View>

        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.eventMetaContainer}>
          <View style={styles.eventMetaRow}>
            <Calendar size={13} color={colors.mint} />
            <Text style={styles.eventMetaText}>{item.date || "Upcoming Weekend"}</Text>
          </View>
          <View style={styles.eventMetaRow}>
            <MapPin size={13} color={colors.mint} />
            <Text style={styles.eventMetaText}>{item.venue || "Main Auditorium"}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <PopButton
            title="I'm Going (RSVP)"
            onPress={() => handleRsvpEvent(item.id)}
            variant="mint"
            size="sm"
            style={{ width: "100%" }}
          />
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusRide"
        subtitle="Peer Carpooling & Events"
        accentColor={colors.mint}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <PopPill
            key={tab}
            label={tab}
            active={selectedTab === tab}
            accentColor={colors.mint}
            accentSoft={colors.mintSoft}
            onPress={() => setSelectedTab(tab)}
          />
        ))}
      </View>

      {/* List */}
      <FlatList
        data={selectedTab === "All Rides" ? rides : events}
        keyExtractor={(item) => item.id}
        renderItem={selectedTab === "All Rides" ? renderRideCard : renderEventCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.mint}
            colors={[colors.mint]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  card: {
    marginBottom: 14
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  driverMeta: {
    flex: 1,
    marginLeft: 10
  },
  driverName: {
    ...typography.label,
    fontSize: 14
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.mint,
    fontSize: 11,
    fontWeight: "700"
  },
  fareBlock: {
    alignItems: "flex-end"
  },
  fareValue: {
    ...typography.h2,
    fontSize: 19,
    color: colors.ink
  },
  fareSub: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 10
  },
  routeContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceInset,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12
  },
  timeline: {
    width: 16,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginRight: 8
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ink
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.lineStrong,
    marginVertical: 2
  },
  dotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint
  },
  routeNames: {
    flex: 1,
    justifyContent: "space-between",
    gap: 8
  },
  originText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "600"
  },
  destText: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "800"
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  timingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  timingText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "600"
  },
  seatsMeter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  seatsText: {
    ...typography.bodySm,
    color: colors.mint,
    fontWeight: "800",
    fontSize: 11
  },
  cardFooter: {
    marginTop: 2
  },
  eventCategoryTag: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full
  },
  eventCategoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.mint
  },
  attendeesPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  attendeesText: {
    ...typography.bodySm,
    color: colors.mint,
    fontWeight: "800"
  },
  itemTitle: {
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: 12
  },
  eventMetaContainer: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderRadius: radii.md,
    padding: 10,
    gap: 6,
    marginBottom: 12
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  eventMetaText: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "600"
  }
});
