import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import { Container } from "../../components/container";
import { GoSearch } from "react-icons/go";
import "../../index.css";

import { 
    collection,
    query,
    getDocs,
    orderBy,
    where
} from 'firebase/firestore'

import {db} from '../../services/firebaseConnection'

interface CarsProps {
    id: string;
    name: string;
    year: string;
    uid: string;
    price: string | number;
    city: string;
    km: string;
    images: CarImageProps[];
}

interface CarImageProps{
    name: string;
    uid: string;
    url: string;
}


export function Home() {
   const [cars, setCars] = useState<CarsProps[]>([])
   const [loadImages, setLoadImages] = useState<string[]>([])
   const [input, setInput] = useState("");


   useEffect(() => {
       loadCars();
   },[])


   function loadCars(){
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))
  
    getDocs(queryRef)
   .then((snapshot) => {
       const listcars = [] as CarsProps[]
       
       snapshot.forEach( doc => {
           listcars.push({
               id: doc.id,
               name: doc.data().name,
               year: doc.data().year,
               city: doc.data().city,
               price: doc.data().price,
               images: doc.data().images,
               uid: doc.data().uid,
               km: doc.data().km
           })
       })

       setCars(listcars);
   })

   }



   function handleImageLoad(id: string){
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
   }

   async function handleSearchCar(){
     if(input === ""){
      loadCars();
      return;
     }

     setCars([]);
     setLoadImages([]);

     const q = query(collection(db, "cars"),
     where("name", ">=", input.toUpperCase()),
     where("name", "<=", input.toUpperCase() + "\uff8ff")
    )
    
    const querySnapshot = await getDocs(q)

    let listcars = []  as CarsProps[];

    querySnapshot.forEach( doc => {
      listcars.push({
          id: doc.id,
          name: doc.data().name,
          year: doc.data().year,
          city: doc.data().city,
          price: doc.data().price,
          images: doc.data().images,
          uid: doc.data().uid,
          km: doc.data().km
      })
  })

   }
 
  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          placeholder="Digite o nome do carro..."
          className="w-full border-2 rounded-lg h-9 outline-none px-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={handleSearchCar}>
          <GoSearch size={28} className="text-[#E11138]" />
        </button>
      </section>

      <h1 className="text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

     
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      {cars.map( car => (
        <Link key={car.id} to={`/car/${car.id}`}>
         <section className="w-full bg-white rounded-lg ">
            <div 
            className='w-full h-72 rounded-lg bg-slate-200' 
            style={{display: loadImages.includes(car.id) ? "none" : "block"}}
            ></div>
         <img
           className="w-full rounded-lg mb-2 mx-h-72 hover:scale-105 transition-all"
           src={car.images[0].url}
           alt="Carro"
           onLoad={() => handleImageLoad(car.id)}
           style={{display: loadImages.includes(car.id) ? "block" : "none"}}

         />
         <h3 className="mt-1 mb-2 px-2 text-[#E11138] font-medium text-[24px]">
          {car.name}
         </h3>

         <div className="flex flex-col px-2">
           <span className="text-zinc-700 mb-6">
             Ano {car.year} / {car.km} km
           </span>
           <strong className="text-black font-medium text-xl">
             R$ {car.price}
           </strong>
         </div>

         <div className="w-ful h-px bg-slate-200 my-2"></div>

         <div className="pb-2 px-2">
           <span className="text-black">{car.city}</span>
         </div>
       </section>
       </Link>
   ))}
      </main>
    </Container>
  );
}
