import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, Appoinments, Contact, Product, Checkout, PostCheckout } from '../pages/web';
import { Auth} from '../pages/admin';
import { ClientLayout } from '../layouts/ClientLayout';
import { useAuth } from '../hooks';


export function WebRouter() {
  
  const { user } = useAuth();  

  const loadLayout = (Layout, Page, title) =>{
    return (
      <Layout title={title} >
        <Page/>
      </Layout>
    )
  }
 
  return (
    <Routes>
        <Route path='https://servimascotas.onrender.com' element=<Home/>  />
        <Route path='https://servimascotas.onrender.com/contact' element={loadLayout(ClientLayout, Contact, "Contacto")} />
        <Route path='https://servimascotas.onrender.com/product' element={loadLayout(ClientLayout, Product)} />
        {!user ? (
          <>
          <Route path='https://servimascotas.onrender.com/appoinments' element={<Auth />} />
          <Route path='https://servimascotas.onrender.com/checkout' element={<Auth />} />
          <Route path='https://servimascotas.onrender.com/post-checkout' element={<Auth />} />
          </>
        ) : (
          <>
          <Route path='https://servimascotas.onrender.com/appoinments' element={loadLayout(ClientLayout, Appoinments, "Peluquería")} />
          <Route path='https://servimascotas.onrender.com/checkout' element={loadLayout(ClientLayout, Checkout, "Pago")} />
          <Route path='https://servimascotas.onrender.com/post-checkout' element={<PostCheckout />} />
          </>
        )}
    </Routes>
  )
}
