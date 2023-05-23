export async function POST(request: Request) {
    if (Math.random() < 0.2) {
        return new Response("Failed to process file", { status: 500 });
    } else {
        return new Response("File Uploaded", { status: 200 });
    }
}

export async function GET(request: Request) {
    return new Response("Hello World!", { status: 200 });
}