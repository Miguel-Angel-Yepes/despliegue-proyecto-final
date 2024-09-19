import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Auth, Home, Products, Appoinments } from '../pages/admin';
import { AdminLayout } from '../layouts';
import { useAuth } from '../hooks';

export function AdminRouter() {
  
  const { user } = useAuth();  

  const loadLayout = (Layout, Page) =>{
    return (
      <Layout>
        <Page/>
      </Layout>
    )
  }

  return (
    <Routes>
    {!user || user.role==="user" ? (
      <Route path="/admin/*" element={<Auth />} />
    ) : (
      <>
        <Route path="https://servimascotas.onrender.com/admin" element={loadLayout(AdminLayout, Home)} />
        <Route path="https://servimascotas.onrender.com/admin/products" element={loadLayout(AdminLayout, Products)} />
        <Route path="https://servimascotas.onrender.com/admin/appoinments" element={loadLayout(AdminLayout, Appoinments)} />
      </>
    )}
</Routes>
  )
}
