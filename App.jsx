import React, { useState, useRef, useEffect } from 'react';

// Main App component
const App = () => {
    // State to store the URL of the uploaded image for preview
    const [uploadedImage, setUploadedImage] = useState(null);
    // State to store the custom text entered by the user
    const [customText, setCustomText] = useState('');
    // State to manage confirmation message display
    const [showConfirmation, setShowConfirmation] = useState(false);
    // Ref for the file input to trigger it programmatically
    const fileInputRef = useRef(null);
    // State to manage the selected Phone Case model (always phone case now)
    const [selectedPhoneCaseModel, setSelectedPhoneCaseModel] = useState('iPhone 15'); // Default to iPhone 15

    // States for text customization (position and font size)
    const [textX, setTextX] = useState(50); // X position percentage for text (from left)
    const [textY, setTextY] = useState(50); // Y position percentage for text (from top)
    const [fontSize, setFontSize] = useState(24); // Font size in pixels (initial value)

    // States for dragging functionality
    const [isDragging, setIsDragging] = useState(false);
    const [initialMouseX, setInitialMouseX] = useState(0);
    const [initialMouseY, setInitialMouseY] = useState(0);
    const [initialTextX, setInitialTextX] = useState(0);
    const [initialTextY, setInitialTextY] = useState(0);

    // Ref for the preview container to calculate relative positions
    const previewContainerRef = useRef(null);
    // Ref for the draggable text element
    const draggableTextRef = useRef(null);

    // Available Phone Case models (updated to include iPhone 12 to 15 series, removed iPhone SE)
    const phoneCaseModels = [
        { name: 'iPhone 12 mini', width: 130, height: 260 },
        { name: 'iPhone 12', width: 145, height: 290 },
        { name: 'iPhone 12 Pro', width: 145, height: 290 },
        { name: 'iPhone 12 Pro Max', width: 155, height: 310 },
        { name: 'iPhone 13 mini', width: 130, height: 260 },
        { name: 'iPhone 13', width: 145, height: 290 },
        { name: 'iPhone 13 Pro', width: 145, height: 290 },
        { name: 'iPhone 13 Pro Max', width: 155, height: 310 },
        { name: 'iPhone 14', width: 145, height: 290 },
        { name: 'iPhone 14 Pro', width: 145, height: 290 },
        { name: 'iPhone 14 Plus', width: 155, height: 310 },
        { name: 'iPhone 14 Pro Max', width: 155, height: 310 },
        { name: 'iPhone 15', width: 150, height: 300 },
        { name: 'iPhone 15 Pro', width: 150, height: 300 },
        { name: 'iPhone 15 Plus', width: 160, height: 320 },
        { name: 'iPhone 15 Pro Max', width: 160, height: 320 },
    ];

    // Function to get the Phone Case placeholder image URL based on selected model
    const getPhoneCaseImageUrl = (modelName) => {
        const model = phoneCaseModels.find(m => m.name === modelName);
        if (model) {
            return `https://placehold.co/${model.width}x${model.height}/60a5fa/ffffff?text=Coque+${model.name}`;
        }
        // Fallback to a default iPhone 15 if the model is not found (e.g., after removing iPhone SE)
        return `https://placehold.co/150x300/60a5fa/ffffff?text=Coque+iPhone+15`;
    };

    // Handler for Phone Case model selection
    const handlePhoneCaseModelSelect = (event) => {
        // Updated to handle select element's onChange event
        setSelectedPhoneCaseModel(event.target.value);
        setUploadedImage(null); // Clear image when model changes
        setCustomText(''); // Clear text when model changes
        setTextX(50); // Reset text position
        setTextY(50); // Reset text position
        setFontSize(24); // Reset font size
    };

    // Handler for file input change (image upload)
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result); // Set the Data URL for preview
            };
            reader.readAsDataURL(file); // Read the file as a Data URL
        }
    };

    // Handler for text input change
    const handleTextChange = (event) => {
        setCustomText(event.target.value);
    };

    // Handler for font size change
    const handleFontSizeChange = (event) => {
        setFontSize(parseInt(event.target.value, 10));
    };

    // Handlers for dragging the text
    const handleMouseDown = (e) => {
        if (draggableTextRef.current && previewContainerRef.current) {
            setIsDragging(true);
            setInitialMouseX(e.clientX);
            setInitialMouseY(e.clientY);
            // Get current text position relative to its parent (previewContainerRef)
            const textRect = draggableTextRef.current.getBoundingClientRect();
            const containerRect = previewContainerRef.current.getBoundingClientRect();

            // Calculate initial X and Y as percentages relative to the container
            const currentTextXPercent = ((textRect.left - containerRect.left) / containerRect.width) * 100;
            const currentTextYPercent = ((textRect.top - containerRect.top) / containerRect.height) * 100;

            setInitialTextX(currentTextXPercent);
            setInitialTextY(currentTextYPercent);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !previewContainerRef.current) return;

        const containerRect = previewContainerRef.current.getBoundingClientRect();
        const textRect = draggableTextRef.current.getBoundingClientRect(); // Current size of the text element

        // Calculate new position relative to the initial mouse position and text's initial position
        const deltaX = e.clientX - initialMouseX;
        const deltaY = e.clientY - initialMouseY;

        let newXPercent = initialTextX + (deltaX / containerRect.width) * 100;
        let newYPercent = initialTextY + (deltaY / containerRect.height) * 100;

        // Clamp values to keep text within the bounds of the product preview (approximately)
        // Taking text element's width/height into account for more accurate clamping
        const textWidthPercent = (textRect.width / containerRect.width) * 100;
        const textHeightPercent = (textRect.height / containerRect.height) * 100;

        // Ensure text stays within the horizontal bounds
        newXPercent = Math.max(0, Math.min(newXPercent, 100 - textWidthPercent));
        // Ensure text stays within the vertical bounds
        newYPercent = Math.max(0, Math.min(newYPercent, 100 - textHeightPercent));

        setTextX(newXPercent);
        setTextY(newYPercent);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add event listeners for dragging globally to ensure smooth drag even if mouse leaves the element
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, initialMouseX, initialMouseY, initialTextX, initialTextY]); // Dependencies for useEffect

    // Handler for the "Commander" button
    const handleOrder = () => {
        if (!uploadedImage && !customText) {
            setShowConfirmation({ type: 'error', message: "Veuillez importer une image ou ajouter du texte pour personnaliser votre produit." });
            setTimeout(() => setShowConfirmation(false), 3000);
            return;
        }
        setShowConfirmation({ type: 'success', message: "Votre commande personnalisée a été enregistrée. Merci pour votre confiance !" });
        setTimeout(() => {
            setShowConfirmation(false);
            setUploadedImage(null);
            setCustomText('');
        }, 3000); // Hide message after 3 seconds
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex flex-col items-center justify-center p-4 font-inter">
            {/* Confirmation message modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`p-8 rounded-lg shadow-xl text-center ${showConfirmation.type === 'success' ? 'bg-white text-green-600' : 'bg-red-100 text-red-700'}`}>
                        <h2 className="text-2xl font-bold mb-4">
                            {showConfirmation.type === 'success' ? 'Commande Confirmée !' : 'Erreur de Commande'}
                        </h2>
                        <p className="text-gray-700">{showConfirmation.message}</p>
                    </div>
                </div>
            )}

            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-lg text-center">
                <span className="text-red-600">Redlines</span> Personalisation de Coques
            </h1>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row gap-8">
                {/* Customization Controls Section */}
                <div className="flex-1 flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">1. Choisissez le Modèle de Coque</h2>
                    <div className="relative inline-block w-full">
                        <select
                            value={selectedPhoneCaseModel}
                            onChange={handlePhoneCaseModelSelect}
                            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition duration-200 ease-in-out"
                        >
                            {phoneCaseModels.map((model) => (
                                <option key={model.name} value={model.name}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">
                        2. Personnalisez votre Création
                    </h2>

                    {/* Image Upload */}
                    <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition duration-300 ease-in-out cursor-pointer"
                         onClick={() => fileInputRef.current.click()}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                        />
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m-3-3h6"></path>
                        </svg>
                        <p className="text-gray-600 font-medium text-center">Cliquez ou glissez une image ici</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF (Max. 5MB)</p>
                    </div>

                    {/* Custom Text Input */}
                    <div className="mt-4">
                        <label htmlFor="customText" className="block text-gray-700 text-lg font-medium mb-2">Ajouter du Texte</label>
                        <textarea
                            id="customText"
                            value={customText}
                            onChange={handleTextChange}
                            rows="3" // Allow multiple lines
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out resize-y"
                            placeholder="Saisissez votre texte personnalisé..."
                        ></textarea>
                        <p className="text-sm text-gray-500 mt-1">Le texte peut être déplacé et redimensionné.</p>
                    </div>

                    {/* Font Size Control */}
                    <div className="mt-4">
                        <label htmlFor="fontSize" className="block text-gray-700 text-lg font-medium mb-2">Taille du Texte: {fontSize}px</label>
                        <input
                            type="range"
                            id="fontSize"
                            min="12"
                            max="72"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                        />
                    </div>

                    {/* Order Button */}
                    <button
                        onClick={handleOrder}
                        className="mt-6 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-xl hover:from-red-600 hover:to-red-800 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Commander
                    </button>
                </div>

                {/* Product Preview Section */}
                <div ref={previewContainerRef} className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl shadow-inner">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Aperçu de la Personnalisation</h2>
                    <div className="relative flex items-center justify-center p-4 w-full h-full min-h-[300px] border border-gray-200 rounded-lg"> {/* Added min-h for better drag area */}
                        {/* Phone Case base image */}
                        <img
                            src={getPhoneCaseImageUrl(selectedPhoneCaseModel)}
                            alt={`Aperçu Coque ${selectedPhoneCaseModel}`}
                            className="w-full h-auto max-w-[180px] rounded-lg shadow-md"
                        />

                        {/* Overlay for uploaded image (custom image by client) */}
                        {uploadedImage && (
                            <img
                                src={uploadedImage}
                                alt="Image importée"
                                className="absolute object-contain rounded-md w-3/4 h-auto top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ maxWidth: '60%', maxHeight: '60%' }}
                            />
                        )}

                        {/* Overlay for custom text */}
                        {customText && (
                            <div
                                ref={draggableTextRef}
                                onMouseDown={handleMouseDown}
                                className={`absolute font-bold text-center p-1 rounded-sm cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                                style={{
                                    color: 'white', // Default text color for phone case
                                    backgroundColor: uploadedImage ? 'rgba(0, 0, 0, 0.5)' : 'rgba(55, 65, 81, 0.75)',
                                    left: `${textX}%`,
                                    top: `${textY}%`,
                                    transform: 'translate(-50%, -50%)', // Centering based on its own size
                                    fontSize: `${fontSize}px`,
                                    whiteSpace: 'pre-wrap', // Allow multiple lines and preserve whitespace
                                    wordWrap: 'break-word', // Break long words
                                    maxWidth: '90%', // Ensure it doesn't go too wide
                                    zIndex: 10 // Ensure text is on top
                                }}
                            >
                                {customText}
                            </div>
                        )}
                    </div>
                    {!uploadedImage && !customText && (
                        <p className="text-gray-500 mt-4 text-center">Votre personnalisation apparaîtra ici.</p>
                    )}
                </div>
            </div>
             {/* Tailwind CSS Script - Always include at the end of the body or in the head */}
             <script src="https://cdn.tailwindcss.com"></script>
        </div>
    );
};

export default App;
