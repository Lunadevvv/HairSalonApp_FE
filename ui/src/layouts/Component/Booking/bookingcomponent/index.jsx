import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Modal } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { FaChevronLeft } from 'react-icons/fa';
import { ServiceSelectionStep } from '../components/ServiceSelectionStep';
import { DateTimeSelectionStep } from '../components/DateTimeSelectionStep';
import SalonSelection from '../components/SalonSelection';
import '../../../Component/Booking/styles/main.scss';


const BookingComponent = () => {
  // State Management
  const [step, setStep] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [recurringBooking, setRecurringBooking] = useState(null);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);

  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();



  // Handle URL step parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam !== null) {
      setStep(parseInt(stepParam, 10));
    } else {
      setStep(0);
    }
  }, [location]);

  // Thêm useEffect để log và kiểm tra selectedSalon
  useEffect(() => {
    console.log('Selected Salon Updated:', selectedSalon);
  }, [selectedSalon]);

  // Thêm useEffect để debug
  useEffect(() => {
    console.log('Booking State:', {
      selectedSalon,
      selectedServices,
      selectedCombos,
      selectedDate,
      selectedTime,
      selectedStylist,
      totalPrice
    });
  }, [selectedSalon, selectedServices, selectedCombos, selectedDate, selectedTime, selectedStylist, totalPrice]);

  // Debug useEffect
  useEffect(() => {
    console.log('Booking state updated:', {
      salon: selectedSalon,
      date: selectedDate,
      time: selectedTime,
      stylist: selectedStylist,
      services: selectedServices,
      combos: selectedCombos,
      price: totalPrice,
      recurring: recurringBooking
    });
  }, [selectedSalon, selectedDate, selectedTime, selectedStylist, 
      selectedServices, selectedCombos, totalPrice, recurringBooking]);

  // Handlers
  const handleViewAllServices = () => {
    if (selectedSalon) {
      setIsServiceModalVisible(true);
    } else {
      message.warning("Anh vui lòng chọn salon trước để xem lịch còn trống ạ!");
    }
  };

  const handleBack = () => {
    navigate('/booking?step=0');
  };

  const handleServiceSelection = (services, combos, price) => {
    setSelectedServices(services);
    setSelectedCombos(combos);
    setTotalPrice(price);
    navigate('/booking?step=0');
  };

  // Cập nhật hàm xử lý chọn salon
  const handleSalonSelect = (salon) => {
    console.log('Handling salon selection:', salon);
    if (!salon?.salonId) {
      console.error('Invalid salon data:', salon);
      message.error('Thông tin salon không hợp lệ');
      return;
    }
    setSelectedSalon(salon);
  };

  const handleSubmit = async () => {
    // Validate all required data
    if (!selectedSalon?.salonId || 
        !selectedDate?.formatted || 
        !selectedTime || 
        !selectedStylist || 
        (selectedServices.length === 0 && selectedCombos.length === 0)) {
      console.error('Missing required booking data:', {
        hasSalon: Boolean(selectedSalon?.salonId),
        hasDate: Boolean(selectedDate?.formatted),
        hasTime: Boolean(selectedTime),
        hasStylist: Boolean(selectedStylist),
        hasServices: selectedServices.length > 0 || selectedCombos.length > 0
      });
      message.error("Vui lòng điền đầy đủ thông tin đặt lịch");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error("Vui lòng đăng nhập để đặt lịch");
        return;
      }

      // Prepare booking data
      const bookingData = {
        date: selectedDate.formatted,
        stylistId: selectedStylist === 'None' ? 'None' : selectedStylist,
        slotId: parseInt(selectedTime),
        price: parseInt(totalPrice),
        serviceId: [...selectedServices, ...selectedCombos.flatMap(c => c.services)]
          .map(s => s.serviceId || s.id),
        period: recurringBooking ? parseInt(recurringBooking) : null,
        salonId: selectedSalon.salonId
      };

      console.log('Sending booking request:', bookingData);

      const response = await axios.post(
        'http://localhost:8080/api/v1/booking', 
        bookingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 201) {
        message.success("Đặt lịch thành công!");
        
        // Chuẩn bị dữ liệu để chuyển sang trang BookingSuccess
        const bookingInfo = {
          ...response.data.result,
          slot: {
            timeStart: response.data.result.timeStart || selectedTime
          },
          status: response.data.result.status || 'Đã đặt lịch',
          salon: {
            id: selectedSalon.salonId,
            name: selectedSalon.name,
            address: selectedSalon.address,
            phone: selectedSalon.phone
          }
        };

        // Chuyển hướng sang trang BookingSuccess với đầy đủ thông tin
        navigate('/booking/success', {
          state: {
            bookingInfo: bookingInfo,
            selectedServices: selectedServices,
            selectedCombos: selectedCombos,
            selectedSalon: selectedSalon // Thêm thông tin salon
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="booking-steps">
            <SalonSelection 
              selectedSalon={selectedSalon}
              onSelect={handleSalonSelect}
            />
            
            <div className="step">
              <h3>2. Chọn dịch vụ</h3>
              <div className="option" onClick={handleViewAllServices}>
                <span className="icon">✂️</span>
                <span>
                  {selectedServices.length > 0 || selectedCombos.length > 0
                    ? `Đã chọn ${selectedServices.length + selectedCombos.length} dịch vụ/combo`
                    : "Xem tất cả dịch vụ hấp dẫn"}
                </span>
                <span className="arrow">›</span>
              </div>
              {(selectedServices.length > 0 || selectedCombos.length > 0) && (
                <div className="selected-services-summary">
                  {selectedServices.map((service, index) => (
                    <p key={index}>{service.serviceName || service.name}</p>
                  ))}
                  {selectedCombos.map((combo, index) => (
                    <p key={`combo-${index}`}>{combo.name} (Combo)</p>
                  ))}
                  <p className="total-price">Tổng thanh toán: {totalPrice.toLocaleString()} VND</p>
                </div>
              )}
            </div>

            <div className="step">
              <h3>3. Chọn ngày, giờ & stylist</h3>
              <DateTimeSelectionStep 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedStylist={selectedStylist}
                setSelectedStylist={setSelectedStylist}
                selectedServices={selectedServices}
                selectedCombos={selectedCombos}
                recurringBooking={recurringBooking}
                setRecurringBooking={setRecurringBooking}
                selectedSalon={selectedSalon}
              />
            </div>
          </div>
        );
      case 2:
        return selectedSalon ? (
          <ServiceSelectionStep
            onServiceSelection={handleServiceSelection}
            initialServices={selectedServices}
            initialCombos={selectedCombos}
            initialTotalPrice={totalPrice}
          />
        ) : null;
      default:
        return null;
    }
  };

  const canSubmitBooking = () => {
    // Log chi tiết giá trị
    console.log('Detailed booking values:', {
      salon: selectedSalon,
      services: selectedServices,
      combos: selectedCombos,
      date: selectedDate,
      time: selectedTime,
      stylist: selectedStylist
    });

    const hasSalon = Boolean(selectedSalon?.salonId);
    const hasServices = selectedServices.length > 0 || selectedCombos.length > 0;
    const hasDate = Boolean(selectedDate?.date);  // Kiểm tra cụ thể date
    const hasTime = Boolean(selectedTime);        // Kiểm tra time
    const hasStylist = Boolean(selectedStylist);  // Kiểm tra stylist

    // Log từng điều kiện
    console.log('Individual conditions:', {
      hasSalon,
      hasServices,
      hasDate,
      hasTime,
      hasStylist,
      dateValue: selectedDate?.date,
      timeValue: selectedTime,
      stylistValue: selectedStylist
    });

    return hasSalon && hasServices && hasDate && hasTime && hasStylist;
  };

  return (
    <div className="booking-wrapper">
      {step > 0 && (
        <button className="back-button" onClick={handleBack}>
          <FaChevronLeft />
        </button>
      )}
      <h2>Đặt lịch giữ chỗ</h2>
      <div className="booking-container">
        {renderStepContent()}
        {step === 0 && (
          <>
            {canSubmitBooking() ? (
              <button 
                className="submit-button" 
                onClick={handleSubmit}
              >
                CHỐT GIỜ CẮT
              </button>
            ) : (
              <div className="booking-status">
                {!selectedSalon?.salonId && <p>⚠️ Vui lòng chọn salon</p>}
                {!(selectedServices.length > 0 || selectedCombos.length > 0) && <p>⚠️ Vui lòng chọn dịch vụ</p>}
                {!selectedDate && <p>⚠️ Vui lòng chọn ngày</p>}
                {!selectedTime && <p>⚠️ Vui lòng chọn giờ</p>}
                {!selectedStylist && <p>⚠️ Vui lòng chọn stylist</p>}
              </div>
            )}
          </>
        )}
      </div>  
      <Modal
        visible={isServiceModalVisible}
        onCancel={() => setIsServiceModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '1000px' }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <ServiceSelectionStep
          onServiceSelection={handleServiceSelection}
          initialServices={selectedServices}
          initialCombos={selectedCombos}
          initialTotalPrice={totalPrice}
          onClose={() => setIsServiceModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default BookingComponent;
