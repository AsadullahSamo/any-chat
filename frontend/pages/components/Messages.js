import React from 'react'
import Card from './Card'
import font from '../../styles/Fonts.module.css';

export default function Messages( {messages, nickname} ) {
  
    const identifyLink = (message) => {
        let linkPattern = /(https?:\/\/[^\s]+)/g;
        return linkPattern.test(message)
    } // end of identifyLink

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
                        <p className={`break-words px-4 w-[30%] text-center ${font.poppinsMedium} ${user.name === nickname ? 'text-white bg-blue-500 self-end mr-10' : 'text-[#737070] bg-[#D6DCE3] mx-10'} mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {user.message} </p>
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
