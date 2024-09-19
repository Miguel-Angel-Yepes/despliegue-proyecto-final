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
        <Route path='/' element=<Home/>  />
        <Route path='/contact' element={loadLayout(ClientLayout, Contact, "Contacto")} />
        <Route path='/product' element={loadLayout(ClientLayout, Product)} />
        {!user ? (
          <>
          <Route path='/appoinments' element={<Auth />} />
          <Route path='/checkout' element={<Auth />} />
          <Route path='/post-checkout' element={<Auth />} />
          </>
        ) : (
          <>
          <Route path='/appoinments' element={loadLayout(ClientLayout, Appoinments, "Peluquería")} />
          <Route path='/checkout' element={loadLayout(ClientLayout, Checkout, "Pago")} />
          <Route path='/post-checkout' element={<PostCheckout />} />
          </>
        )}
    </Routes>
  )
}
