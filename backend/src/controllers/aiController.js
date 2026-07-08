const axios = require('axios');

// @desc    Chat with KitPup AI
// @route   POST /api/v1/ai/chat
// @access  Private
exports.chatWithAI = async (req, res, next) => {
  try {
    const { messages, systemPrompt } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_key_here') {
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key is missing or invalid in backend/.env file' 
      });
    }

    // Map messages to Gemini format, supporting inlineData for images
    const geminiContents = messages.map(msg => {
      const parts = [{ text: msg.content ? String(msg.content) : " " }];
      if (msg.attachment && msg.attachment.data) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType || 'image/jpeg',
            data: msg.attachment.data
          }
        });
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-flash-latest'
    ];

    let response;
    let lastError;

    for (const model of modelsToTry) {
      try {
        response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiContents
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // If successful, break out of the loop
        if (response && response.data) {
          console.log(`Successfully generated content using model: ${model}`);
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed:`, err.response?.data?.error?.message || err.message);
        lastError = err;
      }
    }

    if (!response || !response.data) {
      throw lastError || new Error('All Gemini models failed to generate content');
    }

    const replyText = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ success: true, data: replyText });
  } catch (error) {
    console.error('AI Proxy Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
};
