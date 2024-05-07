import React, { use, useRef } from 'react'
import Card from './Card'
import font from '../../styles/Fonts.module.css';
import Dropdown from './Dropdown';
import { useState, useEffect } from 'react';
import FilePreview from './FilePreview';
import { useRouter } from 'next/router';

export default function Messages( {userDetailsName, messages, nickname, onDeleteMessage, onDeleteForMe, onEdit, userID} ) {

    const [dropdowns, setDropdowns] = useState(Array.isArray(messages) ? Array(messages.length).fill(false) : []);
    const [index, setIndex] = useState(0);
    const router = useRouter();
    

    const toggleDropdown = (index) => {
        setDropdowns(prevState => {
            const updatedDropdowns = [...prevState];
            updatedDropdowns[index] = !updatedDropdowns[index];
            return updatedDropdowns;
        });
        setIndex(index);
    } // end of toggleDropdown

    const identifyLink = (message) => {
        let linkPattern = /(https?:\/\/[^\s]+)/g;
        return linkPattern.test(message)
    } // end of identifyLink

    const closeDropdown = (index) => {
        setDropdowns(prevState => {
            const updatedDropdowns = [...prevState];
            updatedDropdowns[index] = false;
            return updatedDropdowns;
        })
    } // end of closeDropdown

    const handleDeleteClick = (messageIndex) => {
        onDeleteMessage(messageIndex);
        closeDropdown(messageIndex);
    };

    const handleDeleteForMe = (messageIndex) => {
        onDeleteForMe(messageIndex);
        closeDropdown(messageIndex);
    }

    const handleEdit = (index, data) => {
        onEdit(index, data);        
    } // end of handleEdit


    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }
    
    return messages && userDetailsName !== '' && (
         messages.map((user, messageIndex) => {
            return (
                <React.Fragment key={messageIndex}>
                {user && (
                    
                <>
                    {identifyLink(user.message) ? (
                    <>
                        <span className={`hover:cursor-pointer ${user.userID === userID ? 'self-end right-10' : 'self-start left-10'} top-[4.5rem]  relative text-black text-3xl`} onClick={() => toggleDropdown(messageIndex)}> &#x25be; </span>
                        <div className={`mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}>   
                            <div className={`${user.userID === userID ? 'flex justify-end md:mr-10 mr-2' : 'ml-2 md:ml-10'}`}><Card name={user.name} messagePart={user.message.substring(0, user.message.indexOf("http"))} siteUrl={user.message.substring(user.message.indexOf("http"))} /></div>                                
                        </div>
                        {dropdowns[messageIndex] && <div className={`${user.userID === userID ? 'self-end mr-10 -mt-16' : 'ml-96 -mt-16'}`}> <Dropdown message={user.message} userID={user.userID} name={user.name} index={messageIndex} onDeleteClick={() => handleDeleteClick(messageIndex)} onDeleteForMe={() => handleDeleteForMe(messageIndex)} onEdit={handleEdit}/> </div>}
                        <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.userID === userID ? "self-end mr-10" : 'mx-10'} py-2`}> {user.userID === userID ? "You" : user.name.includes("+") ? user.name.replace("+", " ") : user.name}, <span className='text-[#a2a2a2]'>{user.time}</span> </p>
                    </>
                    ) : user.isFile ? (
                        // Condition 2: User message is a file
                        <>
                            <span className={`text-red-500 rounded hover:cursor-pointer ${user.userID === userID ? 'self-end right-10' : 'self-start left-10'} top-[4.8rem] relative text-3xl`} onClick={() => toggleDropdown(messageIndex)}> &#x25be; </span>
                            <div className={`mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}>   
                                <div className={`${user.userID === userID ? 'flex justify-end md:mr-10 mr-2' : 'ml-2 md:ml-10'}`}> <FilePreview fileUserID={user.userID} userID={userID} fileUrl={user.fileUrl ?? 'empty'} name={user.message} size={user.size}/></div>                                
                            </div>
                            {dropdowns[messageIndex] && <div className={`${user.userID === userID ? 'self-end mr-10 -mt-16' : 'ml-96 -mt-16'}`}> <Dropdown message={user.message} userID={user.userID} name={user.name} index={messageIndex} onDeleteClick={() => handleDeleteClick(messageIndex)} onDeleteForMe={() => handleDeleteForMe(messageIndex)} onEdit={handleEdit}/> </div>}
                            <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.userID === userID ? "self-end mr-10" : 'mx-10'} py-2`}> {user.userID === userID ? "You" : user.name.includes("+") ? user.name.replace("+", " ") : user.name}, <span className='text-[#a2a2a2]'>{user.time}</span> </p>
                        </>
                    ) : (
                    <>
                        <div className={`w-[70%] md:w-[30%] ${user.userID === userID ? 'text-white bg-blue-500 self-end md:mr-10 mr-3' : 'text-[#737070] bg-[#D6DCE3] ml-3 md:mx-10'} mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}>
                            <span className='hover:cursor-pointer mr-5 self-center float-right relative top-0' onClick={() => toggleDropdown(messageIndex)}> &#x25be; </span>
                            <p className={`break-words px-4 text-center ${font.poppinsMedium}`}> {user.message} </p>    
                        </div>
                        {dropdowns[messageIndex] && <div className={`${user.userID === userID ? 'self-end mr-10 -mt-16' : 'ml-96 -mt-16'}`}> <Dropdown message={user.message} userID={user.userID} name={user.name} index={messageIndex} onDeleteClick={() => handleDeleteClick(messageIndex)} onDeleteForMe={() => handleDeleteForMe(messageIndex)} onEdit={handleEdit}/> </div>}
                        <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.userID === userID ? "self-end mr-10" : 'mx-10'} py-2`}> {user.userID === userID ? "You" : user.name.includes("+") ? user.name.replace("+", " ") : user.name}, <span className='text-[#a2a2a2]'>{user.time}</span> </p>
                    </>
                    )}
                </>
                )}
            </React.Fragment>
            )
        })
    )

}
