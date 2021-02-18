const config = require('../config.json');
const fs = require('fs');
const aws = require("aws-sdk");

module.exports = uploadImage;


async function uploadImage(req,res){
        console.log(req)
        aws.config.setPromisesDependency();
        aws.config.update({
        accessKeyId: config.awsAccessKey,
        secretAccessKey: config.awsSecretAccessKey,
        region: config.region
        });
        const s3 = new aws.S3();
        var params = {
        ACL: 'public-read',
        Bucket: config.bucketName,
        Body: fs.createReadStream(req.file.path),
        Key: `userAvatar/${req.file.originalname}`
        };


    }


