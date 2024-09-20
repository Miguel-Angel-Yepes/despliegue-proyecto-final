import React, {useState, useEffect} from 'react';
import { Form, Image } from 'semantic-ui-react';
import { useFormik } from 'formik';
import { initialValues, validationSchema } from './LoginForm.form';
import { Auth } from '../../../../api';
import { useAuth } from '../../../../hooks';
import { image } from '../../../../assets';
import { useNavigate } from 'react-router-dom';
import '../Form.css';

const authController = new Auth();

export function LoginForm(props) {
  const navigate = useNavigate();

    const { login, user } = useAuth();

    const { openRegister, onOpenCloseLogin } = props;
    const [error, setError] = useState("");

    
    const formik = useFormik({
      initialValues: initialValues(),
      validationSchema: validationSchema(),
      validateOnChange: false,
      onSubmit: async (formValue ) => {
        try {
          const response = await authController.login(formValue);

          authController.setAccessToken(response.access);
          authController.setRefreshToken(response.refresh);

          login(response.access);


          onOpenCloseLogin();
          console.log(user);
          console.log(response);
          
          

          navigate("/admin");
        } catch (error) {
          setError(error.msg);
        }
      }
    })

  return (
    <Form className="form login" onSubmit={formik.handleSubmit}>
        <Image src={image.LogoServimascotascolor} className='logo'/>
        <Form.Input 
            name="email" 
            placeholder="Correo electrónico" 
            onChange={formik.handleChange} 
            value={formik.values.email}
            error={formik.errors.email}
        />

        <Form.Input 
            name="password" 
            type="password" 
            placeholder="Contraseña"
            onChange={formik.handleChange}
            value={formik.values.password}
            error={formik.errors.password}
        />

        <Form.Button 
          type="submit" 
          fluid loading={formik.isSubmitting}
          style={{ backgroundColor: '#0ba69e', color: 'white' }}
        >
            Entrar
        </Form.Button>

        <p className='register-form__error'> {error} </p>


        <p> ¿No tienes una cuenta? 
            <button onClick={openRegister} className="auth__toggle">
                Crear cuenta
            </button>
        </p>
    </Form>

  )
}
