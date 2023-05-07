import boto3
 
def detectText(local_file):
    textract = boto3.client('textract', region_name='ap-south-1', aws_access_key_id = 'AKIAQQPQBRYJELWOPV7A', aws_secret_access_key= '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')

    with open(local_file,'rb') as document:
        response = textract.detect_document_text(Document={'Bytes': document.read()})
    text = ""
    for item in response["Blocks"]:
        if item["BlockType"] == "LINE":
            text = text + " " + item["Text"]
    
    return text

