const parseArrayField = (fieldName, options = {}) => {
  return (req, res, next) => {
    try {
      const raw = req.body[fieldName];

      if (!raw) return next();

      const parseValue = (val) => {
        let parsed = typeof val === 'string' ? JSON.parse(val) : val;

        if (options.cast && typeof options.cast === 'function') {
          parsed = options.cast(parsed);
        }

        return parsed;
      };

      if (Array.isArray(raw)) {
        req.body[fieldName] = raw.map(parseValue);
      } else {
        req.body[fieldName] = [parseValue(raw)];
      }

      next();
    } catch (err) {
      console.error(`❌ Failed to parse ${fieldName}:`, err.message);
      return res.status(400).json({
        status: 'fail',
        message: `Invalid ${fieldName} format`,
      });
    }
  };
};

module.exports = parseArrayField;
