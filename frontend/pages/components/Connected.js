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



export default function Connected() {

    const router = useRouter();

    const heightRef = useRef(null);
    const inputRef = useRef(null);
    const messageRef = useRef(null);
    
    const [emojis, setEmojis] = useState([]);
    
    const [myMessages, setMyMessages] = useState([{name: '', message: '', time: '', joined: false}]);
    const [allMessages, setAllMessages] = useState([{name: '', message: '', time: '', joined: false}]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [active, setActive] = useState("allMessages");
    const [connectedUsers, setConnectedUsers] = useState([])
    const [nickname, setNickname] = useState(router.asPath.split('=')[1]); // ['nickname']
    const [height, setHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: '', joined: false}]);
    
    let [socket, setSocket] = useState(null);


    useEffect(() => {
      fetch(`http://localhost:8000/users`)
      .then(res => res.json())
      .then(data => setConnectedUsers(data))
    }, [connectedUsers])

    useEffect(() => {
      console.log(router.asPath)
      const query = router.asPath.split('=')[1];
      setNickname(query);
    }, [router.query.query]);
        

    useEffect(() => {
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))
    }, []);    

    useEffect(() => {
      fetch(`http://localhost:8000/users/all`)
      .then(res => res.json())
      .then(data => setData(data))
    }, [])

    useEffect(() => {
      fetch(`http://localhost:8000/users/${nickname}`)
      .then(res => res.json())
      .then(data => {
        setMyMessages(data)
        console.log(data)
      })
    }, [])


		useEffect(() => {
			const newSocket = io('http://localhost:3000');
      setSocket(newSocket)
      
			newSocket.on('onlineUsers', (count) => {	
				setOnlineUsers(count);
			});

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(connectedUsers.filter(user => user !== name))
      })

      newSocket.emit('user-connected', "joined the chat", router.asPath.split('=')[1], `${new Date().getHours()}:${new Date().getMinutes()}`, true)

			return () => {
        newSocket.disconnect();
    	};

		}, []);
  
    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        console.log(message, nickname, time)
        setData([...allMessages, {name: nickname, message: message, time: time, joined: false}]);
      };

      socket.on('receive-message', (message, nickname, time, joined) => {
        setData([...data, {name: nickname, message: message, time: time, joined: joined}]);
        console.log(message, nickname, time, joined)
        // setAllMessages(prevMessages => [...prevMessages, {name: nickname, message: inputRef.current.value, time: time, joined: joined}])
      });

      return () => {
          socket.off('receive-message', handleReceivedMessage);
      };
    }, [socket, data]);

    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time, joined) => {
        console.log(message, nickname, time)
        setMyMessages([...myMessages, {name: nickname, message: message, time: time, joined: joined}]);
      };

      socket.on('send-message-to-user', (message, nickname, time, joined) => {
        setMyMessages([...myMessages, {name: nickname, message: message, time: time, joined: joined}]);
        console.log(message, nickname, time, joined)
        // setAllMessages(prevMessages => [...prevMessages, {name: nickname, message: inputRef.current.value, time: time, joined: joined}])
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

    const identifyLink = (message) => {
      let linkPattern = /(https?:\/\/[^\s]+)/g;
      return linkPattern.test(message)
    } // end of identifyLink

    const handleClick = () => {
      if(inputRef.current.value === '') return;

      socket.emit('send-message', inputRef.current.value, nickname, `${new Date().getHours()}:${new Date().getMinutes()}`);
      setHeight(heightRef.current.clientHeight + 10);
      setData([...data, {name: nickname, message: inputRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`, joined: false}])
      // setAllMessages(prevMessages => [...prevMessages, {name: nickname, message: inputRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`, joined: false}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      // alert("I will be executed")
      if(messageRef.current.value === '') return;
      socket.emit('send-message-to-user', messageRef.current.value, router.asPath.split('=')[1], `${new Date().getHours()}:${new Date().getMinutes()}`, name)
      // setData([...data, {name: nickname, message: messageRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`, joined: false}])
      setMyMessages(prevMessages => [...prevMessages, {name: nickname, message: messageRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`, joined: false}])
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
        {/* {isDataLoaded &&  */}
        <div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
					<Image src={logo} alt='Any chat application logo' className={`pt-10 mx-10 clear-right`} />
					<p className='-mt-10 mx-10 text-2xl float-right'> Online: {connectedUsers.length} </p>

          <div className='flex'>
          <div ref={heightRef} className={`h-[${height}vh] w-[70%] bg-white m-auto rounded-xl`}>

          <Dialog fullWidth={true} open={open} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent>
              <input ref={messageRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder={`Send a message to ${name}`}/>
            </DialogContent>
            <DialogActions>
            <button onClick={handleSpecificMessage} className='m-auto text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-[#434CE6]'> Send </button>
            </DialogActions>
          </Dialog>



          <ul className="mb-10 flex flex-wrap justify-center text-md font-bold text-center text-white bg-[#343A40]">
              <li className={`inline-block px-4 py-3 ${active === "myMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showMyMessages}>
                  View my messages
              </li>
              <li className={`inline-block px-4 py-3 ${active === "allMessages" ? `bg-blue-600` : ""} hover:bg-gray-500 text-white rounded-lg  hover:cursor-pointer me-2`} onClick={showAllMessages}>
                  View all messages
              </li>
          </ul>

            <div className='flex flex-col mb-10 gap-10'>
              { active === "allMessages" ? 
              data.map((user, index) => {
                return (
                  <React.Fragment key={index}>  
                    {user && (
                     <>
                      <p className={`break-words px-4 w-[30%] text-center ${font.poppinsMedium} ${user.name === nickname ? 'text-white bg-blue-500 self-end mr-10' : 'text-[#737070] bg-[#D6DCE3] mx-10'} mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {identifyLink(user.message) ? <a href={`${user.message}`} target='_blank'>{user.message}</a> : user.message } </p>
                      <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.name === nickname ? "self-end mr-10" : 'mx-10'} py-2`}> {user.name}, <span className='text-[#a2a2a2]'> {user.time} </span> </p>
                     </>
                    )}
                  </React.Fragment>
                )
              }) :
              myMessages.map((user, index) => {
                return (
                  <React.Fragment key={index}>  
                    {user && (
                     <>
                      <p className={`break-words px-2 w-[30%] text-center ${font.poppinsMedium} text-[#737070] ${user.name === nickname ? 'bg-[#434CE6] self-end text-white mr-10' : 'bg-[#D6DCE3] mx-10'}  mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {user.message} </p>
                      <p className={`${font.poppinsMedium} text-[#737070] -mt-12 ${user.name === nickname ? "self-end mr-10" : 'mx-10'} py-2`}> {user.name}, <span className='text-[#a2a2a2]'> {user.time} </span> </p>
                     </>
                    )}
                  </React.Fragment>
                )
              })
            }
            </div>

            {/* { showEmojis && */}
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
            {/* } */}

            <div className='-mt-4 w-[100%] h-[10vh] bg-[#ced9de] rounded-b-lg flex justify-center gap-3'>
              <Image onClick={handleShowEmojis} src={emoji} alt="Smiling Emoji icon" className={`self-center hover:cursor-pointer`} />
              <input onKeyDown={handleKeyDown} ref={inputRef} onChange={(e) => e.target.value} type='text' maxLength={1000} className={`self-center ${font.poppinsMedium} bg-[#f5f7fb] rounded-2xl shadow-lg mx-2 pl-4 w-[88%] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Send a message'/>
              <button onClick={handleClick}> <Image src={sendMessage} alt='Send message icon' className='self-center bg-[#9bb0bb] w-8 h-8 p-1 rounded-full hover:cursor-pointer hover:bg-[#5b6063] hover:transition-all hover:duration-500' /> </button>
            </div>
            
          </div>

          <div className='h-[100vh] w-96 bg-white mr-10 flex flex-col items-center mb-10'> 
            {connectedUsers.map((user, index) => {
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
          </div>

          </div>

          



        </div>
        {/* } */}
      </>
    );
}