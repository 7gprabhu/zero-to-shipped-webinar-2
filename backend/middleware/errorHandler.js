export function errorHandler(error, req, res, next) {
  const status = error.status || (error.name === 'MulterError' ? (error.code === 'LIMIT_FILE_SIZE' ? 413 : 400) : 500);
  if (status >= 500) console.error(error.message);
  res.status(status).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'PDF must be 10 MB or smaller.' : error.status ? error.message : status >= 500 ? 'Unable to save the analysis. Check the server and database connection.' : error.message });
}
