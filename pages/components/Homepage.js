import React from 'react'
import Image from 'next/image'
import logo from '../../public/assets/icons/logo.svg'
import mobilePic from '../../public/assets/images/hand-holding-a-phone.png'
import font from '../../styles/Fonts.module.css'
export default function HomePage() {
  return (
    
    <div className='flex'>
			
      <div className='min-h-screen w-[50%] bg-[#edf0f8]'> 
        <Image src={logo} className={`my-10 mx-10`}/>
        <h1 className={`${font.poppinsExtraBold} mt-56 mx-10 text-5xl leading-snug`}> Chat <br/> anywhere <br/> with anyone </h1>
        <button className='my-10 mx-10 text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-[#434CE6]'> Get Started </button>
      </div>

			<div className='min-h-screen w-[50%] bg-[#d8dbe3]'> 
        <Image src={mobilePic} className={`mt-20 mx-auto`} width={450} height={450}/>
      </div>

    </div>

  )
}
