import React, { useEffect } from 'react'
import Image from 'next/image'
import logo from '../../public/assets/icons/logo.svg'
import mobilePic from '../../public/assets/images/hand-holding-a-phone.png'
import font from '../../styles/Fonts.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function HomePage() {

  const router = useRouter()
  const [isAccount, setIsAccount] = React.useState(false)
  let [myDetails, setMyDetails] = React.useState('')

  useEffect(() => {
    const myLoginDetails = JSON.parse(localStorage.getItem('myLoginDetails'))
    setMyDetails(myLoginDetails)
    if (myLoginDetails) {
      setIsAccount(true)
    } else {
      console.log("No user details found")
    }
    console.log(myDetails)
  }, [])

  const handleIsAccountRedirect = () => {
    if (isAccount) {
      router.push(`/components/Connected?name=${myDetails.name}&email=${myDetails.email}&userID=${myDetails.userID}`)
    } else {
      router.push(`/components/ChatPage`)
    }
  }

  return (
    <>
    <div className='flex md:flex-row flex-col'>

      <div className='w-[100%] h-[10%] md:min-h-screen md:w-[50%] bg-[#edf0f8]'>
        <Image src={logo} alt="any chat logo" className={`my-10 mx-10`}/>
        <h1 className={`${font.poppinsExtraBold} mt-10 md:mt-56 mx-10 text-5xl leading-normal`}> Chat <br/> anywhere <br/> with anyone </h1>
         <button className='my-10 mx-10 text-white hover:text-black font-semibold hover:border-2 hover:border-solid hover:border-[#434ce6] hover:bg-white hover:cursor-pointer hover:transition-all hover:duration-500 w-36 h-12 rounded-lg bg-[#434CE6]' onClick={handleIsAccountRedirect}> Get Started </button> 
      </div>

			<div className='w-[100%] h-[30%] md:min-h-screen md:w-[50%] bg-[#d8dbe3]'>
        <Image src={mobilePic} alt="hand holding a phone" className={`mt-20 mx-auto`} width={450} height={450}/>
      </div>

    </div>
    </>

  )
}