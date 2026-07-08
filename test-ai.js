const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://kitpup.vercel.app/api/v1/ai/chat', {
      messages: [{role: 'user', content: 'hello'}],
      systemPrompt: 'You are a helpful assistant.'
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
}

test();
