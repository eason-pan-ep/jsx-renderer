import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileCode2, X } from 'lucide-react';
import { Button } from './Button';

interface UploadModalProps {
    onFileSelected: (file: File) => void;
    onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onFileSelected, onCancel }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [droppedFileName, setDroppedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const handleFile = useCallback((file: File) => {
        setDroppedFileName(file.name);
        onFileSelected(file);
    }, [onFileSelected]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div
                className="confirm-modal upload-modal"
                onClick={e => e.stopPropagation()}
            >
                <div className="upload-modal-header">
                    <h3 className="upload-modal-title">
                        <Upload size={18} />
                        Upload JSX
                    </h3>
                    <button className="upload-modal-close" onClick={onCancel} title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div
                    className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FileCode2 size={40} className="upload-drop-icon" />
                    {droppedFileName ? (
                        <p className="upload-drop-text">{droppedFileName}</p>
                    ) : isDragging ? (
                        <p className="upload-drop-text">Drop it here!</p>
                    ) : (
                        <>
                            <p className="upload-drop-text">
                                Drag & drop your file here
                            </p>
                            <p className="upload-drop-hint">
                                or click to browse
                            </p>
                        </>
                    )}
                </div>

                <p className="upload-modal-formats">
                    Supported: .jsx, .tsx, .js, .ts
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jsx,.tsx,.js,.ts"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />

                <div className="upload-modal-actions">
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};
