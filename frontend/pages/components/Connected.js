import React, { useEffect, useState, useRef, use } from 'react';
import Image from 'next/image';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';
import { io } from 'socket.io-client';
import emoji from '../../public/assets/icons/emoji-icon.svg';
import sendMessage from '../../public/assets/icons/send-message-icon.svg';
import { useRouter } from 'next/router';
import style from '../../styles/Connected.module.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Messages from './Messages';

export default function Connected() {

    const router = useRouter();

    const heightRef = useRef(null);
    const inputRef = useRef(null);
    const messageRef = useRef(null);
    
    const [emojis, setEmojis] = useState([]);
    const [myMessages, setMyMessages] = useState([{name: '', message: '', time: ''}]);
    const [allMessages, setAllMessages] = useState([{name: '', message: '', time: ''}]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [active, setActive] = useState("allMessages");
    const [connectedUsers, setConnectedUsers] = useState([])
    const [nickname, setNickname] = useState(router.asPath.split('=')[1]); // ['nickname']
    const [height, setHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: ''}]);
    let [socket, setSocket] = useState(null);

    useEffect(() => {
      const query = router.asPath.split('=')[1];
      setNickname(query);
    }, [router.query.query]);
        

    useEffect(() => {
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))   

      fetch(`http://localhost:8000/users`)
      .then(res => res.json())
      .then(data => setConnectedUsers(data))

      fetch(`http://localhost:8000/users/all`)
      .then(res => res.json())
      .then(data => setData(data))

      fetch(`http://localhost:8000/users/${nickname}`)
      .then(res => res.json())
      .then(data => setMyMessages(data))
    }, [])


    useEffect(() => {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket)
      
      newSocket.on('onlineUsers', (count) => {  
        setOnlineUsers(count);
      });

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
      })

      newSocket.emit('user-connected', router.asPath.split('=')[1])
      newSocket.on('user-connected', (name) => {
        setConnectedUsers(name)
      })

      return () => {
        newSocket.disconnect();
      };

    }, []);
  
    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        setData([...allMessages, {name: nickname, message: message, time: time}]);
      };

      socket.on('receive-message', (message, nickname, time) => {
        setData([...data, {name: nickname, message: message, time: time}]);
      });

      return () => {
          socket.off('receive-message', handleReceivedMessage);
      };
    }, [socket, data]);

    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        setMyMessages([...myMessages, {name: nickname, message: message, time: time}]);
      };

      socket.on('send-message-to-user', (message, nickname, time) => {
        setMyMessages([...myMessages, {name: nickname, message: message, time: time}]);
      });

      return () => {
          socket.off('send-message-to-user', handleReceivedMessage);
      };
    }, [socket, myMessages]);

    const handleDialogOpen = (name) => {
      setName(name);
      setOpen(true);
    } // end of handleDialogOpen

    const handleDialogClose = () => {
      setOpen(false);
    } // end of handleDialogClose

    

    const handleClick = () => {
      if(inputRef.current.value === '') return;
      socket.emit('send-message', inputRef.current.value, nickname, `${new Date().getHours()}:${new Date().getMinutes()}`);
      setHeight(heightRef.current.clientHeight + 10);
      setData([...data, {name: nickname, message: inputRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      if(messageRef.current.value === '') return;
      socket.emit('send-message-to-user', messageRef.current.value, router.asPath.split('=')[1], `${new Date().getHours()}:${new Date().getMinutes()}`, name)
      setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: messageRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`}])
      setOpen(false);
    } // end of handleSpecificMessage
      
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

    const showAllMessages = () => {
       setActive("allMessages")
    }

    const showMyMessages = () => {
      setActive("myMessages")
    } 

    return (
      <>
        <main className="min-h-screen bg-[#edf0f8]">
          <header className="flex justify-between items-center pt-10 mx-10">
            <Image src={logo} alt='Any chat application logo' className="clear-right" />
            <p className="text-2xl"> Online: {connectedUsers.length} </p>
          </header>

          <section className="flex">
            <div ref={heightRef} className="h-[${height}vh] w-[70%] bg-white m-auto rounded-xl">
              {/* Dialog */}
              <Dialog fullWidth={true} open={open} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent>
                  <input ref={messageRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder={`Send a message to ${name}`} />
                </DialogContent>
                <DialogActions>
                  <button onClick={handleSpecificMessage} className='text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-[#434CE6]'> Send </button>
                </DialogActions>
              </Dialog>

              {/* Navigation */}
              <nav className="mb-10 flex flex-wrap justify-center text-md font-bold text-center text-white bg-[#343A40]">
                <button className={`px-4 py-3 ${active === "myMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showMyMessages}> View my messages </button>
                <button className={`px-4 py-3 ${active === "allMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showAllMessages}> View all messages </button>
              </nav>

              {/* Messages */}
              <div className='flex flex-col mb-10 gap-10'>
                {active === "allMessages" ?
                  <Messages messages={data} nickname={nickname} />
                  :
                  <Messages messages={myMessages} nickname={nickname}/>
                }
              </div>

              {/* Emojis */}
              <div className={`${showEmojis ? `${style.fadeIn}` : `${style.fadeOut}`} mb-4 w-[20rem] h-[20rem] border-4 border-solid border-white flex flex-wrap mt-[4rem] overflow-y-auto bg-white rounded-xl`}>
                {
                  emojis.map((emoji, index) => {
                    return (
                      <div key={index} className='flex gap-5'>
                        <p onClick={() => selectEmoji(emoji.character)} className='text-center text-2xl mt-5 hover:cursor-pointer'> {emoji.character} </p>
                      </div>
                    );
                  })
                }
              </div>

              {/* Input */}
              <footer className='-mt-4 w-[100%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-3'>
                <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`self-center hover:cursor-pointer`} />
                <input onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Send a message' />
                <button onClick={handleClick}> <Image src={sendMessage} alt='Send message icon' className='self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
              </footer>
            </div>

            {/* Connected Users */}
            <aside className='h-[100vh] w-96 bg-white mr-10 flex flex-col items-center mb-10'>
              {connectedUsers.length !== 0 &&
                connectedUsers.map((user, index) => {
                  return (
                    <div key={index} className='flex gap-2 mt-5 border-2 border-solid hover:bg-gray-200 border-[#d9d9d9] p-3 w-[90%] hover:cursor-pointer' onClick={() => handleDialogOpen(user)}>
                      <div className={`text-4xl size-12 bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {user.charAt(0)} </div>
                      <div className='flex flex-col gap-1'>
                        <p className={`${font.poppinsMedium}`}> {user} </p>
                        <p className={`${font.poppinsRegular}`}> Online </p>
                      </div>
                    </div>
                  )
                })}
            </aside>

          </section>

        </main>
      </>
    );
}
