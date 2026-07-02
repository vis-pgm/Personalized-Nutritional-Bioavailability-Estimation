'use client';

import { useState, useRef } from 'react';

export default function Dashboard() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [weightGrams, setWeightGrams] = useState<number>(150);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG or JPEG).');
      return;
    }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null); // Clear previous results on new upload
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit Image and Weight to FastAPI backend
  const handleAnalyzeMeal = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setAnalysisResult(null);

    // Because we are sending a file binary along with text data (weight),
    // we must use FormData instead of a standard JSON string payload.
    const formData = new FormData();
    formData.append('file', image);
    formData.append('weight_grams', weightGrams.toString());

    try {
      const response = await fetch('http://localhost:8000/api/v1/analyze-meal', {
        method: 'POST',
        body: formData, // Browser automatically sets Content-Type to multipart/form-data
      });

      if (!response.ok) throw new Error('AI analysis failed');
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      // Temporary mock data for testing UI before the Python backend is wired up
      console.log('Backend not connected yet, showing interface simulation.');
      setTimeout(() => {
        setAnalysisResult({
          food_identified: "Firm Tofu",
          confidence_score: 0.94,
          estimated_isoflavones_mg: Math.round(weightGrams * 0.28), 
          macronutrients: {
            protein_g: Math.round(weightGrams * 0.08),
            carbs_g: Math.round(weightGrams * 0.02),
            fat_g: Math.round(weightGrams * 0.04)
          }
        });
        setIsProcessing(false);
      }, 1500);
    } finally {
      // If mock data takes over, we keep loading state active until timeout clears it
      if (!image) setIsProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-950 text-gray-100">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Vision Dashboard</h1>
          <p className="text-gray-400 mt-2">Upload a photo of your soy meal to segment and evaluate item-specific bioavailability parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Input & Configurations */}
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={previewUrl ? undefined : triggerFileSelect}
              className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-200 ${
                previewUrl ? 'border-gray-800 bg-gray-900/40' : 'cursor-pointer'
              } ${isDragging ? 'border-indigo-500 bg-indigo-950/20' : 'border-gray-700 hover:border-gray-600 bg-gray-900/20'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Meal preview" className="max-h-full max-w-full object-contain rounded-lg shadow-md" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setImage(null); setAnalysisResult(null); }}
                    className="absolute top-2 right-2 p-2 bg-red-950/80 border border-red-800 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-gray-300">Drag and drop your meal photo here</p>
                  <p className="text-xs text-gray-500">or click to browse local files</p>
                </div>
              )}
            </div>

            {/* Slider Configurator */}
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Estimated Serving Weight</label>
                <span className="text-lg font-bold text-indigo-400">{weightGrams} <span className="text-xs text-gray-500">grams</span></span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              
              <button
                onClick={handleAnalyzeMeal}
                disabled={!image || isProcessing}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-md font-bold text-white transition-all shadow-md"
              >
                {isProcessing ? 'Segmenting Plate & Extracting Metrics...' : 'Run Vision Inference Pipeline'}
              </button>
            </div>
          </div>

          {/* Right Column: AI Response Interface */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[350px] flex flex-col justify-between">
            {!analysisResult && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-full my-auto text-center space-y-2 text-gray-500">
                <p className="text-sm">Inference outputs will be generated here.</p>
                <p className="text-xs max-w-xs">Upload an image and run the pipeline to engage the Vision Transformer and CLIP networks.</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-full my-auto space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 font-medium">Running Computer Vision Models...</p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6 w-full animate-fadeIn">
                <div className="border-b border-gray-800 pb-4">
                  <span className="text-xs font-semibold bg-indigo-950 border border-indigo-800 text-indigo-400 px-2 py-1 rounded-md">Detected Item</span>
                  <h2 className="text-2xl font-bold mt-2 text-white">{analysisResult.food_identified}</h2>
                  <p className="text-xs text-gray-400 mt-1">Classification Certainty: {(analysisResult.confidence_score * 100).toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider block">Target Bioavailability Input</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-400">{analysisResult.estimated_isoflavones_mg}</span>
                    <span className="text-xs font-medium text-emerald-500">mg Isoflavones</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400">Yield Breakdown ({weightGrams}g)</h3>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Protein</span>
                        <span className="text-white font-medium">{analysisResult.macronutrients.protein_g}g</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(analysisResult.macronutrients.protein_g / weightGrams) * 400}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Carbohydrates</span>
                        <span className="text-white font-medium">{analysisResult.macronutrients.carbs_g}g</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(analysisResult.macronutrients.carbs_g / weightGrams) * 400}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Fats</span>
                        <span className="text-white font-medium">{analysisResult.macronutrients.fat_g}g</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(analysisResult.macronutrients.fat_g / weightGrams) * 400}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}