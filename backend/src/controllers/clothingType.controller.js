const { ClothingType } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAll = async (req, res) => {
    try {
        const types = await ClothingType.findAll({
            where: { is_active: true },
            order: [['type_name', 'ASC']]
        });
        return successResponse(res, types, 'Clothing types fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

exports.getById = async (req, res) => {
    try {
        const type = await ClothingType.findByPk(req.params.id);
        if (!type) {
            return errorResponse(res, 'Clothing type not found', 404);
        }
        return successResponse(res, type, 'Clothing type fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { type_name, default_price, description } = req.body;
        const type = await ClothingType.create({
            type_name,
            default_price,
            description,
            is_active: true
        });
        return successResponse(res, type, 'Clothing type created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

exports.update = async (req, res) => {
    try {
        const type = await ClothingType.findByPk(req.params.id);
        if (!type) {
            return errorResponse(res, 'Clothing type not found', 404);
        }
        await type.update(req.body);
        return successResponse(res, type, 'Clothing type updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

exports.delete = async (req, res) => {
    try {
        const type = await ClothingType.findByPk(req.params.id);
        if (!type) {
            return errorResponse(res, 'Clothing type not found', 404);
        }
        await type.destroy();
        return successResponse(res, null, 'Clothing type deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};