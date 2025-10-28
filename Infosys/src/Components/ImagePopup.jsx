// src/Components/ImagePopup.jsx
import React from 'react';

const ImagePopup = ({ imageUrl, title, onClose }) => {
    if (!imageUrl) return null;

    return (
        // Transparent overlay with blur only
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-transparent p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Title and Close Button */}
                <div className="p-3 bg-gray-900 text-white text-lg font-semibold flex justify-between items-center">
                    <span>{title}</span>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 text-3xl leading-none"
                        aria-label="Close image"
                    >
                        &times;
                    </button>
                </div>

                {/* Image Content */}
                <div className="p-4 flex justify-center items-center h-full bg-white">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://via.placeholder.com/600x400?text=Image+Not+Available";
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImagePopup;
