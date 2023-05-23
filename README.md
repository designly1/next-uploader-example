In the modern web landscape, file uploading is a fundamental feature that many applications require. Whether it's a profile picture on a social media platform, an attachment in an email, or a document upload for a cloud storage app, handling file uploads correctly is crucial for a great user experience. With the rise of modern JavaScript libraries and CSS frameworks, creating such features has become more efficient than ever. In this article, we're going to explore the power of React, a popular JavaScript library for building user interfaces, paired with Tailwind CSS, a utility-first CSS framework, and its extension Daisy UI.

React, with its component-based architecture, allows for easy scaling and reusability of code. Tailwind CSS provides low-level utility classes to let you build custom designs without leaving your HTML. Adding Daisy UI into the mix further enhances our toolkit. As an extension for Tailwind CSS, Daisy UI makes it easy to create beautiful interfaces in a jiffy. It's lightweight, easy to use, and accelerates the development process considerably.

![Animated Example](https://cdn.designly.biz/blog_files/create-an-attractive-file-upload-widget-with-react-nextjs-and-tailwind-css/image2.gif)

By leveraging the strengths of React, Tailwind CSS, and Daisy UI, we can create a user-friendly and aesthetically pleasing file uploader. Please feel free to check out or clone the repo at the bottom of the page. There is also a link to a demo as well.

Well enough babble, on to the code!

## File Uploader Component

```jsx
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
```

This component takes several properties:

- `acceptedFileTypes` = an array of content-type strings (defaults to all types)
- `url` = endpoint to send files to
- `maxFileSize` = max file size in MB
- `allowMultiple` = allow multiple file uploads (defaults to false)
- `label` = left hand form control label
- `labelAlt` = right hand muted form control label

Also not that I am using the modern Next.js 13 app router for this demo. So the `'use client'` directive is needed to make this a client component, rather than a server component.

## Putting it All Together

Here's the main `page.tsx`:

```jsx
import FileUploader from "@/components/FileUploader"

const url = "/api/upload";

interface ContainerProps {
  children: React.ReactNode
}

const Container = ({ children }: ContainerProps) => (
  <div className="flex flex-col items-center justify-between gap-4 min-h-60 bg-zinc-800 w-full max-w-2xl py-10 px-4 rounded-xl h-fit">
    {children}
  </div>
)

export default function Home() {
  return (
    <main className="min-h-screen flex-col py-20 px-4 md:px-32 bg-zinc-900 text-white grid grid-cols-1 gap-8 lg:grid-cols-2 2xl:grid-cols-3">
      <Container>
        <h1 className="text-2xl font-bold">File Uploader</h1>
        <FileUploader
          url={url}
          acceptedFileTypes={[
            "image/png",
            "image/jpeg",
          ]}
          maxFileSize={100}
          label="Max File Size: 1MB"
          labelAlt="Accepted File Types: png, jpeg"
        />
      </Container>
      <Container>
        <h1 className="text-2xl font-bold">File Uploader</h1>
        <FileUploader
          url={url}
          acceptedFileTypes={[
            "image/png",
            "image/jpeg",
          ]}
          allowMultiple={true}
          maxFileSize={100}
          label="Max File Size: 100MB (multiple)"
          labelAlt="Accepted File Types: png, jpeg"
        />
      </Container>
      <Container>
        <h1 className="text-2xl font-bold">File Uploader</h1>
        <FileUploader
          url={'https://example.com'}
          acceptedFileTypes={[
            "image/png",
            "image/jpeg",
          ]}
          allowMultiple={true}
          maxFileSize={100}
          label="Max File Size: 100MB (non-existent endpoint)"
          labelAlt="Accepted File Types: png, jpeg"
        />
      </Container>

    </main >
  )
}
```

That's it! No need for additional dependencies, this solution is lightweight, functional, beautiful and creates an excellent UX. Cheers!

---

Note: the demo site API discards all files that are uploaded. The API also randomly returns a code 500 for demonstration of error handling.

[Demo Site](https://next-uploader-example.vercel.app/) | [GitHub Repo](https://github.com/designly1/next-uploader-example)

---

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://blog.designly.biz). Also, please leave your comments! I love to hear thoughts from my readers.

I use [Hostinger](https://hostinger.com?REFERRALCODE=1J11864) to host my clients' websites. You can get a business account that can host 100 websites at a price of $3.99/mo, which you can lock in for up to 48 months! It's the best deal in town. Services include PHP hosting (with extensions), MySQL, Wordpress and Email services.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).