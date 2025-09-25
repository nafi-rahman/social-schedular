"use client";

import { useState, useEffect } from "react";
// Since this is a Next.js component, we'll keep the Image import
// but we will use a standard <img> tag for immediate visual feedback.
import Image from "next/image"; 

const API_BASE_URL = "http://localhost:8001";
// We are using a placeholder image for immediate visibility in the Canvas.
// For a production app, you would use a local image like '/tshirt.png'
// const PRODUCT_IMAGE = "https://placehold.co/400x400/fff/000?text=T-Shirt+Base";
const PRODUCT_IMAGE = "/tshirt.png"; // Local image in the public folder

export default function Customizer() {
  const [customText, setCustomText] = useState("Your Design");
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDesigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/designs/my`);
      if (res.ok) {
        const data = await res.json();
        setSavedDesigns(data);
      }
    } catch (error) {
      console.error("Failed to fetch designs:", error);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/designs/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_text: customText }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Design saved successfully!" });
        fetchDesigns(); // Update the list
      } else {
        setMessage({ type: 'error', text: "Failed to save design." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Error connecting to server." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-8 font-sans antialiased text-gray-800 dark:text-gray-200">
      <header className="py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            Product Customization 👕
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">
            Design your own product in real-time.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Preview Area (Col 1-2) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Live Preview</h2>
          <div className="relative w-full max-w-lg aspect-square">
            {/* Using a standard <img> tag to ensure the image renders immediately */}
            <img 
              src={PRODUCT_IMAGE}
              alt="Product T-Shirt" 
              className="w-full h-full object-contain rounded-xl"
            />
            {/* Overlay Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 text-center p-2 bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 rounded-lg">
              <p 
                className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50 break-words"
                style={{ fontFamily: 'Arial Black', whiteSpace: 'pre-wrap' }}
              >
                {customText}
              </p>
            </div>
          </div>
        </div>

        {/* Controls & Save (Col 3) */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Customize Text</h2>
                <textarea
                    rows="4"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter your design text here..."
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
                />
                <button
                    onClick={handleSave}
                    className="w-full mt-4 bg-green-600 text-white font-bold p-3 rounded-xl hover:bg-green-700 transition-colors"
                >
                    Save Design
                </button>
                {message && (
                    <p className={`text-sm mt-4 text-center p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                        {message.text}
                    </p>
                )}
            </div>

            {/* My Designs List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    My Designs ({savedDesigns.length})
                </h2>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 -mr-2">
                    {savedDesigns.map((design) => (
                        <li 
                            key={design.id} 
                            onClick={() => setCustomText(design.custom_text)}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition-colors"
                        >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">{design.custom_text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Saved: {new Date(design.created_at).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                    {savedDesigns.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No saved designs yet.
                        </p>
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
