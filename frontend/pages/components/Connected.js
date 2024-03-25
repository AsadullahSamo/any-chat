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

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [message, setMessage] = useState(''); // ['message']
    const router = useRouter();

    const heightRef = useRef(null);
    const inputRef = useRef(null);
    const messageRef = useRef(null);
    const roomRef = useRef(null);
    const sendRef = useRef(null);

    const [emojis, setEmojis] = useState([]);
    // const [randomColor, setRandomColor] = useState('bg-gray-500');
    const [connectedUsers, setConnectedUsers] = useState([])
    const [nickname, setNickname] = useState(router.query.query); // ['nickname']
    const [id, setId] = useState('');
    const [checkId, setCheckId] = useState('');
		const [onlineUsers, setOnlineUsers] = useState(0);
    const [userConnected, setUserConnected] = useState(false);
    const [userDisconnected, setUserDisconnected] = useState(false);
    const [userDisconnectedNames, setUserDisconnectedNames] = useState([]);
    const [height, setHeight] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [data, setData] = useState([{name: '', message: '', time: '', joined: false}]);
    // let [sendClicked, setSendClicked] = useState(0);
    let [socket, setSocket] = useState(null);
    let [pageReload, setPageReload] = useState(false)

    useEffect(() => {
      fetch(`http://localhost:8000/users/${nickname}`)
      .then(res => res.json())
      .then(data => setData(data))
    }, [data])

    useEffect(() => {
      fetch(`http://localhost:8000/users`)
      .then(res => res.json())
      .then(data => setConnectedUsers(data))
    }, [connectedUsers])

    useEffect(() => {
      setNickname(router.query.query);
    }, [router.query.query]);
        

    useEffect(() => {
      fetch('https://emoji-api.com/emojis?access_key=81b5e5f1c8f229449b4936039e5e60899f95f4c3')
      .then(res => res.json())
      .then(data => setEmojis(data))
    }, []);    

    useEffect(() => {
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        socket.emit('user-disconnected', pageReload)
      })
    }, [])


		useEffect(() => {
			const newSocket = io('http://localhost:3000');
      setSocket(newSocket)
      
			newSocket.on('onlineUsers', (count) => {	
				setOnlineUsers(count);
			});
      
      if(performance.navigation.type === 1) {
        setPageReload(true)
        setTimeout(() => {
          setPageReload(false)
        }, 3000)
      }

      newSocket.on('user-disconnect', (name) => {
        setConnectedUsers(connectedUsers.filter(user => user !== name))
      })

      newSocket.emit('user-connected', "joined the chat", nickname, `${new Date().getHours()}:${new Date().getMinutes()}`, true)

			return () => {
        newSocket.disconnect();
    	};

		}, []);
  
    useEffect(() => {
      if (!socket) return;

      const handleReceivedMessage = (message, nickname, time) => {
        setData([...data, {name: nickname, message: message, time: time}]);
      };

      socket.on('receive-message', (message, nickname, time, joined) => {
        setData([...data, {name: nickname, message: message, time: time, joined: joined}]);
      });

      return () => {
          socket.off('receive-message', handleReceivedMessage);
      };
    }, [socket, data]);

    useEffect(() => {
      if (!socket) return;

      socket.on('receive-message-by-user', (message, sender, time, joined) => {
        console.log(message, sender)
      })

      return () => {
        socket.off('receive-message-by-user');
      }
    }, [socket])

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
      setData([...data, {name: nickname, message: inputRef.current.value, time: `${new Date().getHours()}:${new Date().getMinutes()}`, joined: false}])
      inputRef.current.value = '';
    }; // end of handleClick

    const handleSpecificMessage = () => {
      // alert("I will be executed")
      if(messageRef.current.value === '') return;
      socket.emit('send-message-to-user', messageRef.current.value, nickname, `${new Date().getHours()}:${new Date().getMinutes()}`, name, socket.id)
      // setSendClicked(prevClicked => prevClicked + 1);
      // console.log(socket.id)
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
            
            <div className='flex flex-col mb-10 gap-10'>
              {data.map((user, index) => {
                return (
                  <React.Fragment key={index}>  
                    {user && !user.joined ? (
                     <>
                      <p className={`px-2 w-[30%] text-center ${font.poppinsMedium} text-[#737070] ${user.joined ? 'bg-white mx-auto' : 'bg-[#D6DCE3] mx-10'}  mt-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl`}> {user.message} </p>
                      <p className={`${font.poppinsMedium} text-[#737070] -mt-12 mx-10 py-2 hover:cursor-pointer hover:text-red-500`} onClick={() => handleDialogOpen(user.name)}> {user.name}, <span className='text-[#a2a2a2]'> {user.time} </span> </p>
                     </>
                    ) : user && (
                      <p className='mt-1 m-auto py-2'> <span className={`${font.poppinsRegular} font-extrabold text-[#737070]`}> {user.name} </span> <span className={`${font.poppinsMedium} text-[#a2a2a2]`}> {user.message} </span> </p>
                    )}
                  </React.Fragment>
                )
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

          <div className='h-[100vh] w-96 bg-white mr-10 flex flex-col items-center mb-10'> 
            {connectedUsers.map((user, index) => {
              return (
                <div key={index} className='flex gap-2 mt-5 border-2 border-solid border-[#d9d9d9] p-3 w-[90%]'>
                  <div className={`text-4xl size-12 bg-gray-500 hover:cursor-pointer hover:bg-green-300 hover:transition-all hover:duration-500 text-white text-center rounded-full mt-[2px]`} onClick={() => handleDialogOpen(user)}> {user.charAt(0)} </div>
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
