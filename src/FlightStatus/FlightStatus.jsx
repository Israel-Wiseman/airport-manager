import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import 'bootstrap'

const FlightStatus = () => {
  const [data, setData] = useState([]);
  const [flights, setFlights] = useState([]);
  const [connection, setConnection] = useState(null);
  const [displayFlights, setDisplayFlights] = useState(false);

  const getStatusName = (statusNumber) => {
    return statusNumber === 0 ? 'Landing' : 'Departure';
  }

  const getStatusBackgroundColor = (statusNumber) => {
    return statusNumber === 0 ? 'darkGreen' : DodgerBlue
  }



  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {

    // Create a SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7130/flightUpdateHub')
      .build();

    setConnection(newConnection);

    const newData = []; // Store the history of flight movements

    newConnection
      .start()
      .then(() => {
        console.log('SignalR connection established.');
        // Handle incoming flight status updates
        newConnection.on('PlaneMoved', (flightNumber, planeCode, fromLocationId, toLocationId, status) => {
          const movementInfo = `Flight ${flightNumber}, Plane Code ${planeCode}, Status: ${status}, moved from ${fromLocationId} to ${toLocationId}`;
          newData.push(movementInfo); // Add the new movement to history
          setData([...newData]); // Update the data state to trigger re-render
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

  const fetchFlights = async () => {
    try {
      const response = await axios.get('https://localhost:7130/api/GetFlights');
      setFlights(response.data);
      setDisplayFlights(!displayFlights);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  return (





    <div className='card' style={{ backgroundImage: 'linear-gradient(LemonChiffon, cornFlowerBlue)' }}>

      <h2 className='card card-title' style={{ marginLeft: '500px', backgroundImage: 'linear-gradient(darkSeaGreen, yellow)' }}
      >Flight Events</h2>
      <ul>

        {data.map((movement, index) => (
          <li key={index} style={{ backgroundImage: 'linear-gradient(LightSlateGray, LightPink)',  marginTop: '10px' }}>
            {movement.replace(/Status: (\d+)/, (match, statusNumber) => `Status: ${getStatusName(parseInt(statusNumber, 10))}`)}

          </li>))}
      </ul>

      <button className='btn btn-info' style={{ width: '200px', marginLeft: '40px' }} onClick={fetchFlights}> Fetch Flight List </button>
      {displayFlights && (
        <div >
          <h1 className='card card-title'
            style={{ marginLeft: '500px', marginTop: '10px', backgroundImage: 'linear-gradient(darkSeaGreen, yellow)' }}>Flight List</h1>
          <ul className='card card-body' style={{ marginLeft: '200px' }}>
            {flights.map((flight) => (
              <li key={flight.id} style={{
                backgroundImage: flight.status === 0 ? 'linear-gradient(darkSeaGreen, white)'
                  : 'linear-gradient(CornflowerBlue, white)'
              }}>

                Flight: {flight.flightNumber}, Plane Code: {flight.planeCode}, Status: {getStatusName(flight.status)}
                <p>======================================</p>
              </li>
            ))}
          </ul>
        </div>
      )

      }
    </div>



  );
};

export default FlightStatus;
