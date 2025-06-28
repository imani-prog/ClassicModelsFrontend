const ConfirmDialog = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-gray-200 opacity-60 cursor-not-allowed"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                    <p className="mb-4 text-lg font-semibold text-gray-800">
                        Are you sure you want to delete this customer?
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={onConfirm} 
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmDialog;
