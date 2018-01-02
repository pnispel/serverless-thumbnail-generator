import Ajv from 'ajv';

const ajv = new Ajv();

ajv.addKeyword('range', { type: 'number', compile: function (sch, parentSchema) {
  var min = sch[0];
  var max = sch[1];

  return parentSchema.exclusiveRange === true
          ? function (data) { return data > min && data < max; }
          : function (data) { return data >= min && data <= max; }
} });

const schema = {
  range: [2, 4],
  exclusiveRange: true
}

const validate = ajv.compile(schema);

export function validateSchema(val) {
  return validate(val)
}
