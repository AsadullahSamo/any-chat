
import { signOut } from "next-auth/react"
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
import Messages from './Messages';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AlertDialog from './AlertDialog';
import parseQueryParameters from 'parse-url-query-params'

const VisuallyHiddenInput = styled('input')({
  display: 'none'
});

export default function Connected() {

    const heightRef = useRef(null);
    const sectionHeightRef = useRef(null);
    const inputRef = useRef(null);
    const router = useRouter()

    
    const [loading, setLoading] = useState(true);
    const [myName, setMyName] = useState(String(parseQueryParameters(router.asPath).name).replace(/%20/g, ' '));
    const [myEmail, setMyEmail] = useState(String(parseQueryParameters(router.asPath).email).replace(/%20/g, ' '))
    const [myUserID, setMyUserID] = useState(String(parseQueryParameters(router.asPath).userID).replace(/%20/g, ' '))
    const [emojis, setEmojis] = useState([]);
    const [userPosition, setUserPosition] = useState("top")
    const [myMessages, setMyMessages] = useState([{name: '', message: '', time: ''}]);
    const [allMessages, setAllMessages] = useState([{name: '', message: '', time: ''}]);
    const [open, setOpen] = useState(false);
    const [userDetails, setUserDetails] = useState({name: '', phone: ''})
    const [active, setActive] = useState("allMessages");
    const [connectedUsers, setConnectedUsers] = useState([])
    const [myContacts, setMyContacts] = useState([])
    const [originalConnectedUsers, setOriginalConnectedUsers] = useState([])
    const [height, setHeight] = useState(0);
    const [sectionHeight, setSectionHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: ''}]);
    let [socket, setSocket] = useState(null);

    useEffect(() => {
      const myLoginDetails = JSON.parse(localStorage.getItem('myLoginDetails'));
      if (!myLoginDetails) {
        localStorage.setItem('myLoginDetails', JSON.stringify({name: myName, email: myEmail, userID: myUserID}))
      }
    }, [myName, myEmail, myUserID])        

    useEffect(() => {
      const myLoginDetails = JSON.parse(localStorage.getItem('myLoginDetails'));
      if (myLoginDetails) {
        setMyName(myLoginDetails.name)
        setMyEmail(myLoginDetails.email)
        setMyUserID(myLoginDetails.userID)
      }
      console.log(myLoginDetails)
    }, [])

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
        fetch(`http://localhost:8000/myContacts/${myUserID}`)
        .then(res => res.json())
        .then(data => {
          if(data.length === 0) return;
          setMyContacts(data[0].myContacts)
        })
      // }
    }, [])

    useEffect(() => {
      const newSocket = io('http://localhost:8000');
      setSocket(newSocket)
      
      newSocket.on('onlineUsers', (count) => {  
        setOnlineUsers(count);
      });

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
        setOriginalConnectedUsers(prevUsers => prevUsers.filter(user => user !== name))
      })
        newSocket.emit('user-connected', myName, myEmail, myUserID)
        newSocket.on('user-connected', (name) => {
          setConnectedUsers(name)
          setOriginalConnectedUsers(name)
        })
      // }

      return () => {
        newSocket.disconnect();
      };

    }, []);
  
    useEffect(() => {
      if (!socket) return;

      socket.on('receive-message', (isFile, message, myName, time, size, userID) => {
        if(isFile === true) {
          setData([...data, {name: myName, message: message, size: size, isFile: true, time: time, userID: userID}]);
        } else {
          setData([...data, {name: myName, message: message, size: 0, isFile: false, time: time, userID: userID}]);
        }
      });

      socket.on('user-details', (user) => {
        setMyMessages(user)
      })

    }, [socket, data]);

    useEffect(() => {
      if (!socket) return;

      socket.on('send-message-to-user', (isFile, message, myName, time, size, senderUserID) => {
        if(isFile === true) {
          setMyMessages([...myMessages, {name: myName, message: message, size: size, isFile: true, time: time, userID: senderUserID}]);
        } else {
          setMyMessages([...myMessages, {name: myName, message: message, size: 0, isFile: false, time: time, userID: senderUserID}]);
        }
      });

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

    const deleteMessageForMe = (index) => {
      if(active === "allMessages") {
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
        const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages')) || [];
        localStorage.setItem('deletedMessages', JSON.stringify([...deletedMessages, [data[index].message, data[index].time]]))
      } else {
        setMyMessages(prevData => prevData.filter((message, i) => message.message !== myMessages[index].message && message.time !== myMessages[index].time));
        const myDeletedMessages = JSON.parse(localStorage.getItem('myDeletedMessages')) || [];
        localStorage.setItem('myDeletedMessages', JSON.stringify([...myDeletedMessages, [myMessages[index].message, myMessages[index].time]]))
      }
    } // end of deleteMessageForMe

    const deleteMessageForEveryone = (index) => {
      if(active === "allMessages") {
        if(data[index].name !== myName) return;
        socket.emit('delete-message', index, data[index]._id, "allMessages", myName, data[index].message, data[index].time);
        setData(prevData => prevData.filter((message, i) => message.message !== data[index].message && message.time !== data[index].time));
      } else {
        if(myMessages[index].name !== myName) return;
        socket.emit('delete-message', index, myMessages[index]._id, "myMessages", myName, myMessages[index].message, myMessages[index].time);
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
      socket.emit('send-message', false, 0, '', inputRef.current.value, myName, `${new Date().toLocaleString()}`, myUserID );
      setHeight(heightRef.current.clientHeight + 10);
      setData([...data, {name: myName, message: inputRef.current.value, size: 0, isFile: false, time: `${new Date().toLocaleString()}`, userID: myUserID}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      const message = inputRef.current.value;
      if(inputRef.current.value === '') return;
      socket.emit('send-message-to-user', false, 0, '', inputRef.current.value, myName, `${new Date().toLocaleString()}`, userDetails.userID, myUserID)
      setHeight(heightRef.current.clientHeight + 10);
      setMyMessages(prevMessages => [...prevMessages, {name: myName, message: message, size: 0, isFile: false, time: `${new Date().toLocaleString()}`, userID: myUserID}])
      inputRef.current.value = '';
    } // end of handleSpecificMessage
      
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if(active === "allMessages") {
          handleClick();
        } else {
          handleSpecificMessage();
        }
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

        socket.emit('send-message', true, e.target.files[0].size, e.target.files[0].name, e.target.files[0].name, myName, `${new Date().toLocaleString()}`, myUserID);
        setData([...data, {name: myName, message: e.target.files[0].name, size: e.target.files[0].size, isFile: true, time: `${new Date().toLocaleString()}`, userID: myUserID}])       
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

        socket.emit('send-message-to-user', true, e.target.files[0].size, e.target.files[0].name, e.target.files[0].name, myName, `${new Date().toLocaleString()}`, userDetails.userID, myUserID)
        setMyMessages(prevMessages => [...prevMessages, {name: myName, message: e.target.files[0].name, size: e.target.files[0].size, isFile: true, time: `${new Date().toLocaleString()}`, userID: myUserID}])
        setOpen(false);
    } // end of handleSpecificFileChange

    const hanldeUserAddition = (details) => {
      socket.emit("contact-added", details.name, details.userID, myUserID)
      if(myContacts.some(contact => contact.userID === details.userID)) return;
      setMyContacts([...myContacts, {name: details.name, userID: details.userID}])
    } // end of hanldeUserAddition

    const handleUserDetails = (name, userID) => {
      setUserDetails({name, userID})
      let myDeletedMessages = JSON.parse(localStorage.getItem("myDeletedMessages")) || [];
      socket.emit('user-details', myUserID, name, userID, myDeletedMessages)
    } // end of handleUserDetails

    const handleUserId = () => {
      setActive("user-id")
    }

    const handleSignOut = () => {
     localStorage.removeItem('myLoginDetails')
     signOut({ callbackUrl: 'http://localhost:3000'})
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
            <button className={`mt-2 ${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto -mt-10 rounded-xl w-[10%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `} onClick={handleSignOut}> Sign out </button>  
            <p className="text-2xl"> Online: {connectedUsers.length} </p>
          </header>

          <section className="flex flex-col-reverse md:flex-row md:order-2 order-1" >
            <div ref={heightRef} className={`mb-5 h-[${height}vh] md:w-[70%] w-[95%] bg-white m-auto rounded-xl `}>

              {active === "myMessages" &&
                <div className='rounded-t-lg bg-gray-100 w-[100%] h-[9vh]'> 
                  <div className={`flex justify-center gap-5 px-4 text-white rounded-lg me-2`}>
                    <p className={`text-5xl size-[60px] bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {userDetails.name.charAt(0) || 'A'} </p>
                    <div className='flex flex-col gap-1'>
                      <p className={`mt-1 text-black text-xl ${font.poppinsMedium} self-center`}> {userDetails.name || 'All my messages'} </p>
                    </div>
                  </div>
                </div>
              }

              {/* Navigation */}
              <nav className="mb-10 flex flex-wrap justify-center text-md font-bold text-center text-white bg-[#343A40]">
              <button className={`px-4 py-3 ${active === "user-id" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={handleUserId}> Check my user id </button>
                <button className={`px-4 py-3 ${active === "myMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showMyMessages}> View my messages </button>
                <button className={`px-4 py-3 ${active === "allMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showAllMessages}> View all messages </button>
              </nav>

              {/* Messages */}
              <div className='flex flex-col mb-10 gap-10'>
                {userDetails.name === '' && active === "myMessages" &&
                  <p className={`${font.poppinsRegular} text-center text-2xl`}> Select a user to text them OR to view their messages OR your messages sent to them, if any</p>
                }
                {active === "allMessages" ?
                  <Messages userID={myUserID} active="allMessages" messages={data} nickname={myName} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe} onEdit={handleEdit}/>
                : active === "myMessages" ?
                  <Messages userID={myUserID} active="myMessages" userDetailsName={userDetails.name} messages={myMessages} nickname={myName} onDeleteMessage={deleteMessageForEveryone} onDeleteForMe={deleteMessageForMe} onEdit={handleEdit}/>
                :
                  <p className={`${font.poppinsRegular} text-center text-2xl`}> Your user id is {JSON.parse(localStorage.getItem("myLoginDetails")).userID}</p>
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
              {(active === "allMessages" || userDetails.name !== '') &&
              <footer className='mb-4 fixed top-[90%] w-[95%] md:w-[70%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-1 md:gap-2'>
                <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`ml-2 md:ml-2 self-center hover:cursor-pointer`} />
                <input placeholder='Send a message' onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 md:mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} />
                <button onClick={active === "allMessages" ? handleClick : handleSpecificMessage}> <Image src={sendMessage} alt='Send message icon' className='mr-1 md:mr-2 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
                <form action="/profile" method="post" encType="multipart/form-data">
                  <Button component="label" role={undefined} variant="text" tabIndex={-1}>
                    <Image src={link} alt='File sharing link icon' className='mt-6 md:mt-4 mr-1 self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500'  />
                    <VisuallyHiddenInput type="file" onChange={active === "allMessages" ? handleFileChange : handleSpecificFileChange}/>
                  </Button>
                </form>
              </footer>
              }
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
                        <div key={index} className='md:mx-2 mx-2 w-[90%] my-2 flex gap-2 mt-5 border-2 border-solid hover:bg-gray-200 border-[#d9d9d9] p-3 hover:cursor-pointer' onClick={() => handleUserDetails(user.name, user.userID)}>
                          <div className={`text-4xl size-12 bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`}> {user.name.charAt(0)} </div>
                          <div className='flex flex-col gap-1'>
                            <p className={`${font.poppinsMedium}`}> {user.name} </p>
                            <p className={`${font.poppinsRegular} text-[13px]`}> {user.userID} </p>
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