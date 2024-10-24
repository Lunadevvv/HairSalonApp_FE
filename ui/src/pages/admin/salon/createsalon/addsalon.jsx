import React from 'react'
import { useNavigate } from 'react-router-dom'
import NavLink from '../../../../layouts/admin/components/link/navLink'
import styles from './addsalon.module.css'

const AddSalon = () => {
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        // Xử lý logic thêm salon ở đây
        console.log('Salon added')
        // Sau khi thêm xong, chuyển về trang danh sách salon
        navigate('/admin/salon')
    }

    return (
        <div className={styles.main}>
            <NavLink currentPage="Thêm Salon" />
            <div className={styles.formWrapper}>
                <h2>Thêm Salon Mới</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Tên salon:</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="address">Địa chỉ:</label>
                        <input type="text" id="address" name="address" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Số điện thoại:</label>
                        <input type="tel" id="phone" name="phone" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="status">Trạng thái:</label>
                        <select id="status" name="status" required>
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Tạm ngưng">Tạm ngưng</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.submitButton}>Thêm Salon</button>
                </form>
            </div>
        </div>
    )
}

export default AddSalon