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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function Connected() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();

    const heightRef = useRef(null);
    const sectionHeightRef = useRef(null);
    const inputRef = useRef(null);
    const messageRef = useRef(null);
    
    const [loading, setLoading] = useState(true);
    const [emojis, setEmojis] = useState([]);
    const [userPosition, setUserPosition] = useState("top")
    const [scrollArrowTopPosition, setScrollArrowTopPosition] = useState(93)
    const [myMessages, setMyMessages] = useState([{name: '', message: '', time: ''}]);
    const [allMessages, setAllMessages] = useState([{name: '', message: '', time: ''}]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [active, setActive] = useState("allMessages");
    const [connectedUsers, setConnectedUsers] = useState([])
    const [originalConnectedUsers, setOriginalConnectedUsers] = useState([])
    const [nickname, setNickname] = useState(router.asPath.split('=')[1]); // ['nickname']
    const [height, setHeight] = useState(0);
    const [sectionHeight, setSectionHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: ''}]);
    let [socket, setSocket] = useState(null);

    useEffect(() => {
      const query = router.asPath.split('=')[1];
      setNickname(query);
    }, [router.query.query]);
        

    useEffect(() => {
      setLoading(true);
      const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages'));
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))   

      fetch(`https://any-chat-server.onrender.com/users`)
      .then(res => res.json())
      .then(data => {
        setConnectedUsers(data)
        setOriginalConnectedUsers(data)
        setSectionHeight(sectionHeightRef.current?.clientHeight + 20)
      })

      fetch(`https://any-chat-server.onrender.com/users/all`)
      .then(res => res.json())
      .then(data => {
        if(deletedMessages !== null) {
          const filteredData = data.filter(message => !deletedMessages.some(deletedMessage =>  Array.isArray(deletedMessage) && deletedMessage.length >= 2 && deletedMessage[0] === message.message && deletedMessage[1] === message.time));
          setData(filteredData);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); // Clear loading state in case of an error
      });

      fetch(`https://any-chat-server.onrender.com/users/${nickname}`)
      .then(res => res.json())
      .then(data => setMyMessages(data))
    }, [])


    useEffect(() => {
      const newSocket = io('https://any-chat-server.onrender.com');
      setSocket(newSocket)
      
      newSocket.on('onlineUsers', (count) => {  
        setOnlineUsers(count);
      });

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
        setOriginalConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
      })

      newSocket.emit('user-connected', router.asPath.split('=')[1])
      newSocket.on('user-connected', (name) => {
        setConnectedUsers(name)
        setOriginalConnectedUsers(name)
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

    useEffect(() => {
      if (!socket) return;

        socket.on('delete-message', (index, activeTab, msg, t) => {
          if(activeTab === "allMessages") {
            setData(prevData => prevData.filter((message, i) => message.message != msg && message.time !== t));
            console.log("Index to be deleted is ", index)
          }
          else {
            setMyMessages(prevData => prevData.filter((message, i) => message.message != msg && message.time !== t));
            console.log("Only my messages will be deleted")
          }
        })

    }, [socket]);

    const handleDialogOpen = (name) => {
      setName(name);
      setOpen(true);
    } // end of handleDialogOpen

    const handleDialogClose = () => {
      setOpen(false);
    } // end of handleDialogClose


    const deleteMessageForMe = (index) => {
      console.log("Index to be deleted is ", index)
      if(active === "allMessages") {
        console.log("All messages to be deleted are ", data[index].message)
        socket.emit('delete-message-for-me', data[index].message, data[index].time, "allMessages", nickname);
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
        const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages')) || [];
        localStorage.setItem('deletedMessages', JSON.stringify([...deletedMessages, [data[index].message, data[index].time]]))
      } else {
        console.log("My messages to be deleted are ", myMessages[index].message)
        console.log("My messages to be deleted are ", myMessages[index].message)
        socket.emit('delete-message-for-me', myMessages[index].message, myMessages[index].time, "myMessages", nickname);
        setMyMessages(prevData => prevData.filter((message, i) => message.message !== myMessages[index].message && message.time !== myMessages[index].time));
      }
      
    } // end of deleteMessageForMe

    const deleteMessageForEveryone = (index) => {
      console.log("Index to be deleted is ", index)
      if(active === "allMessages") {
        console.log("All messages to be deleted are ", data[index].message)
        if(data[index].name !== nickname) return;
        socket.emit('delete-message', index, data[index]._id, "allMessages", nickname, data[index].message, data[index].time);
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
      } else {
        console.log("My messages to be deleted are ", myMessages[index].message)
        if(myMessages[index].name !== nickname) return;
        socket.emit('delete-message', index, myMessages[index]._id, "myMessages", nickname, myMessages[index].message, myMessages[index].time);
        setMyMessages(prevData => prevData.filter((message, i) => message.message !== myMessages[index].message && message.time !== myMessages[index].time));
      }
    } // end of handleDeletedMessage

    const handleClick = () => {
      if(inputRef.current.value === '') return;
      socket.emit('send-message', inputRef.current.value, nickname, `${new Date().toLocaleString()}`);
      setHeight(heightRef.current.clientHeight + 10);
      setData([...data, {name: nickname, message: inputRef.current.value, time: `${new Date().toLocaleString()}`}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      if(messageRef.current.value === '') return;
      socket.emit('send-message-to-user', messageRef.current.value, router.asPath.split('=')[1], `${new Date().toLocaleString()}`, name)
      setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: messageRef.current.value, time: `${new Date().toLocaleString()}`}])
      setOpen(false);
    } // end of handleSpecificMessage
      
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleClick();
      }
    } // end of handleKeyDown

    const handleShowEmojis = () => {
      setShowEmojis(prevShowEmojis => !prevShowEmojis);
    } // end of handleShowEmojis

    const selectEmoji = (emoji) => {
      inputRef.current.value += emoji;
    } // end of selectEmoji

    const showAllMessages = () => {
       setActive("allMessages")
       setUserPosition("top")
    } // end of showAllMessages

    const showMyMessages = () => {
      setActive("myMessages")
    } // end of showMyMessages

    const handleSearchChange = (e) => {
      const userToSearch = e.target.value.toLowerCase()
      if (userToSearch === '') {
        setConnectedUsers([...originalConnectedUsers]);
      } else {
        const filteredUser = connectedUsers.filter(user => user.toLowerCase().startsWith(userToSearch));
        setConnectedUsers(filteredUser);
      }
    } // end of handleChange

    const navigateUser = (e) => {
      if(window.scrollY < 390) {
        window.scrollTo({ top: heightRef.current.clientHeight + 10, behavior: 'smooth' }) 
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' }) 
      }
      setUserPosition(userPosition === "top" ? "bottom" : "top")
    }

    
    return (
      <>
      {loading ? (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[#EDF0F8] bg-opacity-50 z-50">
          <div className={`${style.loader}`}></div>
        </div>
      ) : (
          <main className="min-h-screen bg-[#edf0f8]">
          <header className="flex justify-between items-center pt-10 mx-10 mb-5">
            <Image src={logo} alt='Any chat application logo' className="clear-right" />
            <p className="text-2xl"> Online: {connectedUsers.length} </p>
          </header>

          <section className="flex flex-col-reverse md:flex-row md:order-2 order-1" >
            <div ref={heightRef} className={`mb-5 h-[${height}vh] md:w-[70%] w-[95%] bg-white m-auto rounded-xl `}>
              {/* Dialog */}
              <Dialog fullWidth={fullScreen} open={open} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent>
                  <input ref={messageRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg -ml-[12px] md:mx-2 pl-4 w-[19.5rem] md:w-[33rem] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder={`Send a message to ${name}`} />
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
                  <Messages messages={data} nickname={nickname} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe}/>
                  :
                  <Messages messages={myMessages} nickname={nickname} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe}/>
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
            {active === "allMessages" &&
              <footer className='-mt-4 w-[100%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-2'>
                <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`ml-2 md:ml-0 self-center hover:cursor-pointer`} />
                <input placeholder='Send a message' onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
                <button onClick={handleClick}> <Image src={sendMessage} alt='Send message icon' className='mr-2 md:mr-0 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
              </footer>
            }
            </div>

            <div className={`transition-all duration-500 fixed ${userPosition === "bottom" ? 'left-[75%]' : 'left-[65%]'} ${userPosition === "bottom" ? 'top-[80%]' : 'top-[93%]'} text-center size-12 bg-black mx-5 rounded-full animate-bounce`}>
              {userPosition === "top" ? 
               (<span className='text-4xl font-bold cursor-pointer text-white' onClick={navigateUser}> &#11163; </span> )
               :
               (<span className='text-4xl font-bold cursor-pointer text-white' onClick={navigateUser}> &#11161; </span> )
              }
            </div>

            {/* Connected Users */}
            <aside ref={sectionHeightRef} className={`md:w-96 md:h-[100vh] h-[30vh] overflow-y-auto mt-5 self-center md:self-start mx-auto md:mx-auto w-[100%] bg-white mr-10 mb-10`}>
            <input placeholder='Search the user to message privately' onChange={handleSearchChange} type='search' maxLength={1000} className={`mt-5 ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[95%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
              <div className={`overflow-y items-center flex flex-col`}>
                {connectedUsers.length !== 0 &&
                  connectedUsers.map((user, index) => {
                    return (
                      <div key={index} className='md:mx-2 mx-2 w-[90%] my-2 flex gap-2 mt-5 border-2 border-solid hover:bg-gray-200 border-[#d9d9d9] p-3 hover:cursor-pointer' onClick={() => handleDialogOpen(user)}>
                        <div className={`text-4xl size-12 bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {user.charAt(0)} </div>
                        <div className='flex flex-col gap-1'>
                          <p className={`${font.poppinsMedium}`}> {user} </p>
                          <p className={`${font.poppinsRegular}`}> Online </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </aside>

          </section>

        </main>
      )}
      </>
      )

}