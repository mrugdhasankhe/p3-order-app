resource "aws_lambda_function" "order_handler" {
  function_name = "${var.project_name}-order-handler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  filename         = "../backend/orderHandler/orderHandler.zip"
  source_code_hash = filebase64sha256("../backend/orderHandler/orderHandler.zip")

  timeout     = 10
  memory_size = 256

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.orders.name
      BUCKET_NAME = aws_s3_bucket.invoices.bucket
    }
  }

  tags = local.common_tags
}