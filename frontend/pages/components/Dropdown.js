import React from 'react'
import font from '../../styles/Fonts.module.css';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useMessagesStore } from '../store/messagesStore';

export default function Dropdown( {index, onDeleteClick, onDeleteForMe} ) {
    
    const [open, setOpen] = useState(false);

    const handleDialogOpen = () => {
        setOpen(true);
    } // end of handleDialogOpen

    const handleDialogClose = () => {
        setOpen(false);
    } // end of handleDialogClose

    const handleDeleteClick = () => {
        onDeleteClick(index);
    } // end of handleDeleteClick

    const handleDeleteForMe = () => {
        onDeleteForMe(index);
    }

  return (
    <div className="relative inline-block text-left">

        <Dialog className="flex justify-center" fullWidth={true} open={open} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogActions className='flex justify-center items-center'>
                <button className='text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-red-600' onClick={handleDeleteForMe}> Delete for me </button>
                <button className='text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-48 h-12 rounded-lg bg-red-600' onClick={handleDeleteClick}> Delete for everyone </button>
            </DialogActions>
        </Dialog>

        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
            <ul className="py-1" role="none">
                <li className={`text-gray-700 block px-4 py-2 text-sm ${font.poppinsRegular} hover:bg-gray-300 hover:cursor-pointer`} role="menuitem" tabIndex="-1" id="menu-item-0" onClick={handleDialogOpen}>Delete</li>
                <li className={`text-gray-700 block px-4 py-2 text-sm ${font.poppinsRegular} hover:bg-gray-300 hover:cursor-pointer`} role="menuitem" tabIndex="-1" id="menu-item-1">Support</li>
                <li className={`text-gray-700 block px-4 py-2 text-sm ${font.poppinsRegular} hover:bg-gray-300 hover:cursor-pointer`} role="menuitem" tabIndex="-1" id="menu-item-2">License</li>
            </ul>
        </div>
    </div>
  )
}