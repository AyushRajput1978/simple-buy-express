const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app-error');
const APIFeatures = require('../utils/api-features');
const { deleteFileFromS3, uploadBufferToS3 } = require('../middleware/upload');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with this product id', 404));
    }

    // Delete the image from S3 if it exists
    if (doc.image) {
      await deleteFileFromS3(doc.image);
    }

    // Now delete the document from the DB
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Model, afterUpdateCallback) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Find the existing document
    const existingDoc = await Model.findById(id);
    if (!existingDoc) {
      return next(new AppError('No document found with this product id', 404));
    }

    const updateData = { ...req.body };

    if (req.file) {
      // ✅ If there's a new file, delete the old S3 image if present
      if (existingDoc.image) {
        await deleteFileFromS3(existingDoc.image);
      }

      // ✅ Upload the new file to S3
      const imageUrl = await uploadBufferToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      updateData.image = imageUrl;
    }

    // ✅ Update the document with new data and image
    const updatedDoc = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      // runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('Failed to update document', 500));
    }

    // Optional post-update callback
    if (afterUpdateCallback) {
      await afterUpdateCallback(updatedDoc);
    }

    res.status(200).json({ status: 'success', data: { data: updatedDoc } });
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
    let query = await Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with this product id', 404));
    }
    res.status(200).json({ status: 'success', data: doc });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // works on review
    let filter = {};
    if (req.params.product_id) filter = { product: req.params.product_id };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // EXECUTE QUERY
    // const docs = await features.query.explain();
    const docs = await features.query;
    res.status(200).json({ status: 'success', result: docs.length, data: docs });
  });
