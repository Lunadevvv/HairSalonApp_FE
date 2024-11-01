// src/hooks/useBooking.js
import { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

export const useBooking = () => {
  // States for stylists
  const [stylists, setStylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for time slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Fetch stylists
  const fetchStylists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        'http://localhost:8080/api/v1/staff',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data && response.data.code === 200) {
        setStylists(response.data.result || []);
      } else {
        setError('Không thể lấy danh sách stylist');
        setStylists([]);
      }
    } catch (error) {
      console.error('Error fetching stylists:', error);
      setError('Lỗi khi lấy danh sách stylist: ' + (error.response?.data?.message || error.message));
      setStylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch time slots
  const fetchTimeSlots = async (date) => {
    if (!date) return;
    
    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(
        'http://localhost:8080/api/v1/slot',
        {
          params: { date: formattedDate },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data && response.data.code === 200) {
        setTimeSlots(response.data.result || []);
      } else {
        setSlotsError('Không thể lấy danh sách khung giờ');
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setSlotsError('Lỗi khi lấy khung giờ: ' + (error.response?.data?.message || error.message));
      setTimeSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  return {
    // Stylist data
    stylists,
    isLoading,
    error,
    fetchStylists,

    // Time slots data
    timeSlots,
    isLoadingSlots,
    slotsError,
    fetchTimeSlots
  };
};