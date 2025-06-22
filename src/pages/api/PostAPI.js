import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apiv2.unitededucation.com.tr/api/Auth/register',
        headers: { 
          'Content-Type': 'application/json', 
          'X-API-Key': process.env.API_KEY 
        },
        data: req.body 
      };

      const response = await axios.request(config);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('API call error:', error);
      console.error('API call error message:', error.message);
  
      res.status(error.response?.status || 500).json(
        error.response?.data || 
        { message: 'Internal Server Error' }
      );
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}