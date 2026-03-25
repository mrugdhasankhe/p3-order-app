const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "CORS preflight successful" })
      };
    }

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const customerName = body?.customerName?.trim();
    const email = body?.email?.trim();
    const productName = body?.productName?.trim();
    const quantity = Number(body?.quantity);
    const address = body?.address?.trim();

    if (!customerName || !email || !productName || !quantity || !address) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "All fields are required."
        })
      };
    }

    if (quantity <= 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Quantity must be greater than 0."
        })
      };
    }

    const orderId = uuidv4();
    const createdAt = new Date().toISOString();

    const userId =
      event?.requestContext?.authorizer?.claims?.sub ||
      "demo-user";

    const invoiceKey = `invoices/${orderId}.txt`;

    const invoiceText = [
      "INVOICE",
      "----------------------",
      `Order ID: ${orderId}`,
      `Customer Name: ${customerName}`,
      `Email: ${email}`,
      `Product Name: ${productName}`,
      `Quantity: ${quantity}`,
      `Address: ${address}`,
      `Created At: ${createdAt}`
    ].join("\n");

    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          orderId,
          userId,
          customerName,
          email,
          productName,
          quantity,
          address,
          createdAt,
          invoiceKey,
          status: "CREATED"
        }
      })
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: invoiceKey,
        Body: invoiceText,
        ContentType: "text/plain"
      })
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Order created successfully.",
        orderId,
        invoiceKey
      })
    };
  } catch (error) {
    console.error("Lambda error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error.",
        error: error.message
      })
    };
  }
};