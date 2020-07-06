import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { api, districts, municipalities } from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone/index';

import Logo from '../../assets/logo.svg';

import './styles.css';

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface District {
  sigla: string,
  nome: string
}

interface Municipality {
  id: number,
  nome: string
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [district, setDistricts] = useState<District[]>([]);
  const [municipality, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedDristrict, setSelectedDistrict] = useState("0");
  const [selectedMunicipality, setSelectedMunicipality] = useState("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialMapPosition, setInitialMapPosition] = useState<[number, number]>([0, 0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    }).catch();
  }, []);

  useEffect(() => {
    districts.get<District[]>('').then(response => {
      setDistricts(response.data);
    });
  }, []);

  useEffect(() => {
    if(selectedDristrict === '0') {
      return;
    }
    municipalities.get<Municipality[]>(`${selectedDristrict}/municipios`).then(response => {
      setMunicipalities(response.data);
    });
    
  }, [selectedDristrict])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialMapPosition([latitude, longitude]);
    })
  }, []);

  const districtsRendering = () => {
    const states = district;

    states.sort((a, b) => {
      if(a.nome < b.nome) {
        return -1;
      }

      if(a.nome > b.nome) {
        return 1;
      }

      return 0;
    });

    return states;
  }

  const municipalityRendering = () => {
    const cities = municipality;

    cities.sort((a, b) => {
      if(a.nome < b.nome) {
        return -1;
      }

      if(a.nome > b.nome) {
        return 1;
      }

      return 0;
    });

    return cities;
  };

  const handleSelectDistrict = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(event.target.value);
  };

  const handleSelectMunicipality = (event : ChangeEvent<HTMLSelectElement>) => {
    setSelectedMunicipality(event.target.value);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    
    setFormData({...formData, [name] : value});
  }

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    
    if (alreadySelected >= 0) {
      const newSelectedItems = selectedItems.filter(item => item !== id);
      setSelectedItems(newSelectedItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const state = district.find(element => element.sigla === selectedDristrict)?.nome;
    const city = municipality.find(element => String(element.id) === selectedMunicipality)?.nome;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('state', String(state));
    data.append('city', String(city));
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(","));
    
    if(selectedFile) {
      data.append('image', selectedFile);
    }
    

    await api.post('points', data).catch();

    alert('O Ponto de Recolha foi Criado. Obrigado!');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Registo do <br /> Ponto de Recolha</h1>
        
        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text"
              name="name"
              id="name" 
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email" 
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp" 
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Seleccione o Endereço no Mapa</span>
          </legend>
          <Map center={initialMapPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Distrito</label>
              <select 
                name="uf" 
                id="uf"
                value={selectedDristrict}
                onChange={handleSelectDistrict}
              >
                <option key="0" value="0">Seleccione um Distrito</option>
                {
                  districtsRendering()
                  .map(state => <option key={state.sigla} value={state.sigla}>{state.nome}</option>)
                }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedMunicipality}
                onChange={handleSelectMunicipality}
              >
                <option key="0" value="0">Seleccione um Distrito</option>
                {
                  municipalityRendering()
                  .map(municip => <option key={municip.id} value={municip.id}>{municip.nome}</option>)
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Seleccione um ou mais items abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => {
              return (
                <li 
                  key={item.id} 
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              );
            })};
            
            
          </ul>
        </fieldset>

        <button type="submit">
          Registar Ponto de Recolha
        </button>
      </form>
    </div>
  )
};

export default CreatePoint;