const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoint for pincode lookup - with fallback
app.get('/api/pincode/:pincode', (req, res) => {
  const pincode = req.params.pincode;
  console.log('======================');
  console.log('Received request for pincode:', pincode);

  // Try primary API first
  tryPrimaryAPI(pincode, res);
});

// Try the primary API with browser-like headers
function tryPrimaryAPI(pincode, res) {
  const url = `https://api.postalpincode.in/pincode/${pincode}`;
  console.log('Trying primary API:', url);

  const options = {
    method: 'GET',
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://pincode.app/'
    }
  };

  const makeRequest = https.get(url, options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        if (data && data.length > 0) {
          const jsonData = JSON.parse(data);
          console.log('✅ Primary API Response successful');
          res.json(jsonData);
        } else {
          console.log('⚠️  Primary API returned empty response, trying fallback');
          tryFallbackAPI(pincode, res);
        }
      } catch (parseError) {
        console.error('❌ Parse error from primary API:', parseError.message);
        console.log('⚠️  Trying fallback API');
        tryFallbackAPI(pincode, res);
      }
    });
  });

  makeRequest.on('error', (error) => {
    console.error('❌ Primary API Error:', error.code || error.message);
    console.log('⚠️  Trying fallback API');
    tryFallbackAPI(pincode, res);
  });

  makeRequest.on('timeout', () => {
    console.error('❌ Primary API timeout');
    makeRequest.destroy();
    console.log('⚠️  Trying fallback API');
    tryFallbackAPI(pincode, res);
  });
}

// Fallback API using a different service
function tryFallbackAPI(pincode, res) {
  const url = `https://geoapify.com/api/geocode/search?postcode=${pincode}&country=IN&apiKey=c8f872e1845242a4800b5b4f28c5fb8c`;
  console.log('Trying fallback API (Geoapify)');

  const options = {
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  https.get(url, options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        if (data && data.length > 0) {
          const jsonData = JSON.parse(data);
          console.log('✅ Fallback API Response successful');
          
          // Transform fallback response to match primary API format
          const transformed = transformGeoapifyResponse(pincode, jsonData);
          res.json(transformed);
        } else {
          res.status(500).json({ error: 'No data from any API' });
        }
      } catch (parseError) {
        console.error('❌ Parse error from fallback API:', parseError.message);
        res.status(500).json({ 
          error: 'Unable to fetch pincode details from any service',
          details: 'Both primary and fallback APIs failed'
        });
      }
    });
  }).on('error', (error) => {
    console.error('❌ Fallback API Error:', error.message);
    res.status(500).json({ 
      error: 'Unable to fetch pincode details: ' + error.message,
      details: 'Both primary and fallback APIs failed'
    });
  });
}

// Transform Geoapify response to match PostalPincode format
function transformGeoapifyResponse(pincode, geoapifyData) {
  if (geoapifyData.features && geoapifyData.features.length > 0) {
    const feature = geoapifyData.features[0];
    const properties = feature.properties;
    
    return [
      {
        Status: 'Success',
        PostOffice: [
          {
            Name: properties.city || properties.town || 'Post Office',
            District: properties.state || 'Unknown',
            State: properties.state || 'Unknown',
            Block: properties.state || 'Unknown'
          }
        ]
      }
    ];
  }
  
  return [{ Status: 'Error', PostOffice: [] }];
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'Server is running' });
});

// Alternative endpoint using a different API or method
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working',
    note: 'If pincode lookup fails, it may be due to api.postalpincode.in blocking server-side requests'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend proxy server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});
