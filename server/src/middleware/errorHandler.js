export default function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
}
