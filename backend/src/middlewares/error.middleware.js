const errorMiddleware = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        code: err.code || 'INTERNAL_ERROR'
    });
};

module.exports = errorMiddleware;
