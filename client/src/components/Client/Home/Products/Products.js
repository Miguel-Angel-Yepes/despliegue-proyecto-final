import React, { useEffect, useState } from 'react';
import { Loader, Pagination, Message, Button, Icon, Dropdown, Sidebar, Segment, Menu, Modal } from 'semantic-ui-react';
import { ProductItem } from '../ProductItem';
import {CartItem} from '../CartItem';
import { size, map } from 'lodash';
import { categoryOptions, orderOptions } from '../../../../utils';
import { BasicModal } from '../../../Shared';
import { MenuElements, Footer } from '../../ClientLayout';
import { Product, Cart } from '../../../../api';
import { useAuth } from '../../../../hooks';
import { LoginForm, RegisterForm } from '../../../admin/Auth';
import './Products.css';
import styles from './Cart.module.css';

const productController = new Product();
const cartController = new Cart();

export function Products(props) {

  const { user } = useAuth();
  const [reloadCart, setReloadCart] = useState(false);
  const [cartContent, setCartContent] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const { reload, onReload } = props;
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState();
  const [categories, setCategories] = useState([]);
  const [orderBy, setOrderBy] = useState("");
  const [searchText, setSearchText] = useState(''); // Estado para búsqueda
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [zIndex, setZIndex] = useState(-1); // Estado para el z-index
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const onOpenCloseCart = () => setShowCart((prevState) => !prevState);
  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const cleanCategories = () => setCategories([]);
  const onReloadCart = () => setReloadCart((prevState) => !prevState);
  const onOpenCloseLogin = () => setShowLogin((prevState) => !prevState);
  const toggleForm = () => setIsLogin(!isLogin);

  useEffect(() => {


    (async () => {
      try {
        const response = await cartController.getCart(user._id)
        setCartContent(response);
        console.log(cartContent);
        
      } catch (error) {
        console.error(error);
      }
    })();

    // Si el carrito se abre, cambia el z-index después de 1 segundo
    if (showCart) {
      const timer = setTimeout(() => {
        setZIndex(11111111);
      }, 50);

      // Limpia el timeout si el componente se desmonta o si se vuelve a cerrar
      return () => clearTimeout(timer);
    } else {
      // Si el carrito se cierra, restablece el z-index
      setTimeout(() => {
        setZIndex(-1);
      }, 500);
    }   
    

    
  }, [showCart, reloadCart]);

  useEffect(() => {
    (async () => {
      try {
        const response = await productController.getProducts({ page, limit: 10, active: true, categories, orderBy });

        if (response.docs.length === 0) {
          setError("No se ha encontrado ningún producto");
        } else {
          setProducts(response.docs);
          setPagination({
            limit: response.limit,
            page: response.page,
            pages: response.totalPages,
            total: response.totalDocs,
          });
          setError(null);
        }
      } catch (error) {
        console.error(error);
        setError("No se encontró ningún producto");
      }
    })();
  }, [reload, page, categories, orderBy]);

  const changePage = (_, data) => {
    setPage(data.activePage);
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Sidebar.Pushable as={Segment} className={styles.sidebarPushable} style={{ zIndex: zIndex }}>
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
          <div className={styles.modalCartHeader}>
              <p className={styles.modalCartHeaderFirstP}>
              {cartContent ? cartContent.items.reduce((total, item) => total + item.quantity, 0) : 0}
              </p>
            <div>
              <Icon name="cart" size="big" />
              <p>Carrito de compras</p>
            </div>

            <Icon className={styles.closeIconNavCart} name="close" size="big" onClick={onOpenCloseCart} style={{ cursor: "pointer" }} />
          </div>

          <div className={styles.cartItemContainer}>
            {size(cartContent) > 0 && 
              cartContent.items.map((item) => (
                <CartItem key={item._id} item={item} onReloadCart={onReloadCart} />
              ))
            }
          </div>

          <div className={styles.modalCartFooter}>
            <div>
              <p>Total estimado</p>
              <p>${cartContent?.total}</p>
            </div>

            <Button className={styles.paymentButton} onClick={() => {navigate("/checkout")}}>
              Ir a pagar
            </Button>
          </div>
        </Sidebar>

        <Sidebar.Pusher dimmed={showCart} onClick={onOpenCloseCart}>
          <Segment basic></Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>

      <div className="products">
        {/* Componente MenuElements para búsqueda */}
        <MenuElements onSearch={setSearchText} onOpenCloseCart={onOpenCloseCart}  onReloadCart={onReloadCart} />

        <div className="products-filters">
          <div className="products-filters__order">
            <Button icon labelPosition="left" className="filter__button__product" size="big" onClick={onOpenCloseModal}>
              <Icon name="filter" size="big" />
              <> </>
              Filtrar productos
            </Button>

            <div className="products__filters__order__list">
              <p>Ordenar por: </p>
              <Dropdown
                placeholder="Ordenar por"
                selection
                options={orderOptions}
                onChange={(_, data) => {
                  setOrderBy(data.value);
                }}
                className="ordenar-dropdown"
              />
            </div>
          </div>

          <Button
            icon
            labelPosition="left"
            className="filter__button__product carrito"
            size="big"
            onClick={user?onOpenCloseCart:onOpenCloseLogin}
          >
            <Icon name="cart" size="big" />
            <> </>
            Carrito de compras
          </Button>
        </div>

        {/* Mensaje de error */}
        {error && <Message>{error}</Message>}

        {/* Loader */}
        {!error && !products && <Loader active inline="centered" />}

        {/* Mostrar productos filtrados */}
        {!error && size(filteredProducts) > 0 && (
          <div className="product-grid">
            {map(filteredProducts, (product) => (
              <ProductItem key={product._id} product={product} onReload={onReload} />
            ))}
          </div>
        )}

        {/* No hay productos */}
        {!error && size(filteredProducts) === 0 && <p>No hay ningún producto</p>}

        {/* Paginación */}
        {!error && pagination && (
          <div className="list-courses__pagination">
            <Pagination
              totalPages={pagination.pages}
              defaultActivePage={pagination.page}
              ellipsisItem={null}
              firstItem={null}
              lastItem={null}
              onPageChange={changePage}
            />
          </div>
        )}
        <Footer />
      </div>

      {/* Modal para filtrar por categorías */}
      <BasicModal show={showModal} close={onOpenCloseModal} title="Filtrar por categoria">
        <Button onClick={cleanCategories} className="cleanCategories" size="tiny">
          Limpiar categorias
        </Button>

        <Dropdown
          placeholder="Selecciona categorías"
          fluid
          multiple
          selection
          options={categoryOptions}
          value={categories}
          onChange={(_, data) => {
            setCategories(data.value);
          }}
        />
      </BasicModal>

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
