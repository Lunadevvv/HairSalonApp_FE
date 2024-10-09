import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './index.scss';
import { serviceDetails } from '../../../../data/serviceDetails';
import { spaComboDetail } from '../../../../data/spaComboDetail';
import { hairStylingDetail } from '../../../../data/hairStylingDetail'; 
import { salonData} from '../../../../data/salonData';
import { FaSearch, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { message } from 'antd';
const BookingComponent = () => {
  const [step, setStep] = useState(0);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam !== null) {
      setStep(parseInt(stepParam, 10));
    } else {
      setStep(0);
    }
  }, [location]);

  const handleViewAllSalons = () => {
    navigate('/booking?step=1');
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

  const handleSalonSelect = (salon) => {
    setSelectedSalon(salon);
    navigate('/booking?step=0');
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="booking-steps">
            <div className="step">
              <h3>1. Chọn salon</h3>
              <div className="option" onClick={handleViewAllSalons}>
                <span className="icon">🏠</span>
                <span>{selectedSalon ? selectedSalon.address : "Xem tất cả salon"}</span>
                <span className="arrow">›</span>
              </div>
            </div>
            <div className="step">
              <h3>2. Chọn dịch vụ</h3>
              <div className="option" onClick={handleViewAllServices}>
              <span className="icon">✂️</span>
              <span>Xem tất cả dịch vụ hấp dẫn</span>
              <span className="arrow">›</span>
            </div>
            </div>
            <div className="step">
              <h3>3. Chọn ngày, giờ & stylist</h3>
              <div className="option">
              <span className="icon">📅</span>
              <span>Hôm nay, T2 (07/10)</span>
              <span className="tag">Ngày thường</span>
              <span className="arrow">›</span>
            </div>
            </div>
          </div>
        );
      case 1:
        return <SalonSelectionStep onSalonSelect={handleSalonSelect} />;
      case 2:
        return selectedSalon ? <ServiceSelectionStep /> : null;
      case 3:
        return <DateTimeSelectionStep />;
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
        {(step === 0 || step === 2 || step === 3) && <button className="submit-button">CHỐT GIỜ CẮT</button>}
      </div>
    </div>
  );
};

const SalonSelectionStep = ({ onSalonSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState({});
  const cities = Object.keys(salonData).sort((a, b) => a.localeCompare(b, 'vi'));
  const [selectedSalon, setSelectedSalon] = useState(null);

  useEffect(() => {
    const filtered = cities.filter(city => 
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);

    const filteredSalonData = {};
    Object.entries(salonData).forEach(([city, salons]) => {
      const filteredCitySalons = salons.filter(salon => 
        city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredCitySalons.length > 0) {
        filteredSalonData[city] = filteredCitySalons;
      }
    });
    setFilteredSalons(filteredSalonData);
  }, [searchTerm, cities]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedCity(''); // Reset selected city when searching
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleSalonSelect = (salon) => {
    setSelectedSalon(salon);
    onSalonSelect(salon);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="salon-selection">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm kiếm salon theo tỉnh, thành phố, quận" 
          value={selectedSalon ? selectedSalon.address : searchTerm}
          onChange={handleSearchChange}
          readOnly={selectedSalon !== null}
        />  
          {searchTerm && (
          <button 
            className="clear-button" 
            onClick={() => {
              clearSearch();
              setSelectedSalon(null);
            }} 
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>


      {searchTerm ? (
      <div className="search-results">
        <h3>Kết quả tìm kiếm:</h3>
        {Object.entries(filteredSalons).map(([city, salons]) => (
          <div key={city} className="city-salons">
            <h4>{city}</h4>
            {salons.map(salon => (
              <div key={salon.id} className="salon-item" onClick={() => handleSalonSelect(salon)}>
                <img src={salon.image} alt={salon.address} />
                <div className="salon-info">
                  <h5>{salon.address}</h5>
                  <p>{salon.description}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
        {Object.keys(filteredSalons).length === 0 && (
          <p>Không tìm thấy kết quả phù hợp.</p>
        )}
      </div>
    ) : (
      <>
        <div className="city-list">
          <h3>30Shine có mặt trên các tỉnh thành:</h3>
          <div className="city-grid">
            {filteredCities.map((city, index) => (
              <button 
                key={index} 
                className={`city-button ${selectedCity === city ? 'selected' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
        {selectedCity && salonData[selectedCity] && (
          <div className="selected-city-salons">
            <h3>Các salon tại {selectedCity}:</h3>
            <div className="salon-list">
              {salonData[selectedCity].map((salon) => (
                <div key={salon.id} className="salon-item" onClick={() => handleSalonSelect(salon)}>
                  <img src={salon.image} alt={salon.address} />
                  <div className="salon-info">
                    <h4>{salon.address}</h4>
                    <p>{salon.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
};

const ServiceSelectionStep = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState([]);

  const allServices = {
    ...serviceDetails,
    ...spaComboDetail,
    ...hairStylingDetail
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
        {filteredServices.map(([key, service]) => (
          <div key={key} className="service-item">
          <img src={service.steps[0].image} alt={service.title} />
          <div className="service-content">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p className="price">{service.price || 'Giá liên hệ'}</p>
            <button className="add-service">Thêm dịch vụ</button>
          </div>
        </div>
        ))}
      </div>
      {filteredServices.length === 0 && (
        <p className="no-results">Không tìm thấy dịch vụ phù hợp.</p>
      )}
    </div>
  );
};

const DateTimeSelectionStep = () => {
  return <div>Chọn ngày, giờ & stylist</div>;
};

export default BookingComponent;