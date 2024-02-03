import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

const FlightStatus = () => {
    const [flights, setFlights] = useState([]);
  const [events, setEvents] = useState([]);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Fetch initial flight data
     fetchFlights();



    // Create a SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7130/flightUpdateHub')
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('SignalR connection established.');
        // Handle incoming flight status updates
        newConnection.on('PlaneMoved', (flightNumber, planeCode, fromLocationId, toLocationId, eventType) => {
          setEvents(prevEvents => [
            ...prevEvents,
            { flightNumber, planeCode, fromLocationId, toLocationId, eventType }
          ]);
        });
      })
      .catch((error) => {
        console.error('Error establishing SignalR connection:', error);
      });

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    console.log(events);
  }, [events]);

  const fetchFlights = async () => {
    try {
      const response = await axios.get('https://localhost:7130/api/GetFlights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  

  // return (
  //   // <div>
  //   //   {/* <h1>Flight List</h1>
  //   //   <ul>
  //   //     {flights.map((flight) => (
  //   //       <li key={flight.id}>
  //   //         Flight: {flight.flightNumber}, Plane Code: {flight.planeCode}
  //   //       </li>
  //   //     ))}
  //   //   </ul> */}

  //   //   <h2>Flight Events</h2>
  //   //   <ul>
  //   //     {events.map((event) => (
  //   //       <li key={event.flight.id}>
  //   //         [Events]
  //   //       </li>
  //   //     ))}
  //   //   </ul>
  //   // </div>
  // );
};

export default FlightStatus;
