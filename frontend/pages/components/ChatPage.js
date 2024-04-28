
import Image from 'next/image'
import logo from '../../public/assets/icons/logo.svg'
import font from '../../styles/Fonts.module.css'
import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import parsePhoneNumber from 'libphonenumber-js'
import { useRouter } from 'next/router'
export default function ChatPage() {

	const router = useRouter()
	let [query, setQuery] = useState('');
	const [userDetails, setUserDetails] = useState({name: '', phone: ''})
	const [showMessage, setShowMessage] = useState(false)
	const [fieldMessage, setFieldMessage] = useState('')
	
	const handleChange = (e) => {
		setUserDetails({...userDetails, [e.target.name]: e.target.value})
	} // end of handleChange

	const handleClick = () => {
		const {name, phone} = userDetails
		setQuery(name)
		if(!name || !phone) {
		  handleMessage('Please fill in all the fields')
		  return
		}
		if (!isValidPhoneNumber(phone)) {
		  handleMessage('Please enter a valid phone number')
		  return
		} else {
			setUserDetails({ name: '', phone: '' });
      		router.push({ pathname: "/components/Connected", query: { query: name } });
      		localStorage.setItem('myDetails', JSON.stringify({ name, phone }));
		}
	} // end of handleClick
	
	const handleMessage = (message) => {
		setFieldMessage(message)
		setShowMessage(true)
	} // end of handleMessage
	
	const isValidPhoneNumber = (phone) => {
		const phoneNumber = parsePhoneNumber(phone)
		if (phoneNumber) {
		  return phoneNumber.isValid()
		}
		return false
	} // end of isValidPhoneNumber

	const handleKeyDown = (e) => {
		if(e.key === 'Enter') {
			handleClick()
		}
	} // end of handleKeyDown

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [query])


  
	return (
		<div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
				<Image src={logo} alt="logo" className={`pt-10 mx-10`}/>  

				<div className='md:mt-[5rem] mt-[5rem] w-[90%] md:w-[40%] h-[550px] bg-white mx-auto rounded-xl shadow-2xl pt-10 flex flex-col items-center'>
					<h2 className={`mb-8 md:mb-16 text-xl md:text-3xl w-[90%] md:w-[70%] leading-relaxed text-center mx-auto ${font.poppinsSemiBold}`}> Please enter your name and phone number to join the chat </h2>
					
					<label className={`pl-5 md:pl-12 self-start md:-ml-2 ${font.poppinsSemiBold}`}> Name* <br/>
						<input name="name" value={userDetails.name} placeholder='Enter the name' onChange={handleChange} type='text' maxLength={1000} className={`self-start ${font.poppinsMedium} bg-[#edf0f8] rounded-full shadow-lg md:mx-2 -mx-2 md:-ml-2 mt-2 pl-4 w-[20rem] md:w-[39rem] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} required/>
					</label>
					<label className={`mt-5 pl-5 md:pl-12 self-start md:-ml-2 ${font.poppinsSemiBold}`}> Phone* <br/>
						<input name="phone" value={userDetails.phone} placeholder='Enter the phone number with country code' onChange={handleChange} type='text' pattern='((\+|00)?[1-9]{2}|0)[1-9]( ?[0-9]){8}' className='self-start ${font.poppinsMedium} bg-[#edf0f8] rounded-full shadow-lg md:mx-2 -mx-2 md:-ml-2 mt-2 pl-4 w-[20rem] md:w-[39rem] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500'/>
					</label>

					{showMessage && <p className='text-red-500 text-center text-sm my-5'> {fieldMessage} </p> }
					<button className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `} onClick={handleClick}> Join Chat </button>
				</div>

		</div>
  )

}
