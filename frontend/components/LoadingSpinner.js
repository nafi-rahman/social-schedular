// frontend/components/LoadingSpinner.js

export default function LoadingSpinner({ message = "Loading data..." }) {
    return (
        <div className="flex flex-col items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    );
}