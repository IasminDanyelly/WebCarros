import { ChangeEvent,  useContext, useState } from "react";
import {AuthContext} from '../../../contexts/AuthContext';
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";
import { FiUpload, FiTrash } from "react-icons/fi";
import {Input} from '../../../components/input';
import { useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {v4 as uuidv4} from 'uuid';
import { db, storage } from '../../../services/firebaseConnection';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject

} from 'firebase/storage';
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório!"),
    model: z.string().nonempty("O modelo é obrigatório!"),
    year: z.string().nonempty("O ano do carro é obrigatório!"),
    km: z.string().nonempty("O KM o carro é obrigatório!"),
    price: z.string().nonempty("O campo preço é obrigatório!"),
    city: z.string().nonempty("O campo cidade é obrigatório!"),
    whatsapp: z.string().nonempty("O campo cidade é obrigatório!").refine((value) => /^(\d{10,11})$/.test(value), {
        message: "Número de telefone inválido!"
    }),
    description: z.string().nonempty("A descrição é obrigatória!")
})

   type FormData = z.infer<typeof schema>
 
   interface ImageItemProps{
      uid: string,
      name: string,
      previewUrl: string,
      url: string
   }

   export function New(){
     const { user } = useContext(AuthContext)
     const {register, handleSubmit, formState: { errors }, reset} = useForm<FormData>({
       resolver: zodResolver(schema),
       mode: "onChange"
      });
     

      const [carImages, setCarImages] = useState<ImageItemProps[]>([])


        async function handleFile(e: ChangeEvent<HTMLInputElement>){
          if(e.target.files && e.target.files[0]){
             const image = e.target.files[0]
     
             if(image.type === 'image/jpeg' || image.type === 'image/png'){
               await handleUpload(image);
             }else{
               alert("Envie uma imagem em formato jpeg ou png");
               return;
             }
          }
        }
     
        async function handleUpload(image: File){
            if(!user?.uid){
              return;
            }

            const currentUid = user?.uid;
            const uidImage = uuidv4();

            const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

            uploadBytes(uploadRef, image)
            .then((snapshot) => {
              getDownloadURL(snapshot.ref).then((downloadUrl) => {
                const imageItem = {
                  name: uidImage,
                  uid: currentUid,
                  previewUrl: URL.createObjectURL(image),
                  url: downloadUrl
                }
                setCarImages((images) => [...images, imageItem])
              })
            })
        }

         function onSubmit(data: FormData){
       
            if(carImages.length === 0){
                toast.error("Envie pelo menos 1 imagem desse carro");
                return;
            }


            const carListImages = carImages.map(car => {
              return{
                name: car.name,
                uid: car.uid,
                url: car.url
              }
            })
            
            addDoc(collection(db, "cars"), {
              name: data.name.toUpperCase(),
              model: data.model,
              year: data.year,
              km: data.km,
              whatsapp: data.whatsapp,
              city: data.city,
              price: data.price,
              description: data.description,
              created: new Date(),
              owner: user?.name,
              uid: user?.uid,
              images: carListImages  
            })
            
            
            .then(() => {
               reset();
               setCarImages([])
               toast.success("Cadastrado com sucesso")   
            })

            .catch((error) => {
                console.log(error);
                toast.error("Erro ao cadastrar no banco");
            })
              
         }



         async function handleDeleteImage(item: ImageItemProps){{
           const imagePath = `images/${item.uid}/${item.name}`;

           const imageRef = ref(storage, imagePath);
           try{
              await deleteObject(imageRef)
              setCarImages(carImages.filter((car) => car.url !== item.url))
           }catch(err){
              console.log("Erro ao deletar")
           }
         }}

        

     return(
        <Container>
            <DashboardHeader/>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
              <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
                <div className="absolute cursor-pointer ">
                  <FiUpload size={30} color="#000"/>
                </div>
                <div className="cursor-pointer">
                    <input 
                     type="file" 
                     accept="image/*" 
                     className="opacity-0 cursor-pointer"
                     onChange={handleFile}
                     />
                </div> 
              </button>

              {carImages.map( item => (
                <div key={item.name} className="h-32 flex items-center justify-center relative">
                 
                   <button className="absolute opacity-0 hover:opacity-100 hover:transition-all duration-50]"  onClick={() => handleDeleteImage(item)}>
                     <FiTrash size={28} color="#fff"/>
                   </button>
                
                   <img 
                     src={item.previewUrl}
                     className="rounded-lg w-full h-32 object-cover"
                     alt="Foto do carro"
                   />
                </div>
              ))}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2" >
               <form
                 className="w-full"
                 onSubmit={handleSubmit(onSubmit)}
               >
                 <div className="mb-3">
                      <p className="mb-2 font-medium">Nome do carro</p>
                      <Input
                        type="text"
                        register={register}
                        name="name"
                        error={errors.name?.message}
                        placeholder="Ex: Onix 1.0..."
                      />
                 </div>

                 <div className="mb-3">
                      <p className="mb-2 font-medium">Modelo do carro</p>
                      <Input
                        type="text"
                        register={register}
                        name="model"
                        error={errors.model?.message}
                        placeholder="Ex: 1.0 Flex PLUS MANUAL..."
                      />
                 </div>

                 

                 <div className="flex w-full mb-3 flex-row items-center gap-4">
                    <div className="w-full">
                      <p className="mb-2 font-medium">Ano</p>
                      <Input
                        type="text"
                        register={register}
                        name="year"
                        error={errors.year?.message}
                        placeholder="Ex: 2015/2016..."
                      />
                    </div>

                    <div className="w-full">
                      <p className="mb-2 font-medium">KM rodados</p>
                      <Input
                        type="text"
                        register={register}
                        name="km"
                        error={errors.km?.message}
                        placeholder="Ex: 24.900..."
                      />
                    </div>
                 </div>



                 <div className="flex w-full mb-3 flex-row items-center gap-4">
                    <div className="w-full">
                      <p className="mb-2 font-medium">Telefone / Whatsapp</p>
                      <Input
                        type="text"
                        register={register}
                        name="whatsapp"
                        error={errors.whatsapp?.message}
                        placeholder="Ex: (48) 9999-9999..."
                      />
                    </div>

                    <div className="w-full">
                      <p className="mb-2 font-medium">Cidade</p>
                      <Input
                        type="text"
                        register={register}
                        name="city"
                        error={errors.city?.message}
                        placeholder="Ex: Sombrio - SC..."
                      />
                    </div>
                 </div>

                 <div className="mb-3">
                      <p className="mb-2 font-medium">Preço</p>
                      <Input
                        type="text"
                        register={register}
                        name="price"
                        error={errors.price?.message}
                        placeholder="Ex: 65.000..."
                      />
                 </div>

                 <div className="mb-3">
                      <p className="mb-2 font-medium">Descrição</p>
                      <textarea
                        className="border-2 w-full rounded-md h-24 p-2"
                        {...register("description")}
                        name="description"
                        id="description"
                        placeholder="Digite a descrição completa sobre o carro..." 
                      />
                      {errors.description && <p className="mb-1  text-red-500">{errors.description.message}</p>}
                 </div>
                
                <button type="submit" className="w-full rounded-xl border-none bg-[#E11138] text-white font-medium h-10">
                    Cadastrar
                </button>
               </form>
            </div>
        </Container>
    )
}