const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Upload files to blob
async function uploadFilesToBlob(data) {

    // Replace the following information with your own stored account information
    const accountName = "";
    const accountKey = ""; 

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    //Create BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
    );

    // Create Containers
    const containerName = "gb18ado";
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Upload file
    const blobName = "GB18030CommentMentions.csv";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(data, data.length);
}

module.exports = {
    uploadFilesToBlob
}