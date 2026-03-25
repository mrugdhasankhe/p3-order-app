output "api_invoke_url" {
  value = "${aws_api_gateway_stage.dev.invoke_url}/orders"
}

output "lambda_function_name" {
  value = aws_lambda_function.order_handler.function_name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.orders.name
}

output "invoice_bucket_name" {
  value = aws_s3_bucket.invoices.bucket
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.users.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.web_client.id
}

output "frontend_website_url" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}