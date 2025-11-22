export function logger(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`🔵 [${timestamp}] ${message}`);

  if (data) console.log("➡️ Data:", data);
}

export function errorLogger(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`🔴 [${timestamp}] ERROR: ${message}`);
  console.error(error);
}
