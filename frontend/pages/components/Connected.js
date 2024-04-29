import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';
import { io } from 'socket.io-client';
import emoji from '../../public/assets/icons/emoji-icon.svg';
import sendMessage from '../../public/assets/icons/send-message-icon.svg';
import link from '../../public/assets/icons/link-icon.svg';
import { useRouter } from 'next/router';
import style from '../../styles/Connected.module.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Messages from './Messages';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AlertDialog from './AlertDialog';

const VisuallyHiddenInput = styled('input')({
  display: 'none'
});

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
    const [selectedUser, setSelectedUser] = useState('');
    const [myMessages, setMyMessages] = useState([{name: '', message: '', time: ''}]);
    const [allMessages, setAllMessages] = useState([{name: '', message: '', time: ''}]);
    const [open, setOpen] = useState(false);
    const [userDetails, setUserDetails] = useState({name: '', phone: ''})
    const [active, setActive] = useState("allMessages");
    const [connectedUsers, setConnectedUsers] = useState([])
    const [myContacts, setMyContacts] = useState([])
    const [originalConnectedUsers, setOriginalConnectedUsers] = useState([])
    const [nickname, setNickname] = useState(router.asPath.split('=')[1]); // ['nickname']
    const [height, setHeight] = useState(0);
    const [sectionHeight, setSectionHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: ''}]);
    let [socket, setSocket] = useState(null);

    useEffect(() => {
      const query = router.asPath.split('=')[1]
      setNickname(query);
    }, [router.query.query]);
        

    useEffect(() => {
      setLoading(true);
      const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages'));
      const myDeletedMessages = JSON.parse(localStorage.getItem('myDeletedMessages'));
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))   

      fetch(`http://localhost:8000/users`)
      .then(res => res.json())
      .then(data => {
        setConnectedUsers(data)
        setOriginalConnectedUsers(data)
        setSectionHeight(sectionHeightRef.current?.clientHeight + 20)
      })

      fetch(`http://localhost:8000/users/all`)
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

      const myDetails = JSON.parse(localStorage.getItem("myDetails"))
      fetch(`http://localhost:8000/users/${myDetails.phone}`)
      .then(res => res.json())
      .then(data => {
          setMyMessages(data);
      })

      let myContacts = JSON.parse(localStorage.getItem("myContacts")) || [];
      setMyContacts(myContacts)
    }, [])

    useEffect(() => {
      const handleScroll = () => {
          if(window.scrollY < 290) {
            setUserPosition("top")
          } else {
            setUserPosition("bottom")
          }
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
          window.removeEventListener('scroll', handleScroll);
        }
    }, [userPosition])


    useEffect(() => {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket)
      
      newSocket.on('onlineUsers', (count) => {  
        setOnlineUsers(count);
      });

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
        setOriginalConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
      })

      let myDetails = JSON.parse(localStorage.getItem("myDetails"))
      newSocket.emit('user-connected', router.asPath.split('=')[1], myDetails.phone)
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

      socket.on('receive-message', (isFile, message, nickname, time, size) => {
        if(isFile === true) {
          setData([...data, {name: nickname, message: message, size: size, isFile: true, time: time}]);
        } else {
          // setData([...data, {name: nickname, message: message, time: time}]);
          setData([...data, {name: nickname, message: message, size: 0, isFile: false, time: time}]);
        }
      });

      socket.on('user-details', (user) => {
        setMyMessages(user)
        inputRef.current.value = '';
      })

      return () => {
          socket.off('receive-message', handleReceivedMessage);
      };
    }, [socket, data]);

    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        setMyMessages([...myMessages, {name: nickname, message: message, time: time}]);
      };

      socket.on('send-message-to-user', (isFile, message, nickname, time, size) => {
        if(isFile === true) {
          setMyMessages([...myMessages, {name: nickname, message: message, size: size, isFile: true, time: time}]);
        } else {
          // setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: messageRef.current.value, size: 0, isFile: false, time: `${new Date().toLocaleString()}`}])
          setMyMessages([...myMessages, {name: nickname, message: message, size: 0, isFile: false, time: time}]);
        }
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
          }
          else {
            console.log(`Deleting message for me ${msg}`)
            setMyMessages(prevData => prevData.filter((message, i) => message.message != msg && message.time !== t));
          }
        })

        socket.on('edit-message', (index, newData, activeTab) => {
          if(activeTab === "allMessages") {
            setData(prevData => prevData.map((message, i) => i === index ? {...message, message: newData} : message))
          } else {
            console.log(`Editing message for me ${newData}`)
            setMyMessages(prevData => prevData.map((message, i) => i === index ? {...message, message: newData} : message))
          }
        })

    }, [socket]);

    const handleDialogOpen = (name, phone) => {
      setUserDetails({name, phone})
      setOpen(true);
    } // end of handleDialogOpen

    const handleDialogClose = () => {
      setOpen(false);
    } // end of handleDialogClose

    const deleteMessageForMe = (index) => {
      if(active === "allMessages") {
        // socket.emit('delete-message-for-me', data[index].message, data[index].time, "allMessages", nickname);
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
        const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages')) || [];
        localStorage.setItem('deletedMessages', JSON.stringify([...deletedMessages, [data[index].message, data[index].time]]))
      } else {
        // let myDetails = JSON.parse(localStorage.getItem("myDetails"))
        // socket.emit('delete-message-for-me', myDetails.phone, myMessages[index].message, myMessages[index].time, "myMessages", nickname);
        setMyMessages(prevData => prevData.filter((message, i) => message.message !== myMessages[index].message && message.time !== myMessages[index].time));
        const myDeletedMessages = JSON.parse(localStorage.getItem('myDeletedMessages')) || [];
        localStorage.setItem('myDeletedMessages', JSON.stringify([...myDeletedMessages, [myMessages[index].message, myMessages[index].time]]))
      }
    } // end of deleteMessageForMe

    const deleteMessageForEveryone = (index) => {
      if(active === "allMessages") {
        if(data[index].name !== nickname) return;
        socket.emit('delete-message', index, data[index]._id, "allMessages", nickname, data[index].message, data[index].time);
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
      } else {
        if(myMessages[index].name !== nickname) return;
        socket.emit('delete-message', index, myMessages[index]._id, "myMessages", nickname, myMessages[index].message, myMessages[index].time);
        setMyMessages(prevData => prevData.filter((message, i) => message.message !== myMessages[index].message && message.time !== myMessages[index].time));
      }
    } // end of handleDeletedMessage

    const handleEdit = (index, newData) => {
      if(active === "allMessages") {
        socket.emit('edit-message', index, data[index].message, newData, data[index].time, "allMessages");
        setData(prevData => prevData.map((message, i) => i === index ? {...message, message: newData} : message))
      } else {
        socket.emit('edit-message', index, myMessages[index].message, newData, myMessages[index].time, "myMessages");
        setMyMessages(prevData => prevData.map((message, i) => i === index ? {...message, message: newData} : message))
      }
    }

    const handleClick = () => {
      if(inputRef.current.value === '') return;
      socket.emit('send-message', false, 0, '', inputRef.current.value, nickname, `${new Date().toLocaleString()}`);
      setHeight(heightRef.current.clientHeight + 10);
      setData([...data, {name: nickname, message: inputRef.current.value, size: 0, isFile: false, time: `${new Date().toLocaleString()}`}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      const message = inputRef.current.value;
      if(inputRef.current.value === '') return;
      const myDetails = JSON.parse(localStorage.getItem("myDetails"))
      socket.emit('send-message-to-user', false, 0, '', inputRef.current.value, router.asPath.split('=')[1], `${new Date().toLocaleString()}`, userDetails.phone, myDetails.phone)
      setHeight(heightRef.current.clientHeight + 10);
      setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: message, size: 0, isFile: false, time: `${new Date().toLocaleString()}`}])
      inputRef.current.value = '';
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
      if(window.scrollY < 290) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }) 
      } else {
        window.scrollTo({ top: 0, bottom: 0, behavior: 'smooth'}) 
      }
      setUserPosition(userPosition === "top" ? "bottom" : "top")
    }

    const handleFileChange = (e) => {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

        socket.emit('send-message', true, e.target.files[0].size, e.target.files[0].name, e.target.files[0].name, nickname, `${new Date().toLocaleString()}`);
        setData([...data, {name: nickname, message: e.target.files[0].name, size: e.target.files[0].size, isFile: true, time: `${new Date().toLocaleString()}`}])
        
        setOpen(false);
    }

    const handleSpecificFileChange = (e) => {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

        let myDetails = JSON.parse(localStorage.getItem("myDetails"))
        socket.emit('send-message-to-user', true, e.target.files[0].size, e.target.files[0].name, e.target.files[0].name, nickname, `${new Date().toLocaleString()}`, userDetails.phone, myDetails.phone)
        setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: e.target.files[0].name, size: e.target.files[0].size, isFile: true, time: `${new Date().toLocaleString()}`}])
        setOpen(false);
    } // end of handleSpecificFileChange

    const hanldeUserAddition = (details) => {
      socket.emit("user-added", details.name, details.phone)
      let myContacts = JSON.parse(localStorage.getItem("myContacts")) || [];
      if(myContacts.some(contact => contact.phone === details.phone)) return;
      localStorage.setItem("myContacts", JSON.stringify([...myContacts, {name: details.name, phone: details.phone}]) )
      setMyContacts([...myContacts, {name: details.name, phone: details.phone}])
    } // end of hanldeUserAddition

    const handleUserDetails = (name, phone) => {
      setSelectedUser(name)
      setUserDetails({name, phone})
      let myDetails = JSON.parse(localStorage.getItem("myDetails"))
      let myDeletedMessages = JSON.parse(localStorage.getItem("myDeletedMessages")) || [];
      socket.emit('user-details', myDetails.phone, name, phone, myDeletedMessages)
    } // end of handleUserDetails
    
    
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
                <DialogActions className='flex justify-end gap-5'>
                  <button onClick={handleSpecificMessage} className='text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-[#434CE6]'> Send </button>
                  <Button component="label" role={undefined} variant="text" tabIndex={-1}>
                    <Image src={link} alt='Send message icon' className='mr-2 md:mr-0 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' />
                    <VisuallyHiddenInput type="file" onChange={handleSpecificFileChange}/>
                  </Button>
                </DialogActions>
              </Dialog>

              {active === "myMessages" &&
                <div className='rounded-t-lg bg-gray-100 w-[100%] h-[9vh]'> 
                  <div className={`flex justify-center gap-5 px-4 text-white rounded-lg me-2`}>
                    <p className={`text-5xl size-[60px] bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {userDetails.name.charAt(0) || 'A'} </p>
                    <div className='flex flex-col gap-1'>
                      <p className={`mt-1 text-black text-xl ${font.poppinsMedium} self-center`}> {userDetails.name || 'All my messages'} </p>
                      <p className={`text-black ${font.poppinsRegular}`}> {userDetails.phone || JSON.parse(localStorage.getItem("myDetails")).phone} </p>
                    </div>
                  </div>
                </div>
              }

              {/* Navigation */}
              <nav className="mb-10 flex flex-wrap justify-center text-md font-bold text-center text-white bg-[#343A40]">
                <button className={`px-4 py-3 ${active === "myMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showMyMessages}> View my messages </button>
                <button className={`px-4 py-3 ${active === "allMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showAllMessages}> View all messages </button>
              </nav>

              {/* Messages */}
              <div className='flex flex-col mb-10 gap-10'>
                {userDetails.name === '' && active === "myMessages" &&
                  <p className={`${font.poppinsRegular} text-center text-2xl`}> Click on a user to view their messages </p>
                }
                {active === "allMessages" ?
                  <Messages messages={data} nickname={nickname} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe} onEdit={handleEdit}/>
                :
                  <Messages messages={myMessages} nickname={nickname} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe} onEdit={handleEdit}/>
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
              <footer className='mb-4 fixed top-[90%] w-[70%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-2'>
                <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`ml-1 md:ml-2 self-center hover:cursor-pointer`} />
                <input placeholder='Send a message' onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
                <button onClick={active === "allMessages" ? handleClick : handleSpecificMessage}> <Image src={sendMessage} alt='Send message icon' className='mr-1 md:mr-2 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
                <form action="/profile" method="post" encType="multipart/form-data">
                  <Button component="label" role={undefined} variant="text" tabIndex={-1}>
                    <Image src={link} alt='File sharing link icon' className='mt-4 mr-1 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500'  />
                    <VisuallyHiddenInput type="file" onChange={active === "allMessages" ? handleFileChange : handleSpecificFileChange}/>
                  </Button>
                </form>
              </footer>
            </div>

            {/* Top/bottom cursor mover */}
            <div className={`transition-all duration-500 fixed left-[65%] ${userPosition === "bottom" ? 'top-[80%]' : 'top-[83%]'} text-center size-12 bg-black mx-5 rounded-full animate-bounce`}>
              {userPosition === "top" ? 
               (<span className='text-4xl font-bold cursor-pointer text-white' onClick={navigateUser}> &#8681; </span> )
               :
               (<span className='text-4xl font-bold cursor-pointer text-white' onClick={navigateUser}> &#8679; </span> )
              }
            </div>

            {/* Connected Users */}
          {active === "allMessages" &&
            <aside ref={sectionHeightRef} className={`md:w-96 md:h-[100vh] h-[30vh] overflow-y-auto mt-5 self-center md:self-start mx-auto md:mx-auto w-[100%] bg-white mr-10 mb-10`}>
            <input placeholder='Search the connected users' onChange={handleSearchChange} type='search' maxLength={1000} className={`mt-5 ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[95%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
              <div className={`overflow-y items-center flex flex-col`}>
                {connectedUsers.length !== 0 &&
                  connectedUsers.map((user, index) => {
                    return (
                      <div key={index} className='md:mx-2 mx-2 w-[90%] my-2 flex gap-2 mt-5 border-2 border-solid hover:bg-gray-200 border-[#d9d9d9] p-3 hover:cursor-pointer'>
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
          }

          {active === "myMessages" &&
            (
              <aside ref={sectionHeightRef} className={`md:w-96 md:h-[100vh] h-[30vh] overflow-y-auto mt-5 self-center md:self-start mx-auto md:mx-auto w-[100%] bg-white mr-10 mb-10`}>
              <div className={`overflow-y items-center flex justify-center h-12 w-[100%] bg-gray-300`}> <AlertDialog onAddDetails={hanldeUserAddition}/> </div>
              {myContacts.length !== 0 ? (
                <>
              <input placeholder='Search the user to message privately' onChange={handleSearchChange} type='search' maxLength={1000} className={`mt-5 ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[95%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
                <div className={`overflow-y items-center flex flex-col`}>
                    {myContacts.map((user, index) => {
                      return (
                        <div key={index} className='md:mx-2 mx-2 w-[90%] my-2 flex gap-2 mt-5 border-2 border-solid hover:bg-gray-200 border-[#d9d9d9] p-3 hover:cursor-pointer' onClick={() => handleUserDetails(user.name, user.phone)}>
                          <div className={`text-4xl size-12 bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {user.name.charAt(0)} </div>
                          <div className='flex flex-col gap-1'>
                            <p className={`${font.poppinsMedium}`}> {user.name} </p>
                            <p className={`${font.poppinsRegular}`}> {user.phone} </p>
                          </div>
                        </div>
                      )
                    })
                    }
                </div>
                </>
                  ) : (
                    <p className={`${font.poppinsRegular} mt-5 text-center text-2xl`}> Click the plus icon to add contacts </p>
                  )}
              </aside>
            )
          }
          </section>

        </main>
      )}
      </>
      )

}