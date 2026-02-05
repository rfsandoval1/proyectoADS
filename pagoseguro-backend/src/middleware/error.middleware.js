"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error, _req, res, _next) {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
}
