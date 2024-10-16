import './editButton.css'
import editIcon from '../../../../../assets/admin/pencil-fiiled.svg'
import deleteIcon from '../../../../../assets/admin/deleteIcon.svg'
import { Button } from 'antd';

const EditButton = ({ onEdit, onDelete }) => {
  return (
    <div className='editGroup'>
      <Button color="primary" variant="outlined" size='small' onClick={onEdit}>
        Edit
        <img src={editIcon} alt="" />
      </Button>
      <Button color="danger" variant="outlined" size='small' onClick={onDelete}>
        Delete
        <img src={deleteIcon} alt="" />
      </Button>
    </div>
  )
}

export default EditButton;