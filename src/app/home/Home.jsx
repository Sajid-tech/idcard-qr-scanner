import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const SuccessAnimation = () => {
  return (
    <div className="relative w-6 h-6 mr-2">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="#10B981" 
          strokeWidth="6"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-draw-circle"
        />
        <path
          d="M30,55 L45,70 L70,35"
          fill="none"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          className="animate-draw-check"
        />
      </svg>
    </div>
  );
};

const DuplicateAnimation = () => {
  return (
    <div className="relative w-6 h-6 mr-2">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="#F59E0B" 
          strokeWidth="6"
          strokeDasharray="283"
          strokeDashoffset="283"
          className="animate-draw-circle"
        />
        <path
          d="M30,50 L70,50 M50,30 L50,70"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="80"
          className="animate-draw-x"
        />
      </svg>
    </div>
  );
};

const Home = () => {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanMode, setScanMode] = useState(null); 
  const [scanMessage, setScanMessage] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
    const timeoutRef = useRef(null);
  
  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);


  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setScanResult(result);
      setShowFeedback(true);
   
      setScanHistory(prevHistory => {
        const isDuplicateScan = prevHistory.some(scan => scan.result === result);
        setIsDuplicate(isDuplicateScan);
        
        if (!isDuplicateScan) {
          const newScan = {
            id: Date.now(),
            result: result,
            timestamp: new Date().toLocaleString()
          };
          setScanMessage(`Scan Successful: ${result}`);
          return [newScan, ...prevHistory];
        } else {
          setScanMessage('Duplicate entry detected');
        
          return prevHistory;
        }
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
    
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 1200);
      
      if (scanMode === 'single') {
        setScanning(false);
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    setScanMessage(`Scan Error: ${error.message || "Failed to scan QR code"}`);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 1200);
  };

  const clearAllResults = () => {
    setScanHistory([]);
    setScanResult(null);
    setScanMessage(null);
    setIsDuplicate(false);
    setShowFeedback(false);
  };

  const startSingleScan = () => {
    setScanMode('single');
    setScanning(true);
    setScanMessage('Point your camera at a QR code to scan it (will close after scan)');
    setIsDuplicate(false);
    setScanResult(null);
    setShowFeedback(false);
   
     if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
    }, 300000);
  };

  const startMultiScan = () => {
    setScanMode('multi');
    setScanning(true);
    setScanMessage('Point your camera at QR codes to scan them continuously');
    setIsDuplicate(false);
    setScanResult(null);
    setShowFeedback(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
    }, 300000);
  };

  const stopScanning = () => {
    setScanning(false);
    setScanMode(null);
    setIsDuplicate(false);
    setShowFeedback(false);
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
       <style>
        {`
          @keyframes draw-circle {
            to {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes draw-check {
            0%, 30% {
              stroke-dashoffset: 60;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes draw-x {
            0%, 30% {
              stroke-dashoffset: 80;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          
          .animate-draw-circle {
            animation: draw-circle 0.5s ease-out forwards;
          }
          
          .animate-draw-check {
            animation: draw-check 0.8s ease-out forwards;
          }
          
          .animate-draw-x {
            animation: draw-x 0.8s ease-out forwards;
          }
          
          .scale-in {
            animation: scale-in 0.3s ease-out forwards;
          }
          
          @keyframes scale-in {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
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
          <h1 className="text-3xl font-bold text-center mb-4 text-blue-800">Event Entry</h1>
          
          <Card className={`mb-2 ${showFeedback ? (isDuplicate ? "bg-yellow-200/95" : "bg-green-200") : "bg-white/95"}   backdrop-blur-sm border-blue-300 shadow-lg hover:shadow-blue-100/50 transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {!scanning ? (
                  <>
                    <div className="text-center mb-6">
                    <p className="text-blue-700 mb-4">
                        {scanResult 
                          ? `Last scanned code: ${scanResult}${isDuplicate ? ' (Duplicate)' : ''}`
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
                    
                    {/* {scanMessage && (
                      <p className={`text-center mt-4 ${showFeedback ? (isDuplicate ? 'text-yellow-600' : 'text-green-600') : 'text-blue-600'}`}>
                        {scanMessage}
                      </p>
                    )} */}
            
   {(showFeedback || (scanning && scanMessage)) && (
                <div className={`mt-2 ${
                  isDuplicate ? 'bg-yellow-100' : 
                  scanResult ? 'bg-green-100' : 'bg-blue-100'
                } rounded-lg shadow-lg p-2 text-sm flex items-center border ${
                  isDuplicate ? 'border-yellow-300' : 
                  scanResult ? 'border-green-300' : 'border-blue-300'
                } transition-all duration-300 scale-in`}>
                  {scanResult ? (
                    isDuplicate ? <DuplicateAnimation /> : <SuccessAnimation />
                  ) : (
                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                  <p className={`ml-2 font-medium ${
                    isDuplicate ? 'text-yellow-800' : 
                    scanResult ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {scanMessage}
                  </p>
                </div>
              )}
      
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
              Copyright © {new Date().getFullYear()} | Scanner App
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

//sajid