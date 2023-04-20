const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET'],
}));

const PORT = 8000;

// Send real-time product data to the client using Server-Sent Events
app.get("/realtime-products", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  let limit = 2
  const url = `https://dummyjson.com/products`

  // Fetch product data from the dummyjson API and send it to the frontend
  axios.get(`${url}?limit=${limit}`)
    .then(response => {
      const products = response.data;
      res.write(`data: ${JSON.stringify(products)}\n\n`);

      // Update the product data every 5 seconds and send the new state to the frontend
      const intervalId = setInterval(() => {
        axios.get(`${url}?limit=${limit}`)
          .then(response => {
            ++limit
            console.log('limit', limit, `${url}?limit=${limit}`)
            const newProducts = response.data;
            res.write(`data: ${JSON.stringify(newProducts)}\n\n`);
          })
          .catch(error => {
            console.log("Error fetching product data: ", error.message);
          });
      }, 5000);

      // Stop sending updates to the client when the connection is closed
      req.on("close", () => {
        clearInterval(intervalId);
      });
    })
    .catch(error => {
      console.log("Error fetching product data: ", error.message);
      res.status(500).send("Error fetching product data");
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
