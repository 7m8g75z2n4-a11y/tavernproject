import { Web3Storage } from "web3.storage";

const token = process.env.WEB3_STORAGE_TOKEN ?? "";

export function isWeb3Configured() {
  return !!token;
}

export function makeStorageClient() {
  if (!token) {
    throw new Error("WEB3_STORAGE_TOKEN is not set");
  }
  return new Web3Storage({ token });
}

export async function uploadCharacterMetadata(metadata: Record<string, any>): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });

  const files = [new File([blob], "metadata.json")];

  const cid = await makeStorageClient().put(files, {
    name: "tavern-character",
    wrapWithDirectory: false,
  });

  return `ipfs://${cid}`;
}

export async function uploadCharacterWithImage(metadata: Record<string, any>, imageBuffer: Buffer): Promise<string> {
  const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" });
  const imageFile = new File([imageBuffer as unknown as BlobPart], "image.png", {
    type: "image/png",
  });

  const cid = await makeStorageClient().put([metadataFile, imageFile], {
    name: "tavern-character-with-image",
  });

  return `ipfs://${cid}/metadata.json`;
}
