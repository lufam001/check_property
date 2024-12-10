const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.openrent.co.uk/properties-to-rent/manchester?term=Manchester&area=15&prices_min=350&prices_max=900&bedrooms_min=2&bedrooms_max=2&viewingProperty=20';

async function scrapeData() {
  try {
    // Make the HTTP request to fetch the HTML
    const response = await axios.get(url);
    const html = response.data;

    // Log the HTML content for debugging
    console.log('HTML Content:', html);

    // Load HTML into cheerio
    const $ = cheerio.load(html);

    const propertyList = [];

    // Loop through each property element
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

    // Save the scraped data to a JSON file
    fs.writeFileSync('output.json', JSON.stringify(propertyList, null, 2));
    console.log('Data scraped and saved to output.json');

    // Save the property data into a text file in a readable format
    const dataString = propertyList.map(property => {
      return `Title: ${property.title}\nPrice: ${property.price}\nDistance: ${property.distance}\nBedrooms: ${property.bedrooms}\nBathrooms: ${property.bathrooms}\nStatus: ${property.status}\n\n`;
    }).join('');

    // Write the formatted data to a text file
    fs.writeFileSync('data_string.txt', dataString);
    console.log('Data saved to data_string.txt');

  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeData();
