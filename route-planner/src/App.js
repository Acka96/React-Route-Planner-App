import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import './index.css'
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'

const center = { lat: 42.4392, lng: 19.266 }

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [waypointInputs, setWaypointInputs] = useState([]);
  const [map, setMap] = useState(/** @type google.maps.Map */(null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [waypoints, setWaypoints] = useState([])
  const [newWaypoint] = useState('');

  useEffect(() => {
    // Initialize waypointInputs with empty strings based on the number of waypoints
    setWaypointInputs(Array(waypoints.length).fill(''));
  }, [waypoints]);

  const originRef = useRef()
  const destinationRef = useRef()

  if (!isLoaded) {
    return <div>ne radi</div>
  }

  function addWaypoint() {
    setWaypoints([...waypoints, { location: newWaypoint, stopover: true }]);
  }

  function createAutoComplete(input, index) {
    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const updatedArray = [...waypoints];
      updatedArray[index] = place.formatted_address;
      setWaypoints(updatedArray);
    });
  }
  const waypointsFormatted = waypoints.map((point) => {
    return {
      location: point,
      stopover: true,
    };
  });

  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
  }

  // Function to clear the route
  function clearRoute() {
    setDirectionsResponse(null)
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

  return (
    <div className='relative flex flex-col items-center h-screen w-screen'>
      <div className='max-w-[1240px] mx-auto grid grid-cols-2 gap-4'>
        <div className='absolute left-0 top-0 h-full w-full flex flex-col rounded-lg'>
          {/* Google Map Box */}
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerClassName='w-full h-full'
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => setMap(map)}
          >
            <Marker position={center} />
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        </div>

        {/*desktop*/}
        <div className='p-4 rounded-lg shadow-xl w-fit relative hidden md:block'>
          <div className='p-4 rounded-lg hidden md:flex'>
            <div className='mb-1 mr-1 w-fit'>
              <Autocomplete>
                <input className='p-3 flex rounded-md' type='text' placeholder='Origin' ref={originRef} />
              </Autocomplete>
            </div>
            <div className='mb-1 mr-1'>
              <Autocomplete>
                <input className='p-3 flex rounded-md' type='text' placeholder='Destination' ref={destinationRef} />
              </Autocomplete>
            </div>
            <div className='mb-1 w-fit flex'>
              <button className='bg-[#42a5f5] text-black rounded-md font-medium w-[100px] py-2 ml-2 mr-2' onClick={calculateRoute}>Show Route</button>
              <button className='bg-[#42a5f5] rounded-full px-3' onClick={clearRoute}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24 " strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/*waypoint*/}
          <div className=' rounded-lg  w-fit relative hidden md:block'>
            <div className='rounded-lg w-fit relative hidden md:flex flex-wrap'>
              <button className='bg-[#42a5f5] text-black rounded-md font-medium w-[100px] py-2 ml-4 mr-1' onClick={addWaypoint}>Add Stop</button>
              {waypointInputs.map((input, index) => (
                <div key={index} className='mb-1 mr-1'>
                  <input
                    className='p-2 mr-1 rounded-md'
                    type='text'
                    placeholder={`Stop ${index + 1}`}
                    onChange={(e) => {
                      const updatedInputs = [...waypointInputs];
                      updatedInputs[index] = e.target.value;
                      setWaypointInputs(updatedInputs);
                    }}
                    ref={(input) => createAutoComplete(input, index)}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/*mobile*/}
        <div className='p-2 rounded-lg shadow relative w-fit block md:hidden'>
          <div className='mb-1'>
            <Autocomplete>
              <input className='p-1 flex rounded-md' type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </div>
          <div className='mb-1'>
            <Autocomplete>
              <input className='p-1 flex rounded-md' type='text' placeholder='Destination' ref={destinationRef} />
            </Autocomplete>
          </div>
          <div className='mb-1'>
            <button className='p-1 mr-1 bg-[#42a5f5] text-black rounded-md font-medium' onClick={calculateRoute}>Show Route</button>
            <button className='p-1 bg-[#42a5f5] text-black rounded-md font-medium' onClick={clearRoute}>Clear route</button>
            {/*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block m-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>*/}
          </div>
          <div className='mb-1'>
            <button className='p-1 mb-1 bg-[#42a5f5] text-black rounded-md font-medium' onClick={addWaypoint}>Add Stop</button>
            {waypointInputs.map((input, index) => (
              <div key={index} className='mb-1'>
                <input
                  className='p-2 flex rounded-md'
                  type='text'
                  placeholder={`Stop ${index + 1}`}
                  onChange={(e) => {
                    const updatedInputs = [...waypointInputs];
                    updatedInputs[index] = e.target.value;
                    setWaypointInputs(updatedInputs);
                  }}
                  ref={(input) => createAutoComplete(input, index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
