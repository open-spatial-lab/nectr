import json
import os
import logging
from typing import Dict, Any, List, Optional, Union
import boto3
import geopandas as gpd

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    if 'Records' not in event or len(event['Records']) == 0:
        logging.error('## Event Error')
        logging.error(event)
        return {'statusCode': 400, 'body': 'No Records found in event'}
    
    record = event['Records'][0]
    if 's3' not in record or 'object' not in record['s3'] or 'bucket' not in record['s3']:
        logging.error('## S3 Event Error')
        logging.error(event)
        return {'statusCode': 400, 'body': 'Incomplete S3 event. Check logs'}
    
    bucket = record['s3']['bucket']
    bucket_name = bucket['name']
    object = record['s3']['object']
    file_key = object['key']

    if "__toconvert__" not in file_key:
        logging.info('## Not a file to convert')
        logging.info({ 'file_key': file_key })
        return {'statusCode': 200, 'body': 'Not a file to convert'}

    # read in file using boto3
    s3 = boto3.client('s3')
    s3.download_file(bucket_name, file_key, f'/tmp/{file_key}')

    # read into geopandas
    gdf = gpd.read_file(f'/tmp/{file_key}')
    gdf = sanitize_columns(gdf)
    output_name = file_key.replace('__toconvert__', '')
    output_name = output_name.split('.')[:-1]
    output_name = '.'.join(output_name)
    # buffer geometry to fix errors, if any
    if "geometry" in gdf.columns:
        gdf["geometry"] = gdf["geometry"].buffer(0)

    # write to parquet
    gdf.to_parquet(f'/tmp/temp.parquet', index=False)
    response = {"statusCode": 200, "body": json.dumps({
        'message': 'File converted and uploaded to S3',
        'file_name': f'{output_name}.parquet'
    })}

    # write response to /tmp/response.json
    with open('/tmp/response.json', 'w') as f:
        f.write(json.dumps(response))

    # upload to s3
    s3.upload_file('/tmp/temp.parquet', bucket_name, f'{output_name}.parquet')
    s3.upload_file('/tmp/response.json', bucket_name, f'{output_name.replace("__dataset__", "")}__status__.json')

    # delete local file
    os.remove('/tmp/temp.parquet')
    os.remove('/tmp/response.json')

    # return success 
    logging.info('## Success')
    logging.info(response)
    return response 


def sanitize_columns(gdf: gpd.GeoDataFrame):
    # select columns of type 'object'
    object_cols = gdf.select_dtypes(include=['object']).columns

    # check if any of the object columns have mixed or ambiguous types
    mixed_cols = []
    for col in object_cols:
        if gdf[col].apply(type).nunique() > 1:
            mixed_cols.append(col)

    if mixed_cols:
        # handle mixed columns
        gdf[mixed_cols] = gdf[mixed_cols].astype(str)

    return gdf