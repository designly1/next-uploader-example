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
    <main className="min-h-screen flex flex-col gap-8 py-20 px-4 md:px-32 bg-zinc-900 text-white">
      <h2 className="text-xl font-bold text-center">Note: this demo site API discards all files that are uploaded. The API also randomly returns a code 500 for demonstration of error handling.</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 2xl:grid-cols-3">
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

      </div>
    </main >
  )
}
