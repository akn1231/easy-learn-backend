const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Created') => success(res, data, message, 201);

const paginated = (res, data, pagination) =>
  res.status(200).json({ success: true, ...data, pagination });

const badRequest = (res, message = 'Bad request', errors = null) =>
  res.status(400).json({ success: false, message, ...(errors && { errors }) });

const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ success: false, message });

const notFound = (res, message = 'Not found') =>
  res.status(404).json({ success: false, message });

module.exports = { success, created, paginated, badRequest, unauthorized, notFound };
