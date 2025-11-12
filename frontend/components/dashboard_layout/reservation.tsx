import {
  updateReservationStatus,
  confirmReservation,
  markCustomerArrived,
  markCustomerNoShow,
} from '@/apis/reservation.api';
import { fetchReservationsByRestaurant } from '@/apis/restaurant.api';
import { fetchUserById } from '@/apis/user.api';
import { Check, X, UserCheck, UserX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

// Database enum values (match pgEnum 'reservation_status')
type ReservationStatus =
  | 'unconfirmed'
  | 'expired'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed'
  | 'uncompleted';

type Reservation = {
  id: number;
  date: string; // ISO string
  customerName: string;
  userId?: number;
  status: ReservationStatus;
  total: number; // in THB
  reserveAt?: string; // ISO string for arrival check
};

// Data comes from public API via fetchReservationsByRestaurant

interface ReservationProps {
  restaurantId: number;
}

export default function Reservation({ restaurantId }: ReservationProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'pending' | 'history'>(
    'upcoming',
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Reservation;
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'asc' });

  const handleSort = (key: keyof Reservation) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 50;
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [maxPage, setMaxPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch paginated reservations for current filter and page
        const statusParam =
          filter === 'pending'
            ? 'unconfirmed'
            : filter === 'upcoming'
              ? 'confirmed'
              : [
                  'completed',
                  'cancelled',
                  'rejected',
                  'expired',
                  'uncompleted',
                ];

        const offset = (page - 1) * limit;
        const data = await fetchReservationsByRestaurant(restaurantId, {
          status: statusParam as any,
          offset,
          limit,
        });

        // Testing
        // console.log(
        //   'Reservation API result:',
        //   data,
        //   'page',
        //   page,
        //   'offset',
        //   offset,
        // );

        if (!mounted) return;

        if (data === null) {
          setReservations([]);
          setError('Failed to load reservations');
        } else {
          const mapped = data.map((d: any) => {
            console.log(d);
            return {
              id: d.id,
              date: d.reserveAt || d.createdAt || new Date().toISOString(),
              customerName: `Guest #${d.userId}`,
              userId: d.userId,
              status: (d.status as ReservationStatus) || 'unconfirmed',
              total: d.reservationFee,
              reserveAt: d.reserveAt, // Store for arrival time check
            };
          });

          setReservations(mapped);
          // set pagination flags
          const pageFull = Array.isArray(data) && data.length === limit;
          setHasMore(pageFull);
          setMaxPage((mp) => Math.max(mp, pageFull ? page + 1 : page));

          // Fetch user names for unique userIds on this page
          const userIdSet = new Set<number>(
            mapped.map((m) => m.userId).filter((v): v is number => Boolean(v)),
          );
          const userIds = Array.from(userIdSet);
          const namesMap: Record<number, string> = {};
          await Promise.all(
            userIds.map(async (uid) => {
              const user = await fetchUserById(uid);
              if (user)
                namesMap[uid] =
                  user.displayName || `${user.firstName} ${user.lastName}`;
            }),
          );
          // attach names
          setReservations((prev) =>
            prev.map((r) => ({
              ...r,
              customerName:
                r.userId && namesMap[r.userId]
                  ? namesMap[r.userId]
                  : r.customerName,
            })),
          );
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Unknown error');
        setReservations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [restaurantId, filter, page]);

  // derive filtered list: map UI tabs to DB statuses
  const filtered = useMemo(() => {
    if (filter === 'upcoming')
      return reservations.filter((r) => r.status === 'confirmed');
    if (filter === 'pending')
      return reservations.filter((r) => r.status === 'unconfirmed');
    // history: completed, cancelled, rejected, expired, uncompleted
    return reservations.filter((r) =>
      ['completed', 'cancelled', 'rejected', 'expired', 'uncompleted'].includes(
        r.status,
      ),
    );
  }, [filter, reservations]);

  // apply sorting to filtered list
  const displayed = useMemo(() => {
    const list = [...filtered];
    if (!sortConfig) return list;
    const { key, direction } = sortConfig;
    list.sort((a, b) => {
      const dir = direction === 'asc' ? 1 : -1;
      if (key === 'id' || key === 'total') {
        return (Number(a[key]) - Number(b[key])) * dir;
      }
      if (key === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      }
      // string compare for name and status
      const av = String((a as any)[key] || '').toLowerCase();
      const bv = String((b as any)[key] || '').toLowerCase();
      return av.localeCompare(bv) * dir;
    });
    return list;
  }, [filtered, sortConfig]);

  const handleApprove = (id: number) => {
    // optimistic update to confirmed
    const prev = reservations;
    setReservations((p) =>
      p.map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r)),
    );
    (async () => {
      const ok = await confirmReservation(id);
      if (!ok) {
        setReservations(prev);
        Alert.alert('Failed', `Failed to approve reservation #${id}`);
      } else {
        Alert.alert('Reservation approved', `Reservation #${id} approved`);
      }
    })();
  };

  const handleReject = (id: number) => {
    const prev = reservations;
    setReservations((p) =>
      p.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
    );
    (async () => {
      const ok = await updateReservationStatus(
        id,
        'rejected',
        'restaurant_owner',
      );
      if (!ok) {
        setReservations(prev);
        Alert.alert('Failed', `Failed to reject reservation #${id}`);
      } else {
        Alert.alert(
          'Reservation Rejected',
          `Reservation #${id} has been rejected. Full refund processed to customer's wallet.`,
        );
      }
    })();
  };

  const handleArrived = (id: number) => {
    const prev = reservations;
    setReservations((p) =>
      p.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)),
    );
    (async () => {
      const ok = await markCustomerArrived(id);
      if (!ok) {
        setReservations(prev);
        Alert.alert('Failed', `Failed to mark customer as arrived #${id}`);
      } else {
        Alert.alert(
          'Customer Arrived',
          `Customer for reservation #${id} has been marked as arrived. 95% refund processed.`,
        );
      }
    })();
  };

  const handleNoShow = (id: number) => {
    const prev = reservations;
    setReservations((p) =>
      p.map((r) => (r.id === id ? { ...r, status: 'uncompleted' } : r)),
    );
    (async () => {
      const ok = await markCustomerNoShow(id);
      if (!ok) {
        setReservations(prev);
        Alert.alert('Failed', `Failed to mark customer as no-show #${id}`);
      } else {
        Alert.alert(
          'No-Show Recorded',
          `Customer for reservation #${id} marked as no-show. 95% payout processed to restaurant.`,
        );
      }
    })();
  };

  // Check if arrival window has passed (15 minutes after reservation time)
  const isArrivalWindowPassed = (reserveAt?: string): boolean => {
    if (!reserveAt) return false;
    const reserveTime = new Date(reserveAt);
    const now = new Date();
    const minutesSinceReservation =
      (now.getTime() - reserveTime.getTime()) / (1000 * 60);
    return minutesSinceReservation > 15;
  };

  return (
    <View className="p-4 rounded-md shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setFilter('upcoming')}
            className={`px-3 py-2 mx-1 rounded border border-[#E05910] ${filter === 'upcoming' ? 'bg-[#E05910]' : 'bg-[#FFFFFF]'}`}
          >
            <Text
              className={`${filter === 'upcoming' ? 'text-[#FFFFFF]' : 'text-[#E05910]'}`}
            >
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('pending')}
            className={`px-3 py-2 mx-1 rounded border border-[#E05910] ${filter === 'pending' ? 'bg-[#E05910]' : 'bg-[#FFFFFF]'}`}
          >
            <Text
              className={`${filter === 'pending' ? 'text-[#FFFFFF]' : 'text-[#E05910]'}`}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('history')}
            className={`px-3 py-2 mx-1 rounded border border-[#E05910] ${filter === 'history' ? 'bg-[#E05910]' : 'bg-[#FFFFFF]'}`}
          >
            <Text
              className={`${filter === 'history' ? 'text-[#FFFFFF]' : 'text-[#E05910]'}`}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="overflow-x-auto">
        <View className="w-[95%] border border-gray-300 m-auto bg-white">
          {/* header */}
          <View className="flex-row bg-white border-b border-gray-300">
            <TouchableOpacity
              onPress={() => handleSort('id')}
              className="w-1/12 p-3"
            >
              <Text className="font-bold">
                ID{' '}
                {sortConfig?.key === 'id'
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('date')}
              className="w-3/12 p-3"
            >
              <Text className="font-bold">
                Date{' '}
                {sortConfig?.key === 'date'
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('customerName')}
              className="w-3/12 p-3"
            >
              <Text className="font-bold">
                Customer{' '}
                {sortConfig?.key === 'customerName'
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('status')}
              className="w-2/12 p-3"
            >
              <Text className="font-bold">
                Status{' '}
                {sortConfig?.key === 'status'
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('total')}
              className="w-2/12 p-3"
            >
              <Text className="font-bold text-right">
                Total{' '}
                {sortConfig?.key === 'total'
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </Text>
            </TouchableOpacity>

            {filter === 'pending' ? (
              <Text className="w-1/12 p-3 font-bold text-center">Actions</Text>
            ) : null}

            {filter === 'upcoming' ? (
              <Text className="w-1/12 p-3 font-bold text-center">Actions</Text>
            ) : null}
          </View>

          {/* rows */}
          {displayed.length === 0 ? (
            <View className="p-4">
              <Text className="text-gray-500">No reservations</Text>
            </View>
          ) : (
            displayed.map((r) => (
              <View
                key={r.id}
                className="flex-row items-center border-b border-gray-100"
              >
                <Text className="w-1/12 p-3">{r.id}</Text>
                <Text className="w-3/12 p-3">
                  {new Date(r.date).toLocaleString()}
                </Text>
                <Text className="w-3/12 p-3">{r.customerName}</Text>
                <Text className="w-2/12 p-3 capitalize">{r.status}</Text>
                <Text className="w-2/12 p-3 text-right">
                  {r.total.toLocaleString()} ฿
                </Text>
                {filter === 'pending' ? (
                  <View className="w-1/12 p-2 flex-row justify-center gap-2">
                    {/* Approve only for pending */}
                    {r.status === 'unconfirmed' ? (
                      <TouchableOpacity
                        onPress={() => handleApprove(r.id)}
                        className="px-3 py-2 bg-green-100 rounded"
                      >
                        <Check size={16} color="#16A34A" />
                      </TouchableOpacity>
                    ) : null}

                    {/* Reject only for pending */}
                    {r.status === 'unconfirmed' ? (
                      <TouchableOpacity
                        onPress={() => handleReject(r.id)}
                        className="px-3 py-2 bg-red-100 rounded"
                      >
                        <X size={16} color="#DC2626" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}

                {filter === 'upcoming' ? (
                  <View className="w-1/12 p-2 flex-row justify-center gap-2">
                    {r.status === 'confirmed' ? (
                      <>
                        {/* Arrive button - enabled within 15 minutes of reservation time */}
                        <TouchableOpacity
                          onPress={() => handleArrived(r.id)}
                          disabled={isArrivalWindowPassed(r.reserveAt)}
                          className={`px-3 py-2 rounded ${
                            isArrivalWindowPassed(r.reserveAt)
                              ? 'bg-gray-300'
                              : 'bg-green-100'
                          }`}
                        >
                          <UserCheck
                            size={16}
                            color={
                              isArrivalWindowPassed(r.reserveAt)
                                ? '#9CA3AF'
                                : '#16A34A'
                            }
                          />
                        </TouchableOpacity>

                        {/* No-Show button - enabled after 15 minutes of reservation time */}
                        <TouchableOpacity
                          onPress={() => handleNoShow(r.id)}
                          disabled={!isArrivalWindowPassed(r.reserveAt)}
                          className={`px-3 py-2 rounded ${
                            !isArrivalWindowPassed(r.reserveAt)
                              ? 'bg-gray-300'
                              : 'bg-red-100'
                          }`}
                        >
                          <UserX
                            size={16}
                            color={
                              !isArrivalWindowPassed(r.reserveAt)
                                ? '#9CA3AF'
                                : '#DC2626'
                            }
                          />
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
        {/* pagination */}
        <View className="w-[95%] m-auto flex-row justify-end mt-2">
          <View className="flex-row items-center gap-2">
            {Array.from({ length: maxPage }, (_, i) => i + 1).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPage(p)}
                className={`px-3 py-1 rounded  ${p === page ? 'bg-[#E05910] text-white' : 'bg-white'}`}
              >
                <Text className={`${p === page ? 'text-white' : 'text-black'}`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
