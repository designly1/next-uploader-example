In the modern web landscape, file uploading is a fundamental feature that many applications require. Whether it's a profile picture on a social media platform, an attachment in an email, or a document upload for a cloud storage app, handling file uploads correctly is crucial for a great user experience. With the rise of modern JavaScript libraries and CSS frameworks, creating such features has become more efficient than ever. In this article, we're going to explore the power of React, a popular JavaScript library for building user interfaces, paired with Tailwind CSS, a utility-first CSS framework, and its extension Daisy UI.

React, with its component-based architecture, allows for easy scaling and reusability of code. Tailwind CSS provides low-level utility classes to let you build custom designs without leaving your HTML. Adding Daisy UI into the mix further enhances our toolkit. As an extension for Tailwind CSS, Daisy UI makes it easy to create beautiful interfaces in a jiffy. It's lightweight, easy to use, and accelerates the development process considerably.

![Animated Example](https://cdn.designly.biz/blog_files/create-an-attractive-file-upload-widget-with-react-nextjs-and-tailwind-css/image1.gif)

By leveraging the strengths of React, Tailwind CSS, and Daisy UI, we can create a user-friendly and aesthetically pleasing file uploader. Please feel free to check out or clone the repo at the bottom of the page. There is also a link to a demo as well.

Well enough babble, on to the code!

## File Uploader Component

```jsx
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
  <div className="flex flex-col items-center justify-between gap-4 min-h-60 bg-zinc-800 w-full max-w-2xl py-10 px-4 rounded-xl">
    {children}
  </div>
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-around p-4 bg-zinc-900 text-white">
      <Container>
        <h1 className="text-2xl font-bold">File Uploader</h1>
        <FileUploader
          url={url}
          acceptedFileTypes={[
            "image/png",
            "image/jpeg",
          ]}
          maxFileSize={1}
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

[Demo Site](https://next-uploader-example.vercel.app/) | [GitHub Repo](https://github.com/designly1/next-uploader-example)

---

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://blog.designly.biz). Also, please leave your comments! I love to hear thoughts from my readers.

I use [Hostinger](https://hostinger.com?REFERRALCODE=1J11864) to host my clients' websites. You can get a business account that can host 100 websites at a price of $3.99/mo, which you can lock in for up to 48 months! It's the best deal in town. Services include PHP hosting (with extensions), MySQL, Wordpress and Email services.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).