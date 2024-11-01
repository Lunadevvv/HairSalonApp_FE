import React, { useState, useEffect, useCallback } from 'react';
import { message, Typography, Select } from 'antd';
import { FaCalendarAlt, FaClock, FaUser, FaChevronRight } from 'react-icons/fa';
import { DownOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useBookingDateTime } from '../../../../hooks/useBookingDateTime';
import { getImgurDirectUrl } from '../../../../utils/imageUtils';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const DateTimeSelectionStep = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  selectedStylist,
  setSelectedStylist,
  selectedServices,
  selectedCombos,
  recurringBooking,
  setRecurringBooking,
  selectedSalon
}) => {
  // Local states
  const [isDateListOpen, setIsDateListOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Use the custom hook
  const {
    timeSlots,
    isLoadingSlots,
    slotsError,
    availableStylists,
    isLoadingStylists,
    stylistsError,
    fetchTimeSlots,
    fetchUnavailableSlots,
    fetchAvailableStylists,
    isSlotUnavailable,
    resetTimeSelection,
    isAuthenticated
  } = useBookingDateTime();

  // Date selection logic
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${date.getDate()}/${date.getMonth() + 1} (${days[date.getDay()]})`;
  };

  const dates = [
    { date: today, label: `Hôm nay, ${formatDate(today)}` },
    { date: tomorrow, label: `Ngày mai, ${formatDate(tomorrow)}` }
  ];

  // Check if services are selected
  const checkServiceSelected = () => {
    return (selectedServices && selectedServices.length > 0) || 
           (selectedCombos && selectedCombos.length > 0);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    console.log('Date selected:', date);
    if (!isAuthenticated()) {
      message.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }
    if (!checkServiceSelected()) {
      setFormError('Vui lòng chọn dịch vụ hoặc combo trước khi chọn ngày.');
      return;
    }

    // Lưu date với format đúng
    setSelectedDate({
      date: date.date,
      label: date.label,
      formatted: moment(date.date).format('YYYY-MM-DD')
    });
    
    resetTimeSelection(); // Reset time và stylist khi chọn ngày mới
    setIsDateListOpen(false);
    setFormError('');
  };

  // Handle time selection
  const handleTimeSelect = (slot) => {
    console.log('Time selected:', slot);
    if (!selectedDate) {
      setFormError('Vui lòng chọn ngày trước khi chọn giờ.');
      return;
    }

    // Lưu time slot ID
    setSelectedTime(slot.id);
    setSelectedStylist(null); // Reset stylist khi chọn giờ mới

    if (selectedDate?.date && selectedSalon?.salonId) {
      fetchAvailableStylists(
        selectedDate.date,
        slot.id,
        selectedSalon.salonId
      );
    }
  };

  // Handle stylist selection
  const handleStylistSelect = (stylist) => {
    console.log('Stylist selected:', stylist);
    if (!selectedTime) {
      setFormError('Vui lòng chọn giờ trước khi chọn stylist.');
      return;
    }

    // Lưu stylist code
    setSelectedStylist(stylist.code === 'None' ? 'None' : stylist.code);
    setFormError('');
  };

  // Toggle date list
  const toggleDateList = () => {
    if (!checkServiceSelected()) {
      setFormError('Vui lòng chọn dịch vụ hoặc combo trước khi chọn ngày.');
      return;
    }
    setIsDateListOpen(prev => !prev);
  };

  // Group time slots by period
  const groupTimeSlots = (slots) => {
    return {
      morning: slots.filter(slot => {
        const hour = parseInt(slot.timeStart.split(':')[0]);
        return hour >= 6 && hour < 12;
      }),
      afternoon: slots.filter(slot => {
        const hour = parseInt(slot.timeStart.split(':')[0]);
        return hour >= 12 && hour < 18;
      }),
      evening: slots.filter(slot => {
        const hour = parseInt(slot.timeStart.split(':')[0]);
        return hour >= 18 || hour < 6;
      })
    };
  };

  // Check if time slot is disabled
  const isTimeDisabled = useCallback((slot) => {
    if (!selectedDate) return false;
    
    const [hours, minutes] = slot.timeStart.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate.date);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    return selectedDateTime <= now || isSlotUnavailable(slot.id);
  }, [selectedDate, isSlotUnavailable]);

  // Render time group
  const renderTimeGroup = (groupName, slots) => (
    <div className="time-group" key={groupName}>
      <h5>{groupName}</h5>
      <div className="time-grid">
        {slots.map((slot) => (
          <button
            key={slot.id}
            className={`time-button ${selectedTime === slot.id ? 'selected' : ''} ${isTimeDisabled(slot) ? 'disabled' : ''}`}
            onClick={() => !isTimeDisabled(slot) && handleTimeSelect(slot)}
            disabled={isTimeDisabled(slot)}
          >
            {slot.timeStart.slice(0, 5)}
          </button>
        ))}
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate.date);
      fetchUnavailableSlots(selectedDate.date);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      message.error('Vui lòng đăng nhập để đặt lịch');
      // Có thể redirect đến trang login ở đây
      // navigate('/login');
      return;
    }
  }, []);

  useEffect(() => {
    console.log('DateTimeSelectionStep received salon:', selectedSalon);
  }, [selectedSalon]);

  // Recurring booking options
  const recurringOptions = [
    { value: null, label: 'Không đặt lịch định kỳ hàng tuần' },
    { value: 1, label: 'Mỗi tuần' },
    { value: 2, label: 'Mỗi 2 tuần' },
    { value: 3, label: 'Mỗi 3 tuần' },
    { value: 4, label: 'Mỗi 4 tuần' },
  ];

  return (
    <div className="date-time-selection">
      {/* Date Selection */}
      <div className="date-selection">
        <div className="date-dropdown" onClick={toggleDateList}>
          <FaCalendarAlt className="icon" />
          <span>{selectedDate ? selectedDate.label : 'Chọn ngày'}</span>
          <FaChevronRight className={`arrow ${isDateListOpen ? 'open' : ''}`} />
        </div>

        {isDateListOpen && (
          <div className="date-list">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`date-item ${selectedDate && selectedDate.label === date.label ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <span>{date.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="time-selection">
          <h4>
            <FaClock className="icon" />
            Chọn giờ
          </h4>
          {isLoadingSlots ? (
            <p>Đang tải khung giờ...</p>
          ) : slotsError ? (
            <p className="error-message">{slotsError}</p>
          ) : timeSlots.length > 0 ? (
            <>
              {renderTimeGroup('Buổi sáng', groupTimeSlots(timeSlots).morning)}
              {renderTimeGroup('Buổi chiều', groupTimeSlots(timeSlots).afternoon)}
              {renderTimeGroup('Buổi tối', groupTimeSlots(timeSlots).evening)}
            </>
          ) : (
            <p>Không có khung giờ nào khả dụng.</p>
          )}
        </div>
      )}

      {/* Stylist Selection */}
      {selectedDate && selectedTime && (
        <div className="stylist-selection">
          <h4>
            <FaUser className="icon" />
            Chọn Stylist
          </h4>
          {isLoadingStylists ? (
            <p>Đang tải danh sách stylist...</p>
          ) : stylistsError ? (
            <p className="error-message">{stylistsError}</p>
          ) : availableStylists.length > 0 ? (
            <div className="stylist-list">
              {/* Option for automatic stylist selection */}
              <div
                className={`stylist-item ${selectedStylist === 'None' ? 'selected' : ''}`}
                onClick={() => handleStylistSelect({ code: 'None' })}
              >
                <div className="stylist-info centered-text">
                  <p className="stylist-name">Để chúng tôi chọn giúp bạn</p>
                </div>
                {selectedStylist === 'None' && <div className="check-icon">✓</div>}
              </div>

              {/* Available stylists */}
              {availableStylists.map((stylist) => (
                <div
                  key={stylist.code}
                  className={`stylist-item ${selectedStylist === stylist.code ? 'selected' : ''}`}
                  onClick={() => handleStylistSelect(stylist)}
                >
                  <img 
                    src={getImgurDirectUrl(stylist.image)} 
                    alt={`${stylist.firstName} ${stylist.lastName}`} 
                  />
                  <div className="stylist-info">
                    <p className="stylist-name">{`${stylist.firstName} ${stylist.lastName}`}</p>
                  </div>
                  {selectedStylist === stylist.code && <div className="check-icon">✓</div>}
                </div>
              ))}
            </div>
          ) : (
            <p>Không có stylist nào khả dụng cho khung giờ này.</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {formError && <p className="form-error">{formError}</p>}

      {/* Recurring Booking Options */}
      <div className="recurring-booking">
        <Title level={4}>Đặt lịch định kỳ (Không bắt buộc)</Title>
        <Paragraph>
          Bạn có muốn đặt lịch định kỳ không? Điều này sẽ giúp bạn tiết kiệm thời gian cho những lần đặt lịch tiếp theo.
        </Paragraph>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn tần suất đặt lịch"
          onChange={setRecurringBooking}
          value={recurringBooking}
          suffixIcon={<DownOutlined />}
        >
          {recurringOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default DateTimeSelectionStep; 