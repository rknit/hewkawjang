import { Check, Trash2 } from "lucide-react";
import { useState } from "react";

type Reservation = {
  rowId: number;
  date: string;
  customer: string;
  status: "completed" | "canceled";
  total: number;
};

const initialReservations: Reservation[] = [
  {
    rowId: 1,
    date: "2025-09-14T18:30:00",
    customer: "Alice",
    status: "completed",
    total: 1500,
  },
  {
    rowId: 2,
    date: "2025-09-15T20:00:00",
    customer: "Bob",
    status: "canceled",
    total: 800,
  },
  {
    rowId: 3,
    date: "2025-09-13T12:00:00",
    customer: "Charlie",
    status: "completed",
    total: 2200,
  },
];

export default function ReservationTable() {
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Reservation | "#";
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof Reservation | "#") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    setReservations((prev) => {
      const sorted = [...prev].sort((a, b) => {
        if (key === "#") {
          return direction === "asc"
            ? a.rowId - b.rowId
            : b.rowId - a.rowId;
        }
        if (key === "date") {
          return direction === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (key === "customer") {
          return direction === "asc"
            ? a.customer.localeCompare(b.customer)
            : b.customer.localeCompare(a.customer);
        }
        if (key === "status") {
          return direction === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
        if (key === "total") {
          return direction === "asc" ? a.total - b.total : b.total - a.total;
        }
        return 0;
      });
      return sorted;
    });
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="table-auto w-full border-collapse border border-gray-300 bg-white text-black">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer"
              onClick={() => handleSort("#")}
            >
              #
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer"
              onClick={() => handleSort("customer")}
            >
              Customer
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status
            </th>
            <th
              className="border border-gray-300 px-4 py-2 cursor-pointer"
              onClick={() => handleSort("total")}
            >
              Total (THB)
            </th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation, index) => (
            <tr key={reservation.rowId}>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {reservation.rowId}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(reservation.date).toLocaleString()}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {reservation.customer}
              </td>
              <td className="border border-gray-300 px-4 py-2 capitalize">
                {reservation.status}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {reservation.total.toLocaleString()} ฿
              </td>
              <td className="border border-gray-300 px-4 py-2 flex gap-2 justify-center">
                <button className="p-2 bg-green-100 rounded hover:bg-green-200">
                  <Check className="text-green-600" size={18} />
                </button>
                <button className="p-2 bg-red-100 rounded hover:bg-red-200">
                  <Trash2 className="text-red-600" size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
