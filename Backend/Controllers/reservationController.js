const Reservation = require("../Model/Reservation");

// Table availability counts per package
const initialTableCounts = {
  single: 10,  // All days 10
  two: 20,
  family4: 12,
  family6: 8,
  vip2: 8,
  vip4: 6,
  vip6: 4,
};

const packagePrices = {
  single: 2000,
  two: 3500,
  family4: 7000,
  family6: 10500,
  vip2: 7000,
  vip4: 13000,
  vip6: 19500,
};

// In-memory availability per date
let dailyAvailability = {};

// Get availability for a specific date
exports.getAvailability = (req, res) => {
  const { date } = req.query;
  if (!date) return res.json(initialTableCounts);

  if (!dailyAvailability[date]) dailyAvailability[date] = { ...initialTableCounts };
  res.json(dailyAvailability[date]);
};

// Create reservation
exports.createReservation = async (req, res) => {
  const { packageType, guests, date, time, cardDetails } = req.body;

  // Block past dates
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const sriLankaTime = new Date(utc + 5.5 * 60 * 60000);
  const todayStr = sriLankaTime.toISOString().split("T")[0];
  if (date < todayStr) return res.status(400).json({ message: "Cannot book past dates." });

  // Time validation 09:00–23:30
  const [hour, min] = time.split(":").map(Number);
  if (hour < 9 || (hour === 23 && min > 30) || hour > 23)
    return res.status(400).json({ message: "Time must be between 09:00 and 23:30." });

  if (!dailyAvailability[date]) dailyAvailability[date] = { ...initialTableCounts };

  if (!dailyAvailability[date][packageType] || dailyAvailability[date][packageType] <= 0)
    return res.status(400).json({ message: "No tables available for this package on selected date." });

  const reservation = new Reservation({
    packageType,
    guests,
    date,
    time,
    price: packagePrices[packageType],
    cardDetails,
  });

  try {
    await reservation.save();
    dailyAvailability[date][packageType] -= 1;
    res.json({ message: "Reservation successful!", reservation });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all reservations
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { packageType, guests, date, time } = req.body;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    // If date or packageType changed, adjust availability
    if (reservation.date !== date || reservation.packageType !== packageType) {
      // Restore old availability
      if (!dailyAvailability[reservation.date]) dailyAvailability[reservation.date] = { ...initialTableCounts };
      dailyAvailability[reservation.date][reservation.packageType] += 1;

      // Deduct new availability
      if (!dailyAvailability[date]) dailyAvailability[date] = { ...initialTableCounts };
      if (dailyAvailability[date][packageType] <= 0)
        return res.status(400).json({ message: "No tables available for this package on selected date." });

      dailyAvailability[date][packageType] -= 1;
    }

    // Update fields
    reservation.packageType = packageType;
    reservation.guests = guests;
    reservation.date = date;
    reservation.time = time;
    reservation.price = packagePrices[packageType];

    await reservation.save();
    res.json({ message: "Reservation updated successfully", reservation });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (reservation) {
      if (!dailyAvailability[reservation.date]) dailyAvailability[reservation.date] = { ...initialTableCounts };
      dailyAvailability[reservation.date][reservation.packageType] += 1;
      res.json({ message: "Reservation canceled successfully." });
    } else {
      res.status(404).json({ message: "Reservation not found." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
