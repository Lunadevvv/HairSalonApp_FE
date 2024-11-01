// src/layouts/Component/Booking/components/SalonSelection/index.jsx
import React, { useState, useEffect } from 'react';
import { Card, Modal, Tabs, List, Button, Spin, message } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../utils/axiosConfig';

const { TabPane } = Tabs;

const SalonSelection = ({ selectedSalon, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (modalVisible) {
      fetchSalons();
    }
  }, [modalVisible]);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/salon');
      if (response.data && response.data.code === 0) {
        console.log('Raw salon data:', response.data.result);
        
        const salonsWithId = response.data.result.map(salon => ({
          ...salon,
          id: salon.salonId || salon.id,
          salonId: salon.salonId || salon.id
        }));

        console.log('Processed salons:', salonsWithId);
        setSalons(salonsWithId);
        const uniqueDistricts = [...new Set(salonsWithId.map(salon => salon.district))];
        setDistricts(uniqueDistricts);
      } else {
        message.error('Không thể lấy thông tin salon');
      }
    } catch (error) {
      console.error('Error fetching salons:', error);
      message.error('Không thể tải danh sách salon');
    } finally {
      setLoading(false);
    }
  };

  const handleSalonSelect = (salon) => {
    console.log('Raw selected salon:', salon);
    
    if (!salon.salonId && !salon.id) {
      message.error('Thông tin salon không hợp lệ');
      return;
    }
    
    const formattedSalon = {
      ...salon,
      salonId: salon.salonId || salon.id,
      id: salon.salonId || salon.id
    };
    
    console.log('Formatted salon for selection:', formattedSalon);
    onSelect(formattedSalon);
    setModalVisible(false);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  return (
    <div className="step">
      <h3>1. Địa chỉ salon</h3>
      <div className="salon-address" onClick={() => setModalVisible(true)}>
        <Card className="address-card">
          <div className="address-content">
            <div className="selected-address">
              <EnvironmentOutlined />
              {selectedSalon ? (
                <span>{selectedSalon.address}, Quận {selectedSalon.district}</span>
              ) : (
                <span className="select-prompt">Chọn salon gần bạn</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title="Chọn Salon"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
        className="salon-modal"
      >
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Tabs defaultActiveKey="all" className="salon-tabs">
            <TabPane tab="Tất cả" key="all">
              <List
                dataSource={salons}
                renderItem={salon => (
                  <List.Item 
                    className={`salon-item ${selectedSalon?.id === salon.id ? 'selected' : ''}`}
                    onClick={() => handleSalonSelect(salon)}
                  >
                    <div className="salon-info">
                      <h4>30Shine {salon.district}</h4>
                      <p>
                        <EnvironmentOutlined /> {salon.address}, Quận {salon.district}
                      </p>
                      {salon.open && (
                        <span className="status-open">
                          <CheckCircleOutlined /> Đang mở cửa
                        </span>
                      )}
                      
                    </div>
                    <Button 
                      type={selectedSalon?.id === salon.id ? "primary" : "default"}
                    >
                      {selectedSalon?.id === salon.id ? "Đã chọn" : "Chọn"}
                    </Button>
                  </List.Item>
                )}
              />
            </TabPane>
            {districts.map(district => (
              <TabPane tab={`Quận ${district}`} key={district}>
                <List
                  dataSource={salons.filter(salon => salon.district === district)}
                  renderItem={salon => (
                    <List.Item 
                      className={`salon-item ${selectedSalon?.id === salon.id ? 'selected' : ''}`}
                      onClick={() => handleSalonSelect(salon)}
                    >
                      <div className="salon-info">
                        <h4>30Shine {salon.district}</h4>
                        <p>
                          <EnvironmentOutlined /> {salon.address}, Quận {salon.district}
                        </p>
                        {salon.open && (
                          <span className="status-open">
                            <CheckCircleOutlined /> Đang mở cửa
                          </span>
                        )}
                        <small>Salon ID: {salon.id}</small>
                      </div>
                      <Button 
                        type={selectedSalon?.id === salon.id ? "primary" : "default"}
                      >
                        {selectedSalon?.id === salon.id ? "Đã chọn" : "Chọn"}
                      </Button>
                    </List.Item>
                  )}
                />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default SalonSelection;