import { useSession, signIn, signOut } from "next-auth/react"
import font from '../styles/Fonts.module.css'
import { useEffect, useState } from "react"
export default function Login() {


  const { data: session } = useSession()
  const [userID, setUserID] = useState('')
  // useEffect(() => {
  //   if(session) {
  //     fetch(`http://localhost:8000/email?email=${session.user.email}`)
  //       .then(res => res.json())
  //       .then(data => {
  //         setUserID(data[0].userID)
  //         console.log(data[0].userID)
  //         console.log(userID)
  //       })
  //   }
	// }, [userID]) // end of useEffect

  useEffect(() => {
    if (session) {
        
      fetch(`http://localhost:8000/email?email=${session.user.email}`)
        .then(res => res.json())
        .then(data => {
          // setUserID(data[0].userID)
          // console.log(data[0].userID)
          if(data.length === 0) {
            localStorage.setItem('myDetails', JSON.stringify({ name: session.user.name, email: session.user.email, userID: crypto.randomUUID() }));
            console.log('userID not found')
          } else {
            console.log(data[0].userID)
            localStorage.setItem('myDetails', JSON.stringify({ name: session.user.name, email: session.user.email, userID: data[0].userID }));
          }
        })

        
    }
  }, [session])
  
  console.log(session)


  if (session) {
    return (
      <>
        {/* Signed in as {session.user.email} <br /> */}
        <button className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto -mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `} onClick={() => signOut()}> Sign out  </button>
      </>
    )
  }
  return (
    <>
      {/* Not signed in <br /> */}
      <button className={`${font.poppinsSemiBold} text-white hover:text-black hover:cursor-pointer hover:transition-all hover:duration-700 text-xl text-center mx-auto -mt-10 rounded-xl w-[90%] h-12 bg-[#9CAEBC] hover:bg-white hover:border-2 hover:border-solid hover:border-[#9CAEBC] `} onClick={() => signIn('google', { callbackUrl: 'http://localhost:3000/components/Connected' })}> Sign in with Google </button>
    </>
  )

}