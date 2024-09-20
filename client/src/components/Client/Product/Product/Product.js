import React, { useState, useEffect } from 'react';
import { Image, Icon, Sidebar, Segment, Menu, Button, Card, Modal } from 'semantic-ui-react';
import { Product as ProductClass, Cart } from '../../../../api';
import { ENV } from '../../../../utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItem } from '../../Home/CartItem';
import { size } from 'lodash';
import { useAuth } from '../../../../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { LoginForm, RegisterForm } from '../../../admin/Auth';
import styles from './Product.module.css';
import './cart.css';
import styles2 from '../../Home/Products/Cart.module.css';

const cartController = new Cart();
const productController = new ProductClass();

export function Product() {
  const navigate = useNavigate();

  const location = useLocation();
  const { productId } = location.state || {};
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const [reloadCart, setReloadCart] = useState(false);
  const [cartContent, setCartContent] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [zIndex, setZIndex] = useState(-1);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false); // Estado para el modal de advertencia

  const onOpenCloseLogin = () => setShowLogin((prevState) => !prevState);
  const toggleForm = () => setIsLogin(!isLogin);

  const onOpenCloseCart = () => {
    setShowCart((prevState) => !prevState);
  }

  const onReloadCart = () => setReloadCart((prevState) => !prevState);

  const openModal = () => setShowModal(true); // Función para abrir el modal de advertencia
  const closeModal = () => setShowModal(false); // Función para cerrar el modal de advertencia

  useEffect(() => {
    (async () => {
      try {
        const response = await cartController.getCart(user._id);
        setCartContent(response);
      } catch (error) {
        console.error(error);
      }
    })();

    if (showCart) {
      const timer = setTimeout(() => {
        setZIndex(11111111);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setZIndex(-1);
      }, 500);
    }
  }, [showCart, reloadCart]);

  useEffect(() => {
    (async () => {
      try {
        const response = await productController.getProduct(productId);
        setProduct(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [productId]);

  if (!product) {
    return <div>Cargando producto...</div>;
  }

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    setQuantity(value < 1 ? 1 : value);
  };

  const formattedPrice = `$${product.price.toLocaleString('en-US', {
  })}`;

  const handleAddToCart = async () => {
    try {
      let cart;
      let existingQuantity = 0;

      // Obtener el carrito actual
      try {
        cart = await cartController.getCart(user._id);
      } catch (error) {
        console.log("No se encontró un carrito existente. Creando uno nuevo.");
      }

      // Si el producto ya está en el carrito, obtener la cantidad existente
      if (cart && cart.items.length > 0) {
        const existingItem = cart.items.find(item => item.productId === productId);
        if (existingItem) {
          existingQuantity = existingItem.quantity;
        }
      }

      // Nueva cantidad total (en el carrito más lo que se está agregando)
      const totalQuantity = existingQuantity + quantity;

      // Validar si la cantidad total excede el stock disponible
      if (totalQuantity > product.stock) {
        openModal(); // Abrir modal de advertencia
        return;
      }

      // Si la cantidad no excede el stock, agregar o actualizar el producto en el carrito
      if (existingQuantity > 0) {
        await cartController.updateCartQuantity(user._id, productId, totalQuantity);
      } else {
        await cartController.addToCart(user._id, productId, quantity);
      }

      // Recargar el carrito y abrir el carrito
      onReloadCart();
      onOpenCloseCart();
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
    }
  };

  const discountedPrice = (discount, price) => {
    const discountAmount = price * (discount / 100);
    const Price = price - discountAmount;
    const finalPrice =`$${Price.toLocaleString('en-US', {
    })}`;
    return finalPrice;
  };

  return (
    <>
      <Sidebar.Pushable as={Segment} className={styles2.sidebarPushable} style={{ zIndex: zIndex }}>
        <Sidebar
          as={Menu}
          animation="overlay"
          icon="labeled"
          direction="right"
          vertical
          visible={showCart}
          width="wide"
          style={{backgroundColor: "#cccdce"}}
        >
          <div className={styles2.modalCartHeader}>
              <p className={styles2.modalCartHeaderFirstP}>
              {cartContent ? cartContent.items.reduce((total, item) => total + item.quantity, 0) : 0}
              </p>
            <div>
              <Icon name="cart" size="big" />
              <p>Carrito de compras</p>
            </div>

            <Icon className={styles.closeIconNavCart} name="close" size="big" onClick={onOpenCloseCart} style={{ cursor: "pointer" }} />
          </div>

          <div className={styles2.cartItemContainer}>
            {size(cartContent) > 0 && 
              cartContent.items.map((item) => (
                <CartItem key={item._id} item={item} onReloadCart={onReloadCart} onOpenCloseCart={onOpenCloseCart} />
              ))
            }
          </div>

          <div className={styles2.modalCartFooter}>
            <div>
              <p>Total estimado</p>
              <p>${cartContent?.total}</p>
            </div>

            <Button className={styles2.paymentButton} onClick={() => {navigate("/checkout")}}>
              Ir a pagar
            </Button>
          </div>
        </Sidebar>

        <Sidebar.Pusher dimmed={showCart} onClick={onOpenCloseCart}>
          <Segment basic></Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>

      <div className={styles.productContainer}>
        <Button
          icon
          labelPosition="left"
          className={`filter__button__product`}
          id={styles.carrito}
          size="big"
          onClick={user ? onOpenCloseCart : onOpenCloseLogin}
        >
          <Icon name="cart" size="big" />
          <> </> <span>Carrito de compras</span>
        </Button>

        <Card className={styles.productCard}>
          <Image className={styles.productImage} src={product.images} />
        </Card>
        <div className={styles.productInfo}>
          <p className={styles.productTitle}>{product.name}</p>
          <p className={styles.productP}>{product.info}</p>
          {product.discount ? (
            <>
              <p className={styles.priceWithDiscount}> {formattedPrice} </p>
              <p>{discountedPrice(product.cantDiscount, product.price)}</p>
            </>
          ) : (
            <p>{formattedPrice}</p>
          )}
          <p>Seleccione la cantidad:</p>

          <div className={styles.quantitySelector}>
            <button className={styles.quantityButton} onClick={handleDecrease}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className={styles.quantityInput}
            />
            <button className={styles.quantityButton} onClick={handleIncrease}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <Button className={styles.addToCartButton} onClick={user ? handleAddToCart : onOpenCloseLogin}>
            <FontAwesomeIcon icon={faShoppingCart} /> Agregar al carrito
          </Button>
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} size="small">
        <Modal.Header>Advertencia</Modal.Header>
        <Modal.Content>
          <p>No puedes agregar más de {product.stock} unidades de este producto.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeModal}>Cerrar</Button>
        </Modal.Actions>
      </Modal>

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
    </>
  );
}
