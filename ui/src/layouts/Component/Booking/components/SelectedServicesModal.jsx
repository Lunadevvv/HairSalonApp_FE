import React from 'react';
import { Modal } from 'antd';
import { FaTimes } from 'react-icons/fa';
import { getImgurDirectUrl } from '../../../../utils/imageUtils';
import { formatPrice } from '../../../../utils/priceUtils';

const SelectedServicesModal = ({
  visible,
  onClose,
  selectedServices,
  selectedCombos,
  onRemoveService,
  onRemoveCombo,
  onRemoveServiceFromCombo,
  totalPrice
}) => {
  const renderServiceItem = (service, isCombo = false, comboId = null) => (
    <div key={service.serviceId || service.id} className="selected-service-item">
      <div className="service-info">
        <img 
          src={getImgurDirectUrl(service.image)} 
          alt={service.serviceName || service.name} 
          className="service-image"
        />
        <div className="service-details">
          <h4>{service.serviceName || service.name}</h4>
          <p className="price">{formatPrice(service.price || 0)}</p>
        </div>
      </div>
      <button 
        className="remove-button"
        onClick={() => isCombo ? 
          onRemoveServiceFromCombo(comboId, service) : 
          onRemoveService(service)
        }
      >
        <FaTimes />
      </button>
    </div>
  );

  const renderComboItem = (combo) => (
    <div key={combo.id} className="selected-combo-item">
      <div className="combo-header">
        <div className="combo-info">
          <h3>{combo.name}</h3>
          <p className="price">{formatPrice(combo.price || 0)}</p>
        </div>
        <button 
          className="remove-button"
          onClick={() => onRemoveCombo(combo)}
        >
          <FaTimes />
        </button>
      </div>
      <div className="combo-services">
        {combo.services && combo.services.map(service => (
          <div key={service.serviceId} className="combo-service-item">
            <img 
              src={getImgurDirectUrl(service.image)} 
              alt={service.serviceName} 
              className="service-image"
            />
            <div className="service-details">
              <h4>{service.serviceName}</h4>
              <p className="price">{formatPrice(service.price || 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      title="Dịch vụ đã chọn"
      className="selected-services-modal"
    >
      <div className="modal-content">
        {selectedServices.length === 0 && selectedCombos.length === 0 ? (
          <p className="no-services">Chưa có dịch vụ nào được chọn</p>
        ) : (
          <>
            {selectedCombos.length > 0 && (
              <div className="combos-section">
                <h3>Combo đã chọn</h3>
                {selectedCombos.map(combo => renderComboItem(combo))}
              </div>
            )}
            
            {selectedServices.length > 0 && (
              <div className="services-section">
                <h3>Dịch vụ đã chọn</h3>
                {selectedServices.map(service => renderServiceItem(service))}
              </div>
            )}

            <div className="total-section">
              <h3>Tổng thanh toán</h3>
              <p className="total-price">{formatPrice(totalPrice)}</p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SelectedServicesModal; 