import React from 'react'
import Card from './Card'
import font from '../../styles/Fonts.module.css';
import Dropdown from './Dropdown';
import { useState, useEffect } from 'react';

export default function Messages( {messages, nickname, onDeleteMessage, onDeleteForMe} ) {

    const [dropdowns, setDropdowns] = useState(Array(messages.length).fill(false));
    const [index, setIndex] = useState(0);
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

    const handleDeleteClick = (index) => {
        onDeleteMessage(index);
        closeDropdown(index);
    };

    const handleDeleteForMe = (index) => {
        onDeleteForMe(index);
        closeDropdown(index);
    }

    return (
        messages.map((user, index) => {
            return (
                <React.Fragment key={index}>
                {user && (
                    
                <>
                    {identifyLink(user.message) ? (
                    <>
                        <p className={`break-words px-4 w-[30%] text-center ${font.poppinsMedium} ${user.name === nickname ? 'text-white bg-blue-500 self-end mr-10' : 'text-[#737070] bg-[#D6DCE3] mx-10'} mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {user.message.substring(0, user.message.indexOf("http"))} </p>
                        <div className={`${user.name === nickname ? 'flex justify-end mr-10' : 'ml-10'}`}><Card siteUrl={user.message.substring(user.message.indexOf("http"))} /></div>                                
                        <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.name === nickname ? "self-end mr-10" : 'mx-10'} py-2`}> {user.name === nickname ? "You" : user.name}, <span className='text-[#a2a2a2]'>{user.time}</span> </p>
                    </>
                    ) : (
                    <>
                        <div className={` w-[30%] ${user.name === nickname ? 'text-white bg-blue-500 self-end mr-10' : 'text-[#737070] bg-[#D6DCE3] mx-10'} mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}>
                            <span className='hover:cursor-pointer mr-5 self-center float-right relative top-0' onClick={() => toggleDropdown(index)}> &#x25be; </span>
                            <p className={`break-words px-4 text-center ${font.poppinsMedium}`}> {user.message}  </p>    
                        </div>
                        {dropdowns[index] && <div className={`${user.name === nickname ? 'self-end mr-10 -mt-16' : 'ml-96 -mt-16'}`}> <Dropdown name={user.name} nickname={nickname} index={index} onDeleteClick={handleDeleteClick} onDeleteForMe={handleDeleteForMe}/> </div>}
                        <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.name === nickname ? "self-end mr-10" : 'mx-10'} py-2`}> {user.name === nickname ? "You" : user.name}, <span className='text-[#a2a2a2]'>{user.time}</span> </p>
                    </>
                    )}
                </>
                )}
            </React.Fragment>
            )
        })
    )

}
