# app/services/s3.py
import boto3
import os
from urllib.parse import quote

_s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
_BUCKET = os.getenv("AWS_S3_BUCKET", "")


def presign_put(filename: str, content_type: str, expires_in: int = 3600):
    key = f"uploads/{quote(filename)}"
    url = _s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": _BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )
    return url, key


def presign_get(key: str, expires_in: int = 3600):
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": _BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )
