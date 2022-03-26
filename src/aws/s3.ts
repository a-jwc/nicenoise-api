import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

interface UploadParams {
  Bucket: string;
  Key: string;
  Body: Buffer;
}

interface DownloadParams {
  Bucket: string;
  Key: string;
}

export const upload = async (
  s3Client: S3Client,
  bucketParams: UploadParams,
) => {
  try {
    console.log('uploading to s3');
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    return data;
  } catch (e) {
    throw e;
  }
};

export const download = async (
  s3Client: S3Client,
  bucketParams: DownloadParams,
) => {
  try {
    // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    return data;
  } catch (e) {
    throw e;
  }
};
