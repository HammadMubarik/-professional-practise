import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HomePage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [counts, setCounts] = useState({ available: 0, booked: 0 });
  const [bookingStatus, setBookingStatus] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchSlotData();
    }
  }, [selectedDate, selectedTime]);

  const fetchSlotData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/slots", {
        params: {
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime
        }
      });

      setCounts({
        available: response.data.availableCount,
        booked: response.data.bookedCount
      });
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const bookSlot = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingStatus("Please select both date and time before booking.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/book", {
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        userEmail
      });

      if (response.data.success) {
        setBookingStatus(`Slot assigned: ${response.data.slot}`);
        fetchSlotData();
      } else {
        setBookingStatus(response.data.message);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus("Booking failed due to server error.");
    }
  };

  const fetchMyBookings = async () => {
    if (!userEmail) {
      setBookingStatus("User not logged in.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/my-bookings", {
        params: { email: userEmail }
      });

      if (response.data.success) {
        setUserBookings(response.data.bookings);
        setShowBookings(true);
      } else {
        setBookingStatus("Could not fetch bookings.");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookingStatus("Failed to fetch bookings.");
    }
  };

  return (
    <div className="container">
      <h2>Book a Parking Slot</h2>
      <button onClick={logout} style={{ float: "right", marginBottom: "10px" }}>Logout</button>
      <p>Logged in as: <strong>{userEmail}</strong></p>

      <label>Select Date:</label>
      <DatePicker selected={selectedDate} onChange={setSelectedDate} minDate={new Date()} />

      <label>Select Time:</label>
      <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
        <option value="">-- Select a Time --</option>
        {[
          "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
          "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
          "4:00 PM", "5:00 PM"
        ].map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>

      {selectedDate && selectedTime && (
        <>
          <h4>Available Slots: {counts.available}</h4>
          <h4>Booked Slots: {counts.booked}</h4>
        </>
      )}

      <button onClick={bookSlot}>Book Slot</button>
      <button onClick={fetchMyBookings} style={{ marginLeft: "10px" }}>Show My Bookings</button>
      {bookingStatus && <p>{bookingStatus}</p>}

      {showBookings && (
        <div>
          <h3>My Bookings</h3>
          <ul>
            {userBookings.map((b, index) => (
              <li key={index}>
                Slot: <strong>{b.slot}</strong> on <strong>{b.date}</strong> at <strong>{b.time}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HomePage;
