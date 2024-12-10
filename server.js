const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (like the HTML front-end)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON body
app.use(express.json());

// Scrape data endpoint
app.post('/scrape', async (req, res) => {
  const url = req.body.url; // Get the URL from the request

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Make the HTTP request to fetch the HTML
    const response = await axios.get(url);
    const html = response.data;

    // Log the HTML content for debugging
    console.log('HTML Content:', html);

    // Load HTML into cheerio
    const $ = cheerio.load(html);

    const propertyList = [];

    // Loop through each property element (adjust selector based on working script)
    $('#property-data .pli').each((i, el) => {
      const property = {};

      // Extracting the price
      property.price = $(el).find('.pim.pl-title h2').text().trim();

      // Extracting the distance
      property.distance = $(el).find('.ltc.pl-title h2').text().trim().replace(/[^\d.]/g, '') + ' km';

      // Extracting the property title
      property.title = $(el).find('.banda.pt.listing-title').text().trim();

      // Extracting the number of bedrooms
      property.bedrooms = $(el).find('ul.lic li').first().text().trim();

      // Extracting the number of bathrooms
      property.bathrooms = $(el).find('ul.lic li').eq(1).text().trim();

      // Extracting the furnishing status
      property.status = $(el).find('ul.lic li').eq(2).text().trim();

      // Add the scraped property data to the list
      propertyList.push(property);
    });

    // Log the propertyList to check if data is being collected
    console.log('Scraped Property List:', propertyList);

    // Send the scraped data back to the client
    if (propertyList.length > 0) {
      res.json(propertyList);
    } else {
      res.status(404).json({ message: 'No properties found' });
    }

  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Error scraping data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
