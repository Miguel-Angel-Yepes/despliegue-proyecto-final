import React, { useState, useEffect } from 'react';
import { Form, Dropdown, ButtonOr, ButtonGroup, Button } from 'semantic-ui-react';
import { useFormik } from 'formik';
import { initialValues, validationSchema } from './DirectionForm.form';
import { Checkout } from '../../../../api';
import { useAuth } from '../../../../hooks';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Cart, Preference } from '../../../../api';
import GoogleMapsImage from '../../../../assets/svg/maps.svg'; // Importa la imagen de Google Maps
import WazeImage from '../../../../assets/svg/waze.svg'; // Importa la imagen de Waze
import styles from './DirectionForm.module.css';
import '../../Contact/ContactApi/ContactApi.css';
import './wallet.css';

const cartController = new Cart();
const preferenceController = new Preference();
const checkoutController = new Checkout();

export function DirectionForm(props) {
  initMercadoPago('APP_USR-a6181c8c-164d-4d09-ae15-543995633084', { locale: 'es-CO' });

  const { user } = useAuth();
  const { directionData, setDeliveryMunicipality, handleDeliveryState, deliveryState, deliveryMunicipality } = props;
  const [cartContent, setCartContent] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [municipalityOptions, setMunicipalityOptions] = useState([]);
  const [municipalityDisabled, setMunicipalityDisabled] = useState(true);

  

  useEffect(() => {
    formik.setValues(initialValues(directionData));

    if (directionData?.department) {
      const selectedDepartment = directionData.department;
      const selectedDepartmentOption = departmentOptions.find(opt => opt.value === selectedDepartment);
      if (selectedDepartmentOption) {
        fetchMunicipalities(selectedDepartmentOption.key);
      }
    }
  }, [directionData, departmentOptions]);

  useEffect(() => {
    (async () => {
      try {
        const response = await cartController.getCart(user._id);
        setCartContent(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [user._id]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await response.json();
        const departmentOptions = data.map(department => ({
          key: department.id,
          value: department.name,
          text: department.name,
        }));
        setDepartmentOptions(departmentOptions);
      } catch (error) {
        console.error('Error al obtener los departamentos:', error);
      }
    };

    fetchDepartments();
  }, []);

  const fetchMunicipalities = async (departmentKey) => {
    try {
      const response = await fetch(`https://api-colombia.com/api/v1/Department/${departmentKey}/cities`);
      const data = await response.json();
      const municipalityOptions = data.map(municipality => ({
        key: municipality.id,
        value: municipality.name,
        text: municipality.name,
      }));
      setMunicipalityOptions(municipalityOptions);
      setMunicipalityDisabled(false);
    } catch (error) {
      console.error('Error al obtener los municipios:', error);
    }
  };

  const handleBuy = async () => {
    const id = await preferenceController.createPreference(cartContent);
    if (id) {
      setPreferenceId(id);
    }
  };

  const formik = useFormik({
    initialValues: initialValues(directionData),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async formValue => {
      try {
        const deliveryCost = deliveryState ? (deliveryMunicipality === "Bello" ? 5900 : 9900) : 0;
        const dataToSend = {
          ...formValue,
          delivery: deliveryState,
          deliveryCost,
        };
        await checkoutController.addDirectionData(dataToSend, user._id);
        handleBuy();
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleDepartmentChange = (e, { value, options }) => {
    formik.setFieldValue('department', value);

    const selectedDepartment = options.find(option => option.value === value);
    if (selectedDepartment) {
      fetchMunicipalities(selectedDepartment.key);
      setMunicipalityDisabled(false);
    } else {
      setMunicipalityDisabled(true);
    }
  };

  const handleMunicipalityChange = (e, { value }) => {
    formik.setFieldValue('municipality', value);
    setDeliveryMunicipality(value); // Llama a setDeliveryMunicipality aquí
  };

  // Maneja la redirección a Google Maps con la dirección proporcionada
  const handleNavigateToGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=Cl+66+cr+59-4+barrio+ducado,+Bello`;
    window.open(googleMapsUrl, '_blank');
  };

  // Maneja la redirección a Waze con la dirección proporcionada
  const handleNavigateToWaze = () => {
    const wazeUrl = `https://waze.com/ul?ll=6.3471929,-75.563069&navigate=yes&q=Cl+66+cr+59-4+barrio+ducado,+Bello`;
    window.open(wazeUrl, '_blank');
  };

  return (
    <>
      <ButtonGroup size='large' fluid>
        <Button onClick={() => handleDeliveryState(true)} className={deliveryState === true ? 'selected-button' : ''}>
          Envío a domicilio
        </Button>
        <ButtonOr />
        <Button onClick={() => handleDeliveryState(false)} className={deliveryState === false ? 'selected-button' : ''}>
          Retirar en tienda
        </Button>
      </ButtonGroup>

      {deliveryState ? (
        <Form className={styles.directionForm} onSubmit={formik.handleSubmit}>
          <Form.Field>
            <label>Departamento</label>
            <Dropdown
              name="department"
              placeholder="Seleccione un departamento"
              fluid
              selection
              options={departmentOptions}
              onChange={handleDepartmentChange}
              value={formik.values.department}
              error={formik.errors.department}
            />
          </Form.Field>

          <Form.Field>
            <label>Municipio</label>
            <Dropdown
              placeholder="Seleccione un municipio"
              name="municipality"
              fluid
              selection
              options={municipalityOptions}
              onChange={handleMunicipalityChange}
              value={formik.values.municipality}
              error={formik.errors.municipality}
              disabled={municipalityDisabled}
            />
          </Form.Field>

          <Form.Field>
            <label>Dirección</label>
            <Form.Input
              name="street"
              placeholder="Dirección"
              onChange={formik.handleChange}
              value={formik.values.street}
              error={formik.errors.street}
            />
          </Form.Field>

          <Form.Field>
            <label>Información adicional (ej: apto 201)</label>
            <Form.Input
              name="aditionalDescription"
              placeholder="Información adicional (ej: apto 201)"
              onChange={formik.handleChange}
              value={formik.values.aditionalDescription}
              error={formik.errors.aditionalDescription}
            />
          </Form.Field>

          <Form.Field>
            <label>Barrio</label>
            <Form.Input
              name="neighborhood"
              placeholder="Barrio"
              onChange={formik.handleChange}
              value={formik.values.neighborhood}
              error={formik.errors.neighborhood}
            />
          </Form.Field>

          <Form.Button
            type="submit"
            fluid
            loading={formik.isSubmitting}
            style={{ backgroundColor: '#0ba69e', color: 'white' }}
          >
            Pagar
          </Form.Button>

          {preferenceId && <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />}
        </Form>
      ) : (
        <Form onSubmit={formik.handleSubmit} className={styles.directionForm}>
          <div className={styles.mapContainer}>
            <div className={styles.imageContainer}>
              <a href="https://www.google.com/maps/dir/?api=1&destination=Cl+66+cr+59-4+barrio+ducado,+Bello" target="_blank" rel="noopener noreferrer">
                <img 
                  src={GoogleMapsImage} 
                  alt="Google Maps" 
                  className={styles.mapImage} 
                  style={{ cursor: 'pointer', width: '80%', height: '80%' }}
                />
              </a>
            </div>
            <div className={styles.imageContainer}>
              {/* Enlace para Waze */}
              <a href="https://waze.com/ul?ll=6.3471929,-75.563069&navigate=yes&q=Cl+66+cr+59-4+barrio+ducado,+Bello" target="_blank" rel="noopener noreferrer">
                <img 
                  src={WazeImage} 
                  alt="Waze" 
                  className={styles.mapImage} 
                  style={{ cursor: 'pointer', width: '80%', height: '80%' }}
                />
              </a>
            </div>
          </div>

          <Form.Button
            type="submit"
            fluid
            loading={formik.isSubmitting}
            style={{ backgroundColor: '#0ba69e', color: 'white' }}
          >
            Pagar
          </Form.Button>

          {preferenceId && <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />}
        </Form>
      )}
    </>
  );
}