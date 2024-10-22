import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import styles from './updatesalon.module.css'

const UpdateSalon = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [formData, setFormData] = useState({
        salonName: '',
        address: '',
        phone: '',
        email: '',
        status: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            const response = await axios.put(`http://localhost:8080/api/v1/salon/${id}`, formData)
            if (response.data && response.data.code === 0) {
                setSuccess('Salon updated successfully')
                setTimeout(() => navigate('/salon'), 2000)
            } else {
                setError('Failed to update salon')
            }
        } catch (err) {
            console.error('Error updating salon:', err)
            setError('An error occurred while updating the salon. Please try again.')
        }
    }

    return (
        <div className={styles.updateSalonContainer}>
            <h2>Update Salon</h2>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="salonName">Salon Name:</label>
                    <input 
                        type="text" 
                        id="salonName"
                        name="salonName"
                        value={formData.salonName}
                        onChange={handleChange}
                        placeholder="Enter salon name"
                    />
                </div>
                <div>
                    <label htmlFor="address">Address:</label>
                    <input 
                        type="text" 
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter salon address"
                    />
                </div>
                <div>
                    <label htmlFor="phone">Phone:</label>
                    <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                    />
                </div>
                <div>
                    <label htmlFor="status">Status:</label>
                    <select 
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="">Select status</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm ngưng">Tạm ngưng</option>
                    </select>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={() => navigate('/salon')} className={styles.cancelButton}>Cancel</button>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                </div>
            </form>
        </div>
    )
}

export default UpdateSalon