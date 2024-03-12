import Image from 'next/image'
import logo from '../../public/assets/icons/logo.svg'
import font from '../../styles/Fonts.module.css'
import { io } from 'socket.io-client'
import { useEffect, useState, useRef } from 'react'
export default function ChatPage() {

		const inputRef = useRef(null)
		const [socket, setSocket] = useState(null)
		
		const handleClick = () => {
			socket.emit('message', inputRef.current.value)
		}

		useEffect(() => {
			const socket = io('http://localhost:3000')
			setSocket(socket)
		}, [])
  
  return (
    <div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
			<Image src={logo} className={`pt-10 mx-10`}/>  

			<div className='mt-[10rem] w-[40%] h-96 bg-white mx-auto rounded-xl shadow-2xl pt-10 flex flex-col items-center'>
				<h2 className={`mb-16 text-3xl w-[70%] leading-relaxed text-center mx-auto ${font.poppinsSemiBold}`}> Please enter your nickname and join the chat </h2>
				
				<label className={`pl-12 self-start -ml-2 ${font.poppinsSemiBold}`}> Nickname <br/>
					<input onChange={(e) => e.target.value} ref={inputRef} type='text' className={`self-start ${font.poppinsMedium} bg-[#edf0f8] rounded-full shadow-lg mx-2 -ml-2 mt-2 pl-4 w-[39rem] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Enter Your nickname'/>
				</label>
				<button onClick={handleClick} className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `}> Join chat </button>
			</div>

    </div>
  )

}
