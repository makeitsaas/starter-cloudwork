# AWS CLI notes

Run instances programmatically :
```
aws ec2 run-instances 
    --image-id ami-0a8412cbcfcef4252 
    --count 1 
    --instance-type t2.small 
    --key-name adu-dev 
    --security-group-ids sg-04c858cae6f24e840 
    --subnet-id subnet-01a2857a 
    --region eu-central-1 
    --iam-instance-profile Name=ec2-job-runner 
    --tag-specifications 'ResourceType=instance,Tags=[{Key=mis-instance-type,Value=job-runner}]'
```
```
aws ec2 associate-iam-instance-profile --instance-id i-0ae92fb8e2f57160d --iam-instance-profile Name=ec2-job-runner --region eu-central-1
```
```
aws ec2 terminate-instances --region eu-central-1 --instance-ids i-0b71bd93e8858a708
```
```
aws ec2 describe-instances --region eu-central-1 --instance-ids i-0c439545981230f5b
```


## CustomRunInstance policy

Explained :
- Terminate : CONDITION (if resource is tagged as 'job-runner')
- Run : RESOURCE(security group is 'sg-04c858cae6f24e840' and key pair is 'adu-dev')
- Role : RESOURCE(role can only be 'ec2-job-runner')
- Get console/Describe : any instance
- AssociateIamInstanceProfile : any instance
- Create tags : any instance

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "ec2:TerminateInstances",
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "ec2:ResourceTag/mis-instance-type": "job-runner"
                }
            }
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:GetConsole*",
                "sts:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "ec2:RunInstances"
            ],
            "Resource": [
                "arn:aws:iam::341684622551:role/ec2-job-runner",
                "arn:aws:ec2:*:*:subnet/*",
                "arn:aws:ec2:eu-central-1:341684622551:security-group/sg-04c858cae6f24e840",
                "arn:aws:ec2:eu-central-1::image/ami-0a8412cbcfcef4252",
                "arn:aws:ec2:*:*:instance/*",
                "arn:aws:ec2:eu-central-1:341684622551:key-pair/adu-dev",
                "arn:aws:ec2:*::snapshot/*",
                "arn:aws:ec2:*:*:launch-template/*",
                "arn:aws:ec2:*:*:volume/*",
                "arn:aws:ec2:*:*:placement-group/*",
                "arn:aws:ec2:*:*:network-interface/*"
            ]
        },
        {
            "Sid": "VisualEditor3",
            "Effect": "Allow",
            "Action": "ec2:AssociateIamInstanceProfile",
            "Resource": "arn:aws:ec2:*:*:instance/*"
        },
        {
            "Sid": "VisualEditor4",
            "Effect": "Allow",
            "Action": "ec2:CreateTags",
            "Resource": [
                "arn:aws:ec2:*:*:subnet/*",
                "arn:aws:ec2:*:*:vpn-gateway/*",
                "arn:aws:ec2:*:*:transit-gateway-route-table/*",
                "arn:aws:ec2:*:*:reserved-instances/*",
                "arn:aws:ec2:*:*:client-vpn-endpoint/*",
                "arn:aws:ec2:*:*:vpn-connection/*",
                "arn:aws:ec2:*::snapshot/*",
                "arn:aws:ec2:*:*:security-group/*",
                "arn:aws:ec2:*:*:network-acl/*",
                "arn:aws:ec2:*:*:network-interface/*",
                "arn:aws:ec2:*:*:capacity-reservation/*",
                "arn:aws:ec2:*:*:internet-gateway/*",
                "arn:aws:ec2:*:*:route-table/*",
                "arn:aws:ec2:*:*:dhcp-options/*",
                "arn:aws:ec2:*::spot-instance-request/*",
                "arn:aws:ec2:*:*:instance/*",
                "arn:aws:ec2:*:*:transit-gateway/*",
                "arn:aws:ec2:*:*:volume/*",
                "arn:aws:ec2:*::fpga-image/*",
                "arn:aws:ec2:*:*:vpc/*",
                "arn:aws:ec2:*:*:transit-gateway-attachment/*",
                "arn:aws:ec2:*::image/*"
            ]
        }
    ]
}
```
