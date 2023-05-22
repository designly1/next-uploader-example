'use client'
import React, { useState, ChangeEvent, useRef } from 'react';

interface FileUploaderProps {
    acceptedFileTypes?: string[] | null;
    url: string;
    maxFileSize?: number;
    allowMultiple?: boolean;
    label?: string;
    labelAlt?: string;
}

export default function FileUploader(props: FileUploaderProps) {
    const {
        acceptedFileTypes,
        url, maxFileSize = 5,
        allowMultiple = false,
        label = "",
        labelAlt = ""
    } = props;
    const MAX_FILE_BYTES = maxFileSize * 1024 * 1024; // MB to bytes
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fileSelectedHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        if (event.target.files) {
            const files = Array.from(event.target.files);
            let isValid = true; // Flag to check if all files are valid
            for (const file of files) {
                if (file.size > MAX_FILE_BYTES) {
                    setUploadError(`File size cannot exceed ${maxFileSize} MB`);
                    isValid = false;
                    break;
                }
                if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
                    setUploadError("File type not accepted. Accepted types: " + acceptedFileTypes.join(', '));
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                setSelectedFiles(files);
                fileUploadHandler(files);
            }
        }
    };

    const resetUploader = () => {
        setUploadProgress(0);
        setUploadError(null);
        setSelectedFiles([]);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const fileUploadHandler = async (files: File[]) => {
        let totalSize = files.reduce((total, file) => total + file.size, 0);
        let totalUploaded = 0;

        for (const file of files) {
            const formData = new FormData();
            formData.append("uploads", file);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);

            xhr.upload.addEventListener("progress", event => {
                if (event.lengthComputable) {
                    totalUploaded += event.loaded;
                    const progress = Math.round((totalUploaded / totalSize) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.upload.addEventListener("error", () => {
                setUploadError("An error occurred while uploading the file.");
            });

            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        setUploadSuccess(true);
                    } else {
                        setUploadError("An error occurred while uploading the file. Server response: " + xhr.statusText);
                    }
                }
            });

            await new Promise((resolve, reject) => {
                xhr.onload = resolve;
                xhr.onerror = reject;
                xhr.send(formData);
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full min-h-24">
            {
                uploadSuccess
                    ?
                    <>
                        <div className="btn-group w-full">
                            <span className="btn btn-success w-1/2">Success!</span>
                            <button
                                className="btn w-1/2"
                                onClick={resetUploader}
                            >Upload Another</button>
                        </div>
                        <div className="text-xs text-green-500 flex gap-2 flex-wrap items-center">
                            {selectedFiles.map(f => (
                                <span className="bg-zinc-700 px-2 py-1 rounded-lg" key={f.name}>{f.name}</span>
                            ))}
                        </div>
                    </>
                    :
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">{label}</span>
                            <span className="label-text-alt">{labelAlt}</span>
                        </label>
                        <input
                            type="file"
                            className="file-input file-input-bordered file-input-primary w-full"
                            onChange={fileSelectedHandler}
                            accept={acceptedFileTypes ? acceptedFileTypes.join(',') : undefined}
                            ref={fileInputRef}
                            multiple={allowMultiple} // Added the 'multiple' attribute conditionally
                        />
                        <label className="label">
                            <span className="label-text-alt text-red-500">{uploadError}</span>
                        </label>
                    </div>
            }
            {
                uploadProgress > 0
                    ?
                    <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                    :
                    <></>
            }
        </div>
    );
}
