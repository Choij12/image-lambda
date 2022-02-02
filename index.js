const AWS = require('aws-sdk');

let s3 = new AWS.S3();

exports.handler = async (event) => {
    
    const bucketName = event.Records[0].s3.bucket.name;
    const fileName = event.Records[0].s3.object.key;
    const fileSize = event.Records[0].s3.object.size;
    
    const params = {
        Bucket: bucketName,
        Key: "images.json"
    };
    
    try{
        const manifest = await s3.getObject(params).promise();
        
        let manifestData = JSON.parse(manifest.Body.toString());
        
        manifestData.push({
            name: fileName,
            size: fileSize,
            type: "image",
            
        });
        
        let manifestBody = JSON.stringify(manifestData);
        
        await s3.putObject({... params, Body: manifestBody, ContentType: "application/json"}).promise();
        
        console.log("current manifest", manifestData);
        
    }catch(e){
        
        console.log(e);
        
        const newManifest = {
            Bucket: bucketName,
            Key: "images.json",
            Body: JSON.stringify([{name: fileName, size: fileSize, type: "image"}]),
            ContentType: "application/json",
        };
        
        await s3.putObject(newManifest).promise();
    }
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

