import React, {useEffect} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Auth, Home, Products, Appoinments } from '../pages/admin';
import { AdminLayout } from '../layouts';
import { useAuth } from '../hooks';

export function AdminRouter() {
  
  const { user } = useAuth();  
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin" && location.pathname.startsWith('/admin')) {
      navigate('/'); // Redirige a la página principal si el rol no es admin
    }
  }, [user, navigate]);

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
        <Route path="/admin" element={loadLayout(AdminLayout, Home)} />
        <Route path="/admin/products" element={loadLayout(AdminLayout, Products)} />
        <Route path="/admin/appoinments" element={loadLayout(AdminLayout, Appoinments)} />
      </>
    )}
</Routes>
  )
}
