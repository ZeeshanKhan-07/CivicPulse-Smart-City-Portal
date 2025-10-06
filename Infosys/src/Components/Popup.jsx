import React from 'react';

const Popup = ({ type, text, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

    const Icon = () => (
        isSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-sm">
            <div className={`p-6 max-w-sm w-full rounded-xl shadow-2xl border-l-4 ${bgColor} ${borderColor} ${textColor} transform scale-100 transition-transform duration-300`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                        <Icon />
                        <p className="ml-3 font-semibold text-lg">{text}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Popup;