'use client'
import React, { useState, ChangeEvent, useRef } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

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

    // Change the state structure to handle multiple file progress and status
    const [fileProgress, setFileProgress] = useState<{ [key: string]: number }>({});
    const [fileStatus, setFileStatus] = useState<{ [key: string]: string }>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

    const isError = Object.values(fileStatus).some(status => status !== 'Uploaded');

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetUploader = () => {
        setFileProgress({});
        setFileStatus({});
        setUploadError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const fileSelectedHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setUploadError(null); // reset the upload error when a new file is selected
        if (event.target.files) {
            const files = Array.from(event.target.files);
            let isValid = true; // Flag to check if all files are valid
            let fileErrors: { [key: string]: string } = {};

            for (const file of files) {
                if (file.size > MAX_FILE_BYTES) {
                    fileErrors[file.name] = `File size cannot exceed ${maxFileSize} MB`;
                    isValid = false;
                }
                if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
                    fileErrors[file.name] = "File type not accepted. Accepted types: " + acceptedFileTypes.join(', ');
                    isValid = false;
                }
            }

            if (!isValid) {
                setFileStatus(fileErrors);
            } else {
                files.forEach(file => {
                    setFileProgress(prev => ({ ...prev, [file.name]: 0 }));
                    fileUploadHandler(file);
                });
            }
        }
    };

    const fileUploadHandler = (file: File) => {
        const formData = new FormData();
        formData.append("uploads", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.upload.addEventListener("progress", event => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setFileProgress(prev => ({ ...prev, [file.name]: progress }));
            }
        });

        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    setFileStatus(prev => ({ ...prev, [file.name]: 'Uploaded' }));
                    setUploadSuccess(true);
                } else {
                    setFileStatus(prev => ({ ...prev, [file.name]: "An error occurred while uploading the file. Server response: " + xhr.statusText }));
                }
            }
        });

        xhr.send(formData);
    };

    return (
        <div className="flex flex-col gap-4 w-full h-60 md:h-48">
            {
                uploadSuccess
                    ?
                    <div className="flex flex-col gap-2">
                        {
                            isError ? <span className="text-xs text-red-500">Upload completed, but with errors.</span> : <></>
                        }
                        <div className="btn-group w-full">
                            <span className="btn btn-success w-1/2">Success!</span>
                            <button
                                className="btn w-1/2"
                                onClick={resetUploader}
                            >Upload Another</button>
                        </div>
                    </div>
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

            <div className="overflow-x-auto flex gap-2 flex-col-reverse">
                {Object.entries(fileProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="text-xs flex flex-col gap-1">
                        <p>{fileName}</p>
                        <div className="flex items-center gap-2">
                            <progress
                                className="progress progress-primary w-full"
                                value={progress}
                                max="100"
                            />
                            {progress === 100 &&
                                <>
                                    {
                                        fileStatus[fileName] === 'Uploaded'
                                            ?
                                            <FaCheck className="text-xl text-green-500 mr-4" />
                                            :
                                            <FaTimes className="text-xl text-red-500 mr-4" />
                                    }
                                </>
                            }
                        </div>
                        <p className="text-red-500">{fileStatus[fileName] !== 'Uploaded' ? fileStatus[fileName] : ''}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}