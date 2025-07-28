const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app-error');
const APIFeatures = require('../utils/api-features');
const { deleteFileFromS3 } = require('../middleware/upload');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with this product id', 404));
    }

    // Delete the image from S3 if it exists
    if (doc.images && Array.isArray(doc.images)) {
      await Promise.all(doc.images.map(deleteFileFromS3));
    }
    // Now delete the document from the DB
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Model, afterUpdateCallback) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Step 1: Fetch the existing document
    const existingDoc = await Model.findById(id);
    if (!existingDoc) {
      return next(new AppError('No document found with this ID', 404));
    }

    const updateData = { ...req.body };

    // Step 2: Single Image Handling
    if (req.body.image && req.body.image !== existingDoc.image) {
      // Delete previous image only if replaced
      if (existingDoc.image) {
        await deleteFileFromS3(existingDoc.image);
      }
      updateData.image = req.body.image;
    }
    // Step 3: Multiple Image Handling (Smart Comparison)
    if (Array.isArray(req.body.images)) {
      const { images } = req.body; // array of URLs from client or uploaded
      const oldImages = existingDoc.images || [];

      const imagesToDelete = oldImages.filter((img) => !images.includes(img));
      // // Delete only removed images from S3
      await Promise.all(imagesToDelete.map(deleteFileFromS3));

      // updateData.images = [...newImages, ...imagesToKeep]; // final updated array
    }

    // Step 4: Perform DB update
    const updatedDoc = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedDoc) {
      return next(new AppError('Failed to update document', 500));
    }

    // Step 5: Optional hook
    if (afterUpdateCallback) {
      await afterUpdateCallback(updatedDoc);
    }
    res.status(200).json({
      status: 'success',
      message: 'Document updated successfully',
      data: { data: updatedDoc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions && Array.isArray(popOptions)) {
      popOptions.forEach((opt) => {
        query = query.populate(opt);
      });
    } else if (popOptions) {
      query = query.populate(popOptions);
    }

    const doc = await query;
    if (!doc) return next(new AppError('No document found with this ID', 404));

    res.status(200).json({ status: 'success', data: doc });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.product_id) filter = { product: req.params.product_id };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (popOptions && Array.isArray(popOptions)) {
      popOptions.forEach((opt) => {
        features.query = features.query.populate(opt);
      });
    } else if (popOptions) {
      features.query = features.query.populate(popOptions);
    }

    const docs = await features.query;
    res.status(200).json({ status: 'success', result: docs.length, data: docs });
  });
