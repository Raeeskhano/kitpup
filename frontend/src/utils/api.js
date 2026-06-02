const BASE = 'http://localhost:5000/api';

export const api = {
  get: (path) => 
    fetch(BASE + path, { 
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
    }).then(r => r.json()),
    
  post: (path, body) => 
    fetch(BASE + path, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }, 
      body: JSON.stringify(body) 
    }).then(r => r.json()),
    
  patch: (path, body) => 
    fetch(BASE + path, { 
      method: 'PATCH', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }, 
      body: JSON.stringify(body) 
    }).then(r => r.json()),
    
  postForm: (path, formData) => 
    fetch(BASE + path, { 
      method: 'POST', 
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }, 
      body: formData 
    }).then(r => r.json()),
};
