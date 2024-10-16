import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './createCategory.module.css';

function CreateCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        if (!categoryName.trim() || !categoryDescription.trim()) {
            setNotification({ message: 'Vui lòng điền đầy đủ thông tin.', type: 'error' });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/v1/category', {
                categoryName,
                categoryDescription
            });

            if (response.data.code === 0) {
                setNotification({ message: 'Thêm danh mục thành công!', type: 'success' });
                setTimeout(() => navigate('/category'), 2000); // Chuyển hướng sau 2 giây
            } else {
                setNotification({ message: 'Có lỗi xảy ra khi thêm danh mục.', type: 'error' });
            }
        } catch (error) {
            console.error('Lỗi khi thêm danh mục:', error);
            setNotification({ message: 'Có lỗi xảy ra khi thêm danh mục. Vui lòng thử lại sau.', type: 'error' });
        }
    };

    return (
        <div className={styles.createCategoryContainer}>
            <h2>Thêm Danh Mục Mới</h2>
            {notification.message && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {notification.message}
                </div>
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="categoryName">Tên Danh Mục:</label>
                    <input
                        type="text"
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="categoryDescription">Mô Tả Danh Mục:</label>
                    <textarea
                        id="categoryDescription"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Thêm Danh Mục</button>
                    <button type="button" className={styles.cancelButton} onClick={() => navigate('/category')}>Hủy</button>
                </div>
            </form>
        </div>
    );
}

export default CreateCategory;