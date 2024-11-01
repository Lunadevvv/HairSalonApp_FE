import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useServices } from '../../../../hooks/useServices';
import { getImgurDirectUrl } from '../../../../utils/imageUtils';
import { formatPrice } from '../../../../utils/priceUtils';
import SelectedServicesModal from './SelectedServicesModal';
import axios from 'axios';

const { Title } = Typography;

export const ServiceSelectionStep = ({ 
  onServiceSelection, 
  initialServices, 
  initialCombos, 
  initialTotalPrice, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả dịch vụ');
  const [filteredServices, setFilteredServices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [comboDetails, setComboDetails] = useState({});

  const {
    services: selectedServices,
    setServices: setSelectedServices,
    combos: selectedCombos,
    setCombos: setSelectedCombos,
    totalPrice,
    loading,
    error,
    allServices,
    allCombos,
    categories,
    updateTotalPrice
  } = useServices(initialServices, initialCombos, initialTotalPrice);

  useEffect(() => {
    const filtered = allServices.filter(service => {
      const serviceName = service.serviceName || service.name || '';
      const description = service.description || '';
      const categoryName = service.categories?.categoryName || '';

      const matchesSearch =
        serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'Tất cả dịch vụ' || 
        categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, allServices]);

  const handleAddService = (service) => {
    const serviceId = service.serviceId || service.id;
    setSelectedServices(prevServices => {
      const isServiceSelected = prevServices.some(s => (s.serviceId || s.id) === serviceId);
      if (!isServiceSelected) {
        return [...prevServices, {...service, isCombo: false}];
      } else {
        return prevServices.filter(s => (s.serviceId || s.id) !== serviceId);
      }
    });
    updateTotalPrice();
  };

  const handleAddCombo = async (combo) => {
    if (!comboDetails[combo.id]) {
      await fetchComboDetails(combo.id);
    }
    const comboWithDetails = comboDetails[combo.id] || combo;
    setSelectedCombos(prevCombos => {
      const isAlreadySelected = prevCombos.some(c => c.id === combo.id);
      if (isAlreadySelected) {
        return prevCombos.filter(c => c.id !== combo.id);
      } else {
        // Loại bỏ các dịch vụ đơn lẻ đã có trong combo
        setSelectedServices(prevServices => 
          prevServices.filter(service => 
            !comboWithDetails.services.some(comboService => 
              (comboService.serviceId || comboService.id) === (service.serviceId || service.id)
            )
          )
        );
        return [...prevCombos, comboWithDetails];
      }
    });
    updateTotalPrice();
  };

  const fetchComboDetails = async (comboId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/v1/combo/${comboId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.code === 200) {
        setComboDetails(prevDetails => ({
          ...prevDetails,
          [comboId]: response.data.result
        }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin combo:', error);
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setSelectedServices(prevServices => 
      prevServices.filter(service => 
        (service.serviceId || service.id) !== (serviceToRemove.serviceId || serviceToRemove.id)
      )
    );
    updateTotalPrice();
  };

  const handleRemoveCombo = (comboToRemove) => {
    setSelectedCombos(prevCombos => 
      prevCombos.filter(combo => 
        (combo.id || combo.serviceId) !== (comboToRemove.id || comboToRemove.serviceId)
      )
    );
    updateTotalPrice();
  };

  const handleBreakCombo = (comboId, serviceToRemove) => {
    setSelectedCombos(prevCombos => {
      const comboIndex = prevCombos.findIndex(combo => combo.id === comboId);
      if (comboIndex === -1) return prevCombos;

      const combo = prevCombos[comboIndex];
      const updatedComboServices = combo.services.filter(
        service => service.serviceId !== serviceToRemove.serviceId
      );

      const newSelectedCombos = prevCombos.filter(c => c.id !== comboId);

      setSelectedServices(prevServices => {
        const newServices = updatedComboServices.filter(comboService => 
          !prevServices.some(existingService => 
            existingService.serviceId === comboService.serviceId
          )
        );
        return [...prevServices, ...newServices];
      });

      return newSelectedCombos;
    });
    updateTotalPrice();
  };

  const handleDoneSelection = () => {
    onServiceSelection(selectedServices, selectedCombos, totalPrice);
    onClose();
  };

  const isServiceInCombo = (serviceId) => {
    return selectedCombos.some(combo => 
      combo.services && combo.services.some(service => service.serviceId === serviceId)
    );
  };

  const renderService = (service) => {
    const isSelected = selectedServices.some(s => s.serviceId === service.serviceId);
    const isDisabled = isServiceInCombo(service.serviceId);

    return (
      <div key={service.serviceId} className="service-item">
        <img src={getImgurDirectUrl(service.image)} alt={service.serviceName || service.name} />
        <div className="service-content">
          <h3>{service.serviceName || service.name}</h3>
          <p>{service.description || ''}</p>
          <p className="price">{formatPrice(service.price || 0)}</p>
          <button
            className={`add-service ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && handleAddService(service)}
            disabled={isDisabled}
          >
            {isSelected ? 'Đã thêm' : isDisabled ? 'Trong combo' : 'Thêm dịch vụ'}
          </button>
        </div>
      </div>
    );
  };

  const renderCombo = (combo) => {
    const isSelected = selectedCombos.some(c => c.id === combo.id);
    const comboWithDetails = comboDetails[combo.id] || combo;

    return (
      <div key={combo.id} className="combo-item">
        <div className="combo-services__images">
          {comboWithDetails.services && comboWithDetails.services.slice(0, 2).map((service, index) => (
            <div key={service.serviceId} className="combo-services__image-container">
              <img
                src={getImgurDirectUrl(service.image)}
                alt={service.serviceName}
                className="combo-services__image"
              />
            </div>
          ))}
        </div>
        <div className="combo-content">
          <h3>{comboWithDetails.name}</h3>
          <p>{comboWithDetails.description}</p>
          <p className="price">{formatPrice(comboWithDetails.price || 0)}</p>
          <button
            className={`add-service ${isSelected ? 'selected' : ''}`}
            onClick={() => handleAddCombo(comboWithDetails)}
          >
            {isSelected ? 'Đã thêm' : 'Thêm combo'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="service-selection">
      <Title level={2}>Chọn dịch vụ</Title>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm dịch vụ, nhóm dịch vụ hoặc giá"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-button" onClick={() => setSearchTerm('')}>
            <FaTimes />
          </button>
        )}
      </div>

      <div className="category-buttons">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>

      <h3>Combo dịch vụ</h3>
      <div className="combo-grid">
        {allCombos.map(combo => renderCombo(combo))}
      </div>

      <h3>Dịch vụ riêng lẻ</h3>
      <div className="service-grid">
        {filteredServices.map(service => renderService(service))}
      </div>

      <div className="service-summary">
        <div className="summary-content">
          <span className="selected-services" onClick={() => setIsModalVisible(true)}>
            {`Đã chọn ${selectedServices.length + selectedCombos.length} dịch vụ`}
          </span>
          <span className="total-amount">
            Tổng thanh toán: {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          className="done-button"
          disabled={selectedServices.length === 0 && selectedCombos.length === 0}
          onClick={handleDoneSelection}
        >
          Xong
        </button>
      </div>

      <SelectedServicesModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        selectedServices={selectedServices}
        selectedCombos={selectedCombos}
        onRemoveService={handleRemoveService}
        onRemoveCombo={handleRemoveCombo}
        onRemoveServiceFromCombo={handleBreakCombo}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default ServiceSelectionStep;