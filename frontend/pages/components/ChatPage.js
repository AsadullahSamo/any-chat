import Image from 'next/image'
import logo from '../../public/assets/icons/logo.svg'
import font from '../../styles/Fonts.module.css'
import { useRef, useState } from 'react'
import Link from 'next/link'

export default function ChatPage() {

	let [query, setQuery] = useState('');
	const [val, setValue] = useState('');
	const inputRef = useRef(null);
	
	const handleChange = (e) => {
		setValue(e.target.value);
		setQuery(e.target.value);
	} // end of handleChange
  
	return (
		<div className={`min-h-screen w-[100%] bg-[#edf0f8]`}>
				<Image src={logo} alt="logo" className={`pt-10 mx-10`}/>  

				<div className='mt-[10rem] w-[40%] h-96 bg-white mx-auto rounded-xl shadow-2xl pt-10 flex flex-col items-center'>
					<h2 className={`mb-16 text-3xl w-[70%] leading-relaxed text-center mx-auto ${font.poppinsSemiBold}`}> Please enter your nickname and join the chat </h2>
					
					<label className={`pl-12 self-start -ml-2 ${font.poppinsSemiBold}`}> Nickname <br/>
						<input onChange={handleChange} value={val} ref={inputRef} type='text' className={`self-start ${font.poppinsMedium} bg-[#edf0f8] rounded-full shadow-lg mx-2 -ml-2 mt-2 pl-4 w-[39rem] h-12 border-2 border-solid border-[#d8dbe3] focus:outline-none focus:border-2 focus:border-solid focus:border-[#edf0f8] focus:transition-all focus:duration-500`} placeholder='Enter Your nickname'/>
					</label>
					{/* <button className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `}> <RetainQueryLink href={{pathname: "/components/Connected", query: {query}}}> Join chat </RetainQueryLink> </button> */}
					<button className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `}> <Link href={{pathname: "/components/Connected", query: {query}}}> Join chat </Link> </button>
				</div>

		</div>
  )

}
