// ✅ REACT NATIVE SCREEN WITH ORANGE THEME AND STATUS-BASED ACTION BUTTONS

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  fetchUserReservations,
  UserReservation,
  ReservationStatus,
} from '@/apis/user.api';

import { cancelReservation } from '@/apis/reservation.api';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';
import { fetchRestaurantById } from '@/apis/restaurant.api';
import { Restaurant } from '@/types/restaurant.type';

type ReservationWithRestaurant = UserReservation & { restaurant: Restaurant };

type FilterType = 'upcoming' | 'completed' | 'cancelled';

export default function UserReservationsScreen() {
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>(
    [],
  );
  const [filteredReservations, setFilteredReservations] = useState<
    UserReservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([
    'upcoming',
  ]);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const rawReservations = await fetchUserReservations();

      // Fetch all restaurant details in parallel
      const enrichedReservations: ReservationWithRestaurant[] =
        await Promise.all(
          rawReservations.map(async (res) => {
            const restaurant = await fetchRestaurantById(res.restaurantId);
            if (!restaurant)
              throw new Error(`Restaurant ${res.restaurantId} not found`);

            return {
              ...res,
              restaurant,
            };
          }),
        );

      setReservations(enrichedReservations);
      applyFilter(activeFilters, enrichedReservations);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  }, [loadReservations]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const toggleFilter = (filter: FilterType) => {
    let updatedFilters: FilterType[];
    if (activeFilters.includes(filter)) {
      updatedFilters = activeFilters.filter((f) => f !== filter);
    } else {
      updatedFilters = [...activeFilters, filter];
    }
    setActiveFilters(updatedFilters);
    applyFilter(updatedFilters);
  };

  const applyFilter = (filters: FilterType[], data?: UserReservation[]) => {
    const list = data || reservations;
    let newFiltered: UserReservation[] = [];

    filters.forEach((filter) => {
      if (filter === 'upcoming') {
        newFiltered.push(
          ...list.filter(
            (r) => r.status === 'unconfirmed' || r.status === 'confirmed',
          ),
        );
      } else if (filter === 'completed') {
        newFiltered.push(...list.filter((r) => r.status === 'completed'));
      } else if (filter === 'cancelled') {
        newFiltered.push(
          ...list.filter((r) =>
            ['cancelled', 'rejected', 'expired'].includes(r.status),
          ),
        );
      }
    });

    // Remove duplicates
    const uniqueFiltered = Array.from(
      new Set(newFiltered.map((r) => r.id)),
    ).map((id) => newFiltered.find((r) => r.id === id)) as UserReservation[];

    uniqueFiltered.sort(
      (a, b) =>
        new Date(a.reserveAt).getTime() - new Date(b.reserveAt).getTime(),
    );

    setFilteredReservations(uniqueFiltered);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'unconfirmed':
        return '#ec5b24';
      case 'cancelled':
        return '#ef4444';
      case 'rejected':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
      default:
        return '#10b981';
    }
  };

  const getStatusText = (status: ReservationStatus) => {
    switch (status) {
      case 'unconfirmed':
        return 'Restaurant has not confirmed your order';
      case 'confirmed':
        return 'Restaurant has confirmed your order';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canCancelReservation = (reservation: UserReservation) => {
    const reserveDate = new Date(reservation.reserveAt);
    const now = new Date();
    const hoursDiff =
      (reserveDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    console.log('cancale?', hoursDiff);
    return (
      ['unconfirmed', 'confirmed'].includes(reservation.status) &&
      hoursDiff > 24
    );
  };

  const renderActionButtons = (r: UserReservation) => {
    const actions: React.JSX.Element[] = [];

    const addTextAction = (
      label: string,
      icon: React.JSX.Element,
      onPress?: () => void,
      keySuffix?: string,
    ) => (
      <TouchableOpacity
        key={`${label}-${keySuffix ?? r.id}`}
        onPress={onPress}
        style={styles.actionLink}
      >
        {icon}
        <Text style={styles.actionLinkText}>{label}</Text>
      </TouchableOpacity>
    );

    // === Cancel ===
    if (['unconfirmed', 'confirmed'].includes(r.status)) {
      actions.push(
        addTextAction(
          'Cancel',
          <Text style={{ color: '#e05910', fontWeight: '800', marginRight: 4 }}>
            ×
          </Text>,
          () => {
            if (!canCancelReservation(r)) {
              Alert.alert(
                'Too Late to Cancel',
                'Cancellations must be made at least 24 hours in advance.',
                [{ text: 'OK', style: 'default' }],
              );
              return;
            }

            Alert.alert('Cancel Reservation', 'Are you sure?', [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                onPress: async () => {
                  try {
                    const success = await cancelReservation(r.id, 'user');
                    if (success) {
                      Alert.alert(
                        'Cancelled',
                        'Reservation has been cancelled.',
                      );
                      loadReservations();
                    } else {
                      Alert.alert('Error', 'Could not cancel reservation.');
                    }
                  } catch (e) {
                    Alert.alert('Error', 'Something went wrong.');
                  }
                },
              },
            ]);
          },
          'cancel',
        ),
      );
    }

    // === Completed ===
    if (r.status === 'completed') {
      actions.push(
        addTextAction(
          'Give Rating',
          <Entypo name="chevron-right" size={14} color="#e05910" />,
          () => {
            console.log('Give Rating pressed for', r.id);
            // TODO: Implement rating navigation here
          },
          'rating',
        ),
        addTextAction(
          'Book Again',
          <Entypo name="chevron-right" size={14} color="#e05910" />,
          () => {
            console.log('Book Again pressed for', r.id);
            // TODO: Implement book again logic here
          },
          'book-again-completed',
        ),
      );
    }

    // === Cancelled / Rejected / Expired ===
    if (['cancelled', 'rejected', 'expired'].includes(r.status)) {
      actions.push(
        addTextAction(
          'Book Again',
          <Entypo name="chevron-right" size={14} color="#e05910" />,
          () => {
            console.log('Book Again pressed for', r.id);
            // TODO: Implement book again logic here
          },
          'book-again-cancelled',
        ),
      );
    }

    return <View style={styles.actionButtonsContainer}>{actions}</View>;
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Your Reservation</Text>
          <View style={styles.filterContainer}>
            {['upcoming', 'completed', 'cancelled'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilters.includes(filter as FilterType) &&
                    styles.activeFilterButton,
                ]}
                onPress={() => toggleFilter(filter as FilterType)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilters.includes(filter as FilterType) &&
                      styles.activeFilterText,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reservations List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredReservations.length === 0 ? (
            <Text style={styles.emptyText}>No reservations found</Text>
          ) : (
            filteredReservations.map((r) => {
              const { date, time } = formatDateTime(r.reserveAt);
              return (
                <View key={r.id} style={styles.card}>
                  {/* Top Section */}
                  <View style={styles.cardTop}>
                    <View style={styles.dateTimeRow}>
                      <FontAwesome5
                        name="calendar-alt"
                        size={14}
                        color="#e05910"
                      />
                      <Text style={styles.dateTimeText}>
                        {' '}
                        {date}, {time}
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      {r.status === 'completed' ? (
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color={getStatusColor(r.status)}
                        />
                      ) : (
                        <MaterialIcons
                          name="info"
                          size={16}
                          color={getStatusColor(r.status)}
                        />
                      )}

                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(r.status) },
                        ]}
                      >
                        {' '}
                        {getStatusText(r.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Divider Line */}
                  <View style={styles.cardDivider} />

                  {/* Bottom Section */}
                  <Text style={styles.restaurantName}>{r.restaurant.name}</Text>
                  <Text style={styles.address}>
                    📍 {r.restaurant.road}, {r.restaurant.subDistrict},{' '}
                    {r.restaurant.district}
                  </Text>

                  <Text style={styles.guests}>
                    👤 {r.numberOfAdult} Adults
                    {r.numberOfChildren ? `, ${r.numberOfChildren} Kids` : ''}
                  </Text>

                  {/* Action Buttons */}
                  {renderActionButtons(r)}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerContainer: {
    backgroundColor: '#ffffffff',
    borderRadius: 5,
    padding: 16,
    borderColor: '#e05910',
    borderWidth: 2,
    maxHeight: '100%',
    maxWidth: '100%',
    width: '70%',
  },

  headerRow: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e05910',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5a474',
    backgroundColor: '#fef9f3',
  },
  activeFilterButton: {
    backgroundColor: '#e05910',
    borderColor: '#e05910',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e05910',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#e05910',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fef9f3',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e7b393',
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#e05910',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#d66a1f',
    marginVertical: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d66a1f',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#8b5e3c',
    marginBottom: 4,
  },
  guests: {
    fontSize: 14,
    color: '#8b5e3c',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallActionButton: {
    backgroundColor: '#e05910',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionLinkText: {
    color: '#e05910',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
});
