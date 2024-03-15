import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';
import { io } from 'socket.io-client';
import emoji from '../../public/assets/icons/emoji-icon.svg';
import sendMessage from '../../public/assets/icons/send-message-icon.svg';
import { useRouter } from 'next/router';
import style from '../../styles/Connected.module.css';

export default function Connected() {

    const router = useRouter();
    const nickname = router.query.query;
    // console.log(nickname);
    const heightRef = useRef(null);
    const inputRef = useRef(null);

    const [emojis, setEmojis] = useState([]);
		const [onlineUsers, setOnlineUsers] = useState(0);
    const [height, setHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: ''}]);
    let [socket, setSocket] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/users')
        .then(res => res.json())
        .then(data => setData(data))
    }, [])

    useEffect(() => {
      const apiKey = '81b5e5f1c8f229449b4936039e5e60899f95f4c3';
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))
    }, []);

		useEffect(() => {
			const newSocket = io('http://localhost:3000');
      setSocket(newSocket)

			newSocket.on('onlineUsers', (count) => {	
				setOnlineUsers(count);
			});

			return () => {
        newSocket.disconnect();
    	};
		}, []);

    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        setData([...data, {name: nickname, message: message, time: time}]);
      };

      socket.on('receive-message', handleReceivedMessage);

      return () => {
          socket.off('receive-message', handleReceivedMessage);
      };
    }, [socket, data]);

    const handleClick = () => {
      if(inputRef.current.value === '') return;

      socket.emit('send-message', inputRef.current.value, nickname, `${new Date().getHours()}:${new Date().getMinutes()}`);
      setHeight(heightRef.current.clientHeight + 10);
      // setMessageArray([...messageArray, inputRef.current.value]);
      setData([...data, {name: nickname, message: inputRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`}])
      inputRef.current.value = '';
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleClick();
      }
    }

    const handleShowEmojis = () => {
      setShowEmojis(prevShowEmojis => !prevShowEmojis);
    }

    const selectEmoji = (emoji) => {
      inputRef.current.value += emoji;
    }

    return (
      <>

        <div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
					<Image src={logo} alt='Any chat application logo' className={`pt-10 mx-10 clear-right`} />
					<p className='-mt-10 mx-10 text-2xl float-right'> Online: {onlineUsers} </p>

          <div ref={heightRef} className={`h-[${height}vh] w-[70%] bg-white m-auto rounded-xl`}>
            
            <div className='flex flex-col mb-10 gap-10'>
              {data.map((user, index) => {
                return (
                  <>
                    <p key={index} className={`w-[30%] text-center ${font.poppinsMedium}  text-[#737070] bg-[#D6DCE3] mx-10 mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {user.message} </p>
                    <p key={index} className={`${font.poppinsMedium} text-[#737070]  -mt-12 mx-10 py-2`}> {user.name}, <span className='text-[#a2a2a2]'> {user.time} </span> </p>
                  </>
                );
              })}
            </div>

            {/* { showEmojis && */}
              <div className={`${showEmojis ? `${style.fadeIn}` : `${style.fadeOut}`} mb-4 -ml-[14%] w-[20rem] h-[20rem] border-4 border-solid border-white flex flex-wrap mt-[4rem] overflow-y-auto bg-white rounded-xl`}>
                { 
                  emojis.map((emoji, index) => {
                    return (
                      <div key={index} className=' flex gap-5'>
                        <p onClick={() => selectEmoji(emoji.character)} className='text-center text-2xl mt-5 hover:cursor-pointer'> {emoji.character} </p>
                      </div>
                    );
                  })
                }
              </div>
            {/* } */}

            <div className='-mt-4 w-[100%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-3'>
              <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`self-center hover:cursor-pointer`} />
              <input onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Send a message'/>
              <button onClick={handleClick}> <Image src={sendMessage} alt='Send message icon' className='self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
            </div>
            
          </div>

          



        </div>
      </>
    );
}
