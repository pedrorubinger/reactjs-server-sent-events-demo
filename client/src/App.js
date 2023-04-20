import React, { useState, useEffect, useRef } from "react";

import "./App.css";
const BaseURL = "http://localhost:8000";

const containerStyle = {
  marginBottom: 8,
  borderRadius: 5,
  padding: 5,
  backgroundColor: '#FDF4F5',
}

const App = () => {
  const eventSource = useRef(null)
  const [status, setStatus] = useState("idle");
  const [products, setProducts] = useState([]);
  
  const handleEventMessage = (e) => {
    try {
      console.log("Message received!")

      if (e.data) {
        const { products } = JSON.parse(e.data)

        console.log(products)
        setStatus("ready")
        setProducts(products)
      } else throw new Error()
    } catch (err) {
      setStatus("error")
    }
  }

  useEffect(() => {
    eventSource.current = new EventSource(`${BaseURL}/realtime-products`);
    eventSource.current.onmessage = (e) => handleEventMessage(e)

    return () => {
      eventSource.current.close();
    };
  }, []);
  
  return (
    <div className="App">
      {status === "idle" && <span>Awaiting for response...</span>}
      {status === "error" && <span>An error has occurred fetchin data from API.</span>}

      {!!products.length && (
        products.map((product) => {
          return (
            <div style={containerStyle} key={product.id}>
              {product.title}
            </div>
          )
        })
      )}
    </div>
  );
}

export default App