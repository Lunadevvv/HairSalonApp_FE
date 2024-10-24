import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import styles from './updatesalon.module.css'

const UpdateSalon = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        status: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (location.state && location.state.salon) {
            setFormData(location.state.salon)
        }
    }, [location.state])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        
        // Here you would typically make an API call to update the salon
        // For now, we'll just simulate a successful update
        setSuccess('Salon updated successfully')
        setTimeout(() => {
            navigate('/admin/salon', { 
                state: { updatedSalon: formData }
            })
        }, 2000)
    }

    return (
        <div className={styles.updateSalonContainer}>
            <h2>Update Salon</h2>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Salon Name:</label>
                    <input 
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
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
                    <button type="button" onClick={() => navigate('/admin/salon')} className={styles.cancelButton}>Cancel</button>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                </div>
            </form>
        </div>
    )
}

export default UpdateSalon
