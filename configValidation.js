const Joi = require('@hapi/joi');

// Schema Configuration
// schema.indexName: populated by defaults if not overridden
// schema.icuTokenizer: boolean, optional, defaults to false
// dbclient: object, validation performed by opensearch module
const schema = Joi.object().required().keys({
  schema: Joi.object().required().keys({
    indexName: Joi.string().required(),
    icuTokenizer: Joi.boolean().optional()
  }),
  dbclient: Joi.object().required()
}).unknown(true);

module.exports = {
  validate: function validate(config) {
    const validated = schema.validate(config);
    if (validated.error) {
      throw new Error(validated.error.details[0].message);
    }
  }
};
