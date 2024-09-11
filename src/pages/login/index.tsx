import {useEffect} from 'react'
import logoImg from "../../assets/logo.svg"
import {Link, useNavigate} from 'react-router-dom'
import {Container} from '../../components/container'
import {Input} from '../../components/input'

import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'

import {auth} from '../../services/firebaseConnection'
import {signInWithEmailAndPassword, signOut} from 'firebase/auth'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
  password: z.string().nonempty("O campo senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export function Login(){
     const navigate = useNavigate()
     const {register, handleSubmit, formState: {errors}} =  useForm<FormData>({
       resolver: zodResolver(schema),
       mode: "onChange"
     })
    

     useEffect(() => {
      async function handleLogout(){
         await signOut(auth);
      }

      handleLogout()
    }, [])


     function onSubmit(data: FormData){
      signInWithEmailAndPassword(auth, data.email, data.password)
      .then((user) => {
        console.log(user)
        toast.success('Logado com sucesso!')
        navigate("/dashboard", {replace: true})
      })

      .catch((error) => {
        toast.error("Erro ao fazer o login")
        console.log(error)
      })
     }


    return(
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4 '>
               <Link to="/" className='max-w-sm w-full select-none mb-6 '>
                 <img
                   className='w-full'
                   src={logoImg}
                   alt='Logo do site'
                 />
               </Link>

               <form 
                 className='bg-white max-w-xl w-full rounded-lg mb-24 p-4'
                 onSubmit={handleSubmit(onSubmit)}
                >

                  <div className='mb-3'> 
                    <Input
                        type='email'
                        placeholder='Digite seu email'
                        name='email'
                        error={errors.email?.message}
                        register={register}
                    />
                  </div>

                  <div className='mb-3'>
                   <Input
                        type='password'
                        placeholder='Digite seu password'
                        name='password'
                        error={errors.password?.message}
                        register={register}
                    />
                  </div>

                  <button type='submit' className='bg-[#E11138] hover:bg-[#aa2323] transition-all w-full rounded-md text-white h-10 font-medium outline-none'>Acessar</button>
                  <Link to='/register' className='flex justify-center text-[rgba(0,0,0,.7)] mt-5'>Ainda não possui uma conta? Cadastre-se</Link>
               </form>
            </div>
        </Container>
    )
}