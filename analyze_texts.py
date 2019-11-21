import boto3
import time

BUCKET = 'ungarinyin-us-2019'
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:587368145150:UngarinyinAmazonTextract'
ROLE_ARN = 'arn:aws:iam::587368145150:role/UngarinyinTextractRole'

s3 = boto3.resource('s3', region_name='us-east-1')
bucket = s3.Bucket(BUCKET)
textract = boto3.client('textract', region_name='us-east-1')
documents = [x for x in bucket.objects.filter(Prefix="Typescripts").all()]

i = 0
for document in documents[48:]:
    i += 1
    document_name = document.key
    print(document_name)
    if i == 8:
        time.sleep(300)
        i = 0
    response = textract.start_document_text_detection(DocumentLocation={'S3Object': {'Bucket': BUCKET, 'Name': document_name}},
                                                      NotificationChannel={'RoleArn': ROLE_ARN, 'SNSTopicArn': SNS_TOPIC_ARN})
    print('Start Job Id: ' + response['JobId'] +
          ' for "' + document_name + '"')
