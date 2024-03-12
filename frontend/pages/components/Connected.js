import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';
import { io } from 'socket.io-client';

export default function Connected() {
		const [onlineUsers, setOnlineUsers] = useState(0);
    // const [socket, setSocket] = useState(null);
    // const [message, setMessage] = useState([]);
    // const [onlineUsers, setOnlineUsers] = useState([]);

    // useEffect(() => {
    //     const socket = io('http://localhost:3000');
    //     setSocket(socket);

    //     // Listen for messages from the server
    //     socket.on('message', (message) => {
    //         setMessage((prevMessages) => [...prevMessages, message]);
    //     });

    //     // Listen for onlineUsers updates from the server
    //     socket.on('onlineUsers', (users) => {
    //         setOnlineUsers(users);
    //     });

    //     return () => {
    //         // Clean up the socket connection on component unmount
    //         socket.disconnect();
    //     };
    // }, []);
		useEffect(() => {
			const socket = io('http://localhost:3000');
			socket.on('onlineUsers', (count) => {	
				setOnlineUsers(count);
			});

			return () => {
        // Clean up the socket connection on component unmount
        socket.disconnect();
    	};
		}, []);
		
    return (
        <div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
					<Image src={logo} className={`pt-10 mx-10 clear-right`} />
					<p className='-mt-10 mx-10 text-2xl float-right'> Online: {onlineUsers} </p>
        </div>
    );
}
