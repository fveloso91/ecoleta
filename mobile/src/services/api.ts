import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.1.67:3333'
});

export const districts = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
})

export const municipalities = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/'
})