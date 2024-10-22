import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavLink from '../../../../layouts/admin/components/link/navLink'
import HeaderColumn from '../../../../layouts/admin/components/table/headerColumn'
import HeaderButton from '../../../../layouts/admin/components/table/button/headerButton'
import EditButton from '../../../../layouts/admin/components/table/button/editButton'
import styles from './salon.module.css'

const SalonList = () => {
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')

    // Dữ liệu mẫu cho salon
    const sampleSalons = [
        { id: 1, name: "Salon A", address: "123 Street A", phone: "0123456789", email: "salonA@example.com", status: "Hoạt động" },
        { id: 2, name: "Salon B", address: "456 Street B", phone: "0987654321", email: "salonB@example.com", status: "Tạm ngưng" },
    ]

    const handleSearch = (value) => {
        setSearchText(value)
        // Thêm logic tìm kiếm thực tế ở đây
    }

    const handleEdit = (id) => {
        console.log("Edit salon:", id)
        // Thêm logic chỉnh sửa
    }

    const handleDelete = (id) => {
        console.log("Delete salon:", id)
        // Thêm logic xóa
    }

    const handleAddSalon = () => {
        console.log("Add new salon")
        // Thêm logic để thêm salon mới
    }

    return (
        <div className={styles.main}>
            <NavLink currentPage="Quản lý Salon" />
            <div className={styles.tableGroup}>
                <HeaderButton 
                    text="Thêm salon" 
                    add={true} 
                    onClick={handleAddSalon} 
                    onSearch={handleSearch}
                    searchText="tên salon"
                />
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr className={styles.columnHeaderParent}>
                                <HeaderColumn title="ID salon" sortable />
                                <HeaderColumn title="Tên salon" sortable />
                                <HeaderColumn title="Địa chỉ" />
                                <HeaderColumn title="Số điện thoại" />
                                <HeaderColumn title="Email" />
                                <HeaderColumn title="Trạng thái" sortable />
                                <HeaderColumn title="" />
                            </tr>
                        </thead>
                        <tbody>
                            {sampleSalons.map((salon) => (
                                <tr key={salon.id} className={styles.row}>
                                    <td className={styles.info}>{salon.id}</td>
                                    <td className={styles.info}>{salon.name}</td>
                                    <td className={styles.info}>{salon.address}</td>
                                    <td className={styles.info}>{salon.phone}</td>
                                    <td className={styles.info}>{salon.email}</td>
                                    <td className={styles.info}>
                                        <span className={salon.status === 'Hoạt động' ? styles.activeStatus : styles.inactiveStatus}>
                                            {salon.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionCell}>
                                        <EditButton onEdit={() => handleEdit(salon.id)} onDelete={() => handleDelete(salon.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SalonList