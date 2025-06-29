const Modal = ({ open, onClose, children, title }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-blue-300 rounded-lg p-6 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose} type="button">&times;</button>
                {title && <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>}
                {children}
            </div>
        </div>
    );
};

export default Modal;
