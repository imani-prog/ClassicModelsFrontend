const ConfirmDialog = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-sm shadow-lg relative">
                <p className="mb-4 text-lg font-semibold text-gray-800">
                    Are you sure you want to delete this customer?
                </p>
                <div className="flex gap-4 justify-end">
                    <button 
                        onClick={onCancel} 
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
