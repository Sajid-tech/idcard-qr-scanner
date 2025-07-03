import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanMode, setScanMode] = useState(null); 

 
  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setScanResult(result);
      
     
      const newScan = {
        id: Date.now(),
        result: result,
        timestamp: new Date().toLocaleString()
      };
      setScanHistory(prev => [newScan, ...prev]);
      
   
      if (scanMode === 'single') {
        setScanning(false);
      }
      
      toast({
        title: "Scan Successful",
        description: `QR Code detected: ${result}`,
        className: "bg-blue-100 text-blue-800",
      });
    }
  };

  const handleError = (error) => {
    console.error(error);
    toast({
      title: "Scan Error",
      description: error.message || "Failed to scan QR code",
      variant: "destructive",
    });
  };

  const clearAllResults = () => {
    setScanHistory([]);
    setScanResult(null);
    toast({
      title: "Cleared",
      description: "All scan history has been cleared",
      className: "bg-blue-100 text-blue-800",
    });
  };

  const startSingleScan = () => {
    setScanMode('single');
    setScanning(true);
  };

  const startMultiScan = () => {
    setScanMode('multi');
    setScanning(true);
  };

  const stopScanning = () => {
    setScanning(false);
    setScanMode(null);
  };

  const barcodeFormats = [
    "qr_code",
    "code_128",
    "code_39",
    "code_93",
    "codabar",
    "ean_13",
    "ean_8",
    "upc_a",
    "upc_e",
    "itf",
  ];

  return (
    <div className="w-full p-4 relative overflow-hidden min-h-screen ">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-indigo-50/20">
          <div 
            className="absolute inset-0 bg-[length:30px_30px] bg-[linear-gradient(to_right,#dbeafe_1px,transparent_1px),linear-gradient(to_bottom,#dbeafe_1px,transparent_1px)]"
            style={{
              opacity: 0.6,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))'
            }}
          ></div>
        </div>
      </div>
      
      <div className='sm:hidden'>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4 text-blue-800">QR Code Scanner</h1>
          
          <Card className="mb-2 bg-white/95 backdrop-blur-sm border-blue-300 shadow-lg hover:shadow-blue-100/50 transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {!scanning ? (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-blue-700 mb-4">
                        {scanResult 
                          ? `Last scanned code: ${scanResult}`
                          : "Choose a scanning mode below"}
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={startSingleScan}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-200/50 transition-all"
                        >
                          Single Scan
                        </Button>
                        <Button
                          onClick={startMultiScan}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-green-200/50 transition-all"
                        >
                          Multi Scan
                        </Button>
                      </div>
                    </div>
                    {(scanResult || scanHistory.length > 0) && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setScanResult(null)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Clear Result
                        </Button>
                        <Button
                          variant="outline"
                          onClick={clearAllResults}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Clear All History
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-blue-800">
                        {scanMode === 'single' ? 'Single Scan Mode' : 'Multi Scan Mode'}
                      </h2>
                      <Button
                        variant="ghost"
                        onClick={stopScanning}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Stop Scanner
                      </Button>
                    </div>
                    
                    <div className="w-full flex justify-center">
                      <Scanner
                        formats={barcodeFormats}
                        onScan={handleScan}
                        onError={handleError}
                        className="w-full max-w-lg border-2 border-blue-300 rounded-lg overflow-hidden"
                        styles={{
                          container: {
                            width: "100%",
                            maxWidth: "640px",
                            height: "auto",
                          },
                          video: {
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                          },
                        }}
                      />
                    </div>
                    
                    <p className="text-center mt-4 text-blue-600">
                      {scanMode === 'single' 
                        ? "Point your camera at a QR code to scan it (will close after scan)"
                        : "Point your camera at QR codes to scan them continuously"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {scanHistory.length > 0 && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm border-blue-300 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-800">Scan History</h2>
                  <span className="text-sm text-blue-600">
                    Total scans: {scanHistory.length}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-blue-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="py-2 px-4 border-b border-blue-200 text-left text-blue-800">SL No</th>
                        <th className="py-2 px-4 border-b border-blue-200 text-left text-blue-800">Scan Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanHistory.map((scan, index) => (
                        <tr key={scan.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="py-2 px-4 border-b border-blue-200">{index + 1}</td>
                          <td className="py-2 px-4 border-b border-blue-200 break-all">{scan.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm text-blue-800/70">
            <p>Powered by @Ag Solutions</p>
            <div className="text-xs text-blue-800/50 mt-2">
              Copyright © {new Date().getFullYear()} | Siga Scanner App
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-lg border border-blue-200 shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Mobile Experience Recommended</h2>
          <p className="text-blue-700">
            For the best scanning experience, please use this app on a mobile device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;