import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchServices } from '../data/hairservice';
import { fetchCombos } from '../data/comboservice';

export const useServices = (initialServices = [], initialCombos = [], initialTotalPrice = 0) => {
  const [services, setServices] = useState(initialServices);
  const [combos, setCombos] = useState(initialCombos);
  const [totalPrice, setTotalPrice] = useState(initialTotalPrice);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [allCombos, setAllCombos] = useState([]);
  const [categories, setCategories] = useState(['Tất cả dịch vụ']);

  const loadData = async () => {
    try {
      const [servicesResponse, combosResponse] = await Promise.all([
        fetchServices(),
        fetchCombos()
      ]);

      let servicesData = servicesResponse.result || servicesResponse;
      let combosData = combosResponse.result || combosResponse;

      if (Array.isArray(servicesData) && Array.isArray(combosData)) {
        setAllServices(servicesData);
        setAllCombos(combosData);

        const categorySet = new Set(servicesData.flatMap(item => 
          item.categories ? [item.categories.categoryName] : []
        ).filter(Boolean));
        setCategories(['Tất cả dịch vụ', ...Array.from(categorySet)]);
      } else {
        setError("Dữ liệu dịch vụ không hợp lệ.");
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const updateTotalPrice = () => {
    const servicesTotal = services.reduce((total, service) => total + (Number(service.price) || 0), 0);
    const combosTotal = combos.reduce((total, combo) => total + (Number(combo.price) || 0), 0);
    setTotalPrice(servicesTotal + combosTotal);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateTotalPrice();
  }, [services, combos]);

  return {
    services,
    setServices,
    combos,
    setCombos,
    totalPrice,
    loading,
    error,
    allServices,
    allCombos,
    categories,
    updateTotalPrice
  };
}; 