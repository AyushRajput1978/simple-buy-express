const Product = require('../models/productModels');

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,image';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = Product.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-ratingsAverage');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numProducts = await Product.countDocuments();
    //   if (skip >= numProducts) throw new Error('This page does not exist');
    // }
    return this;
  }
}

exports.getAllProducts = async (req, res, next) => {
  try {
    // BUILD QUERRY

    // // 1A) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'limit', 'sort', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // // 1B) Advance filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Product.find(JSON.parse(queryStr));

    // 2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-ratingsAverage');
    // }

    // 3) Field limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query.select(fields);
    // } else {
    //   query.select('-__v');
    // }

    // 4) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 10;
    // const skip = (page - 1) * limit;
    // query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numProducts = await Product.countDocuments();
    //   if (skip >= numProducts) throw new Error('This page does not exist');
    // }

    const features = new APIFeatures(Product.find(), req.query).filter().sort;
    // EXECUTE QUERY
    const products = await features.query;
    res.status(200).json({ status: 'success', result: products.length, products });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ sttaus: 'fail', message: 'No Product found with this product id' });
  }
  res.status(200).json({ sttaus: 'success', data: { product } });
};
exports.updateProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'No product found with this product id' });
  }
  res.status(200).json({ status: 'success', data: { product } });
};
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ status: 'success', data: null });
  }
  res.status(204).json({ status: 'success', data: null });
};
