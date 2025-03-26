
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HomePage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [counts, setCounts] = useState({ available: 0, booked: 0 });

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

      setAvailableSlots(response.data.availableSlots);
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
        userEmail: "demo@example.com" // Replace with actual user later
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
  

  return (
    <div className="container">
      <h2>Book a Parking Slot</h2>

      <label>Select Date:</label>
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} minDate={new Date()} />

      <label>Select Time:</label>
      <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
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

      {selectedDate && selectedTime && (
        <>
          <h4>Available Slots: {counts.available}</h4>
          <h4>Booked Slots: {counts.booked}</h4>
        </>
      )}

      <button onClick={bookSlot}>Book Slot</button>
      {bookingStatus && <p>{bookingStatus}</p>}
    </div>
  );
}

export default HomePage;
