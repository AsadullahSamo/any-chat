import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Image from 'next/image';
import plus from '../../public/assets/icons/plus.svg'
import font from '../../styles/Fonts.module.css';
import parsePhoneNumber from 'libphonenumber-js'

export default function AlertDialog({onAddDetails}) {
  
  const [open, setOpen] = React.useState(false);
  const [userDetails, setUserDetails] = React.useState({name: '', phone: ''})
  const [showMessage, setShowMessage] = React.useState(false)
  const [fieldMessage, setFieldMessage] = React.useState('')
  // const [contactExists, setContactExists] = React.useState(false)
  
  const handleClickOpen = () => {
    setShowMessage(false)
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMessage = (message) => {
    setFieldMessage(message)
    setShowMessage(true)
  }

  const handleClick = () => {
    let myContacts = JSON.parse(localStorage.getItem('myContacts')) || []
    myContacts = myContacts.map(contact => contact.phone)
    const {name, phone} = userDetails

    if(!name || !phone) {
      handleMessage('Please fill in all the fields')
      return
    }
    if(myContacts.includes(phone)) {
      handleMessage('The user already exists in the contacts list. Please enter a different phone number.')
      return
    }
    if (!isValidPhoneNumber(phone)) {
      handleMessage('Please enter a valid phone number')
      return
    } else {
      setUserDetails({name: '', phone: ''})
      onAddDetails({name, phone})
      setOpen(false);
    }
    
  }

  const handleChange = (e) => {
    setUserDetails({...userDetails, [e.target.name]: e.target.value})
  }

  const isValidPhoneNumber = (phone) => {
    const phoneNumber = parsePhoneNumber(phone)
    if (phoneNumber) {
      return phoneNumber.isValid()
    }
    return false
  }
  

  return (
    <React.Fragment>
      <Button onClick={handleClickOpen}>
        <div className={`overflow-y items-center flex justify-center h-12 w-[100%] bg-gray-300`}><Image src={plus} alt='plus icon' width={20} height={20}/> </div>
      </Button>
      <Dialog fullScreen style={{margin: "auto", width: "80vw", height: "20vw"}} open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          User Details
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <form className='flex flex-col gap-5'>
              <input name="name" value={userDetails.name} placeholder='Enter the name' onChange={handleChange} type='text' maxLength={1000} className={`text-black self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} required/>
              <input name="phone" value={userDetails.phone} placeholder='Enter the phone number with country code' onChange={handleChange} type='text' pattern='((\+|00)?[1-9]{2}|0)[1-9]( ?[0-9]){8}' className={`text-black self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
              {showMessage && <p className='text-red-500 text-center text-sm'> {fieldMessage} </p> }
              {/* {contactExists && <p className='text-red-500 text-center text-sm'> The user already exists in the contacts list. Please enter a different phone number. </p> } */}
              <DialogActions>
                <button onClick={handleClick} autoFocus className={`rounded-full w-48 h-12 hover:border-2 hover:border-blue-500 hover:bg-white hover:text-black transition-all duration-500 hover:cursor-pointer text-white bg-blue-500 ${font.poppinsMedium} font-bold`}> ADD TO CONTACTS </button>
              </DialogActions>
            </form>

          </DialogContentText>
        </DialogContent>
        
      </Dialog>
    </React.Fragment>
  );
}
