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
