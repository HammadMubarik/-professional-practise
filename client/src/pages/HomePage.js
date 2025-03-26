import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HomePage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedTime]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/slots", {
        params: {
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
        },
      });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const bookSlot = async (slot) => {
    try {
      const response = await axios.post("http://localhost:5000/book", {
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        slot,
        userEmail: "demo@example.com" // Later: replace with actual user email
      });

      if (response.data.success) {
        setBookingStatus(`Slot ${slot} booked successfully!`);
        fetchAvailableSlots();
      } else {
        setBookingStatus("Booking failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error booking slot:", error);
    }
  };

  return (
    <div className="container">
      <h2>Book a Parking Slot</h2>

      <label>Select Date:</label>
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} minDate={new Date()} />

      <label>Select Time:</label>
      <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
        <option value="">Select a time</option>
        <option value="08:00 AM">8:00 - 9:00 AM</option>
        <option value="09:00 AM">9:00 - 10:00 AM</option>
        <option value="10:00 AM">10:00 - 11:00 AM</option>
        <option value="11:00 AM">11:00 - 12:00 AM</option>
        <option value="12:00 PM">12:00 - 1:00 PM</option>
        <option value="1:00 PM">1:00 - 2:00 PM </option>
        <option value="2:00 PM">2:00 - 3:00PM</option>
        <option value="3:00 PM">3:00 - 4:00PM</option>
        <option value="4:00 PM">4:00 - 5:00PM</option>
        <option value="5:00 PM">5:00 - 6:00PM</option>
      </select>

      <h3>Available Slots</h3>
      {availableSlots.length > 0 ? (
        availableSlots.map((slot, index) => (
          <button key={index} onClick={() => bookSlot(slot)}>{slot}</button>
        ))
      ) : (
        <p>No available slots.</p>
      )}

      {bookingStatus && <p>{bookingStatus}</p>}
    </div>
  );
}

export default HomePage;
