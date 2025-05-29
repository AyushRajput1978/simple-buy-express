const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app-error');
const APIFeatures = require('../utils/api-features');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with this product id', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Model, afterUpdateCallback) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updateData = { ...req.body };

    // If new image uploaded, add it
    if (req.file) {
      updateData.image = req.file.location;
    }
    const doc = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with this product id', 404));
    }
    // Execute optional callback
    if (afterUpdateCallback) {
      await afterUpdateCallback(doc);
    }
    res.status(200).json({ status: 'success', data: { data: doc } });
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
    res.status(200).json({ sttaus: 'success', data: doc });
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
