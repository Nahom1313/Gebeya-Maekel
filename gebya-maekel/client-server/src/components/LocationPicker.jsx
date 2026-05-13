import { useState } from 'react';

const LocationPicker = ({ onLocationSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detected, setDetected] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using free API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          const address = {
            address: `${data.address?.road || ''} ${data.address?.neighbourhood || ''}`.trim(),
            city: data.address?.city || data.address?.town || data.address?.village || '',
            phone: '',
            lat: latitude,
            lng: longitude,
            fullAddress: data.display_name,
          };

          onLocationSelect(address);
          setDetected(true);
          setLoading(false);
        } catch (err) {
          setError('Could not get address from location');
          setLoading(false);
        }
      },
      (err) => {
        setError('Location access denied. Please enter address manually.');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={detectLocation}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
          detected
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500"></div>
            Detecting location...
          </>
        ) : detected ? (
          <>✅ Location detected!</>
        ) : (
          <>📍 Auto-detect my location</>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
      {detected && (
        <p className="text-green-500 text-xs mt-2">
          ✅ Address filled automatically! You can still edit it below.
        </p>
      )}
    </div>
  );
};

export default LocationPicker;