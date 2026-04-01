import { Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';

// Get all appointments for a patient
export const getPatientAppointments = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.userId;

    const query: any = { patientId: userId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'firstName lastName email specialization')
      .sort({ date: -1, time: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments', details: error.message });
  }
};

// Get all appointments for a doctor
export const getDoctorAppointments = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const userId = req.userId;

    const query: any = { doctorId: userId };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email dateOfBirth')
      .sort({ date: 1, time: 1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments', details: error.message });
  }
};

// Create a new appointment
export const createAppointment = async (req: any, res: Response) => {
  try {
    const { doctorId, date, time, duration = 30, type = 'consultation', notes, reason } = req.body;
    const patientId = req.userId;

    // Validate doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Doctor already has an appointment at this time' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date: new Date(date),
      time,
      duration,
      type: type === 'in-person' ? 'in-person' : 'video',
      reason,
      notes
    });

    await appointment.save();
    await appointment.populate('doctorId', 'firstName lastName email specialization');

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment', details: error.message });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.userId;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is authorized (patient or doctor)
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();
    await appointment.populate(['doctorId', 'patientId']);

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user is authorized (patient or doctor)
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment', details: error.message });
  }
};

// Get available time slots for a doctor on a specific date
export const getAvailableSlots = async (req: any, res: Response) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'Doctor ID and date are required' });
    }

    // Get all appointments for the doctor on that date
    const appointments = await Appointment.find({
      doctorId,
      date: new Date(date as string),
      status: { $in: ['scheduled', 'completed'] }
    }).select('time duration');

    // Generate all possible time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(time);
      }
    }

    // Filter out occupied slots
    const occupiedSlots = new Set();
    appointments.forEach(apt => {
      const [hour, minute] = apt.time.split(':').map(Number);
      const duration = apt.duration || 30;
      const slots = duration / 30;
      
      for (let i = 0; i < slots; i++) {
        const slotHour = hour + Math.floor((minute + (i * 30)) / 60);
        const slotMinute = (minute + (i * 30)) % 60;
        const time = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
        occupiedSlots.add(time);
      }
    });

    const availableSlots = allSlots.filter(slot => !occupiedSlots.has(slot));

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error: any) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots', details: error.message });
  }
};
