import client from './client';

export const getProducts = (params) => 
  client.get('/products', { params }).then(res => res.data);

export const getCategories = (params) => 
  client.get('/categories', { params }).then(res => res.data);

export const createProduct = (data) => 
  client.post('/products', data).then(res => res.data);

export const updateProduct = (id, data) => 
  client.patch(`/products/${id}`, data).then(res => res.data);

export const deleteProduct = (id) => 
  client.delete(`/products/${id}`).then(res => res.data);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
