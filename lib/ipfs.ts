import { Web3Storage, File } from "web3.storage";

const token = process.env.WEB3_STORAGE_TOKEN;

if (!token) {
  throw new Error("WEB3_STORAGE_TOKEN not set");
}

const client = new Web3Storage({ token });

export async function uploadCharacterMetadata(
  metadata: Record<string, any>
): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });

  const files = [new File([blob], "metadata.json")];

  const cid = await client.put(files, {
    name: "tavern-character",
    wrapWithDirectory: false,
  });

  // wrapWithDirectory=false means the file is directly at the CID
  return `ipfs://${cid}`;
}

export async function uploadCharacterWithImage(
  metadata: Record<string, any>,
  imageBuffer: Buffer
): Promise<string> {
  const metadataFile = new File(
    [JSON.stringify(metadata)],
    "metadata.json",
    { type: "application/json" }
  );
  const imageFile = new File([imageBuffer], "image.png", {
    type: "image/png",
  });

  const cid = await client.put([metadataFile, imageFile], {
    name: "tavern-character-with-image",
  });

  return `ipfs://${cid}/metadata.json`;
}
