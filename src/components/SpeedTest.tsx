import React, { useState } from 'react';
import { useLibreSpeedTest } from '@/hooks/useLibreSpeedTest';

const SpeedTest = () => {
  const [result, setResult] = useState(null);
  const [liveData, setLiveData] = useState(null); 
  const [running, setRunning] = useState(false);

  const handleStart = () => {
     setResult(null);
    setLiveData(null);
    setRunning(true);


    const startTest = useLibreSpeedTest(
      (liveUpdate) => setLiveData(liveUpdate), // onUpdate
      (finalResult) => {
        setResult(finalResult); // onEnd
        setRunning(false);
      }
    );

    startTest(); // ✅ Call it
  };

   return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Internet Speed Test</h2>

      <button
        onClick={handleStart}
        disabled={running}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {running ? "Testing..." : "Start Test"}
      </button>

      {liveData && (
        <div className="space-y-1 mt-4 text-sm text-gray-700">
          <p>⬇ Download: <strong>{liveData.download} Mbps</strong></p>
          <p>⬆ Upload: <strong>{liveData.upload} Mbps</strong></p>
          <p>📶 Ping: <strong>{liveData.ping} ms</strong></p>
        </div>
      )}

      {result && !running && (
        <div className="mt-4 text-green-600 text-sm">
          ✅ Test Complete!
        </div>
      )}
    </div>
  );
};


export default SpeedTest;
