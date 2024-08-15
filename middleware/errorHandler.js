// middlewares/errorHandler.js

//const errorHandler = (err, req, res, next) => {   //已经声明过了，不用再次声明，改用导出
/*module.exports = (err, req, res, next) => {
    console.error('Error:', err);
  
    // 根据错误类型设置状态码
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }; */
  
//module.exports = errorHandler;

export default (err, req, res, next) => {
  console.error('Error:', err);

  // 根据错误类型设置状态码
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};