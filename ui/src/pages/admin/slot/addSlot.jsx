import React, { useEffect, useState } from 'react'
import NavLink from '../../../layouts/admin/components/link/navLink'
import { useNavigate } from 'react-router-dom'
import { Modal, notification } from 'antd'
import CUForm from '../../../layouts/admin/components/formv2/form'
import { create, getAll } from '../services/slotService'
import moment from 'moment' // Thêm moment để định dạng thời gian

function AddSlot() {
    const [availableSlot, setAvailableSlot] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)
    useEffect(() => {
        const loadSlots = async () => {
          try {
            const response = await getAll();
            const slots = response.data.result.map(slot => ({
                value: moment(slot.timeStart, 'HH:mm').format('HH:mm')   
            }));
            setAvailableSlot(slots)
          } catch (error) {
            console.error("Error loading slots:", error);
          }
        };
        loadSlots();
      }, []); 
      const onSelect = (time) => {
        if (time) {
            setSelectedSlot(moment(time, 'HH:mm').format('HH:mm'));
        } else {
            setSelectedSlot(null);
        }
    }
      const inputs = [
        {
            label: 'Thời gian',
            name:'timeStart',
            isTime: true,
            rules: [{required: true, message: 'Vui lòng chọn thời gian!',
                validator: (_, selectedSlot) => {
                    if (availableSlot.some(slot => slot.value === selectedSlot)) {
                        notification.error({
                            message: 'Thời gian trùng lặp',
                            description: 'Thời gian bạn chọn đã tồn tại, vui lòng chọn thời gian khác!',
                            duration: 2 
                        });
                        return Promise.reject('Thời gian này đã tồn tại');
                    }else if(!selectedSlot){
                        notification.error({
                            message: 'Thời gian bị trống',
                            description: 'Thời gian đang bị bỏ trống!',
                            duration: 2 
                        });
                        return Promise.reject('Thời gian không được bỏ trống');
                    }
                    return Promise.resolve();
                }
            }],
            onChange: onSelect
        }
      ]
    const back = useNavigate()
    const handleCreate = async (value) => {
        Modal.confirm({
            title: 'Xác nhận',
            content: 'Bạn có muốn thêm mới khung giờ này ?',
            onOk: async () => {
                try {
                    const response = await create(value)
                    notification.success({
                      message: 'Thành công',
                      description: 'Khung giờ đã được thêm mới!',
                      duration: 2
                    });
                  setTimeout(() => {
                    back('/admin/slot', { state: { shouldReload: true } })
                  }, 1000)
                    return response
                } catch (error) {
                    console.error(error);
                    notification.error({
                        message: 'Thất bại',
                        description: 'Thêm mới khung giờ thất bại!',
                        duration: 2
                      });
                }
            },
            footer: (_, { OkBtn, CancelBtn }) => (
              <>
                <CancelBtn />
                <OkBtn />
              </>
            ),
          });
        
    }
  return (
    <><NavLink currentPage='Thêm khung giờ'/>
    <CUForm inputs={inputs} handleSave={handleCreate} />
    </>
  )
}

export default AddSlot