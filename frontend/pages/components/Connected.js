import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';
import { io } from 'socket.io-client';
import emoji from '../../public/assets/icons/emoji-icon.svg';
import sendMessage from '../../public/assets/icons/send-message-icon.svg';
export default function Connected() {
		const [onlineUsers, setOnlineUsers] = useState(0);
		useEffect(() => {
			const socket = io('http://localhost:3000');
			socket.on('onlineUsers', (count) => {	
				setOnlineUsers(count);
			});

			return () => {
        socket.disconnect();
    	};
		}, []);
		
    return (
      <>

        <div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
					<Image src={logo} className={`pt-10 mx-10 clear-right`} />
					<p className='-mt-10 mx-10 text-2xl float-right'> Online: {onlineUsers} </p>

          <div className={`flex justify-center items-center h-[85vh] w-[70%] bg-white m-auto rounded-xl`}>
            <div className='w-[100%] h-[10vh] bg-[#ced9de] self-end rounded-b-lg flex justify-center gap-8'>
              <Image src={emoji} className='self-center' />
              <input onChange={(e) => e.target.value} type='text' className={`self-center ${font.poppinsMedium} bg-[#edf0f8] rounded-2xl shadow-lg mx-2 pl-4 w-[80%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Send a message'/>
              <Image src={sendMessage} className='self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' />
            </div>
          </div>

        </div>
      </>
    );
}
