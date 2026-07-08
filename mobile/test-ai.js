const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('https://kitpup.vercel.app/api/v1/users/login', {
      email: 'test@example.com', // Let's use a dummy or I should register one
      password: 'password123'
    });
    console.log("Logged in");
  } catch (err) {
    // If login fails, let's register one
    try {
      const regRes = await axios.post('https://kitpup.vercel.app/api/v1/users/register', {
        name: 'Tester',
        email: 'tester123@example.com',
        password: 'password123'
      });
      console.log("Registered");
    } catch(e) {}
  }
  
  try {
    const loginRes = await axios.post('https://kitpup.vercel.app/api/v1/users/login', {
      email: 'tester123@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    
    const res = await axios.post('https://kitpup.vercel.app/api/v1/ai/chat', {
      messages: [{ role: 'user', content: 'hello' }],
      systemPrompt: 'You are helpful'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
})();
