import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333'
});

export const districts = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
})

export const municipalities = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/'
})