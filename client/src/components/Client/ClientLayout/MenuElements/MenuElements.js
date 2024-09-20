import React, { useState } from 'react';
import { Image, Icon, Button, Modal, Confirm } from 'semantic-ui-react';
import { image } from '../../../../assets';
import { useAuth } from '../../../../hooks';
import { LoginForm, RegisterForm } from '../../../admin/Auth';
import { useNavigate } from 'react-router-dom';
import styles from './MenuElements.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export function MenuElements({ onSearch, onOpenCloseCart,onReloadCart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onOpenCloseLogin = () => {
    handleCloseMenu()
    setShowLogin((prevState) => !prevState);
  }

  const onOpenCloseConfirm = () => {
    handleCloseMenu()
    setShowConfirm((prevState) => !prevState)
  };

  const toggleForm = () => setIsLogin(!isLogin);
  

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const onLogout = () => {
    logout();
    onReloadCart();
    navigate("/");
    onOpenCloseConfirm();
  };

  return (
    <>
      <div className={styles['client-menu']}>
        {/* Logo */}
        <Image
          src={image.LogoServimascotasblanco}
          as="a"
          href="/"
          className={styles['client-menu__Image']}
        />

        {/* Search Input */}
        <div className={styles.buscador}>
          <input
            type="search"
            placeholder="Buscar productos..."
            className={styles['buscador__input']}
            onChange={handleSearchChange}
          />
          <i className={`fas fa-search ${styles['buscador__icon']}`}></i>
        </div>

        {/* Menu buttons for large screens */}
        <div className={styles['menu-buttons']}>
          <Button
            className={styles['menu-elements__Button']}
            size="large"
            onClick={() => {
              if (user) {
                navigate('/appoinments'); // Redirige a la página de citas si hay usuario
              } else {
                onOpenCloseLogin(); // Abre el modal de login si no hay usuario
              }
            }}
          >
            Peluquería
          </Button>
          
          <Button
            onClick={() => {navigate("/contact")}}
            className={styles['menu-elements__Button']}
            size="large"
          >
            Contacto
          </Button>

          {user ? (
            <Button
              className={styles['menu-elements__Button__Login']}
              size="large"
              onClick={onOpenCloseConfirm}
            >
              <Icon name="user" className={styles.userIcon} />
              <p>Hola {user.firstname}</p>
            </Button>
          ) : (
            <Button
              className={styles['menu-elements__Button__Login']}
              size="large"
              onClick={onOpenCloseLogin}
            >
              <Icon name="user" />
              <p>Iniciar sesión</p>
            </Button>
          )}
        </div>

        {/* Hamburger Button (only visible on small screens) */}
        <div className={styles.burguer}>
          <Button
            icon
            className={styles['client-menu__Hamburger-act']}
            onClick={toggleMenu}
          >
            <Icon name={isMenuOpen ? 'times' : 'bars'} />
          </Button>
        </div>
      </div>

      {/* Modal Menu for small screens */}
      {isMenuOpen && (
        <div className={styles['menu-modal']}>
          <div className={styles['menu-modal__content']}>
            <Button
              icon
              className={styles['menu-modal__close']}
              onClick={handleCloseMenu}
            >
              <Icon name="times" />
            </Button>

            <div
              className={styles['menu-modal__item']}
              onClick={() => {
                handleCloseMenu(); // Siempre cierra el menú
                if (user) {
                  navigate('/appoinments'); // Redirige a "appoinments" si hay usuario
                } else {
                  onOpenCloseLogin(); // Abre el modal de login si no hay usuario
                }
              }}
            >
              <a>Peluquería</a>
            </div>

            <div className={styles['menu-modal__divider']}></div>

            <div
              className={styles['menu-modal__item']}
              onClick={() => {
                handleCloseMenu();
                navigate('/contact');
              }}
            >
              <a>Contacto</a>
            </div>
            
            <div className={styles['menu-modal__divider']}></div>

            <Button
                className={styles['menu-elements__Button__Carrito']}
                size="large"
                onClick={user?onOpenCloseCart:onOpenCloseLogin}
              >
                <Icon name="cart" className={styles.userIcon} />
                <p>Carrito de compras</p>
              </Button>
            
            <div className={styles['menu-modal__divider']}></div>


            {user ? (
              <Button
                className={styles['menu-elements__Button__Login']}
                size="large"
                onClick={onOpenCloseConfirm}
              >
                <Icon name="user" className={styles.userIcon} />
                <p>Hola {user.firstname}</p>
              </Button>
            ) : (
              <Button
                className={styles['menu-elements__Button__Login']}
                size="large"
                onClick={onOpenCloseLogin}
              >
                <Icon name="user" />
                <p>Iniciar sesión</p>
              </Button>
          )}
            </div>
          </div>
      )}

      <Modal closeIcon open={showLogin} onClose={onOpenCloseLogin} className={styles.modal}>
        <Modal.Content className={styles.modalContent}>
          {isLogin ? (
            <LoginForm
              openRegister={toggleForm}
              onOpenCloseLogin={onOpenCloseLogin}
            />
          ) : (
            <RegisterForm
              openLogin={toggleForm}
              onOpenCloseLogin={onOpenCloseLogin}
            />
          )}
        </Modal.Content>
      </Modal>

      <Confirm
        open={showConfirm}
        onCancel={onOpenCloseConfirm}
        onConfirm={onLogout}
        content="Deseas cerrar la sesión?"
        size="mini"
      />
    </>
  );
}
