// src/components/stations/StationSelector.jsx
import { useRadio } from '../../context/RadioContext';
import StationCard from './StationCard';

export default function StationSelector() {
  const { stations, isLoading, isApiError } = useRadio();

  return (
    <section id="stations" className="w-full max-w-3xl mx-auto px-4">
      {/* Hanging line graphic */}
      <div className="flex justify-center mb-5">
        <div className="relative w-full max-w-lg flex justify-between px-12 h-[1px]">
          <div className="absolute inset-0 bg-[#2d1c17]/60 rounded-full" />
          <div className="w-1.5 h-3 bg-[#130b0e]/80 -mt-1 rounded-sm" />
          <div className="w-1.5 h-3 bg-[#130b0e]/80 -mt-1 rounded-sm" />
        </div>
      </div>

      {isLoading && stations.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs font-body tracking-wider text-paper-dark/60 animate-pulse">
            Connecting to radio wavelengths...
          </p>
        </div>
      )}

      {isApiError && (
        <div className="text-center py-4 border border-sari/20 rounded bg-sari/5 max-w-md mx-auto mb-4">
          <p className="text-xs font-body text-sari-light px-4">
            Could not connect to the station transmitter. Check your connection.
          </p>
        </div>
      )}

      {stations.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stations.map((station, i) => (
            <StationCard key={station.id} station={station} index={i} />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-6">
            <p className="text-xs font-body text-paper-dark/50">No stations available.</p>
          </div>
        )
      )}
    </section>
  );
}
