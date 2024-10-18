import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './index.scss';
import { serviceDetails } from '../../../../data/serviceDetails';
import { spaComboDetail } from '../../../../data/spaComboDetail';
import { hairStylingDetail } from '../../../../data/hairStylingDetail';
import { FaSearch, FaTimes, FaChevronLeft, FaUser, FaChevronRight, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { message, Radio, Typography, Select } from 'antd';
import SelectedServicesModal from '../selectservicemodal';
import stylist1 from "../../../../assets/imageHome/Stylist/Stylist_1.jpg";
import stylist2 from "../../../../assets/imageHome/Stylist/Stylist_2.jpg";
import stylist3 from "../../../../assets/imageHome/Stylist/Stylist_3.jpg";
import stylist4 from "../../../../assets/imageHome/Stylist/Stylist_4.jpg";
import stylist5 from "../../../../assets/imageHome/Stylist/Stylist_5.jpg";
import stylist6 from "../../../../assets/imageHome/Stylist/Stylist_6.jpg";
import { DownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const BookingComponent = () => {


  const [step, setStep] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [recurringBooking, setRecurringBooking] = useState(null);
  const [accountId, setAccountId] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const handleRemoveService = (index) => {
    const newServices = [...selectedServices];
    const removedService = newServices.splice(index, 1)[0];
    setSelectedServices(newServices);
    setTotalPrice(prevTotal => prevTotal - parseInt(removedService.price.replace(/\D/g, '')));
  };

  // Set fixed salon address
  const fixedSalon = {
    id: 1,
    address: "Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh 700000",
    description: "Chi nhánh duy nhất của chúng tôi",
    image: "path/to/salon/image.jpg" // Add an appropriate image path
  };

  useEffect(() => {
    setSelectedSalon(fixedSalon);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam !== null) {
      setStep(parseInt(stepParam, 10));
    } else {
      setStep(0);
    }
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token in BookingComponent:', token);

    if (!token) {
      message.error('Vui lòng đăng nhập để đặt lịch.');
      navigate('/login');
      return;
    }

    fetchAccountInfo(token);
  }, [navigate]);

  const fetchAccountInfo = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Account info response:', response.data);

      if (response.data && response.data.result && response.data.result.id) {
        setAccountId(response.data.result.id);
      } else {
        throw new Error('Không thể lấy thông tin tài khoản');
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        message.error("Có lỗi xảy ra khi lấy thông tin tài khoản. Vui lòng thử lại.");
      }
    }
  };

  const handleViewAllServices = () => {
    if (selectedSalon) {
      navigate('/booking?step=2');
    } else {
      // Hiển thị thông báo
      message.warning("Anh vui lòng chọn salon trước để xem lịch còn trống ạ!");
    }
  };

  const handleBack = () => {
    navigate('/booking?step=0');
  };

  const handleServiceSelection = (services, price) => {
    setSelectedServices(services);
    setTotalPrice(price);
    navigate('/booking?step=0');
  };

//MẪU API VÀ REQUEST DỮ LIỆU VỀ CHO BE 

  const handleSubmit = async () => {
    if (!accountId) {
      message.error("Vui lòng đăng nhập để đặt lịch.");
      navigate('/login');
      return;
    }

    // Kiểm tra các thông tin khác...
    if (!selectedSalon || selectedServices.length === 0 || !selectedStylist || !selectedDate || !selectedTime) {
      message.error("Vui lòng chọn đầy đủ thông tin trước khi đặt lịch.");
      return;
    }
//MẪU Ở ĐÂY
    const requestBody = {
      accountId: accountId,
      date: selectedDate.date.toISOString().split('T')[0].replace(/-/g, '/'),
      slotId: convertTimeToSlotId(selectedTime),
      services: selectedServices.map(service => ({
        type: service.type || "service",
        id: service.id
      })),
      recurringWeeks: recurringBooking || 0,
      stylistId: selectedStylist.id
    };
    console.log("Request Body:", requestBody);
// MẪU API
    try {
      const response = await axios.post('http://localhost:8080/api/v1/getBooking', requestBody, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.status === "success") {
        localStorage.setItem('bookingInfo', JSON.stringify(response.data.bookingDetails));
        navigate('/booking/success');
      } else {
        message.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu đặt lịch:", error.response || error);
      message.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
    }
  };

  // Hàm chuyển đổi thời gian thành slotId
  const convertTimeToSlotId = (time) => {
    const [hours, minutes] = time.split('h').map(Number);
    return (hours - 8) * 2 + (minutes === 40 ? 1 : 0);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="booking-steps">
            <div className="step">
              <h3>1. Địa chỉ salon</h3>
              <div className="option">
                <span className="icon">🏠</span>
                <span>{fixedSalon.address}</span>
              </div>
            </div>
            <div className="step">
              <h3>2. Chọn dịch vụ</h3>
              <div className="option" onClick={handleViewAllServices}>
                <span className="icon">✂️</span>
                <span>
                  {selectedServices.length > 0
                    ? `Đã chọn ${selectedServices.length} dịch vụ`
                    : "Xem tất cả dịch vụ hấp dẫn"}
                </span>
                <span className="arrow">›</span>
              </div>
              {selectedServices.length > 0 && (
                <div className="selected-services-summary">
                  {selectedServices.map((service, index) => (
                    <p key={index}>{service.title}</p>
                  ))}
                  <p className="total-price">Tổng thanh toán: {totalPrice.toLocaleString()} VND</p>
                </div>
              )}
            </div>
            <div className="step">
              <h3>3. Chọn ngày, giờ & stylist</h3>

              <DateTimeSelectionStep 
              selectedStylist={selectedStylist} 
              setSelectedStylist={setSelectedStylist}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              recurringBooking={recurringBooking}
              setRecurringBooking={setRecurringBooking}
             />
            </div>
          </div>
        );
      case 2:
        return selectedSalon ? (
          <ServiceSelectionStep
            onServiceSelection={handleServiceSelection}
            initialServices={selectedServices}
            initialTotalPrice={totalPrice}
          />
        ) : null;
      case 3:
        return (
          <DateTimeSelectionStep
            selectedStylist={selectedStylist}
            setSelectedStylist={setSelectedStylist}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            recurringBooking={recurringBooking}
            setRecurringBooking={setRecurringBooking}
          />
        );
      default:
        return null;
    }
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
        {(step === 0 || step === 3) && (
          <button className="submit-button" onClick={handleSubmit}>
            CHỐT GIỜ CẮT
          </button>
        )}
      </div>  
      <SelectedServicesModal
        visible={isModalVisible}
        onClose={hideModal}
        selectedServices={selectedServices}
        onRemoveService={handleRemoveService}
        totalPrice={totalPrice}
      />
    </div>
  );
};

const ServiceSelectionStep = ({ onServiceSelection, initialServices, initialTotalPrice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(initialServices || []);
  const [totalPrice, setTotalPrice] = useState(initialTotalPrice || 0);
  const summaryRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace(',', '.') + ' VND';
  };

  const handleAddService = (service) => {
    const isServiceSelected = selectedServices.some(s => s.title === service.title);
    if (!isServiceSelected) {
      setSelectedServices(prevServices => [...prevServices, service]);
      setTotalPrice(prevTotal => {
        const servicePrice = parseInt(service.price.replace(/\D/g, '')) || 0;
        return prevTotal + servicePrice;
      });
    } else {
      // Nếu dịch vụ đã được chọn, hãy xóa nó
      setSelectedServices(prevServices => prevServices.filter(s => s.title !== service.title));
      setTotalPrice(prevTotal => {
        const servicePrice = parseInt(service.price.replace(/\D/g, '')) || 0;
        return prevTotal - servicePrice;
      });
    }
  };


  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const handleRemoveService = (index) => {
    const newServices = [...selectedServices];
    const removedService = newServices.splice(index, 1)[0];
    setSelectedServices(newServices);
    setTotalPrice(prevTotal => {
      const servicePrice = parseInt(removedService.price.replace(/\D/g, '')) || 0;
      return prevTotal - servicePrice;
    });
  };

  const allServices = {
    ...serviceDetails,
    ...spaComboDetail,
    ...hairStylingDetail
  };

  const handleDoneSelection = () => {
    onServiceSelection(selectedServices, totalPrice);
  };

  useEffect(() => {
    const filtered = Object.entries(allServices).filter(([key, service]) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || key.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, allServices]);

  return (
    <div className="service-selection">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ, nhóm dịch vụ hoặc giá"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="category-buttons">
        <button onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'active' : ''}>Tất cả dịch vụ</button>
        <button onClick={() => setSelectedCategory('cat-goi')} className={selectedCategory === 'cat-goi' ? 'active' : ''}>Cắt gội xả massage</button>
        <button onClick={() => setSelectedCategory('uon')} className={selectedCategory === 'uon' ? 'active' : ''}>Uốn định hình tóc</button>
        <button onClick={() => setSelectedCategory('nhuom')} className={selectedCategory === 'nhuom' ? 'active' : ''}>Nhuộm tóc</button>
        <button onClick={() => setSelectedCategory('goi-combo')} className={selectedCategory === 'goi-combo' ? 'active' : ''}>Gội massage</button>
      </div>
      <div className="service-grid">
        {filteredServices.map(([key, service]) => {
          const isSelected = selectedServices.some(s => s.title === service.title);
          return (
            <div key={key} className="service-item">
              <img src={service.steps[0].image} alt={service.title} />
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="price">{service.price || 'Giá liên hệ'}</p>
                <button
                  className={`add-service ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAddService(service)}
                >
                  {isSelected ? 'Đã thêm' : 'Thêm dịch vụ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filteredServices.length === 0 && (
        <p className="no-results">Không tìm thấy dịch vụ phù hợp.</p>
      )}

      <div className="service-summary">
        <div className="summary-content">
          <span
            className="selected-services"
            onClick={showModal}
            style={{ cursor: 'pointer' }}
          >
           {`Đã chọn ${selectedServices.length} dịch vụ`}
          </span>
          <span className="total-amount">
            Tổng thanh toán: {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          className="done-button"
          disabled={selectedServices.length === 0}
          onClick={handleDoneSelection}
        >
          Xong
        </button>
      </div>

      <SelectedServicesModal
        visible={isModalVisible}
        onClose={hideModal}
        selectedServices={selectedServices}
        onRemoveService={handleRemoveService}
        totalPrice={totalPrice}
      />
    </div>
  );
};

const DateTimeSelectionStep = ({ 
  selectedStylist, 
  setSelectedStylist, 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime,
  recurringBooking,
  setRecurringBooking
}) => {
  const [isStyleListOpen, setIsStyleListOpen] = useState(false);
  const [isDateListOpen, setIsDateListOpen] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [currentStylistIndex, setCurrentStylistIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    //updat current time every minute
    const updateCurrentTime = () => setCurrentTime(new Date());
    updateCurrentTime(); //  set initial time imediately
    const timer = setInterval(updateCurrentTime, 6000);
    return () => clearInterval(timer);
  }, []);

  const isTimeDisabled = (time) => {
    if (!selectedDate) return false;
    
    const [hours, minutes] = time.split('h').map(Number);
    const selectedDateTime = new Date(selectedDate.date);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    // If selected date is today, disable times before or equal to current time
    if (selectedDate.date.toDateString() === currentTime.toDateString()) {
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      
      // If the time is earlier than or equal to current time, disable it
      if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes)) {
        return true;
      }
      
      // Disable slots within the next 30 minutes from now
      const thirtyMinutesLater = new Date(currentTime.getTime() + 30 * 60000);
      return selectedDateTime <= thirtyMinutesLater;
    }
    return false;
  };

  const times = [
 '8h00',
    '8h40', '9h00', '9h40', '10h00',
    '10h40', '11h00', '11h40', '12h00',
    '12h40', '13h00', '13h40', '14h00',
    '14h40', '15h00', '15h40', '16h00',
    '16h40', '17h00', '17h40', '18h00',
    '18h40', '19h00', '19h40', '20h00',
  ];

  const stylists = [
    { id: 1, name: '30Shine Chọn Giúp Anh', image: stylist1 },
    { id: 2, name: 'Luận Triệu', image: stylist2 },
    { id: 3, name: 'Bắc Lý', image: stylist3 },
    { id: 4, name: 'Huy Nguyễn', image: stylist4 },
    { id: 5, name: 'Đạt Nguyễn', image: stylist5 },
    { id: 6, name: 'Phúc Nguyễn', image: stylist6 },
  ];

  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
    setIsStyleListOpen(false);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${date.getDate()}/${date.getMonth() + 1} (${days[date.getDay()]})`;
  };

  const dates = [
    { date: today, label: `Hôm nay, ${formatDate(today)}`, tag: today.getDay() === 0 || today.getDay() === 6 ? 'Cuối tuần' : 'Ngày thường' },
    { date: tomorrow, label: `Ngày mai, ${formatDate(tomorrow)}`, tag: tomorrow.getDay() === 0 || tomorrow.getDay() === 6 ? 'Cuối tuần' : 'Ngày thường' },
  ];


  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsDateListOpen(false);
  };
  const toggleStyleList = () => {
    setIsStyleListOpen(!isStyleListOpen);
  };

  const toggleDateList = () => {
    setIsDateListOpen(!isDateListOpen);
    setIsStyleListOpen(false);
  };

  const handlePrev = () => {
    setCurrentStylistIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentStylistIndex(prevIndex => Math.min(stylists.length - 4, prevIndex + 1));
  };

  const handlePrevTime = () => {
    setCurrentTimeIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTime = () => {
    setCurrentTimeIndex(prev => Math.min(times.length - 3, prev + 1));
  };

  const handleRecurringChange = (value) => {
    setRecurringBooking(value);
  };

  const recurringOptions = [
    { value: null, label: 'Không đặt lịch định kỳ hàng tuần' },
    { value: 1, label: 'Mỗi tuần' },
    { value: 2, label: 'Mỗi 2 tuần' },
    { value: 3, label: 'Mỗi 3 tuần' },
    { value: 4, label: 'Mỗi 4 tuần' },
  ];

  return (
    <div className="date-time-selection">
      <div className="stylist-selection">
        <h3 onClick={toggleStyleList} className="stylist-header">
          Chọn Stylist
          <FaChevronRight className={`arrow ${isStyleListOpen ? 'open' : ''}`} />
        </h3>
        {selectedStylist && (
          <div className="selected-stylist-summary">
            <p>Lựa chọn của bạn: {selectedStylist.name}</p>
            <img
              src={selectedStylist.image}
              alt={selectedStylist.name}
              className="stylist-image"
            />
          </div>
        )}
        {/* Thêm thông tin bổ sung nếu có */}
    {/* <p>Chuyên môn: {selectedStylist.specialty}</p> */}
    {/* <p>Đánh giá: {selectedStylist.rating}</p> */}
        
        {isStyleListOpen && (
          <div className="stylist-carousel">
            {currentStylistIndex > 0 && (
              <button className="nav-button prev" onClick={handlePrev}>
                <FaChevronLeft />
              </button>
            )}
            <div className="stylist-list" style={{ transform: `translateX(-${currentStylistIndex * 25}%)` }}>
              {stylists.map((stylist) => (
                <div
                  key={stylist.id}
                  className={`stylist-item ${selectedStylist && selectedStylist.id === stylist.id ? 'selected' : ''}`}
                  onClick={() => handleStylistSelect(stylist)}
                >
                  {stylist.id === 1 ? (
                    <div className="default-stylist">
                      <FaUser className="icon" />
                      <span className="stylist-name">{stylist.name}</span>
                    </div>
                  ) : (
                    <>
                      <img src={stylist.image} alt={stylist.name} />
                      <div className="stylist-info">
                        <p className="stylist-name">{stylist.name}</p>
                      </div>
                    </>
                  )}
                  {selectedStylist && selectedStylist.id === stylist.id && (
                    <div className="check-icon">✓</div>
                  )}
                </div>
              ))}
            </div>
            {currentStylistIndex < stylists.length - 4 && (
              <button className="nav-button next" onClick={handleNext}>
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="date-selection">
        <div
          className="date-dropdown"
          onClick={toggleDateList}
        >
          <FaCalendarAlt className="icon" />
          <span>{selectedDate ? selectedDate.label : 'Chọn ngày'}</span>
          <span className={`tag ${selectedDate ? (selectedDate.tag === 'Cuối tuần' ? 'weekend' : 'weekday') : ''}`}>
            {selectedDate ? selectedDate.tag : ''}
          </span>
          <FaChevronRight className="arrow" />
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
                <span className={`tag ${date.tag === 'Cuối tuần' ? 'weekend' : 'weekday'}`}>{date.tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="time-selection">
          <h4>
            <FaClock className="icon" />
            Chọn giờ
          </h4>
          <div className="time-carousel">
            <button className="nav-button prev" onClick={handlePrevTime} disabled={currentTimeIndex === 0}>
              <FaChevronLeft />
            </button>
            <div className="time-grid">
              {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} className="time-row">
                  {times.slice(currentTimeIndex + rowIndex * 5, currentTimeIndex + (rowIndex + 1) * 5).map((time) => (
                    <button
                      key={time}
                      className={`time-button ${selectedTime === time ? 'selected' : ''} ${isTimeDisabled(time) ? 'disabled' : ''}`}
                      onClick={() => !isTimeDisabled(time) && setSelectedTime(time)}
                      disabled={isTimeDisabled(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <button className="nav-button next" onClick={handleNextTime} disabled={currentTimeIndex >= times.length - 15}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      <div className="recurring-booking">
        <Title level={4}>Đặt lịch định kỳ (Không bắt buộc)</Title>
        <Paragraph>
          Bạn có muốn đặt lịch định kỳ không? Điều này sẽ giúp bạn tiết kiệm thời gian cho những lần đặt lịch tiếp theo.
        </Paragraph>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn tần suất đặt lịch"
          onChange={handleRecurringChange}
          value={recurringBooking}
          suffixIcon={<DownOutlined />}
        >
          {recurringOptions.map(option => (
            <Option key={option.value} value={option.value}>{option.label}</Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default BookingComponent;