import { useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { message } from 'antd';

export const useBookingDateTime = () => {
  // States for date & time
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  // States for stylists
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [availableStylists, setAvailableStylists] = useState([]);
  const [isLoadingStylists, setIsLoadingStylists] = useState(false);
  const [stylistsError, setStylistsError] = useState(null);

  // Helper function to get token
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để đặt lịch');
    }
    return token;
  };

  // Fetch time slots for a specific date
  const fetchTimeSlots = async (date) => {
    if (!date) return;
    
    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      const token = getToken();
      const response = await axios.get('http://localhost:8080/api/v1/slot', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.code === 200) {
        setTimeSlots(response.data.result);
      } else {
        setSlotsError('Không thể lấy khung giờ: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      if (error.message === 'Vui lòng đăng nhập để đặt lịch') {
        setSlotsError(error.message);
      } else {
        setSlotsError('Lỗi khi lấy khung giờ: ' + error.message);
      }
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch unavailable slots for a specific date
  const fetchUnavailableSlots = async (date) => {
    if (!date) return;

    try {
      const token = getToken();
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(`http://localhost:8080/api/v1/slot/${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.code === 200) {
        setUnavailableSlots(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching unavailable slots:', error);
      // Handle unauthorized error
      if (error.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại để tiếp tục');
      }
    }
  };

  // Fetch available stylists for a specific date and time slot
  const fetchAvailableStylists = async (date, slotId, salonId) => {
    console.log('Stylist fetch params:', {
      date: date,
      slotId: slotId,
      salonId: salonId,
      dateType: typeof date,
      slotIdType: typeof slotId,
      salonIdType: typeof salonId
    });
    
    if (!date || !slotId || !salonId) {
      const missingParams = [];
      if (!date) missingParams.push('ngày');
      if (!slotId) missingParams.push('khung giờ');
      if (!salonId) missingParams.push('salon');
      
      const errorMsg = `Thiếu thông tin cần thiết: ${missingParams.join(', ')}`;
      console.error(errorMsg, { date, slotId, salonId });
      setStylistsError(errorMsg);
      return;
    }

    setIsLoadingStylists(true);
    setStylistsError(null);

    try {
      const token = getToken();
      const formattedDate = moment(date).format('YYYY-MM-DD');
      
      console.log('Calling stylist API with:', {
        date: formattedDate,
        slotId,
        salonId,
        url: `http://localhost:8080/api/v1/staff/stylist?slotId=${slotId}&date=${formattedDate}&salonId=${salonId}`
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/staff/stylist?slotId=${slotId}&date=${formattedDate}&salonId=${salonId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 200) {
        setAvailableStylists(response.data.result);
      } else {
        setStylistsError('Không thể lấy danh sách stylist: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching available stylists:', error);
      if (error.message === 'Vui lòng đăng nhập để đặt lịch') {
        setStylistsError(error.message);
      } else {
        setStylistsError('Lỗi khi lấy danh sách stylist: ' + error.message);
      }
    } finally {
      setIsLoadingStylists(false);
    }
  };

  // Helper function to check if a slot is unavailable
  const isSlotUnavailable = useCallback((slotId) => {
    return unavailableSlots.some(slot => slot.id === slotId);
  }, [unavailableSlots]);

  // Reset functions
  const resetTimeSelection = () => {
    setSelectedTime(null);
    setSelectedStylist(null);
  };

  const resetDateSelection = () => {
    setSelectedDate(null);
    resetTimeSelection();
  };

  return {
    // Date & Time states
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    timeSlots,
    isLoadingSlots,
    slotsError,
    unavailableSlots,
    
    // Stylist states
    selectedStylist,
    setSelectedStylist,
    availableStylists,
    isLoadingStylists,
    stylistsError,

    // Functions
    fetchTimeSlots,
    fetchUnavailableSlots,
    fetchAvailableStylists,
    isSlotUnavailable,
    resetTimeSelection,
    resetDateSelection,

    // Add error states
    isAuthenticated: () => {
      try {
        getToken();
        return true;
      } catch {
        return false;
      }
    }
  };
}; 