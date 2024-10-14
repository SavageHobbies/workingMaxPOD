import React, { useState, useEffect } from 'react';
import './App.css';

const mockupCategories = [
  'blankets', 'hoodies', 'mugs', 'ornaments', 'phone', 'pillows', 
  'puzzles', 'sweatshirts', 'totes', 'tshirt', 'tumblers'
];

function App() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedThumbnails, setSelectedThumbnails] = useState([]);
  const [uploadedDesigns, setUploadedDesigns] = useState([]);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMockups, setGeneratedMockups] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingDesigns, setIsProcessingDesigns] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchThumbnails(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchThumbnails = async (category) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://printify.trendsetterz.buzz/get_thumbs.php?category=${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setThumbnails(data);
        setError(null);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (e) {
      setError(`Failed to fetch thumbnails: ${e.message}`);
      setThumbnails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedThumbnails([]);
    setStep(2);
  };

  const handleThumbnailClick = (thumbnail) => {
    if (selectedThumbnails.includes(thumbnail)) {
      setSelectedThumbnails(selectedThumbnails.filter(t => t !== thumbnail));
    } else if (selectedThumbnails.length < 10) {
      setSelectedThumbnails([...selectedThumbnails, thumbnail]);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    setIsProcessingDesigns(true);
    try {
      const newDesigns = await Promise.all(files.map(async (file) => {
        const preview = await createTransparentPreview(file);
        return { file, preview };
      }));
      setUploadedDesigns(newDesigns);
      setStep(3);
    } catch (error) {
      console.error("Error processing designs:", error);
      setError("Failed to process designs. Please try again.");
    } finally {
      setIsProcessingDesigns(false);
    }
  };
  
  const createTransparentPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          // Clear the canvas with a transparent background
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0);
          
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateMockups = () => {
    if (selectedThumbnails.length > 0 && uploadedDesigns.length > 0) {
      setIsGenerating(true);
      // This should be an API call to your backend service
      simulateBackendMockupGeneration(selectedThumbnails, uploadedDesigns, selectedCategory)
        .then((generatedMockups) => {
          setGeneratedMockups(generatedMockups);
          setIsGenerating(false);
          setStep(4);
        })
        .catch((error) => {
          console.error("Error generating mockups:", error);
          setIsGenerating(false);
        });
    }
  };
  
  
  // This function simulates what your backend should do
  const simulateBackendMockupGeneration = (templates, designs, category) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockups = [];
        templates.forEach((template, tIndex) => {
          designs.forEach((design, dIndex) => {
            mockups.push({
              id: `${tIndex}-${dIndex}`,
              templateUrl: `https://printify.trendsetterz.buzz/mockups/${category}/${template}`,
              designUrl: design.preview,
              templateName: `Template ${tIndex + 1}`,
              designName: design.file.name
            });
          });
        });
        resolve(mockups);
      }, 3000);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MAX POD</h1>
      </header>
      <main>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-robot">🤖</div>
            <p>Hold on, Max is fetching designs...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <section className="product-selection">
                <h2>Select Product Category</h2>
                <select 
                  value={selectedCategory} 
                  onChange={handleCategoryChange}
                >
                  <option value="">Select a category</option>
                  {mockupCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </section>
            )}

            {error && <p className="error-message">{error}</p>}

            {step >= 2 && step < 4 && (
              <section className="design-upload">
                <h2>Upload Designs for {selectedCategory}</h2>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  accept="image/*"
                  id="fileInput"
                  style={{display: 'none'}}
                />
                <label htmlFor="fileInput" className="custom-file-upload">
                  Choose Files
                </label>
                {uploadedDesigns.length > 0 && (
                  <span>{uploadedDesigns.length} files</span>
                )}
                {uploadedDesigns.length > 0 && (
                  <div className="uploaded-designs">
                    <h3>Uploaded Designs:</h3>
                    <div className="design-grid">
                      {uploadedDesigns.map((design, index) => (
                        <div key={index} className="design-item">
                          <img src={design.preview} alt={`Design ${index + 1}`} />
                          <p>{design.file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}


            {step === 3 && selectedCategory && (
              <section className="thumbnail-selection">
                <h3>Select up to 10 templates for {selectedCategory}</h3>
                <div className="thumbnail-grid">
                  {thumbnails.map((thumbnail, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail-item ${selectedThumbnails.includes(thumbnail) ? 'selected' : ''}`}
                      onClick={() => handleThumbnailClick(thumbnail)}
                    >
                      <img 
                        src={`https://printify.trendsetterz.buzz/mockups/${selectedCategory}/${thumbnail}`} 
                        alt={`${selectedCategory} thumbnail ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p>Selected: {selectedThumbnails.length} / 10</p>
                {selectedThumbnails.length > 0 && (
                  <button 
                    onClick={handleGenerateMockups} 
                    disabled={isGenerating}
                    className="generate-button"
                  >
                    {isGenerating ? "Generating..." : "Generate Mockups"}
                  </button>
                )}
              </section>
            )}

            {isGenerating && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="loading-robot">🤖</div>
                  <p>Please wait while Max generates your mockups...</p>
                </div>
              </div>
            )}

            {step === 4 && generatedMockups.length > 0 && (
              <section className="generated-mockups">
                <h2>Generated Mockups:</h2>
                <div className="mockup-grid">
                  {generatedMockups.map((mockup) => (
                    <div key={mockup.id} className="mockup-item">
                      <div className="mockup-image-container">
                        <img src={mockup.templateUrl} alt={`Template ${mockup.templateName}`} className="mockup-image" />
                        <img src={mockup.designUrl} alt={`Design ${mockup.designName}`} className="design-overlay" />
                      </div>
                      <p>Template: {mockup.templateName}</p>
                      <p>Design: {mockup.designName}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
